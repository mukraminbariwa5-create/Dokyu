/**
 * My Docs sync: the shape the app sends to an account, and how two copies are combined.
 *
 * Each document and family member carries `updatedAt`; when two copies disagree, the newer edit wins.
 * Deletions are kept as small "deleted" notes so a document removed on one phone does not come back
 * from another. The server stores the merged copy with a version number, so two phones saving at the
 * same moment cannot overwrite each other (the second one merges again and retries).
 */
import { z } from 'zod';

export const MYDOC_STATUSES = ['need', 'preparing', 'applied', 'ready', 'have'] as const;
export const MYDOC_RELATIONS = ['child', 'parent', 'spouse', 'sibling', 'other'] as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const stamp = z.string().max(40);
const id = z.string().min(1).max(40);
/** Optional text: empty strings are kept as "not set". */
const text = (max: number) => z.string().max(max).optional();

export const myDocPersonSchema = z.object({
  id,
  name: z.string().min(1).max(60),
  relation: z.enum(MYDOC_RELATIONS),
  updatedAt: stamp.optional(),
});

export const myDocSchema = z.object({
  id,
  personId: id,
  guide: text(60),
  title: text(120),
  status: z.enum(MYDOC_STATUSES),
  referenceNo: text(80),
  appointmentDate: isoDate.or(z.literal('')).optional(),
  appointmentTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .or(z.literal(''))
    .optional(),
  appointmentPlace: text(120),
  expires: isoDate.or(z.literal('')).optional(),
  notes: text(500),
  updatedAt: stamp,
});

export const myDocDeletionSchema = z.object({
  kind: z.enum(['doc', 'person']),
  id,
  at: stamp,
});

/** Unknown fields (like a phone's own reminder ids) are dropped: they mean nothing on another device. */
export const myDocsDataSchema = z.object({
  people: z.array(myDocPersonSchema).max(50),
  docs: z.array(myDocSchema).max(300),
  deleted: z.array(myDocDeletionSchema).max(1000).default([]),
});

export const myDocsPutSchema = z.object({
  baseVersion: z.number().int().min(0),
  data: myDocsDataSchema,
});

export type MyDocPerson = z.infer<typeof myDocPersonSchema>;
export type MyDoc = z.infer<typeof myDocSchema>;
export type MyDocDeletion = z.infer<typeof myDocDeletionSchema>;
export type MyDocsData = z.infer<typeof myDocsDataSchema>;

export const EMPTY_MYDOCS: MyDocsData = { people: [], docs: [], deleted: [] };

/** Deletion notes older than this are dropped; every device will have synced by then. */
const KEEP_DELETIONS_MS = 180 * 86_400_000;
const EPOCH = '1970-01-01T00:00:00.000Z';
const time = (iso: string | undefined) => {
  const t = Date.parse(iso ?? EPOCH);
  return Number.isNaN(t) ? 0 : t;
};

function newest<T extends { id: string; updatedAt?: string }>(a: T[], b: T[]): Map<string, T> {
  const out = new Map<string, T>();
  for (const item of [...a, ...b]) {
    const seen = out.get(item.id);
    // Ties keep the first copy (the caller passes the local copy first).
    if (!seen || time(item.updatedAt) > time(seen.updatedAt)) out.set(item.id, item);
  }
  return out;
}

/**
 * Combines two copies of My Docs. Newer edits win, deletions win over older edits, and documents of a
 * family member who was removed move to "me" (the same as removing a person on one phone).
 * Extra fields on `a`'s items (e.g. reminder ids) are kept when `a`'s copy wins.
 */
export function mergeMyDocs<D extends MyDoc, P extends MyDocPerson>(
  a: { people: P[]; docs: D[]; deleted?: MyDocDeletion[] },
  b: { people: MyDocPerson[]; docs: MyDoc[]; deleted?: MyDocDeletion[] },
  now: number = Date.now(),
): { people: P[]; docs: D[]; deleted: MyDocDeletion[] } {
  const deletions = new Map<string, MyDocDeletion>();
  for (const d of [...(a.deleted ?? []), ...(b.deleted ?? [])]) {
    if (now - time(d.at) > KEEP_DELETIONS_MS) continue;
    const key = `${d.kind}:${d.id}`;
    const seen = deletions.get(key);
    if (!seen || time(d.at) > time(seen.at)) deletions.set(key, d);
  }
  const deletedAt = (kind: 'doc' | 'person', itemId: string) => {
    const d = deletions.get(`${kind}:${itemId}`);
    return d ? time(d.at) : -1;
  };

  const people = [...newest<P>(a.people, b.people as P[]).values()].filter(
    (p) => deletedAt('person', p.id) < time(p.updatedAt),
  );
  const personIds = new Set(people.map((p) => p.id));
  const docs = [...newest<D>(a.docs, b.docs as D[]).values()]
    .filter((d) => deletedAt('doc', d.id) < time(d.updatedAt))
    .map((d) => (d.personId === 'me' || personIds.has(d.personId) ? d : { ...d, personId: 'me' }))
    .sort((x, y) => time(y.updatedAt) - time(x.updatedAt));

  return { people, docs, deleted: [...deletions.values()] };
}

/**
 * The part of a local copy that can be sent: each item is checked on its own, so one odd item (say, from
 * an older app version) stays on the phone instead of stopping the whole sync.
 */
export function cleanMyDocs(x: {
  people: unknown[];
  docs: unknown[];
  deleted?: unknown[];
}): MyDocsData {
  const keep = <T>(schema: z.ZodType<T>, items: unknown[] = []) =>
    items.flatMap((item) => {
      const r = schema.safeParse(item);
      return r.success ? [r.data] : [];
    });
  return {
    people: keep(myDocPersonSchema, x.people).slice(0, 50),
    docs: keep(myDocSchema, x.docs).slice(0, 300),
    deleted: keep(myDocDeletionSchema, x.deleted).slice(-1000),
  };
}

/** True when two copies hold the same documents, people and deletions (ignores order and extra fields). */
export function sameMyDocs(a: MyDocsData, b: MyDocsData): boolean {
  const key = (x: MyDocsData) => {
    const clean = cleanMyDocs(x);
    return JSON.stringify({
      people: [...clean.people].sort((p, q) => p.id.localeCompare(q.id)),
      docs: [...clean.docs].sort((p, q) => p.id.localeCompare(q.id)),
      deleted: [...clean.deleted].sort((p, q) =>
        `${p.kind}${p.id}`.localeCompare(`${q.kind}${q.id}`),
      ),
    });
  };
  return key(a) === key(b);
}
