import type { useRouter } from 'expo-router';
import type { PublicUser } from '@dokyu/shared';

/** Where to go after signing in or signing up: setup if the account has none yet, else back where they were. */
export function goAfterAuth(router: ReturnType<typeof useRouter>, user: PublicUser) {
  if (!user.onboarded) router.replace('/setup');
  else if (router.canGoBack()) router.back();
  else router.replace('/');
}
