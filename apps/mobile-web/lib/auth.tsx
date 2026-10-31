/**
 * Who is signed in. Guests can use almost everything (plan §2); signing in adds saving and reminders.
 * On sign-in, the profile and the device settings are merged: answers the guest already gave on this device
 * are saved to the new account, and the account's language and text size are applied to the device.
 */
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
import type { ProfileUpdate, PublicUser } from '@dokyu/shared';
import { api, authApi, refreshSession } from './api';
import { useSettings } from './settings';

type Status = 'loading' | 'signedOut' | 'signedIn';

/**
 * Other parts of the app can take part in signing out: `before` runs while the user is still signed in
 * (e.g. My Docs saves its last changes), `after` runs once they are out (e.g. My Docs clears this device).
 */
export interface SignOutHook {
  before?: () => Promise<void>;
  after?: () => void;
}
const signOutHooks = new Set<SignOutHook>();
export function onSignOut(hook: SignOutHook): () => void {
  signOutHooks.add(hook);
  return () => {
    signOutHooks.delete(hook);
  };
}

interface AuthContextValue {
  status: Status;
  user: PublicUser | null;
  signIn: (email: string, password: string) => Promise<PublicUser>;
  signUp: (input: {
    email: string;
    password: string;
    fullName: string;
    consent: boolean;
  }) => Promise<PublicUser>;
  signOut: () => Promise<void>;
  /** Deletes the account on the server (needs the password again), then signs out. */
  deleteAccount: (password: string) => Promise<void>;
  /** Saves profile fields. Does nothing for guests. */
  updateProfile: (patch: ProfileUpdate) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const settings = useSettings();
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<PublicUser | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  /** Brings the device and the account in line after a sign-in or session restore. */
  const adopt = useCallback(async (u: PublicUser) => {
    const s = settingsRef.current;
    let current = u;
    if (!u.onboarded && s.setupDone) {
      // Answers given as a guest on this device carry over to the new account.
      current = (
        await api<{ data: PublicUser }>('/me', {
          method: 'PATCH',
          body: {
            language: s.language,
            textSize: s.largeText ? 'large' : 'normal',
            goals: s.goals,
            ...(s.province ? { province: s.province } : {}),
            ...(s.municipality ? { municipality: s.municipality } : {}),
            onboarded: true,
          },
        }).catch(() => ({ data: u }))
      ).data;
    }
    if (current.onboarded) {
      s.update({
        language: current.language,
        largeText: current.textSize === 'large',
        province: current.province,
        municipality: current.municipality,
        goals: current.goals,
        introSeen: true,
        setupDone: true,
      });
    }
    setUser(current);
    setStatus('signedIn');
    return current;
  }, []);

  // Restore the session once the device settings are loaded.
  useEffect(() => {
    if (!settings.ready || status !== 'loading') return;
    void (async () => {
      try {
        const session = await refreshSession();
        if (session) await adopt(session.user);
        else setStatus('signedOut');
      } catch {
        setStatus('signedOut');
      }
    })();
  }, [settings.ready, status, adopt]);

  const signIn = useCallback(
    async (email: string, password: string) => adopt((await authApi.login(email, password)).user),
    [adopt],
  );

  const signUp = useCallback<AuthContextValue['signUp']>(
    async (input) => {
      await authApi.signup({ ...input, language: settingsRef.current.language });
      return adopt((await authApi.login(input.email, input.password)).user);
    },
    [adopt],
  );

  const signOut = useCallback(async () => {
    for (const hook of signOutHooks) await hook.before?.().catch(() => {});
    await authApi.logout().catch(() => {});
    setUser(null);
    setStatus('signedOut');
    for (const hook of signOutHooks) hook.after?.();
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    await authApi.deleteAccount(password);
    setUser(null);
    setStatus('signedOut');
    for (const hook of signOutHooks) hook.after?.();
  }, []);

  const updateProfile = useCallback(
    async (patch: ProfileUpdate) => {
      if (status !== 'signedIn') return;
      const { data } = await api<{ data: PublicUser }>('/me', { method: 'PATCH', body: patch });
      setUser(data);
    },
    [status],
  );

  const value = useMemo(
    () => ({ status, user, signIn, signUp, signOut, deleteAccount, updateProfile }),
    [status, user, signIn, signUp, signOut, deleteAccount, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
