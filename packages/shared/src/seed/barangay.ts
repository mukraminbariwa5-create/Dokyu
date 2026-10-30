/** Demo barangay (clearly labelled sample data, docs/CONTENT.md §6). Real barangays enter their own Citizen's Charter values. */
export interface BarangayDocSeed {
  code: string;
  name: string;
  /** centavos */
  fee: number;
  processing: string;
  requirements: string[];
  legalBasis?: string;
}

export const DEMO_BARANGAY = {
  slug: 'walled-city-demo',
  name: 'Brgy. Walled City (Demo)',
  municipality: 'Jolo',
  province: 'Sulu',
  isDemo: true,
  hours: 'Mon–Fri 8:00 AM–5:00 PM',
} as const;

export const DEMO_BARANGAY_DOCS: BarangayDocSeed[] = [
  { code: 'CLEARANCE', name: 'Barangay Clearance', fee: 5000, processing: '1 day', requirements: ['Valid ID', 'Proof of residency', 'Cedula (Community Tax Certificate)'] },
  { code: 'RESIDENCY', name: 'Certificate of Residency', fee: 3000, processing: 'Same day', requirements: ['Valid ID', 'Proof of residency'] },
  { code: 'INDIGENCY', name: 'Certificate of Indigency', fee: 0, processing: 'Same day', requirements: ['Valid ID'] },
  {
    code: 'FTJ',
    name: 'First-Time Jobseeker Certification',
    fee: 0,
    processing: 'Same day',
    requirements: ['Valid ID', 'Proof of 6+ months residency', 'Signed Oath of Undertaking'],
    legalBasis: 'RA 11261 (First Time Jobseekers Assistance Act)',
  },
];
