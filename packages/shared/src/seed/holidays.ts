/**
 * Nationwide holidays. Sources: Proclamation No. 1006 s. 2025 (2026 list), Proclamation No. 1189 s. 2026
 * (Eid'l Fitr, 20 Mar 2026), Proclamation No. 1264 s. 2026 (Eid'l Adha, 27 May 2026) and
 * Proclamation No. 1427 s. 2026 (2027 list). Eid'l Fitr and Eid'l Adha 2027 are proclaimed separately later.
 * Checked 2026-10-30.
 */
import type { Localized } from '../guides';

export type HolidayKind = 'regular' | 'special' | 'specialWorking';

export interface Holiday {
  /** YYYY-MM-DD, Philippine time. */
  date: string;
  name: Localized;
  kind: HolidayKind;
  source: string;
}

const P2026 =
  'https://pco.gov.ph/news_releases/pbbm-issues-proclamation-declaring-regular-holidays-special-non-working-days-for-2026/';
const P2027 = 'https://www.officialgazette.gov.ph/ (Proclamation No. 1427, s. 2026)';

const h = (date: string, en: string, tl: string, kind: HolidayKind, source: string): Holiday => ({
  date,
  name: { en, tl },
  kind,
  source,
});

export const HOLIDAYS: Holiday[] = [
  h('2026-01-01', "New Year's Day", 'Bagong Taon', 'regular', P2026),
  h('2026-02-17', 'Chinese New Year', 'Chinese New Year', 'special', P2026),
  h('2026-02-25', 'EDSA People Power Anniversary', 'Anibersaryo ng EDSA', 'specialWorking', P2026),
  h('2026-03-20', "Eid'l Fitr", "Eid'l Fitr", 'regular', 'Proclamation No. 1189, s. 2026'),
  h('2026-04-02', 'Maundy Thursday', 'Huwebes Santo', 'regular', P2026),
  h('2026-04-03', 'Good Friday', 'Biyernes Santo', 'regular', P2026),
  h('2026-04-04', 'Black Saturday', 'Sabado de Gloria', 'special', P2026),
  h('2026-04-09', 'Araw ng Kagitingan', 'Araw ng Kagitingan', 'regular', P2026),
  h('2026-05-01', 'Labor Day', 'Araw ng Paggawa', 'regular', P2026),
  h('2026-05-27', "Eid'l Adha", "Eid'l Adha", 'regular', 'Proclamation No. 1264, s. 2026'),
  h('2026-06-12', 'Independence Day', 'Araw ng Kalayaan', 'regular', P2026),
  h('2026-08-21', 'Ninoy Aquino Day', 'Araw ni Ninoy Aquino', 'special', P2026),
  h('2026-08-31', 'National Heroes Day', 'Araw ng mga Bayani', 'regular', P2026),
  h('2026-11-01', "All Saints' Day", 'Undas (Todos los Santos)', 'special', P2026),
  h('2026-11-02', "All Souls' Day", 'Araw ng mga Kaluluwa', 'special', P2026),
  h('2026-11-30', 'Bonifacio Day', 'Araw ni Bonifacio', 'regular', P2026),
  h(
    '2026-12-08',
    'Feast of the Immaculate Conception',
    'Kapistahan ng Immaculada Concepcion',
    'special',
    P2026,
  ),
  h('2026-12-24', 'Christmas Eve', 'Bisperas ng Pasko', 'special', P2026),
  h('2026-12-25', 'Christmas Day', 'Pasko', 'regular', P2026),
  h('2026-12-30', 'Rizal Day', 'Araw ni Rizal', 'regular', P2026),
  h('2026-12-31', 'Last Day of the Year', 'Huling Araw ng Taon', 'special', P2026),

  h('2027-01-01', "New Year's Day", 'Bagong Taon', 'regular', P2027),
  h('2027-02-06', 'Chinese New Year', 'Chinese New Year', 'special', P2027),
  h('2027-02-25', 'EDSA People Power Anniversary', 'Anibersaryo ng EDSA', 'specialWorking', P2027),
  h('2027-03-25', 'Maundy Thursday', 'Huwebes Santo', 'regular', P2027),
  h('2027-03-26', 'Good Friday', 'Biyernes Santo', 'regular', P2027),
  h('2027-03-27', 'Black Saturday', 'Sabado de Gloria', 'special', P2027),
  h('2027-04-09', 'Araw ng Kagitingan', 'Araw ng Kagitingan', 'regular', P2027),
  h('2027-05-01', 'Labor Day', 'Araw ng Paggawa', 'regular', P2027),
  h('2027-06-12', 'Independence Day', 'Araw ng Kalayaan', 'regular', P2027),
  h('2027-08-21', 'Ninoy Aquino Day', 'Araw ni Ninoy Aquino', 'special', P2027),
  h('2027-08-30', 'National Heroes Day', 'Araw ng mga Bayani', 'regular', P2027),
  h('2027-11-01', "All Saints' Day", 'Undas (Todos los Santos)', 'special', P2027),
  h('2027-11-02', "All Souls' Day", 'Araw ng mga Kaluluwa', 'special', P2027),
  h('2027-11-30', 'Bonifacio Day', 'Araw ni Bonifacio', 'regular', P2027),
  h(
    '2027-12-08',
    'Feast of the Immaculate Conception',
    'Kapistahan ng Immaculada Concepcion',
    'special',
    P2027,
  ),
  h('2027-12-24', 'Christmas Eve', 'Bisperas ng Pasko', 'special', P2027),
  h('2027-12-25', 'Christmas Day', 'Pasko', 'regular', P2027),
  h('2027-12-30', 'Rizal Day', 'Araw ni Rizal', 'regular', P2027),
  h('2027-12-31', 'Last Day of the Year', 'Huling Araw ng Taon', 'special', P2027),
];

/** Shown under the list: the two Islamic holidays for 2027 come later. */
export const HOLIDAYS_PENDING: Localized = {
  en: "Eid'l Fitr and Eid'l Adha 2027 are declared separately once their dates are set. Local holidays (like a city's founding day) can also close offices.",
  tl: "Hiwalay na idedeklara ang Eid'l Fitr at Eid'l Adha 2027 kapag naitakda na ang petsa. Maaari ring magsara ang opisina sa lokal na holiday (gaya ng araw ng lungsod).",
};
