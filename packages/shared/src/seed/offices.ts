/** First-batch offices (docs/CONTENT.md §5). Pins are placed by hand later in the admin editor. */
export interface OfficeSeed {
  slug: string;
  agency: string;
  name: string;
  address: string;
  municipality: string;
  province: string;
  phone?: string;
  services: string[];
  hours: string;
  hoursConfirmed: boolean;
  source: string;
}

export const OFFICES: OfficeSeed[] = [
  {
    slug: 'psa-sulu',
    agency: 'PSA',
    name: 'PSA Sulu Provincial Office & PhilSys Registration Center',
    address: '2nd Floor, Notre Dame Commercial Complex, Sanchez St., Walled City, Jolo, Sulu 7400',
    municipality: 'Jolo',
    province: 'Sulu',
    phone: '(085) 341-8911 loc. 2461',
    services: ['National ID registration', 'Civil registry assistance'],
    hours: 'Mon–Fri 8:00 AM–5:00 PM',
    hoursConfirmed: false,
    source: 'https://rsso07.psa.gov.ph/node/1684041209',
  },
  {
    slug: 'nbi-wemro',
    agency: 'NBI',
    name: 'NBI Western Mindanao Regional Office',
    address: 'Edificio Costal Building, Corcuera St., Zamboanga City',
    municipality: 'Zamboanga City',
    province: 'Zamboanga del Sur',
    services: ['NBI Clearance'],
    hours: 'Mon–Fri 8:00 AM–5:00 PM',
    hoursConfirmed: false,
    source: 'https://rsso09.psa.gov.ph/node/1684057778',
  },
  {
    slug: 'dfa-zamboanga',
    agency: 'DFA',
    name: 'DFA Consular Office Zamboanga',
    address: 'Go-Velayo Bldg., Veterans Ave., Zamboanga City',
    municipality: 'Zamboanga City',
    province: 'Zamboanga del Sur',
    phone: '(062) 991-4398',
    services: ['Passport (appointment only)'],
    hours: 'By appointment via passport.gov.ph',
    hoursConfirmed: false,
    source: 'https://newsinfo.inquirer.net/1790894/dfa-opens-consular-office-in-pagadian-city/amp',
  },
  {
    slug: 'psa-ro9',
    agency: 'PSA',
    name: 'PSA Regional Office IX',
    address: 'Dagdag Building, San Jose Road, Baliwasan, Zamboanga City',
    municipality: 'Zamboanga City',
    province: 'Zamboanga del Sur',
    phone: '(062) 957-4636',
    services: ['Civil registry assistance'],
    hours: 'Mon–Fri 8:00 AM–5:00 PM',
    hoursConfirmed: false,
    source: 'https://rsso09.psa.gov.ph',
  },
  {
    slug: 'psa-crs-pasig',
    agency: 'PSA',
    name: 'PSA CRS Outlet Pasig City',
    address: 'Pasig City Hall, Caruncho Ave., Brgy. San Nicolas, Pasig City 1603',
    municipality: 'Pasig',
    province: 'Metro Manila',
    phone: '(02) 8292-0910',
    services: ['PSA certificates (appointment)', 'Extra city fee applies'],
    hours: 'Mon–Fri 8:00 AM–5:00 PM',
    hoursConfirmed: false,
    source: 'https://rssomimaropa.psa.gov.ph/node/1684041229',
  },
  {
    slug: 'philhealth-lhio-pasig',
    agency: 'PhilHealth',
    name: 'PhilHealth LHIO Pasig',
    address: 'Ground Floor, Iriz One Corporate Centre, 35 Meralco Ave., San Antonio Village, Pasig',
    municipality: 'Pasig',
    province: 'Metro Manila',
    services: ['Member registration', 'ID and records'],
    hours: 'Mon–Fri 8:00 AM–5:00 PM',
    hoursConfirmed: true,
    source: 'https://www.philhealth.gov.ph/advisories/2016/adv2016-0027.pdf',
  },
];
