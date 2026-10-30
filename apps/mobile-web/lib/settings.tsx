/**
 * Settings kept on the device: language, large text and the onboarding answers (plan §3.1 G and H.3).
 * Guests keep them only here; for signed-in users they are also saved to the profile (lib/auth.tsx).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { font, type GoalSlug, type TextVariant } from '@dokyu/shared';
import { i18n, type Language, detectLanguage } from './i18n';

const STORAGE_KEY = 'dokyu.settings.v1';

export interface Settings {
  language: Language;
  largeText: boolean;
  /** The intro slides were shown (or skipped). */
  introSeen: boolean;
  /** Language, area and goals were answered (or skipped). */
  setupDone: boolean;
  province: string | null;
  municipality: string | null;
  goals: GoalSlug[];
  /** Doki's Home tour was finished or skipped. */
  tourSeen: boolean;
}

interface SettingsContextValue extends Settings {
  ready: boolean;
  setLanguage: (language: Language) => void;
  setLargeText: (largeText: boolean) => void;
  update: (patch: Partial<Settings>) => void;
  /** Font size for a text variant, honouring large-text mode. */
  textSize: (variant: TextVariant) => number;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readSaved(raw: string | null, fallback: Settings): Settings {
  if (!raw) return fallback;
  let saved: unknown;
  try {
    saved = JSON.parse(raw);
  } catch {
    return fallback;
  }
  if (typeof saved !== 'object' || saved === null) return fallback;
  const s = saved as Record<string, unknown>;
  return {
    language: s.language === 'tl' || s.language === 'en' ? s.language : fallback.language,
    largeText: typeof s.largeText === 'boolean' ? s.largeText : fallback.largeText,
    introSeen: s.introSeen === true,
    tourSeen: s.tourSeen === true,
    setupDone: s.setupDone === true,
    province: typeof s.province === 'string' ? s.province : null,
    municipality: typeof s.municipality === 'string' ? s.municipality : null,
    goals: Array.isArray(s.goals)
      ? (s.goals.filter((g) => typeof g === 'string') as GoalSlug[])
      : [],
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    language: detectLanguage(),
    largeText: false,
    introSeen: false,
    setupDone: false,
    province: null,
    municipality: null,
    goals: [],
    tourSeen: false,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setSettings((s) => readSaved(raw, s)))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (i18n.language !== settings.language) i18n.changeLanguage(settings.language).catch(() => {});
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, ready]);

  const update = useCallback(
    (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })),
    [],
  );
  const setLanguage = useCallback((language: Language) => update({ language }), [update]);
  const setLargeText = useCallback((largeText: boolean) => update({ largeText }), [update]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      ready,
      setLanguage,
      setLargeText,
      update,
      textSize: (variant) => (settings.largeText ? font.sizeLarge : font.size)[variant],
    }),
    [settings, ready, setLanguage, setLargeText, update],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
