/**
 * My Docs (plan §3.1 C): documents you and your family have, are getting, or need, with appointments,
 * expiry dates and reminders. Always saved on this device, so it works without an account; when signed in,
 * it also syncs with the account (see packages/shared/src/mydocs.ts for the merge rules), so it comes back
 * on a new phone or browser. Signing out removes the account's copy from this device.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import {
  cleanMyDocs,
  mergeMyDocs,
  sameMyDocs,
  type MyDocDeletion,
  type MyDocsData,
} from '@dokyu/shared';
import { scheduleReminders, cancelReminders } from './reminders';
import { ACCOUNTS_ENABLED, ApiError, api } from './api';
import { onSignOut, useAuth } from './auth';

export const DOC_STATUSES = ['need', 'preparing', 'applied', 'ready', 'have'] as const;
export type DocStatus = (typeof DOC_STATUSES)[number];
export const RELATIONS = ['child', 'parent', 'spouse', 'sibling', 'other'] as const;
export type Relation = (typeof RELATIONS)[number];

export interface Person {
  id: string;
  name: string;
  relation: Relation;
  updatedAt?: string;
}

export interface TrackedDoc {
  id: string;
  /** "me" or a family member id. */
  personId: string;
  /** A Dokyu guide, or a custom title. */
  guide?: string;
  title?: string;
  status: DocStatus;
  referenceNo?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentPlace?: string;
  expires?: string;
  notes?: string;
  reminderIds?: string[];
  updatedAt: string;
}

interface Store {
  people: Person[];
  docs: TrackedDoc[];
  /** Deletion notes, so a removed item does not come back from the account. */
  deleted: MyDocDeletion[];
  /** The account this copy is synced with, or null for a guest's copy. */
  owner: string | null;
  /** The account copy's version this phone last merged with. */
  version: number;
}

/** Where syncing stands, for the line under My Docs. */
export type SyncState = 'off' | 'syncing' | 'synced' | 'offline';

export const MYDOCS_KEY = 'dokyu.mydocs.v1';
/** A guest's own My Docs, set aside while they try the shared demo account, and put back at sign-out. */
const GUEST_KEY = 'dokyu.mydocs.guest.v1';
const EMPTY: Store = { people: [], docs: [], deleted: [], owner: null, version: 0 };

