/** About, Help, Privacy and Terms text (plan §3.1 H). Plain words, English and Tagalog. */
import type { Localized } from '@dokyu/shared';

export interface InfoBlock {
  heading: Localized;
  body: Localized;
}

export const CONTACT_EMAIL = 'mukraminansao@gmail.com';
export const UPDATED = '2026-10-31';

export const ABOUT: InfoBlock[] = [
  {
    heading: { en: 'What Dokyu is', tl: 'Ano ang Dokyu' },
    body: {
      en: 'Dokyu helps anyone who needs government papers (students, job seekers, teachers, workers, parents, seniors) get them in one trip: know exactly what to bring, do the online part at home, and go to the office only to submit and claim.',
      tl: 'Tinutulungan ng Dokyu ang sinumang nangangailangan ng papeles sa gobyerno (estudyante, naghahanap ng trabaho, guro, manggagawa, magulang, senior) na makuha ito sa isang punta lang: alamin kung ano mismo ang dadalhin, gawin sa bahay ang online na bahagi, at pumunta sa opisina para lang mag-submit at kumuha.',
    },
  },
  {
    heading: { en: 'Independent, not the government', tl: 'Independyente, hindi gobyerno' },
    body: {
      en: 'Dokyu is not affiliated with any government agency. It links only to official sites (.gov.ph and the agencies’ own booking sites) and shows when each guide was last checked. Always confirm on the official site before you go.',
      tl: 'Walang kaugnayan ang Dokyu sa anumang ahensya ng gobyerno. Sa opisyal na site lang ito nagli-link (.gov.ph at sariling booking site ng ahensya) at ipinapakita kung kailan huling na-check ang bawat gabay. Kumpirmahin palagi sa opisyal na site bago pumunta.',
    },
  },
  {
    heading: { en: 'Who made it', tl: 'Sino ang gumawa' },
    body: {
      en: 'Built by Mukramin Bariwa Ansao, from Jolo, Sulu, with Doki the living document as your guide.',
      tl: 'Ginawa ni Mukramin Bariwa Ansao, taga-Jolo, Sulu, kasama si Doki bilang gabay mo.',
    },
  },
];

export const HELP: InfoBlock[] = [
  {
    heading: { en: 'Is Dokyu free?', tl: 'Libre ba ang Dokyu?' },
    body: {
      en: 'Yes. Dokyu never takes payments. Fees shown in the guides are paid to the government office or its official payment partners.',
      tl: 'Oo. Hindi kailanman tumatanggap ng bayad ang Dokyu. Ang bayad na nasa gabay ay para sa opisina ng gobyerno o sa opisyal na payment partner nito.',
    },
  },
  {
    heading: { en: 'Do I need an account?', tl: 'Kailangan ko ba ng account?' },
    body: {
      en: 'No. Guides, checklists, the Office Finder, holidays, My Docs and Ask Doki all work without one. An account keeps your profile and My Docs on every phone or browser you sign in on.',
      tl: 'Hindi. Gumagana ang mga gabay, checklist, Office Finder, holiday, My Docs at Ask Doki kahit walang account. Sa account, nasa bawat phone o browser na pag-sign in-an mo ang profile at My Docs mo.',
    },
  },
  {
    heading: {
      en: 'The office was closed or the fee was different',
      tl: 'Sarado ang opisina o iba ang bayad',
    },
    body: {
      en: 'Offices sometimes change hours, move or close for local holidays. Check the official site or call before a long trip, and tell us so we can fix the guide.',
      tl: 'Minsan nagbabago ang oras, lumilipat o nagsasara ang opisina dahil sa lokal na holiday. Tingnan ang opisyal na site o tumawag bago bumiyahe nang malayo, at sabihan kami para maayos ang gabay.',
    },
  },
  {
    heading: { en: 'Why is the map pin a little off?', tl: 'Bakit medyo mali ang pin sa mapa?' },
    body: {
      en: 'Pins are approximate. Use the landmark and the Directions button, which searches the office by name and address.',
      tl: 'Tantiya lang ang pin. Gamitin ang landmark at ang Directions button, na hinahanap ang opisina ayon sa pangalan at address.',
    },
  },
  {
    heading: { en: 'How do reminders work?', tl: 'Paano gumagana ang paalala?' },
    body: {
      en: 'On Android, Dokyu reminds you the day before an appointment and 30 days before a document expires. On the web, the same reminders appear in My Docs.',
      tl: 'Sa Android, pinapaalalahanan ka ng Dokyu isang araw bago ang appointment at 30 araw bago mag-expire ang dokumento. Sa web, nasa My Docs ang parehong paalala.',
    },
  },
  {
    heading: {
      en: 'How do I see Doki’s tour again?',
      tl: 'Paano ko makikita ulit ang tour ni Doki?',
    },
    body: {
      en: 'Go to Account and tap “Show me around again”.',
      tl: 'Pumunta sa Account at i-tap ang “Ipakita ulit ang app”.',
    },
  },
];

