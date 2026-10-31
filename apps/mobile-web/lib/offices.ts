/** Office Finder helpers for the app: live clock, "near me", and status words. */
import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import type { TFunction } from 'i18next';
import {
  HOLIDAYS,
  OFFICES,
  formatClock,
  nextOpening,
  officeStatus,
  pick,
  type OfficeSeed,
} from '@dokyu/shared';

export const AGENCY_MONO: Record<OfficeSeed['agency'], string> = {
  PSA: 'PSA',
  NBI: 'NBI',
  DFA: 'DFA',
  PNP: 'PNP',
  PHLPost: 'POST',
  PhilHealth: 'PH',
};

export function useOffice(slug: string | undefined) {
  return OFFICES.find((o) => o.slug === slug);
}

/** The current time, refreshed every minute so "Open now" stays true. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export type LocationState =
  | { state: 'idle' }
  | { state: 'asking' }
  | { state: 'denied' }
  | { state: 'error' }
  | { state: 'ok'; lat: number; lng: number };

/** Asks for location only when the user taps "Near me". It stays on the phone; it is never sent or saved. */
export function useMyLocation() {
  const [loc, setLoc] = useState<LocationState>({ state: 'idle' });
  const ask = useCallback(async () => {
    setLoc({ state: 'asking' });
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setLoc({ state: 'denied' });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLoc({ state: 'ok', lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      setLoc({ state: 'error' });
    }
  }, []);
  const clear = useCallback(() => setLoc({ state: 'idle' }), []);
  return { loc, ask, clear };
}

export type StatusTone = 'open' | 'soon' | 'closed' | 'holiday';

/** "Open now · until 5:00 PM", "Closed · opens Tue 7:00 AM", "Closed today: Christmas Day". */
export function statusWords(
  office: OfficeSeed,
  now: Date,
  t: TFunction,
  language: 'en' | 'tl',
): { tone: StatusTone; text: string } {
  const s = officeStatus(office, now, HOLIDAYS);
  if (s.state === 'open')
    return {
      tone: s.closingSoon ? 'soon' : 'open',
      text: s.closingSoon
        ? t('offices.closingSoon', { time: formatClock(s.closesAt) })
        : t('offices.openUntil', { time: formatClock(s.closesAt) }),
    };
  if (s.state === 'closed' && (s.reason === 'holiday' || s.reason === 'local'))
    return {
      tone: 'holiday',
      text: t('offices.closedHoliday', { name: pick(s.holiday, language) }),
    };
  const next = nextOpening(office, now, HOLIDAYS);
  if (!next) return { tone: 'closed', text: t('offices.closed') };
  const when =
    next.daysAhead === 0
      ? t('offices.today')
      : next.daysAhead === 1
        ? t('offices.tomorrow')
        : t(`days.${next.date.dow}`);
  return {
    tone: 'closed',
    text: t('offices.closedOpens', { when, time: formatClock(next.open) }),
  };
}
