/** "Before you go" ticks, kept on the device per guide. Signed-in tracking moves to My Docs in Phase 4. */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const key = (slug: string) => `dokyu.checklist.${slug}`;

export function useChecklist(slug: string | undefined) {
  const [ticked, setTicked] = useState<number[]>([]);

  useEffect(() => {
    if (!slug) return;
    AsyncStorage.getItem(key(slug))
      .then((raw) => {
        const saved: unknown = raw ? JSON.parse(raw) : [];
        if (Array.isArray(saved))
          setTicked(saved.filter((n): n is number => typeof n === 'number'));
      })
      .catch(() => {});
  }, [slug]);

  const save = useCallback(
    (next: number[]) => {
      setTicked(next);
      if (slug) AsyncStorage.setItem(key(slug), JSON.stringify(next)).catch(() => {});
    },
    [slug],
  );

  const toggle = useCallback(
    (i: number) => save(ticked.includes(i) ? ticked.filter((x) => x !== i) : [...ticked, i]),
    [ticked, save],
  );

  return { ticked, toggle, clear: () => save([]) };
}

/** Ticks for many guides at once (Home and the Checklists page). Re-reads whenever `refreshKey` changes. */
export function useAllChecklists(slugs: string[], refreshKey?: unknown) {
  const [bySlug, setBySlug] = useState<Record<string, number[]>>({});
  const joined = slugs.join(',');
  useEffect(() => {
    const list = joined ? joined.split(',') : [];
    AsyncStorage.multiGet(list.map(key))
      .then((pairs) => {
        const next: Record<string, number[]> = {};
        pairs.forEach(([, raw], i) => {
          try {
            const saved: unknown = raw ? JSON.parse(raw) : [];
            if (Array.isArray(saved))
              next[list[i]!] = saved.filter((n): n is number => typeof n === 'number');
          } catch {
            /* ignore a damaged entry */
          }
        });
        setBySlug(next);
      })
      .catch(() => {});
  }, [joined, refreshKey]);
  return bySlug;
}
