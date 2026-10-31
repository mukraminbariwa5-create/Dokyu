/**
 * My Docs (plan §3.1 C): documents you and your family have, are getting, or need, with appointments,
 * expiry dates and reminders. Kept on this device (nothing is uploaded), so it works without an account.
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
import { scheduleReminders, cancelReminders } from './reminders';

export const DOC_STATUSES = ['need', 'preparing', 'applied', 'ready', 'have'] as const;
export type DocStatus = (typeof DOC_STATUSES)[number];
export const RELATIONS = ['child', 'parent', 'spouse', 'sibling', 'other'] as const;
export type Relation = (typeof RELATIONS)[number];

export interface Person {
  id: string;
  name: string;
  relation: Relation;
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
}

export const MYDOCS_KEY = 'dokyu.mydocs.v1';
const EMPTY: Store = { people: [], docs: [] };

function parse(raw: string | null): Store {
  if (!raw) return EMPTY;
  try {
    const v = JSON.parse(raw) as Partial<Store>;
    return {
      people: Array.isArray(v.people) ? v.people.filter((p) => p && typeof p.id === 'string') : [],
      docs: Array.isArray(v.docs) ? v.docs.filter((d) => d && typeof d.id === 'string') : [],
    };
  } catch {
    return EMPTY;
  }
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

interface MyDocsValue extends Store {
  ready: boolean;
  saveDoc: (doc: Omit<TrackedDoc, 'id' | 'updatedAt'> & { id?: string }) => Promise<TrackedDoc>;
  removeDoc: (id: string) => void;
  addPerson: (name: string, relation: Relation) => Person;
  removePerson: (id: string) => void;
  clearAll: () => void;
}

const Ctx = createContext<MyDocsValue | null>(null);

export function MyDocsProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(EMPTY);
  const [ready, setReady] = useState(false);
  const latest = useRef(store);
  latest.current = store;

  useEffect(() => {
    AsyncStorage.getItem(MYDOCS_KEY)
      .then((raw) => setStore(parse(raw)))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(MYDOCS_KEY, JSON.stringify(store)).catch(() => {});
  }, [store, ready]);

  const saveDoc = useCallback<MyDocsValue['saveDoc']>(async (input) => {
    const id = input.id ?? newId();
    const previous = latest.current.docs.find((d) => d.id === id);
    if (previous?.reminderIds?.length) await cancelReminders(previous.reminderIds);
    const base: TrackedDoc = { ...input, id, updatedAt: new Date().toISOString() };
    const reminderIds = await scheduleReminders(base);
    const doc = { ...base, reminderIds };
    setStore((s) => ({
      ...s,
      docs: s.docs.some((d) => d.id === id)
        ? s.docs.map((d) => (d.id === id ? doc : d))
        : [doc, ...s.docs],
    }));
    return doc;
  }, []);

  const removeDoc = useCallback((id: string) => {
    const doc = latest.current.docs.find((d) => d.id === id);
    if (doc?.reminderIds?.length) cancelReminders(doc.reminderIds).catch(() => {});
    setStore((s) => ({ ...s, docs: s.docs.filter((d) => d.id !== id) }));
  }, []);

  const addPerson = useCallback((name: string, relation: Relation) => {
    const person = { id: newId(), name: name.trim().slice(0, 60), relation };
    setStore((s) => ({ ...s, people: [...s.people, person] }));
    return person;
  }, []);

  const removePerson = useCallback((id: string) => {
    // Their documents move to "Me" rather than vanishing.
    setStore((s) => ({
      people: s.people.filter((p) => p.id !== id),
      docs: s.docs.map((d) => (d.personId === id ? { ...d, personId: 'me' } : d)),
    }));
  }, []);

  const clearAll = useCallback(() => {
    for (const d of latest.current.docs)
      if (d.reminderIds?.length) cancelReminders(d.reminderIds).catch(() => {});
    setStore(EMPTY);
  }, []);

  const value = useMemo(
    () => ({ ...store, ready, saveDoc, removeDoc, addPerson, removePerson, clearAll }),
    [store, ready, saveDoc, removeDoc, addPerson, removePerson, clearAll],
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
