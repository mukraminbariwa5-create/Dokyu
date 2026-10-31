import { useQuery } from '@tanstack/react-query';
import { ACCOUNTS_ENABLED, serverFeatures } from './api';

/** Which optional server features are on (email). Assumes "on" until the server answers. */
export function useServerFeatures() {
  const q = useQuery({
    queryKey: ['server-features'],
    queryFn: serverFeatures,
    enabled: ACCOUNTS_ENABLED,
    staleTime: 10 * 60_000,
  });
  return q.data ?? { email: true };
}
