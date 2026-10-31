/**
 * Offices for the Office Finder (plan §3.1 D), first areas: Metro Manila and Sulu (with Zamboanga City,
 * where Sulu residents go for a passport and the NBI regional office). Checked 2026-10-30 against the sources
 * listed on each office. Map pins are approximate: the app says so and shows the landmark and directions.
 */
import type { Localized } from '../guides';

/** 1 = Monday … 6 = Saturday, 0 = Sunday. Times are Philippine time, 24-hour "HH:MM". */
export interface OpeningHours {
  days: number[];
  open: string;
  close: string;
}

export interface OfficeSeed {
  slug: string;
  agency: 'PSA' | 'NBI' | 'DFA' | 'PNP' | 'PHLPost' | 'PhilHealth';
  name: string;
  address: string;
  municipality: string;
  province: string;
  area: 'metro-manila' | 'sulu' | 'zamboanga';
  /** Approximate pin. */
  lat: number;
  lng: number;
  landmark?: Localized;
  phone?: string;
  email?: string;
  /** Guide slugs you can do here. */
  guides: string[];
  /** What happens here, in plain words. */
  services: Localized;
  hours: OpeningHours[];
  hoursNote?: Localized;
  /** True when the hours come from the agency itself. */
  hoursConfirmed: boolean;
  /** Booking link when the office works by appointment. */
  appointment?: { url: string; label: Localized };
  /** Local holidays when this office usually closes (month 1–12). */
  usuallyClosed?: Array<{ month: number; day: number; reason: Localized }>;
  tip?: Localized;
  source: string;
  lastVerified: string;
}

const WEEKDAYS = [1, 2, 3, 4, 5];
const CHECKED = '2026-10-30';