export const PRIVACY: InfoBlock[] = [
  {
    heading: { en: 'On your phone', tl: 'Sa phone mo' },
    body: {
      en: 'Your language, text size, area, goals, checklists and My Docs are saved on this device. Without an account, nothing is uploaded.',
      tl: 'Naka-save sa device na ito ang wika, laki ng text, lugar, layunin, checklist at My Docs mo. Kung walang account, walang ina-upload.',
    },
  },
  {
    heading: { en: 'If you make an account', tl: 'Kung gagawa ka ng account' },
    body: {
      en: 'We keep your name, email, general area (province and city, never GPS), goals, the documents and family members in your My Docs, a scrambled (hashed) password and a list of signed-in devices. We never see or store your password itself. Signing out removes your My Docs from that device; your account keeps it.',
      tl: 'Itinatago namin ang pangalan, email, pangkalahatang lugar (probinsya at lungsod, hindi GPS), layunin, ang mga dokumento at kapamilya sa My Docs mo, naka-hash na password at listahan ng naka-sign-in na device. Hindi namin nakikita o itinatago ang mismong password mo. Kapag nag-sign out ka, mabubura ang My Docs sa device na iyon; nasa account mo pa rin ito.',
    },
  },
  {
    heading: { en: 'Location', tl: 'Lokasyon' },
    body: {
      en: '“Near me” uses your location only to sort offices by distance, on your phone. It is never saved or sent.',
      tl: 'Ginagamit lang ng “Malapit sa akin” ang lokasyon mo para ayusin ang mga opisina ayon sa layo, sa phone mo. Hindi ito sine-save o ipinapadala.',
    },
  },
  {
    heading: { en: 'Ask Doki', tl: 'Ask Doki' },
    body: {
      en: 'Doki answers on your phone from Dokyu’s checked guides. What you type is not sent anywhere.',
      tl: 'Sumasagot si Doki sa phone mo mula sa mga na-check na gabay ng Dokyu. Hindi ipinapadala kahit saan ang tina-type mo.',
    },
  },
  {
    heading: { en: 'Your choices', tl: 'Ang mga pagpipilian mo' },
    body: {
      en: 'In Account you can download everything Dokyu keeps about you as a file, delete the data on this device, and delete your account (this cannot be undone). No ads, no trackers, and we never sell data.',
      tl: 'Sa Account, puwede mong i-download bilang file ang lahat ng itinatago ng Dokyu tungkol sa iyo, burahin ang data sa device na ito, at burahin ang account mo (hindi na ito maibabalik). Walang ads, walang tracker, at hindi kami nagbebenta ng data.',
    },
  },
];

export const TERMS: InfoBlock[] = [
  {
    heading: { en: 'Information, not advice', tl: 'Impormasyon, hindi payo' },
    body: {
      en: 'Dokyu gives general information from official sources. Requirements, fees and hours can change without notice. It is not legal advice, and the government office’s decision is final.',
      tl: 'Pangkalahatang impormasyon mula sa opisyal na source ang ibinibigay ng Dokyu. Puwedeng magbago ang requirements, bayad at oras nang walang abiso. Hindi ito legal na payo, at ang desisyon ng opisina ng gobyerno ang masusunod.',
    },
  },
  {
    heading: { en: 'Fair use', tl: 'Tamang paggamit' },
    body: {
      en: 'Use Dokyu for your own papers or to help family and friends. Do not use it to impersonate an office, sell “fixer” services, or collect other people’s data.',
      tl: 'Gamitin ang Dokyu para sa sarili mong papeles o para tulungan ang pamilya at kaibigan. Huwag itong gamitin para magpanggap na opisina, magbenta ng serbisyong “fixer”, o mangolekta ng data ng ibang tao.',
    },
  },
  {
    heading: { en: 'No guarantee', tl: 'Walang garantiya' },
    body: {
      en: 'We work hard to keep guides correct, but Dokyu is provided as is. We are not responsible for a wasted trip or a rejected application; always confirm on the official site.',
      tl: 'Pinagsisikapan naming tama ang mga gabay, pero ibinibigay ang Dokyu nang ganito. Hindi kami mananagot sa nasayang na biyahe o na-reject na aplikasyon; kumpirmahin palagi sa opisyal na site.',
    },
  },
  {
    heading: { en: 'Changes', tl: 'Mga pagbabago' },
    body: {
      en: 'If these terms change, the date at the top of this page changes too.',
      tl: 'Kapag nagbago ang mga tuntuning ito, magbabago rin ang petsa sa itaas ng pahinang ito.',
    },
  },
];
