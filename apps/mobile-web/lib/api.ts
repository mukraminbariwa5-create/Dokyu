/**
 * Talks to the Dokyu API. Keeps the 15-minute access token in memory only and renews it with the refresh token:
 * on the web the refresh token lives in an httpOnly cookie (JavaScript never sees it); on Android it lives in
 * the phone's secure storage (expo-secure-store).
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { PublicUser } from '@dokyu/shared';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000').replace(
  /\/$/,
  '',
);
/**
 * The public web preview (GitHub Pages) has no server yet, so accounts are switched off there and every
 * screen that needs one says so instead of failing. Set EXPO_PUBLIC_PREVIEW=1 at build time.
 */
export const ACCOUNTS_ENABLED = process.env.EXPO_PUBLIC_PREVIEW !== '1';
const CLIENT = Platform.OS === 'web' ? 'web' : 'native';
const REFRESH_KEY = 'dokyu.refresh';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Per-field messages for forms, from the API's Zod validation. */
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

export interface SessionResponse {
  user: PublicUser;
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}

let accessToken: string | null = null;
let refreshing: Promise<SessionResponse | null> | null = null;

const refreshStore = {
  async get() {
    return CLIENT === 'native' ? SecureStore.getItemAsync(REFRESH_KEY) : null;
  },
  async set(token: string | undefined) {
    if (CLIENT === 'native' && token) await SecureStore.setItemAsync(REFRESH_KEY, token);
  },
  async clear() {
    if (CLIENT === 'native') await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

async function raw<T>(
  path: string,
  init: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  if (!ACCOUNTS_ENABLED) throw new ApiError(0, 'Accounts are not available in this preview yet.');
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, {
      method: init.method ?? 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Dokyu-Client': CLIENT,
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError(0, 'No connection. Check your internet and try again.');
  }
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    fields?: Record<string, string>;
  } & T;
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Something went wrong', data.fields);
  return data;
}

/** Saves a new session's tokens. */
async function keep(session: SessionResponse) {
  accessToken = session.accessToken;
  await refreshStore.set(session.refreshToken);
  return session;
}

/** Renews the access token. Several callers at once share one request (the refresh token is single-use). */
export function refreshSession(): Promise<SessionResponse | null> {
  refreshing ??= (async () => {
    try {
      const stored = await refreshStore.get();
      if (CLIENT === 'native' && !stored) return null;
      return await keep(
        await raw<SessionResponse>('/auth/refresh', {
          method: 'POST',
          body: stored ? { refreshToken: stored } : {},
        }),
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        accessToken = null;
        await refreshStore.clear();
      }
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/** Calls the API as the signed-in user, renewing the access token once if it has expired. */
export async function api<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  try {
    return await raw<T>(path, { ...init, token: accessToken });
  } catch (e) {
    if (!(e instanceof ApiError) || e.status !== 401) throw e;
    const renewed = await refreshSession();
    if (!renewed) throw e;
    return raw<T>(path, { ...init, token: accessToken });
  }
}

export const authApi = {
  async login(email: string, password: string) {
    return keep(
      await raw<SessionResponse>('/auth/login', { method: 'POST', body: { email, password } }),
    );
  },
  signup(body: {
    email: string;
    password: string;
    fullName: string;
    language: string;
    consent: boolean;
  }) {
    return raw<{ message: string }>('/auth/signup', { method: 'POST', body });
  },
  async logout() {
    const stored = await refreshStore.get();
    try {
      await raw('/auth/logout', { method: 'POST', body: stored ? { refreshToken: stored } : {} });
    } finally {
      accessToken = null;
      await refreshStore.clear();
    }
  },
  forgot(email: string) {
    return raw<{ message: string }>('/auth/forgot', { method: 'POST', body: { email } });
  },
  reset(token: string, password: string) {
    return raw<{ message: string }>('/auth/reset', { method: 'POST', body: { token, password } });
  },
  verifyEmail(token: string) {
    return raw<{ message: string }>('/auth/verify-email', { method: 'POST', body: { token } });
  },
  exportMyData() {
    return api<Record<string, unknown>>('/me/export');
  },
  async deleteAccount(password: string) {
    await api('/me', { method: 'DELETE', body: { password } });
    accessToken = null;
    await refreshStore.clear();
  },
  resendVerification() {
    return api<{ message: string }>('/auth/resend-verification', { method: 'POST', body: {} });
  },
};
