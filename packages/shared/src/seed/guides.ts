/**
 * First 8 national guides. Source of truth: docs/CONTENT.md (verified 2026-10-30).
 * `verified: false` marks facts only found on independent guide sites; the app shows them with a "confirm on the official site" note.
 */
export interface GuideFee {
  label: string;
  /** centavos; null = varies */
  amount: number | null;
  note?: string;
}

export interface GuideSeed {
  slug: string;
  title: string;
  agency: string;
  mono: string;
  category:
    | 'Identity'
    | 'Clearances'
    | 'Civil registry'
    | 'Work & benefits'
    | 'Travel'
    | 'Barangay';
  fees: GuideFee[];
  validity: string;
  requirements: string[];
  steps: string[];
  firstTimeJobseekerFree: boolean;
  officialUrl: string;
  sources: string[];
  warnings: string[];
  lastVerified: string;
  verified: boolean;
}

const VERIFIED_ON = '2026-10-30';

export const GUIDES: GuideSeed[] = [
  {
    slug: 'psa-birth-certificate',
    title: 'PSA Birth Certificate',
    agency: 'Philippine Statistics Authority',
    mono: 'PSA',
    category: 'Civil registry',
    fees: [
      { label: 'PSA CRS outlet', amount: 15500 },
      { label: 'PSAHelpline (delivered)', amount: 36500 },
      {
        label: 'Pasig, Caloocan, Muntinlupa, Valenzuela outlets',
        amount: null,
        note: 'Extra city fee under local revenue code',
      },
    ],
    validity: 'No expiry (some offices ask for a recent copy)',
    requirements: [
      'Appointment slip (booking is free)',
      'Valid ID matching the appointment name',
      'Authorization letter and IDs if requesting for someone else',
    ],
    steps: [
      'Book a free slot at appointment.psa.gov.ph (National ID holders may use the Special Lane)',
      'Arrive 30 minutes early with your valid ID',
      'Fill in the request form',
      'Pay at the cashier (GCash and Maya accepted)',
      'Claim your copy',
    ],
    firstTimeJobseekerFree: true,
    officialUrl: 'https://appointment.psa.gov.ph',
    sources: ['https://rsso07.psa.gov.ph/node/1684057236', 'https://psahelpline.ph/'],
    warnings: ['Never pay a booking fee: PSA appointments are free.'],
    lastVerified: VERIFIED_ON,
    verified: true,
  },
  {
    slug: 'national-id',
    title: 'National ID (PhilSys)',
    agency: 'PSA · Philippine Identification System',
    mono: 'NID',
    category: 'Identity',
    fees: [{ label: 'Registration and card', amount: 0, note: 'Free under RA 11055' }],
    validity: 'No expiry',
    requirements: [
      'PSA birth certificate + 1 government ID, or',
      'Passport, UMID or driver’s license',
      'Secondary documents list: philsys.gov.ph/supporting-documents',
    ],
    steps: [
      'Check philsys.gov.ph: some areas need an online appointment first',
      'Go to a registration center with your documents',
      'Photo, fingerprints and iris scan',
      'Keep your transaction slip',
      'Get the Digital National ID at national-id.gov.ph',
    ],
    firstTimeJobseekerFree: false,
    officialUrl: 'https://philsys.gov.ph',
    sources: [
      'https://rsso04a.psa.gov.ph/sites/default/files/RSSO/Citizens-Charter_PhilSys-Registration-Process.pdf',
    ],
    warnings: ['Anyone charging a registration fee is breaking the law.'],
    lastVerified: VERIFIED_ON,
    verified: true,
  },
  {
    slug: 'nbi-clearance',
    title: 'NBI Clearance',
    agency: 'National Bureau of Investigation',
    mono: 'NBI',
    category: 'Clearances',
    fees: [
      { label: 'Clearance fee', amount: 13000 },
      { label: 'E-payment fee', amount: 2500 },
    ],
    validity: '1 year from release',
    requirements: [
      '2 valid government IDs',
      'Online appointment reference number',
      'Proof of payment',
    ],
    steps: [
      'Register on clearance.nbi.gov.ph (no walk-ins)',
      'Pick a branch and date',
      'Pay online or over the counter (no rescheduling after paying)',
      'Visit the branch for photo and fingerprints',
      'Same-day release if there is no “hit”',
    ],
    firstTimeJobseekerFree: true,
    officialUrl: 'https://clearance.nbi.gov.ph',
    sources: [
      'https://tokyo.philembassy.net/consular-section/services/notarial-services/nbi-clearance/',
    ],
    warnings: ['Look-alike sites exist. Only use clearance.nbi.gov.ph.'],
    lastVerified: VERIFIED_ON,
    verified: true,
  },
  {
    slug: 'police-clearance',
    title: 'Police Clearance',
    agency: 'Philippine National Police',
    mono: 'PNP',
    category: 'Clearances',
    fees: [
      { label: 'Clearance fee', amount: 15000 },
      { label: 'Payment channel fee', amount: null, note: '₱10–₱30 depending on channel' },
    ],
    validity: '6 months',
    requirements: ['Valid government ID', 'Account on pnpclearance.ph', 'Payment reference number'],
    steps: [
      'Register on pnpclearance.ph',
      'Fill in the form and book a station',
      'Pay the fee and save the reference',
      'Visit the station for photo and fingerprints',
      'Same-day release if there is no hit',
    ],
    firstTimeJobseekerFree: true,
    officialUrl: 'https://pnpclearance.ph',
    sources: [
      'https://pnpclearance.ph/landing/AppPonsive/doc/how_to_apply_v2.pdf',
      'https://sannicolaspangasinan.gov.ph/sannicolas2/?p=4317',
    ],
    warnings: [],
    lastVerified: VERIFIED_ON,
    verified: true,
  },
  {
    slug: 'barangay-clearance',
    title: 'Barangay Clearance',
    agency: 'Your barangay',
    mono: 'BRGY',
    category: 'Barangay',
    fees: [{ label: 'Per the barangay’s Citizen’s Charter', amount: null }],
    validity: 'Set by your barangay',
    requirements: ['Valid ID', 'Proof of residency', 'Community Tax Certificate (cedula)'],
    steps: [
      'Open Barangay in Dokyu and pick the document',
      'Choose the purpose and submit',
      'Wait for “Ready for pickup”',
      'Pay at the counter and get an official receipt',
      'Show your QR and valid ID to claim',
    ],
    firstTimeJobseekerFree: false,
    officialUrl: '',
    sources: ['https://lawphil.net/statutes/repacts/ra2018/ra_11032_2018.html'],
    warnings: ['Fees not listed in the Citizen’s Charter are not allowed (RA 11032).'],
    lastVerified: VERIFIED_ON,
    verified: true,
  },
  {
    slug: 'postal-id',
    title: 'Postal ID',
    agency: 'PHLPost',
    mono: 'POST',
    category: 'Identity',
    fees: [
      { label: 'Regular', amount: 55000, note: 'Includes tax and delivery' },
      { label: 'Rush', amount: 65000 },
    ],
    validity: '3 years',
    requirements: [
      'Application form',
      'Proof of identity (PSA birth certificate works)',
      'Proof of address',
    ],
    steps: [
      'Get the form at a post office or phlpost.gov.ph',
      'Submit it at a capturing station',
      'Pay the fee',
      'Photo and biometrics',
      'Card is delivered (same day at select Manila branches)',
    ],
    firstTimeJobseekerFree: false,
    officialUrl: 'https://phlpost.gov.ph',
    sources: ['https://phlpost.gov.ph/?p=14034', 'https://phlpost.gov.ph/?p=13478'],
    warnings: [],
    lastVerified: VERIFIED_ON,
    verified: true,
  },
  {
    slug: 'tin',
    title: 'TIN (first-time / EO 98)',
    agency: 'Bureau of Internal Revenue',
    mono: 'BIR',
    category: 'Work & benefits',
    fees: [{ label: 'Registration', amount: 0, note: 'No fee listed in the Citizen’s Charter' }],
    validity: 'For life',
    requirements: [
      'BIR Form 1904 (2 copies if walk-in)',
      'Government ID',
      'First-Time Jobseeker Barangay Certification, if applicable',
    ],
    steps: [
      'Create an account on orus.bir.gov.ph',
      'Choose “Get TIN – E.O. 98 / One-Time Taxpayer”',
      'Fill in Form 1904 online',
      'Or submit at your RDO (about 2 hours)',
      'Save your TIN',
    ],
    firstTimeJobseekerFree: true,
    officialUrl: 'https://orus.bir.gov.ph',
    sources: ['https://www.bir.gov.ph/BIRCC-RDO-External-Service-04'],
    warnings: ['Having more than one TIN is a crime.'],
    lastVerified: VERIFIED_ON,
    verified: false,
  },
  {
    slug: 'passport',
    title: 'Passport',
    agency: 'Department of Foreign Affairs',
    mono: 'DFA',
    category: 'Travel',
    fees: [
      { label: 'Regular', amount: 95000 },
      { label: 'Expedited', amount: 120000 },
      { label: 'Payment center fee', amount: 5000 },
    ],
    validity: '10 years (adults)',
    requirements: [
      'Confirmed appointment from passport.gov.ph',
      'PSA birth certificate',
      'Valid ID',
    ],
    steps: [
      'Book on passport.gov.ph only (anyone else is a fixer)',
      'Pay the fee online',
      'Print the appointment packet',
      'Appear at the consular office',
      'Claim at the same office',
    ],
    firstTimeJobseekerFree: false,
    officialUrl: 'https://www.passport.gov.ph',
    sources: ['https://consular.dfa.gov.ph/passport-faq/'],
    warnings: [
      'Seniors, PWDs, solo parents and OFWs can use the priority lane without an appointment.',
    ],
    lastVerified: VERIFIED_ON,
    verified: true,
  },
];