export const OFFICES: OfficeSeed[] = [
  // ---- Metro Manila ----
  {
    slug: 'psa-crs-east-avenue',
    agency: 'PSA',
    name: 'PSA Central Outlet (CRS Building)',
    address: 'CRS Building, PSA Complex, East Avenue, Diliman, Quezon City',
    municipality: 'Quezon City',
    province: 'Metro Manila',
    area: 'metro-manila',
    lat: 14.6446,
    lng: 121.0492,
    landmark: {
      en: 'Inside the PSA Complex on East Avenue, near the government offices along Agham Road.',
      tl: 'Sa loob ng PSA Complex sa East Avenue, malapit sa mga opisina ng gobyerno sa Agham Road.',
    },
    phone: '(02) 8461-0500',
    guides: ['psa-birth-certificate'],
    services: {
      en: 'Birth, marriage and death certificates and CENOMAR. Special lane for seniors, PWDs and pregnant women.',
      tl: 'Birth, marriage at death certificate at CENOMAR. May special lane para sa senior, PWD at buntis.',
    },
    hours: [{ days: WEEKDAYS, open: '07:00', close: '17:00' }],
    hoursConfirmed: true,
    appointment: {
      url: 'https://appointment.psa.gov.ph',
      label: { en: 'Book a PSA appointment', tl: 'Mag-book ng PSA appointment' },
    },
    tip: {
      en: 'Arrive 30 minutes before your appointment and bring the slip and a valid ID.',
      tl: 'Dumating 30 minuto bago ang appointment at dalhin ang slip at valid ID.',
    },
    source: 'https://rsso01.psa.gov.ph/node/55001',
    lastVerified: CHECKED,
  },
  {
    slug: 'psa-crs-pasig',
    agency: 'PSA',
    name: 'PSA CRS Outlet Pasig City',
    address: 'Pasig City Hall Compound, Caruncho Ave., Brgy. San Nicolas, Pasig City',
    municipality: 'Pasig',
    province: 'Metro Manila',
    area: 'metro-manila',
    lat: 14.5601,
    lng: 121.0765,
    landmark: {
      en: 'Inside the Pasig City Hall compound on Caruncho Avenue.',
      tl: 'Sa loob ng compound ng Pasig City Hall sa Caruncho Avenue.',
    },
    phone: '(02) 8292-0910',
    guides: ['psa-birth-certificate'],
    services: {
      en: 'PSA certificates. The city adds its own fee on top of the PSA fee.',
      tl: 'PSA certificates. May dagdag na bayad ang lungsod bukod sa bayad sa PSA.',
    },
    hours: [{ days: WEEKDAYS, open: '07:00', close: '17:00' }],
    hoursNote: {
      en: 'Metro Manila PSA outlets open Monday to Friday. Call ahead before a long trip.',
      tl: 'Bukas ang mga PSA outlet sa Metro Manila Lunes hanggang Biyernes. Tumawag muna bago bumiyahe nang malayo.',
    },
    hoursConfirmed: false,
    appointment: {
      url: 'https://appointment.psa.gov.ph',
      label: { en: 'Book a PSA appointment', tl: 'Mag-book ng PSA appointment' },
    },
    source: 'https://rssomimaropa.psa.gov.ph/node/1684041229',
    lastVerified: CHECKED,
  },
  {
    slug: 'psa-crs-manila-bay',
    agency: 'PSA',
    name: 'PSA CRS Outlet Ayala Malls Manila Bay',
    address:
      '5th Floor, Ayala Malls Manila Bay, Diosdado Macapagal Blvd. cor. Aseana Ave., Parañaque City',
    municipality: 'Parañaque',
    province: 'Metro Manila',
    area: 'metro-manila',
    lat: 14.5205,
    lng: 120.9897,
    landmark: {
      en: '5th floor of Ayala Malls Manila Bay, near DFA Aseana.',
      tl: 'Ika-5 palapag ng Ayala Malls Manila Bay, malapit sa DFA Aseana.',
    },
    guides: ['psa-birth-certificate'],
    services: {
      en: 'PSA certificates (it replaced the old Pasay outlet in 2023).',
      tl: 'PSA certificates (ito ang pumalit sa lumang outlet sa Pasay noong 2023).',
    },
    hours: [{ days: WEEKDAYS, open: '07:00', close: '17:00' }],
    hoursConfirmed: false,
    appointment: {
      url: 'https://appointment.psa.gov.ph',
      label: { en: 'Book a PSA appointment', tl: 'Mag-book ng PSA appointment' },
    },
    source: 'https://psa.gov.ph/content/public-advisory-14',
    lastVerified: CHECKED,
  },
  {
    slug: 'nbi-main-clearance',
    agency: 'NBI',
    name: 'NBI Main Clearance Processing Center',
    address: 'NBI Clearance Building, United Nations Avenue, Ermita, Manila',
    municipality: 'Manila',
    province: 'Metro Manila',
    area: 'metro-manila',
    lat: 14.5797,
    lng: 120.9848,
    landmark: {
      en: 'Along UN Avenue in Ermita, near the corner of Taft Avenue (UN Avenue LRT station).',
      tl: 'Sa UN Avenue sa Ermita, malapit sa kanto ng Taft Avenue (UN Avenue LRT station).',
    },
    guides: ['nbi-clearance'],
    services: {
      en: 'NBI clearance: photo, fingerprints and release. Register and pay online first.',
      tl: 'NBI clearance: litrato, fingerprint at release. Mag-register at magbayad muna online.',
    },
    hours: [{ days: WEEKDAYS, open: '08:00', close: '17:00' }],
    hoursConfirmed: false,
    appointment: {
      url: 'https://clearance.nbi.gov.ph',
      label: { en: 'Register and pick a date', tl: 'Mag-register at pumili ng petsa' },
    },
    tip: {
      en: 'Go only on your appointment date. Seniors, PWDs and pregnant women can usually walk in.',
      tl: 'Pumunta lang sa petsa ng appointment mo. Kadalasang puwedeng walk-in ang senior, PWD at buntis.',
    },
    source:
      'https://www.gmanetwork.com/news/topstories/metro/932248/no-nbi-clearance-processing-in-manila-on-january-9/story',
    lastVerified: CHECKED,
  },
  {
    slug: 'dfa-aseana',
    agency: 'DFA',
    name: 'DFA Office of Consular Affairs (Aseana)',
    address:
      'Aseana Business Park, Diosdado Macapagal Blvd. cor. Bradco Ave., Brgy. Tambo, Parañaque City',
    municipality: 'Parañaque',
    province: 'Metro Manila',
    area: 'metro-manila',
    lat: 14.5295,
    lng: 120.9917,
    landmark: {
      en: 'Corner of Macapagal Boulevard and Bradco Avenue in Aseana City.',
      tl: 'Kanto ng Macapagal Boulevard at Bradco Avenue sa Aseana City.',
    },
    phone: '(02) 8651-9400',
    guides: ['passport'],
    services: {
      en: 'Passport applications and renewals, by appointment.',
      tl: 'Aplikasyon at renewal ng pasaporte, may appointment.',
    },
    hours: [{ days: WEEKDAYS, open: '08:00', close: '17:00' }],
    hoursNote: {
      en: 'Your appointment slip shows your exact time. Arrive 30 minutes early.',
      tl: 'Nasa appointment slip mo ang eksaktong oras. Dumating 30 minuto bago.',
    },
    hoursConfirmed: false,
    appointment: {
      url: 'https://www.passport.gov.ph/appointment',
      label: { en: 'Book a passport appointment', tl: 'Mag-book ng appointment sa pasaporte' },
    },
    usuallyClosed: [
      {
        month: 2,
        day: 13,
        reason: {
          en: 'Parañaque Day (city holiday)',
          tl: 'Araw ng Parañaque (holiday ng lungsod)',
        },
      },
    ],
    source:
      'https://dfa.gov.ph/authentication-functions/113-newsroom/public-advisory/36127-suspension-of-operations-in-the-office-of-consular-affairs-aseana-in-celebration-of-paranaque-day',
    lastVerified: CHECKED,
  },
  {
    slug: 'phlpost-manila-central',
    agency: 'PHLPost',
    name: 'Manila Central Post Office',
    address: 'Liwasang Bonifacio, Magallanes Drive, Ermita, Manila',
    municipality: 'Manila',
    province: 'Metro Manila',
    area: 'metro-manila',
    lat: 14.5965,
    lng: 120.9775,
    landmark: {
      en: 'The big columned building at the end of Liwasang Bonifacio, beside the Pasig River.',
      tl: 'Ang malaking gusaling may haligi sa dulo ng Liwasang Bonifacio, sa tabi ng Pasig River.',
    },
    phone: '(02) 8527-0089',
    guides: ['postal-id'],
    services: {
      en: 'Postal ID application and capture, with same-day release offered in 2026.',
      tl: 'Aplikasyon at capture ng Postal ID, may same-day release noong 2026.',
    },
    hours: [{ days: WEEKDAYS, open: '08:00', close: '17:00' }],
    hoursConfirmed: false,
    source:
      'https://tribune.net.ph/2026/06/24/phlpost-offers-same-day-postal-id-release-on-manila-day',
    lastVerified: CHECKED,
  },

  // ---- Sulu ----
  {
    slug: 'psa-sulu',
    agency: 'PSA',
    name: 'PSA Sulu Provincial Office & PhilSys Registration Center',
    address: '2nd Floor, Notre Dame Commercial Complex, Sanchez St., Walled City, Jolo, Sulu 7400',
    municipality: 'Jolo',
    province: 'Sulu',
    area: 'sulu',
    lat: 6.0538,
    lng: 121.0006,
    landmark: {
      en: '2nd floor of the Notre Dame Commercial Complex (NDCC) on Sanchez Street, Walled City.',
      tl: 'Ika-2 palapag ng Notre Dame Commercial Complex (NDCC) sa Sanchez Street, Walled City.',
    },
    phone: '(085) 341-8911 loc. 2461',
    email: 'sulu@psa.gov.ph',
    guides: ['national-id', 'psa-birth-certificate'],
    services: {
      en: 'National ID registration and updates, and help with civil registry documents.',
      tl: 'Registration at pag-update ng National ID, at tulong sa civil registry documents.',
    },
    hours: [{ days: WEEKDAYS, open: '08:00', close: '17:00' }],
    hoursNote: {
      en: 'Government office hours. Mobile registration also visits schools and barangays.',
      tl: 'Oras ng opisina ng gobyerno. May mobile registration din sa mga paaralan at barangay.',
    },
    hoursConfirmed: false,
    source: 'https://psa.gov.ph/directory/autonomous-region-in-muslim-mindanao',
    lastVerified: CHECKED,
  },
  {
    slug: 'pnp-jolo',
    agency: 'PNP',
    name: 'Jolo Municipal Police Station',
    address: 'Brgy. Walled City, Jolo, Sulu',
    municipality: 'Jolo',
    province: 'Sulu',
    area: 'sulu',
    lat: 6.0545,
    lng: 121.0015,
    guides: ['police-clearance'],
    services: {
      en: 'National Police Clearance: pick this station when you book on pnpclearance.ph.',
      tl: 'National Police Clearance: piliin ang istasyong ito kapag nag-book sa pnpclearance.ph.',
    },
    hours: [{ days: WEEKDAYS, open: '08:00', close: '17:00' }],
    hoursNote: {
      en: 'Clearance desk hours. The station itself is open 24 hours.',
      tl: 'Oras ng clearance desk. Bukas nang 24 oras ang istasyon mismo.',
    },
    hoursConfirmed: false,
    appointment: {
      url: 'https://pnpclearance.ph',
      label: { en: 'Book on pnpclearance.ph', tl: 'Mag-book sa pnpclearance.ph' },
    },
    source: 'https://pnpclearance.ph',
    lastVerified: CHECKED,
  },

  // ---- Zamboanga City (serves Sulu, Basilan and Tawi-Tawi) ----
  {
    slug: 'dfa-zamboanga',
    agency: 'DFA',
    name: 'DFA Consular Office Zamboanga',
    address: 'Go-Velayo Bldg., Veterans Ave., Zamboanga City',
    municipality: 'Zamboanga City',
    province: 'Zamboanga del Sur',
    area: 'zamboanga',
    lat: 6.912,
    lng: 122.0745,
    phone: '(062) 991-4398',
    guides: ['passport'],
    services: {
      en: 'Passports for Zamboanga, Basilan, Sulu and Tawi-Tawi, by appointment.',
      tl: 'Pasaporte para sa Zamboanga, Basilan, Sulu at Tawi-Tawi, may appointment.',
    },
    hours: [{ days: WEEKDAYS, open: '08:00', close: '17:00' }],
    hoursNote: {
      en: 'Confirm the address on your appointment slip; offices sometimes move.',
      tl: 'Kumpirmahin ang address sa appointment slip mo; minsan lumilipat ang opisina.',
    },
    hoursConfirmed: false,
    appointment: {
      url: 'https://www.passport.gov.ph/appointment',
      label: { en: 'Book a passport appointment', tl: 'Mag-book ng appointment sa pasaporte' },
    },
    usuallyClosed: [
      {
        month: 2,
        day: 26,
        reason: {
          en: 'Dia de Zamboanga (city holiday)',
          tl: 'Dia de Zamboanga (holiday ng lungsod)',
        },
      },
    ],
    source:
      'https://dfa.gov.ph/authentication-functions/113-newsroom/public-advisory/36137-suspension-of-operations-in-dfa-consular-office-zamboanga-on-26-february-2025',
    lastVerified: CHECKED,
  },
  {
    slug: 'nbi-wemro',
    agency: 'NBI',
    name: 'NBI Western Mindanao Regional Office',
    address: 'Edificio Costal Building, Corcuera St., Zamboanga City',
    municipality: 'Zamboanga City',
    province: 'Zamboanga del Sur',
    area: 'zamboanga',
    lat: 6.9067,
    lng: 122.076,
    guides: ['nbi-clearance', 'national-id'],
    services: {
      en: 'NBI clearance, plus a National ID registration desk set up with PSA in 2024.',
      tl: 'NBI clearance, at may National ID registration desk kasama ang PSA mula 2024.',
    },
    hours: [{ days: WEEKDAYS, open: '08:00', close: '17:00' }],
    hoursConfirmed: false,
    appointment: {
      url: 'https://clearance.nbi.gov.ph',
      label: { en: 'Register and pick a date', tl: 'Mag-register at pumili ng petsa' },
    },
    source: 'https://rsso09.psa.gov.ph/node/1684057778',
    lastVerified: CHECKED,
  },
];

export const OFFICE_AREAS = [
  { key: 'metro-manila', en: 'Metro Manila', tl: 'Metro Manila' },
  { key: 'sulu', en: 'Sulu (+ Zamboanga City)', tl: 'Sulu (+ Zamboanga City)' },
  { key: 'zamboanga', en: 'Zamboanga City', tl: 'Zamboanga City' },
] as const;
