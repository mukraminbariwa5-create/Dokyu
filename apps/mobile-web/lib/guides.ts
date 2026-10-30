/**
 * Guides come from the API (so the Super Admin can update fees and steps without a new app release).
 * The copy bundled in the app shows instantly and keeps working offline or when the server can't be reached.
 */
import { useQuery } from '@tanstack/react-query';
import { GUIDES, guideSchema, type Guide } from '@dokyu/shared';
import { api } from './api';

async function fetchGuides(): Promise<Guide[]> {
  const res = await api<{ data: unknown[] }>('/guides');
  // Never trust the network blindly: keep only guides that match the shared schema.
  const valid = res.data
    .map((g) => guideSchema.safeParse(g))
    .flatMap((p) => (p.success ? [p.data] : []));
  return valid.length ? valid : GUIDES;
}

export function useGuides() {
  return useQuery({
    queryKey: ['guides'],
    queryFn: fetchGuides,
    initialData: GUIDES,
    initialDataUpdatedAt: 0, // the bundled copy counts as old, so the app checks for updates once
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useGuide(slug: string | undefined): Guide | undefined {
  const { data } = useGuides();
  return data.find((g) => g.slug === slug);
}
