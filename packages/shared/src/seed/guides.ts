/**
 * The first 8 guides. Sources: docs/CONTENT.md plus the re-check on 2026-10-30 (passport, PhilSys, Postal ID,
 * NBI, police and First-Time Jobseeker requirements). Checked against guideSchema in the shared tests.
 * `verified: false` = some facts only appear on independent guide sites; the app asks users to confirm on the official site.
 */
import { guideSchema, type Guide, type GuideInput } from '../guides';

const VERIFIED_ON = '2026-10-30';

const PHOTO_ON_SITE = {
  en: 'ID photos: your photo is taken there',
  tl: 'ID photo: kukunan ka ng litrato doon',
};

const RAW: GuideInput[] = [
  {
    slug: 'psa-birth-certificate',
    title: { en: 'PSA Birth Certificate', tl: 'PSA Birth Certificate' },
    summary: {
      en: 'Official proof of your birth and name. You need it for a passport, National ID, school and your first job.',
      tl: 'Opisyal na patunay ng kapanganakan at pangalan mo. Kailangan ito sa pasaporte, National ID, paaralan at unang trabaho.',
    },
    agency: { en: 'Philippine Statistics Authority', tl: 'Philippine Statistics Authority' },
    mono: 'PSA',
    category: 'civilRegistry',
    fees: [
      { label: { en: 'At a PSA outlet', tl: 'Sa PSA outlet' }, amount: 15500 },
      {
        label: { en: 'Online, delivered (PSAHelpline)', tl: 'Online, idedeliver (PSAHelpline)' },
        amount: 36500,
      },
      {
        label: {
          en: 'Pasig, Caloocan, Muntinlupa, Valenzuela outlets',
          tl: 'Outlet sa Pasig, Caloocan, Muntinlupa, Valenzuela',
        },
        amount: null,
        note: { en: 'An extra city fee is added', tl: 'May dagdag na bayad ng lungsod' },
      },
    ],
    processing: {
      en: 'Outlet: usually the same day. Online: delivered in about 2–7 working days.',
      tl: 'Outlet: kadalasan sa parehong araw. Online: idedeliver sa loob ng mga 2–7 araw ng trabaho.',
    },
    validity: {
      en: 'Does not expire, but some offices ask for a recently issued copy.',
      tl: 'Hindi nag-e-expire, pero may opisinang humihingi ng bagong kopya.',
    },
    requirements: [
      {
        name: { en: 'Appointment confirmation', tl: 'Kumpirmasyon ng appointment' },
        bring: 'printout',
        note: {
          en: 'Booking is free. Bring the printed slip to be safe.',
          tl: 'Libre ang booking. Magdala ng naka-print na slip para sigurado.',
        },
        onlyIf: { en: 'Going to an outlet', tl: 'Kung pupunta sa outlet' },
      },
      {
        name: { en: 'Valid ID', tl: 'Valid ID' },
        bring: 'original',
        note: {
          en: 'Your name must match the appointment.',
          tl: 'Dapat tugma ang pangalan mo sa appointment.',
        },
      },
      {
        name: { en: 'Birth certificate request form', tl: 'Request form ng birth certificate' },
        bring: 'fillOut',
        note: { en: 'Available at the outlet.', tl: 'Makukuha sa outlet.' },
        onlyIf: { en: 'Going to an outlet', tl: 'Kung pupunta sa outlet' },
      },
      {
        name: {
          en: 'Authorization letter + both valid IDs',
          tl: 'Authorization letter + valid ID ninyong dalawa',
        },
        bring: 'original',
        onlyIf: { en: 'Requesting for someone else', tl: 'Kung para sa ibang tao' },
      },
    ],
    noNeed: [{ en: 'Photos', tl: 'Litrato' }],
    steps: [
      {
        where: 'home',
        text: {
          en: 'Easiest: order online and it is delivered to your home. If you do this, you are done.',
          tl: 'Pinakamadali: mag-order online at idedeliver sa bahay mo. Kung ito ang pipiliin mo, tapos ka na.',
        },
        action: {
          kind: 'order',
          label: { en: 'Order online (delivered)', tl: 'Mag-order online (delivery)' },
          url: 'https://psahelpline.ph',
        },
      },
      {
        where: 'home',
        text: {
          en: 'Or book a free appointment at a PSA outlet near you. Book even if you have a National ID.',
          tl: 'O mag-book ng libreng appointment sa pinakamalapit na PSA outlet. Mag-book kahit may National ID ka.',
        },
        action: {
          kind: 'book',
          label: { en: 'Book an outlet appointment', tl: 'Mag-book ng appointment' },
          url: 'https://appointment.psa.gov.ph',
        },
      },
      {
        where: 'office',
        text: {
          en: 'Arrive 30 minutes early with your valid ID and slip.',
          tl: 'Dumating nang 30 minuto nang maaga dala ang valid ID at slip.',
        },
      },
      {
        where: 'office',
        text: {
          en: 'Fill out the request form and pay ₱155 (GCash and Maya accepted).',
          tl: 'Sagutan ang request form at magbayad ng ₱155 (tumatanggap ng GCash at Maya).',
        },
      },
      { where: 'office', text: { en: 'Claim your copy.', tl: 'Kunin ang kopya mo.' } },
    ],
    tips: [
      {
        tone: 'warning',
        text: {
          en: 'PSA appointments are free. Never pay anyone or any website for a slot.',
          tl: 'Libre ang appointment sa PSA. Huwag magbayad sa kahit sinong tao o website para sa slot.',
        },
      },
      {
        tone: 'tip',
        text: {
          en: 'Need a digital copy? PSA also offers an official e-certificate through PSAHelpline.',
          tl: 'Kailangan ng digital na kopya? May opisyal na e-certificate din ang PSA sa PSAHelpline.',
        },
      },
    ],
    firstTimeJobseekerFree: true,
    sources: [
      'https://rsso07.psa.gov.ph/node/1684057236',
      'https://psahelpline.ph/',
      'https://appointment.psa.gov.ph/',
    ],
    lastVerified: VERIFIED_ON,
    verified: true,
  },
  {
    slug: 'national-id',
    title: { en: 'National ID (PhilSys)', tl: 'National ID (PhilSys)' },
    summary: {
      en: 'Free ID for every Filipino, accepted as a valid ID almost everywhere. You can use the digital version while waiting for the card.',
      tl: 'Libreng ID para sa bawat Pilipino, tinatanggap bilang valid ID halos kahit saan. Puwede mong gamitin ang digital na bersyon habang hinihintay ang card.',
    },
    agency: {
      en: 'PSA · Philippine Identification System',
      tl: 'PSA · Philippine Identification System',
    },
    mono: 'NID',
    category: 'identity',
    fees: [
      {
        label: { en: 'Registration and card', tl: 'Registration at card' },
        amount: 0,
        note: { en: 'Free under RA 11055', tl: 'Libre ayon sa RA 11055' },
      },
    ],
    processing: {
      en: 'Registration takes about 20 minutes. The physical card is delivered later.',
      tl: 'Mga 20 minuto ang registration. Idedeliver ang card pagkatapos.',
    },
    validity: { en: 'Does not expire.', tl: 'Hindi nag-e-expire.' },
    requirements: [
      {
        name: { en: 'One primary document', tl: 'Isang primary document' },
        bring: 'original',
        note: {
          en: 'PSA birth certificate together with 1 government ID that has your photo. Or: a passport, UMID or driver’s license.',
          tl: 'PSA birth certificate kasama ang 1 government ID na may litrato mo. O kaya: pasaporte, UMID o driver’s license.',
        },
      },
      {
        name: { en: 'Secondary documents', tl: 'Secondary documents' },
        bring: 'original',
        note: { en: 'Full list on philsys.gov.ph.', tl: 'Kumpletong listahan sa philsys.gov.ph.' },
        onlyIf: {
          en: 'You have none of the primary documents',
          tl: 'Kung wala kang primary document',
        },
      },
      {
        name: { en: 'Appointment confirmation', tl: 'Kumpirmasyon ng appointment' },
        bring: 'phoneOk',
        onlyIf: { en: 'You booked online', tl: 'Kung nag-book ka online' },
      },
    ],
    noNeed: [
      PHOTO_ON_SITE,
      {
        en: 'Photocopies: they scan your documents and give them back',
        tl: 'Photocopy: isi-scan nila ang dokumento mo at ibabalik',
      },
    ],
    steps: [
      {
        where: 'home',
        text: {
          en: 'Some areas (like Cebu) need an online appointment first. Register and book a schedule online.',
          tl: 'May mga lugar (gaya ng Cebu) na kailangan munang mag-appointment online. Mag-register at mag-book ng schedule online.',
        },
        action: {
          kind: 'register',
          label: { en: 'Register and book online', tl: 'Mag-register at mag-book online' },
          url: 'https://register.philsys.gov.ph',
        },
      },
      {
        where: 'office',
        text: {
          en: 'Go to a PhilSys registration center and show your documents.',
          tl: 'Pumunta sa PhilSys registration center at ipakita ang mga dokumento mo.',
        },
      },
      {
        where: 'office',
        text: {
          en: 'Your photo, fingerprints and iris scan are taken.',
          tl: 'Kukunan ka ng litrato, fingerprint at iris scan.',
        },
      },
      {
        where: 'office',
        text: {
          en: 'Keep your transaction slip. You need it to track and claim your ID.',
          tl: 'Itago ang transaction slip mo. Kailangan ito para i-track at kunin ang ID.',
        },
      },
      {
        where: 'home',
        text: {
          en: 'Get your Digital National ID online while waiting for the card.',
          tl: 'Kunin ang Digital National ID mo online habang hinihintay ang card.',
        },
        action: {
          kind: 'info',
          label: { en: 'Get the Digital National ID', tl: 'Kunin ang Digital National ID' },
          url: 'https://national-id.gov.ph',
        },
      },
    ],
    tips: [
      {
        tone: 'warning',
        text: {
          en: 'Registration is free. Report anyone who charges a fee to the PhilSys hotline 1388.',
          tl: 'Libre ang registration. I-report sa PhilSys hotline 1388 ang sinumang naniningil.',
        },
      },
    ],
    firstTimeJobseekerFree: false,
    sources: [
      'https://psa.gov.ph/content/psa-data-reveals-common-identification-documents-used-public-attests-need-philid',
      'https://rsso04a.psa.gov.ph/sites/default/files/RSSO/Citizens-Charter_PhilSys-Registration-Process.pdf',
      'https://cebudailynews.inquirer.net/?p=709288',
    ],
    lastVerified: VERIFIED_ON,
    verified: false,
  },
  {
    slug: 'nbi-clearance',
    title: { en: 'NBI Clearance', tl: 'NBI Clearance' },
    summary: {
      en: 'Shows you have no criminal record in NBI files. Most employers and visa applications ask for it.',
      tl: 'Patunay na wala kang criminal record sa NBI. Hinihingi ito ng karamihan ng employer at sa visa.',
    },
    agency: { en: 'National Bureau of Investigation', tl: 'National Bureau of Investigation' },
    mono: 'NBI',
    category: 'clearances',
    fees: [
      { label: { en: 'Clearance fee', tl: 'Bayad sa clearance' }, amount: 13000 },
      { label: { en: 'E-payment fee', tl: 'E-payment fee' }, amount: 2500, addOn: true },
    ],
    processing: {
      en: 'Usually the same day. If your name has a “hit”, you come back on the date they give you.',
      tl: 'Kadalasan sa parehong araw. Kung may “hit” ang pangalan mo, babalik ka sa petsang ibibigay nila.',
    },
    validity: { en: '1 year from release.', tl: '1 taon mula nang inilabas.' },
    requirements: [
      {
        name: { en: 'Valid government IDs', tl: 'Valid government ID' },
        qty: 2,
        bring: 'original',
        note: {
          en: 'Not expired, with your photo. Photocopies, company IDs and barangay clearance are not accepted.',
          tl: 'Hindi expired at may litrato mo. Hindi tinatanggap ang photocopy, company ID at barangay clearance.',
        },
      },
      { name: { en: 'Reference number', tl: 'Reference number' }, bring: 'phoneOk' },
      { name: { en: 'Proof of payment', tl: 'Patunay ng bayad' }, bring: 'phoneOk' },
      {
        name: {
          en: 'First-Time Jobseeker Barangay Certification + Oath of Undertaking',
          tl: 'First-Time Jobseeker Barangay Certification + Oath of Undertaking',
        },
        bring: 'originalAndCopy',
        note: {
          en: 'Issued within the last year. Makes the clearance free.',
          tl: 'Inilabas sa loob ng nakaraang taon. Libre na ang clearance.',
        },
        onlyIf: { en: 'First job', tl: 'Unang trabaho' },
      },
    ],
    noNeed: [
      PHOTO_ON_SITE,
      {
        en: 'A printed form: the reference number is enough',
        tl: 'Naka-print na form: sapat na ang reference number',
      },
    ],
    steps: [
      {
        where: 'home',
        text: {
          en: 'Create an account on the NBI Clearance site. There are no walk-ins.',
          tl: 'Gumawa ng account sa NBI Clearance site. Walang walk-in.',
        },
        action: {
          kind: 'register',
          label: { en: 'Register on NBI Clearance', tl: 'Mag-register sa NBI Clearance' },
          url: 'https://clearance.nbi.gov.ph',
        },
      },
      {
        where: 'home',
        text: {
          en: 'Fill out the form, then pick a branch and date. You can’t change the date after paying.',
          tl: 'Sagutan ang form, tapos pumili ng branch at petsa. Hindi na mapapalitan ang petsa pagkatapos magbayad.',
        },
      },
      {
        where: 'home',
        text: {
          en: 'Pay online or at a payment center and save the reference number.',
          tl: 'Magbayad online o sa payment center at i-save ang reference number.',
        },
      },
      {
        where: 'office',
        text: {
          en: 'Arrive 30 minutes early in proper clothes: no sleeveless tops, shorts or slippers.',
          tl: 'Dumating nang 30 minuto nang maaga na maayos ang suot: bawal ang sleeveless, shorts at tsinelas.',
        },
      },
      {
        where: 'office',
        text: {
          en: 'Your photo, fingerprints and signature are taken, then claim your clearance.',
          tl: 'Kukunan ka ng litrato, fingerprint at pirma, tapos kunin ang clearance mo.',
        },
      },
    ],
    tips: [
      {
        tone: 'warning',
        text: {
          en: 'Look-alike sites exist. Only use clearance.nbi.gov.ph.',
          tl: 'May mga pekeng site. Gamitin lang ang clearance.nbi.gov.ph.',
        },
      },
      {
        tone: 'tip',
        text: {
          en: 'Remove earrings and colored contact lenses before the photo.',
          tl: 'Tanggalin ang hikaw at colored contact lens bago kunan ng litrato.',
        },
      },
    ],
    firstTimeJobseekerFree: true,
    sources: [
      'https://tokyo.philembassy.net/consular-section/services/notarial-services/nbi-clearance/',
      'https://www.moneymax.ph/government-services/articles/nbi-clearance-online',
    ],
    lastVerified: VERIFIED_ON,
    verified: false,
  },
  {
    slug: 'police-clearance',
    title: { en: 'Police Clearance', tl: 'Police Clearance' },
    summary: {
      en: 'National Police Clearance: shows you have no criminal record in PNP files. Often asked for local jobs.',
      tl: 'National Police Clearance: patunay na wala kang record sa PNP. Madalas hinihingi sa trabaho dito sa bansa.',
    },
    agency: { en: 'Philippine National Police', tl: 'Philippine National Police' },
    mono: 'PNP',
    category: 'clearances',
    fees: [
      { label: { en: 'Clearance fee', tl: 'Bayad sa clearance' }, amount: 15000 },
      {
        label: { en: 'Payment channel fee', tl: 'Bayad sa payment channel' },
        amount: null,
        note: { en: '₱10–₱30 depending on how you pay', tl: '₱10–₱30 depende sa paraan ng bayad' },
        addOn: true,
      },
    ],
    processing: {
      en: 'Usually the same day if there is no “hit”.',
      tl: 'Kadalasan sa parehong araw kung walang “hit”.',
    },
    validity: { en: '6 months.', tl: '6 na buwan.' },
    requirements: [
      {
        name: { en: 'Valid government ID', tl: 'Valid government ID' },
        bring: 'original',
        note: {
          en: 'The official guide asks for 1, but some stations ask for 2. Bring 2 if you have them. Not expired, with photo and signature.',
          tl: '1 ang hinihingi ng opisyal na gabay, pero may istasyong humihingi ng 2. Magdala ng 2 kung mayroon. Hindi expired, may litrato at pirma.',
        },
      },
      { name: { en: 'Reference number', tl: 'Reference number' }, bring: 'phoneOk' },
      { name: { en: 'Proof of payment', tl: 'Patunay ng bayad' }, bring: 'phoneOk' },
      {
        name: {
          en: 'First-Time Jobseeker Barangay Certification',
          tl: 'First-Time Jobseeker Barangay Certification',
        },
        bring: 'original',
        note: { en: 'Makes the clearance free.', tl: 'Libre na ang clearance.' },
        onlyIf: { en: 'First job', tl: 'Unang trabaho' },
      },
    ],
    noNeed: [PHOTO_ON_SITE],
    steps: [
      {
        where: 'home',
        text: {
          en: 'Create an account on the National Police Clearance System.',
          tl: 'Gumawa ng account sa National Police Clearance System.',
        },
        action: {
          kind: 'register',
          label: { en: 'Register on NPCS', tl: 'Mag-register sa NPCS' },
          url: 'https://pnpclearance.ph',
        },
      },
      {
        where: 'home',
        text: {
          en: 'Complete your profile and book a police station, date and time.',
          tl: 'Kumpletuhin ang profile at mag-book ng istasyon, petsa at oras.',
        },
      },
      {
        where: 'home',
        text: {
          en: 'Pay the fee and save the reference number and receipt.',
          tl: 'Magbayad at i-save ang reference number at resibo.',
        },
      },
      {
        where: 'office',
        text: {
          en: 'At the station, your photo, fingerprints and signature are taken.',
          tl: 'Sa istasyon, kukunan ka ng litrato, fingerprint at pirma.',
        },
      },
      {
        where: 'office',
        text: {
          en: 'Wait for your name, then claim your clearance.',
          tl: 'Hintayin ang tawag sa pangalan mo, tapos kunin ang clearance.',
        },
      },
    ],
    tips: [
      {
        tone: 'tip',
        text: {
          en: 'You can apply at any police station in the country, not only where you live.',
          tl: 'Puwede kang mag-apply sa kahit anong istasyon sa bansa, hindi lang kung saan ka nakatira.',
        },
      },
      {
        tone: 'warning',
        text: {
          en: 'Only use pnpclearance.ph. Other sites are not official.',
          tl: 'Gamitin lang ang pnpclearance.ph. Hindi opisyal ang ibang site.',
        },
      },
    ],
    firstTimeJobseekerFree: true,
    sources: [
      'https://pnpclearance.ph/landing/AppPonsive/doc/how_to_apply_v2.pdf',
      'https://sannicolaspangasinan.gov.ph/sannicolas2/?p=4317',
    ],
    lastVerified: VERIFIED_ON,
    verified: true,
  },
  {
    slug: 'barangay-clearance',
    title: { en: 'Barangay Clearance', tl: 'Barangay Clearance' },
    summary: {
      en: 'Shows you live in the barangay and have no record there. Each barangay sets its own requirements and fee.',
      tl: 'Patunay na nakatira ka sa barangay at wala kang record doon. Ang bawat barangay ang nagtatakda ng requirements at bayad.',
    },
    agency: { en: 'Your barangay', tl: 'Ang barangay mo' },
    mono: 'BRGY',
    category: 'barangay',
    fees: [
      {
        label: { en: 'Set by your barangay', tl: 'Itinakda ng barangay mo' },
        amount: null,
        note: {
          en: 'Must be listed in its Citizen’s Charter',
          tl: 'Dapat nakalista sa Citizen’s Charter nito',
        },
      },
    ],
    processing: {
      en: 'Often the same day. Set by your barangay.',
      tl: 'Kadalasan sa parehong araw. Depende sa barangay.',
    },
    validity: { en: 'Set by your barangay.', tl: 'Depende sa barangay.' },
    requirements: [
      { name: { en: 'Valid ID', tl: 'Valid ID' }, bring: 'original' },
      {
        name: { en: 'Proof of residency', tl: 'Patunay ng tirahan' },
        bring: 'originalAndCopy',
        note: {
          en: 'For example a utility bill with your name and address.',
          tl: 'Halimbawa: bill ng kuryente o tubig na may pangalan at address mo.',
        },
      },
      {
        name: {
          en: 'Community Tax Certificate (cedula)',
          tl: 'Community Tax Certificate (cedula)',
        },
        bring: 'original',
        note: {
          en: 'For this year. Usually available at the barangay or city hall.',
          tl: 'Para sa taong ito. Kadalasang makukuha sa barangay o city hall.',
        },
      },
      {
        name: { en: '1x1 or 2x2 photo', tl: '1x1 o 2x2 na litrato' },
        bring: 'original',
        onlyIf: {
          en: 'Your barangay asks for it. Ask first',
          tl: 'Kung hinihingi ng barangay mo. Magtanong muna',
        },
      },
    ],
    noNeed: [],
    steps: [
      {
        where: 'home',
        text: {
          en: 'Message or call your barangay hall: ask for their requirements, fee and office hours.',
          tl: 'I-message o tawagan ang barangay hall: itanong ang requirements, bayad at oras ng opisina.',
        },
      },
      {
        where: 'home',
        text: { en: 'Prepare everything on the list.', tl: 'Ihanda ang lahat ng nasa listahan.' },
      },
      {
        where: 'office',
        text: {
          en: 'Go to the barangay hall and fill out the request.',
          tl: 'Pumunta sa barangay hall at sagutan ang request.',
        },
      },
      {
        where: 'office',
        text: {
          en: 'Pay only the fee listed in the Citizen’s Charter and get an official receipt.',
          tl: 'Bayaran lang ang nakalista sa Citizen’s Charter at humingi ng opisyal na resibo.',
        },
      },
      { where: 'office', text: { en: 'Claim your clearance.', tl: 'Kunin ang clearance mo.' } },
    ],
    tips: [
      {
        tone: 'tip',
        text: {
          en: 'First job? Ask for the free First-Time Jobseeker Certification (RA 11261). You sign an Oath of Undertaking at the hall and must have lived there at least 6 months. It makes NBI, police and PSA papers free.',
          tl: 'Unang trabaho? Humingi ng libreng First-Time Jobseeker Certification (RA 11261). Pipirma ka ng Oath of Undertaking sa hall at dapat 6 na buwan ka nang nakatira doon. Libre na ang NBI, police at PSA.',
        },
      },
      {
        tone: 'warning',
        text: {
          en: 'Fees not listed in the barangay’s Citizen’s Charter are not allowed (RA 11032).',
          tl: 'Bawal maningil ng bayad na wala sa Citizen’s Charter ng barangay (RA 11032).',
        },
      },
    ],
    firstTimeJobseekerFree: false,
    sources: [
      'https://lawphil.net/statutes/repacts/ra2018/ra_11032_2018.html',
      'https://lawphil.net/statutes/repacts/ra2019/ra_11261_2019.html',
    ],
    lastVerified: VERIFIED_ON,
    verified: true,
  },
  {
    slug: 'postal-id',
    title: { en: 'Postal ID', tl: 'Postal ID' },
    summary: {
      en: 'An easy first ID: you don’t need another valid ID to get it. Accepted for passports and banks.',
      tl: 'Madaling unang ID: hindi mo kailangan ng ibang valid ID para makakuha. Tinatanggap sa pasaporte at bangko.',
    },
    agency: { en: 'PHLPost', tl: 'PHLPost' },
    mono: 'POST',
    category: 'identity',
    fees: [
      {
        label: { en: 'Regular', tl: 'Regular' },
        amount: 55000,
        note: { en: 'Includes tax and delivery', tl: 'Kasama ang tax at delivery' },
      },
      { label: { en: 'Rush', tl: 'Rush' }, amount: 65000 },
    ],
    processing: {
      en: 'Delivered in about 10–15 working days in Metro Manila, 4–5 weeks in far provinces. Same-day release at selected branches.',
      tl: 'Idedeliver sa loob ng mga 10–15 araw ng trabaho sa Metro Manila, 4–5 linggo sa malalayong probinsya. May same-day release sa ilang branch.',
    },
    validity: { en: '3 years.', tl: '3 taon.' },
    requirements: [
      {
        name: { en: 'Postal ID application form', tl: 'Application form ng Postal ID' },
        qty: 2,
        bring: 'fillOut',
        note: {
          en: 'PHLPost lists one form, but many post offices ask for 2 copies. Use capital letters.',
          tl: 'Isang form ang nakalista sa PHLPost, pero maraming post office ang humihingi ng 2 kopya. Gumamit ng malalaking titik.',
        },
      },
      {
        name: { en: 'Proof of identity', tl: 'Patunay ng pagkakakilanlan' },
        bring: 'original',
        note: {
          en: 'A PSA birth certificate is enough. National ID, passport, UMID or driver’s license also work.',
          tl: 'Sapat na ang PSA birth certificate. Puwede rin ang National ID, pasaporte, UMID o driver’s license.',
        },
      },
      {
        name: { en: 'Proof of address', tl: 'Patunay ng tirahan' },
        bring: 'original',
        note: {
          en: 'A barangay certificate, or a utility bill with your name and current address.',
          tl: 'Barangay certificate, o bill na may pangalan at kasalukuyang address mo.',
        },
      },
    ],
    noNeed: [{ en: 'Another valid ID', tl: 'Ibang valid ID' }, PHOTO_ON_SITE],
    steps: [
      {
        where: 'home',
        text: {
          en: 'Download and print the application form, then fill it in.',
          tl: 'I-download at i-print ang application form, tapos sagutan.',
        },
        action: {
          kind: 'download',
          label: { en: 'Download the application form', tl: 'I-download ang application form' },
          url: 'https://phlpost.gov.ph/wp-content/uploads/2024/10/PID-Application-Form_101024-1-1.pdf',
        },
      },
      {
        where: 'office',
        text: {
          en: 'Submit the form and your documents at a post office and pay.',
          tl: 'Isumite ang form at mga dokumento sa post office at magbayad.',
        },
      },
      {
        where: 'office',
        text: {
          en: 'Your photo and fingerprints are taken at the ID capture station.',
          tl: 'Kukunan ka ng litrato at fingerprint sa ID capture station.',
        },
      },
      {
        where: 'home',
        text: {
          en: 'Wait for the card to be delivered to your address.',
          tl: 'Hintayin ang card na idedeliver sa address mo.',
        },
      },
    ],
    tips: [
      {
        tone: 'tip',
        text: {
          en: 'Same-day release is offered at SM City Manila and Robinsons Otis (Mon–Fri).',
          tl: 'May same-day release sa SM City Manila at Robinsons Otis (Lunes–Biyernes).',
        },
      },
      {
        tone: 'warning',
        text: {
          en: 'Don’t buy a Postal ID from online sellers. Only post offices issue it.',
          tl: 'Huwag bumili ng Postal ID sa online seller. Post office lang ang naglalabas nito.',
        },
      },
    ],
    firstTimeJobseekerFree: false,
    sources: [
      'https://phlpost.gov.ph/?p=14034',
      'https://phlpost.gov.ph/?p=124',
      'https://tribune.net.ph/2026/07/23/phlpost-no-valid-id-needed-to-get-a-postal-id',
    ],
    lastVerified: VERIFIED_ON,
    verified: true,
  },
  {
    slug: 'tin',
    title: { en: 'TIN (first-time / EO 98)', tl: 'TIN (unang beses / EO 98)' },
    summary: {
      en: 'Your Taxpayer Identification Number. Needed for work, banks and government transactions. You only ever get one.',
      tl: 'Ang Taxpayer Identification Number mo. Kailangan sa trabaho, bangko at transaksyon sa gobyerno. Isa lang ang puwede mong makuha.',
    },
    agency: { en: 'Bureau of Internal Revenue', tl: 'Bureau of Internal Revenue' },
    mono: 'BIR',
    category: 'work',
    fees: [
      {
        label: { en: 'Registration', tl: 'Registration' },
        amount: 0,
        note: { en: 'No fee listed', tl: 'Walang nakalistang bayad' },
      },
    ],
    processing: {
      en: 'Done online through ORUS. Walk-in at your RDO takes about 2 hours.',
      tl: 'Ginagawa online sa ORUS. Mga 2 oras kung sa RDO ka pupunta.',
    },
    validity: { en: 'For life.', tl: 'Habambuhay.' },
    requirements: [
      {
        name: { en: 'Valid government ID', tl: 'Valid government ID' },
        bring: 'phoneOk',
        note: {
          en: 'You upload a clear photo or scan of it.',
          tl: 'Mag-upload ng malinaw na litrato o scan nito.',
        },
      },
      {
        name: { en: 'Your own email address', tl: 'Sariling email address' },
        bring: 'phoneOk',
        note: {
          en: 'ORUS accepts one email per person. Use one you will keep.',
          tl: 'Isang email lang bawat tao sa ORUS. Gumamit ng hindi mo papalitan.',
        },
      },
      {
        name: {
          en: 'First-Time Jobseeker Barangay Certification',
          tl: 'First-Time Jobseeker Barangay Certification',
        },
        bring: 'phoneOk',
        onlyIf: { en: 'First job', tl: 'Unang trabaho' },
      },
      {
        name: { en: 'BIR Form 1904', tl: 'BIR Form 1904' },
        qty: 2,
        bring: 'fillOut',
        onlyIf: {
          en: 'You register at the RDO instead of online',
          tl: 'Kung sa RDO ka magre-register imbes na online',
        },
      },
    ],
    noNeed: [{ en: 'Photos', tl: 'Litrato' }],
    steps: [
      {
        where: 'home',
        text: {
          en: 'Create an ORUS account with your own email and verify it.',
          tl: 'Gumawa ng ORUS account gamit ang sariling email at i-verify ito.',
        },
        action: {
          kind: 'register',
          label: { en: 'Register on ORUS', tl: 'Mag-register sa ORUS' },
          url: 'https://orus.bir.gov.ph',
        },
      },
      {
        where: 'home',
        text: {
          en: 'Choose “Get TIN for Filipino Citizen – E.O. 98 / One-Time Taxpayer” and fill out the form.',
          tl: 'Piliin ang “Get TIN for Filipino Citizen – E.O. 98 / One-Time Taxpayer” at sagutan ang form.',
        },
      },
      {
        where: 'home',
        text: { en: 'Upload your ID and submit.', tl: 'I-upload ang ID mo at isumite.' },
      },
      {
        where: 'home',
        text: {
          en: 'Wait for the approval email, then download your Digital TIN ID in ORUS.',
          tl: 'Hintayin ang email ng approval, tapos i-download ang Digital TIN ID mo sa ORUS.',
        },
      },
    ],
    tips: [
      {
        tone: 'warning',
        text: {
          en: 'Having more than one TIN is a crime.',
          tl: 'Krimen ang magkaroon ng higit sa isang TIN.',
        },
      },
      {
        tone: 'tip',
        text: {
          en: 'If your new employer will register you, let them do it so you don’t end up with two TINs.',
          tl: 'Kung ire-register ka ng bago mong employer, hayaan sila para hindi ka magkaroon ng dalawang TIN.',
        },
      },
    ],
    firstTimeJobseekerFree: true,
    sources: [
      'https://www.bir.gov.ph/BIRCC-RDO-External-Service-04',
      'https://bir-cdn.bir.gov.ph/BIR/pdf/1904%20October%202025%20ENCS%20Final.pdf',
    ],
    lastVerified: VERIFIED_ON,
    verified: false,
  },
  {
    slug: 'passport',
    title: { en: 'Passport', tl: 'Pasaporte' },
    summary: {
      en: 'Needed to travel abroad, and accepted everywhere as a valid ID. Appointments are only booked online.',
      tl: 'Kailangan sa pagbiyahe sa ibang bansa at tinatanggap kahit saan bilang valid ID. Online lang ang booking ng appointment.',
    },
    agency: { en: 'Department of Foreign Affairs', tl: 'Department of Foreign Affairs' },
    mono: 'DFA',
    category: 'travel',
    fees: [
      { label: { en: 'Regular', tl: 'Regular' }, amount: 95000 },
      { label: { en: 'Expedited', tl: 'Expedited' }, amount: 120000 },
      {
        label: { en: 'Payment center fee', tl: 'Bayad sa payment center' },
        amount: 5000,
        addOn: true,
      },
    ],
    processing: {
      en: 'Expedited: 5 working days in NCR, 7 outside NCR. Regular takes longer.',
      tl: 'Expedited: 5 araw ng trabaho sa NCR, 7 sa labas ng NCR. Mas matagal ang regular.',
    },
    validity: { en: '10 years for adults.', tl: '10 taon para sa adult.' },
    requirements: [
      {
        name: {
          en: 'Appointment packet with application form',
          tl: 'Appointment packet kasama ang application form',
        },
        bring: 'printout',
        note: {
          en: 'Emailed to you after booking. Print it.',
          tl: 'Ipapadala sa email pagkatapos mag-book. I-print ito.',
        },
      },
      {
        name: { en: 'PSA birth certificate', tl: 'PSA birth certificate' },
        bring: 'originalAndCopy',
        note: { en: 'On PSA security paper.', tl: 'Nasa security paper ng PSA.' },
      },
      {
        name: { en: 'Valid ID', tl: 'Valid ID' },
        bring: 'originalAndCopy',
        note: {
          en: 'From DFA’s list of accepted IDs. The National ID, ePhilID and a printed Digital National ID are accepted.',
          tl: 'Mula sa listahan ng DFA. Tinatanggap ang National ID, ePhilID at naka-print na Digital National ID.',
        },
      },
      {
        name: { en: 'Proof of online payment', tl: 'Patunay ng online na bayad' },
        bring: 'printout',
      },
      {
        name: { en: 'PSA marriage certificate', tl: 'PSA marriage certificate' },
        bring: 'originalAndCopy',
        onlyIf: {
          en: 'Married woman using your husband’s surname',
          tl: 'Babaeng kasal na gagamit ng apelyido ng asawa',
        },
      },
    ],
    noNeed: [PHOTO_ON_SITE],
    steps: [
      {
        where: 'home',
        text: {
          en: 'Book an appointment on the DFA’s official site. Booking is free.',
          tl: 'Mag-book ng appointment sa opisyal na site ng DFA. Libre ang booking.',
        },
        action: {
          kind: 'book',
          label: { en: 'Book a passport appointment', tl: 'Mag-book ng appointment' },
          url: 'https://www.passport.gov.ph/appointment',
        },
      },
      {
        where: 'home',
        text: {
          en: 'Pay the passport fee online right after booking.',
          tl: 'Bayaran ang passport fee online pagkatapos mag-book.',
        },
      },
      {
        where: 'home',
        text: {
          en: 'Print the appointment packet and photocopy your documents.',
          tl: 'I-print ang appointment packet at ipa-photocopy ang mga dokumento.',
        },
      },
      {
        where: 'office',
        text: {
          en: 'Go to the consular office on your date in decent clothes.',
          tl: 'Pumunta sa consular office sa petsa mo nang maayos ang suot.',
        },
      },
      {
        where: 'office',
        text: {
          en: 'Your photo and fingerprints are taken.',
          tl: 'Kukunan ka ng litrato at fingerprint.',
        },
      },
      {
        where: 'office',
        text: {
          en: 'Claim your passport at the same office.',
          tl: 'Kunin ang pasaporte sa parehong opisina.',
        },
      },
    ],
    tips: [
      {
        tone: 'warning',
        text: {
          en: 'Appointments are free and only valid from passport.gov.ph. Anyone selling slots is a fixer.',
          tl: 'Libre ang appointment at sa passport.gov.ph lang ito valid. Fixer ang sinumang nagbebenta ng slot.',
        },
      },
      {
        tone: 'tip',
        text: {
          en: 'Seniors, PWDs, solo parents and OFWs can use the priority lane without an appointment.',
          tl: 'Puwede sa priority lane nang walang appointment ang senior, PWD, solo parent at OFW.',
        },
      },
      {
        tone: 'tip',
        text: {
          en: 'From Sulu, Basilan or Tawi-Tawi? The DFA Consular Office in Zamboanga City serves your area.',
          tl: 'Taga-Sulu, Basilan o Tawi-Tawi? Ang DFA Consular Office sa Zamboanga City ang para sa inyo.',
        },
      },
    ],
    firstTimeJobseekerFree: false,
    sources: [
      'https://consular.dfa.gov.ph/passport-faq/',
      'https://consular.dfa.gov.ph/reminders/10-passport',
      'https://www.passport.gov.ph/',
    ],
    lastVerified: VERIFIED_ON,
    verified: true,
  },
];

/** Parsed once, so defaults are filled in and any mistake fails loudly at start-up and in tests. */
export const GUIDES: Guide[] = RAW.map((g) => guideSchema.parse(g));