function parse(raw: string | null): Store {
  if (!raw) return EMPTY;
  try {
    const v = JSON.parse(raw) as Partial<Store>;
    return {
      people: Array.isArray(v.people) ? v.people.filter((p) => p && typeof p.id === 'string') : [],
      docs: Array.isArray(v.docs) ? v.docs.filter((d) => d && typeof d.id === 'string') : [],
      deleted: Array.isArray(v.deleted) ? v.deleted : [],
      owner: typeof v.owner === 'string' ? v.owner : null,
      version: typeof v.version === 'number' ? v.version : 0,
    };
  } catch {
    return EMPTY;
  }
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

interface MyDocsValue {
  people: Person[];
  docs: TrackedDoc[];
  ready: boolean;
  sync: SyncState;
  /** When the account copy last matched this device (ISO time), if ever. */
  syncedAt: string | null;
  /** Tries to sync now (e.g. a "Try again" button). */
  syncNow: () => void;
  saveDoc: (doc: Omit<TrackedDoc, 'id' | 'updatedAt'> & { id?: string }) => Promise<TrackedDoc>;
  removeDoc: (id: string) => void;
  addPerson: (name: string, relation: Relation) => Person;
  removePerson: (id: string) => void;
  clearAll: () => void;
}

const Ctx = createContext<MyDocsValue | null>(null);

const now = () => new Date().toISOString();

/** Keeps phone reminders in line with a copy that came from the account. */
async function withReminders(incoming: TrackedDoc[], local: TrackedDoc[]): Promise<TrackedDoc[]> {
  const byId = new Map(local.map((d) => [d.id, d]));
  const out: TrackedDoc[] = [];
  for (const doc of incoming) {
    const mine = byId.get(doc.id);
    if (mine && mine.updatedAt === doc.updatedAt) {
      out.push({ ...doc, reminderIds: mine.reminderIds });
      continue;
    }
    if (mine?.reminderIds?.length) await cancelReminders(mine.reminderIds).catch(() => {});
    const reminderIds = await scheduleReminders(doc).catch(() => [] as string[]);
    out.push({ ...doc, reminderIds });
  }
  const kept = new Set(incoming.map((d) => d.id));
  for (const d of local)
    if (!kept.has(d.id) && d.reminderIds?.length)
      await cancelReminders(d.reminderIds).catch(() => {});
  return out;
}

export function MyDocsProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const [store, setStore] = useState<Store>(EMPTY);
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncState>('off');
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  // Bumped by every local change, so a sync follows shortly after.
  const [changes, setChanges] = useState(0);
  const latest = useRef(store);
  latest.current = store;
  const userId = status === 'signedIn' ? (user?.id ?? null) : null;
  const userRef = useRef(userId);
  userRef.current = userId;
  const demoRef = useRef(false);
  demoRef.current = status === 'signedIn' && !!user?.demo;

  useEffect(() => {
    AsyncStorage.getItem(MYDOCS_KEY)
      .then((raw) => setStore(parse(raw)))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(MYDOCS_KEY, JSON.stringify(store)).catch(() => {});
  }, [store, ready]);

  // Counts edits made on this phone; a sync that sees it move knows to run again.
  const edits = useRef(0);
  const changed = useCallback(() => {
    edits.current += 1;
    setChanges((c) => c + 1);
  }, []);

  // --- Sync with the account -------------------------------------------------------------------
  const running = useRef<Promise<void> | null>(null);
  const again = useRef(false);

  const syncOnce = useCallback(async (uid: string) => {
    for (let attempt = 0; attempt < 4; attempt++) {
      const start = latest.current;
      const editsAtStart = edits.current;
      // Another account's copy is never uploaded to this one: it is replaced instead. A guest's own
      // documents never go into the shared demo account: they are set aside and come back at sign-out.
      const guestIntoDemo = start.owner === null && demoRef.current;
      if (guestIntoDemo && (start.docs.length || start.people.length)) {
        const { people, docs, deleted } = start;
        await AsyncStorage.setItem(GUEST_KEY, JSON.stringify({ people, docs, deleted }));
      }
      const mine = !guestIntoDemo && (start.owner === null || start.owner === uid);
      const local = mine ? start : { ...EMPTY };
      const remote = await api<{ data: MyDocsData; version: number }>('/me/docs');
      const merged = mergeMyDocs(local, remote.data);
      const outgoing = cleanMyDocs(merged);
      let version = remote.version;
      if (!sameMyDocs(outgoing, remote.data)) {
        try {
          version = (
            await api<{ version: number }>('/me/docs', {
              method: 'PUT',
              body: { baseVersion: remote.version, data: outgoing },
            })
          ).version;
        } catch (e) {
          if (e instanceof ApiError && e.status === 409) continue; // another phone saved: merge again
          throw e;
        }
      }
      if (userRef.current !== uid) return; // signed out meanwhile: drop the result
      const docs = await withReminders(merged.docs, start.docs);
      // Keep anything edited on this phone while the sync was running; those edits sync next round.
      if (edits.current !== editsAtStart) again.current = true;
      setStore((s) => {
        const current = s.owner === uid || (s.owner === null && !guestIntoDemo) ? s : { ...EMPTY };
        const next = { ...mergeMyDocs(current, { ...merged, docs }), owner: uid, version };
        latest.current = next;
        return next;
      });
      return;
    }
    throw new Error('My Docs kept changing on another device');
  }, []);

  const requestSync = useCallback(() => {
    const uid = userRef.current;
    if (!uid || !ACCOUNTS_ENABLED) return;
    if (running.current) {
      again.current = true;
      return;
    }
    setSync('syncing');
    running.current = (async () => {
      try {
        // At most a few rounds in a row (edits made during a sync); the next trigger picks up the rest.
        for (let round = 0; round < 5; round++) {
          again.current = false;
          await syncOnce(uid);
          if (!again.current || userRef.current !== uid) break;
        }
        setSync('synced');
        setSyncedAt(now());
      } catch {
        setSync('offline');
      } finally {
        running.current = null;
      }
    })();
  }, [syncOnce]);

  // On sign-in (or a restored session), once this device's copy is loaded.
  useEffect(() => {
    if (!ready) return;
    if (userId) requestSync();
    else setSync('off');
  }, [ready, userId, requestSync]);

  // Shortly after each change on this phone.
  useEffect(() => {
    if (!changes || !userId) return;
    const timer = setTimeout(requestSync, 1200);
    return () => clearTimeout(timer);
  }, [changes, userId, requestSync]);

  // When the app comes back to the front (another phone may have changed something).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') requestSync();
    });
    return () => sub.remove();
  }, [requestSync]);

  // Signing out: save the last changes, then remove the account's copy from this device.
  useEffect(
    () =>
      onSignOut({
        before: async () => {
          const uid = userRef.current;
          if (!uid) return;
          await running.current;
          await syncOnce(uid).catch(() => {});
        },
        after: () => {
          if (latest.current.owner === null) return;
          for (const d of latest.current.docs)
            if (d.reminderIds?.length) cancelReminders(d.reminderIds).catch(() => {});
          setStore(EMPTY);
          setSyncedAt(null);
          // Back from the demo account: the guest's own documents return.
          void (async () => {
            const saved = await AsyncStorage.getItem(GUEST_KEY).catch(() => null);
            if (!saved) return;
            await AsyncStorage.removeItem(GUEST_KEY).catch(() => {});
            const back = parse(saved);
            const docs = await withReminders(back.docs, []);
            setStore({ ...back, docs, owner: null, version: 0 });
          })();
        },
      }),
    [syncOnce],
  );

  // --- Local changes ---------------------------------------------------------------------------
  const saveDoc = useCallback<MyDocsValue['saveDoc']>(
    async (input) => {
      const id = input.id ?? newId();
      const previous = latest.current.docs.find((d) => d.id === id);
      if (previous?.reminderIds?.length) await cancelReminders(previous.reminderIds);
      const base: TrackedDoc = { ...input, id, updatedAt: now() };
      const reminderIds = await scheduleReminders(base);
      const doc = { ...base, reminderIds };
      setStore((s) => ({
        ...s,
        docs: s.docs.some((d) => d.id === id)
          ? s.docs.map((d) => (d.id === id ? doc : d))
          : [doc, ...s.docs],
      }));
      changed();
      return doc;
    },
    [changed],
  );

  const removeDoc = useCallback(
    (id: string) => {
      const doc = latest.current.docs.find((d) => d.id === id);
      if (doc?.reminderIds?.length) cancelReminders(doc.reminderIds).catch(() => {});
      setStore((s) => ({
        ...s,
        docs: s.docs.filter((d) => d.id !== id),
        deleted: [...s.deleted, { kind: 'doc', id, at: now() }],
      }));
      changed();
    },
    [changed],
  );

  const addPerson = useCallback(
    (name: string, relation: Relation) => {
      const person = { id: newId(), name: name.trim().slice(0, 60), relation, updatedAt: now() };
      setStore((s) => ({ ...s, people: [...s.people, person] }));
      changed();
      return person;
    },
    [changed],
  );

  const removePerson = useCallback(
    (id: string) => {
      // Their documents move to "Me" rather than vanishing.
      const at = now();
      setStore((s) => ({
        ...s,
        people: s.people.filter((p) => p.id !== id),
        docs: s.docs.map((d) => (d.personId === id ? { ...d, personId: 'me', updatedAt: at } : d)),
        deleted: [...s.deleted, { kind: 'person', id, at }],
      }));
      changed();
    },
    [changed],
  );

  /** "Delete data on this device": empties this phone only (the account keeps its copy). */
  const clearAll = useCallback(() => {
    for (const d of latest.current.docs)
      if (d.reminderIds?.length) cancelReminders(d.reminderIds).catch(() => {});
    setStore(EMPTY);
  }, []);

  const value = useMemo(
    () => ({
      people: store.people,
      docs: store.docs,
      ready,
      sync,
      syncedAt,
      syncNow: requestSync,
      saveDoc,
      removeDoc,
      addPerson,
      removePerson,
      clearAll,
    }),
    [
      store.people,
      store.docs,
      ready,
      sync,
      syncedAt,
      requestSync,
      saveDoc,
      removeDoc,
      addPerson,
      removePerson,
      clearAll,
    ],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMyDocs(): MyDocsValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMyDocs must be used inside <MyDocsProvider>');
  return ctx;
}

