/**
 * Office Finder logic shared by the app and the API: Philippine-time clock, holidays, open/closed status,
 * opening-hours text, distance and directions links. Pure functions, easy to test.
 */
import type { Localized } from './guides';
import type { Holiday } from './seed/holidays';
import type { OfficeSeed, OpeningHours } from './seed/offices';

export interface ManilaTime {
  /** YYYY-MM-DD */
  iso: string;
  year: number;
  month: number;
  day: number;
  /** 0 = Sunday … 6 = Saturday */
  dow: number;
  /** Minutes since midnight. */
  minutes: number;
}

/** The Philippines is UTC+8 all year (no daylight saving), so this works on any phone's time zone. */
export function manilaTime(date: Date): ManilaTime {
  const t = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const year = t.getUTCFullYear();
  const month = t.getUTCMonth() + 1;
  const day = t.getUTCDate();
  return {
    iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    year,
    month,
    day,
    dow: t.getUTCDay(),
    minutes: t.getUTCHours() * 60 + t.getUTCMinutes(),
  };
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** A holiday that closes government offices (special working days do not). */
export function closingHoliday(iso: string, holidays: Holiday[]): Holiday | undefined {
  return holidays.find((h) => h.date === iso && h.kind !== 'specialWorking');
}

export type OfficeStatus =
  | { state: 'open'; closesAt: string; closingSoon: boolean }
  | { state: 'closed'; reason: 'hours' }
  | { state: 'closed'; reason: 'holiday'; holiday: Localized }
  | { state: 'closed'; reason: 'local'; holiday: Localized }
  | { state: 'unknown' };

function hoursOn(office: Pick<OfficeSeed, 'hours'>, dow: number): OpeningHours | undefined {
  return office.hours.find((h) => h.days.includes(dow));
}

function localClosure(office: Pick<OfficeSeed, 'usuallyClosed'>, t: ManilaTime) {
  return office.usuallyClosed?.find((c) => c.month === t.month && c.day === t.day);
}

export function officeStatus(
  office: Pick<OfficeSeed, 'hours' | 'usuallyClosed'>,
  now: Date,
  holidays: Holiday[],
): OfficeStatus {
  if (office.hours.length === 0) return { state: 'unknown' };
  const t = manilaTime(now);
  const holiday = closingHoliday(t.iso, holidays);
  if (holiday) return { state: 'closed', reason: 'holiday', holiday: holiday.name };
  const local = localClosure(office, t);
  if (local) return { state: 'closed', reason: 'local', holiday: local.reason };
  const today = hoursOn(office, t.dow);
  if (!today) return { state: 'closed', reason: 'hours' };
  const open = toMinutes(today.open);
  const close = toMinutes(today.close);
  if (t.minutes >= open && t.minutes < close)
    return { state: 'open', closesAt: today.close, closingSoon: close - t.minutes <= 60 };
  return { state: 'closed', reason: 'hours' };
}

/** When the office next opens (within two weeks), skipping holidays. `daysAhead` 0 = later today. */
export function nextOpening(
  office: Pick<OfficeSeed, 'hours' | 'usuallyClosed'>,
  now: Date,
  holidays: Holiday[],
): { daysAhead: number; date: ManilaTime; open: string } | null {
  const nowT = manilaTime(now);
  for (let i = 0; i < 15; i++) {
    const t = manilaTime(addDays(now, i));
    if (closingHoliday(t.iso, holidays) || localClosure(office, t)) continue;
    const h = hoursOn(office, t.dow);
    if (!h) continue;
    if (i === 0 && nowT.minutes >= toMinutes(h.open)) continue;
    return { daysAhead: i, date: t, open: h.open };
  }
  return null;
}

/** "8:00 AM" style. */
export function formatClock(hhmm: string): string {
  const mins = toMinutes(hhmm);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

const DAY_SHORT = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  tl: ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'],
};

/** "Mon–Fri · 8:00 AM–5:00 PM" */
export function hoursText(office: Pick<OfficeSeed, 'hours'>, language: 'en' | 'tl'): string[] {
  const names = DAY_SHORT[language];
  return office.hours.map((h) => {
    const days = [...h.days].sort((a, b) => a - b);
    const first = days[0] ?? 1;
    const last = days[days.length - 1] ?? first;
    const consecutive = days.every((d, i) => d === first + i);
    const dayText =
      days.length === 1
        ? names[first]
        : consecutive
          ? `${names[first]}–${names[last]}`
          : days.map((d) => names[d]).join(', ');
    return `${dayText} · ${formatClock(h.open)}–${formatClock(h.close)}`;
  });
}

/** Great-circle distance in kilometres. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Directions by name and address (more reliable than an approximate pin). */
export function directionsUrl(office: Pick<OfficeSeed, 'name' | 'address'>): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${office.name}, ${office.address}`,
  )}`;
}

export function telUrl(phone: string): string {
  // "(02) 8461-0500 loc. 201" → "tel:0284610500"
  const main = phone.split(/loc\.?/i)[0] ?? phone;
  return `tel:${main.replace(/[^\d+]/g, '')}`;
}

export function officesForGuide<T extends Pick<OfficeSeed, 'guides'>>(
  offices: T[],
  slug: string,
): T[] {
  return offices.filter((o) => o.guides.includes(slug));
}

/** Holidays from today on (Philippine date), soonest first. */
export function upcomingHolidays(holidays: Holiday[], now: Date): Holiday[] {
  const today = manilaTime(now).iso;
  return holidays.filter((h) => h.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}
