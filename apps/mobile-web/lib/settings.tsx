/**
 * App-wide display settings: language and large-text mode (plan §3.1 G and H.3).
 * Saved on the device so they survive restarts; synced to the profile in Phase 2.
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
import { font, type TextVariant } from '@dokyu/shared';
import { i18n, type Language, detectLanguage } from './i18n';

const STORAGE_KEY = 'dokyu.settings.v1';

interface Settings {
  language: Language;
  largeText: boolean;
}

interface SettingsContextValue extends Settings {
  ready: boolean;
  setLanguage: (language: Language) => void;
  setLargeText: (largeText: boolean) => void;
  /** Font size for a text variant, honouring large-text mode. */
  textSize: (variant: TextVariant) => number;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function isSettings(value: unknown): value is Partial<Settings> {
  return typeof value === 'object' && value !== null;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    language: detectLanguage(),
    largeText: false,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved: unknown = JSON.parse(raw);
        if (!isSettings(saved)) return;
        setSettings((s) => ({
          language:
            saved.language === 'tl' || saved.language === 'en' ? saved.language : s.language,
          largeText: typeof saved.largeText === 'boolean' ? saved.largeText : s.largeText,
        }));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (i18n.language !== settings.language) i18n.changeLanguage(settings.language).catch(() => {});
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, ready]);

  const setLanguage = useCallback(
    (language: Language) => setSettings((s) => ({ ...s, language })),
    [],
  );
  const setLargeText = useCallback(
    (largeText: boolean) => setSettings((s) => ({ ...s, largeText })),
    [],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      ready,
      setLanguage,
      setLargeText,
      textSize: (variant) => (settings.largeText ? font.sizeLarge : font.size)[variant],
    }),
    [settings, ready, setLanguage, setLargeText],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