export type DocAlert =
  | { kind: 'expired'; doc: TrackedDoc }
  | { kind: 'expiring'; doc: TrackedDoc; days: number }
  | { kind: 'appointment'; doc: TrackedDoc; days: number }
  | { kind: 'ready'; doc: TrackedDoc };

const dayDiff = (fromIso: string, toIso: string) =>
  Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000);

/** What needs attention, most urgent first. `todayIso` is the Philippine date. */
export function docAlerts(docs: TrackedDoc[], todayIso: string): DocAlert[] {
  const out: Array<DocAlert & { rank: number }> = [];
  for (const doc of docs) {
    if (doc.appointmentDate && doc.status !== 'have') {
      const days = dayDiff(todayIso, doc.appointmentDate);
      if (days >= 0 && days <= 7) out.push({ kind: 'appointment', doc, days, rank: days });
    }
    if (doc.status === 'ready') out.push({ kind: 'ready', doc, rank: 3 });
    if (doc.expires) {
      const days = dayDiff(todayIso, doc.expires);
      if (days < 0) out.push({ kind: 'expired', doc, rank: -1 });
      else if (days <= 60) out.push({ kind: 'expiring', doc, days, rank: 10 + days });
    }
  }
  return out.sort((a, b) => a.rank - b.rank).map(({ rank: _rank, ...a }) => a as DocAlert);
}
