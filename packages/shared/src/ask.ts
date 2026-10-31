/**
 * Ask Doki (plan §3.1 E), offline edition: understands short questions in English, Tagalog or Taglish and
 * answers only from Dokyu's checked guides, offices and holidays, so it never makes facts up.
 * The app turns the result into Doki's words and buttons.
 */
import type { GoalSlug } from './auth';

export type AskTopic =
  'requirements' | 'fees' | 'where' | 'online' | 'time' | 'validity' | 'overview';

export type AskResult =
  | { kind: 'greeting' }
  | { kind: 'thanks' }
  | { kind: 'guide'; guides: string[]; topic: AskTopic }
  | { kind: 'goal'; goal: GoalSlug }
  | { kind: 'holiday' }
  | { kind: 'offices' }
  | { kind: 'unknown' };

/** Words people use for each document. Longer phrases first is not needed: any hit counts. */
export const GUIDE_ALIASES: Record<string, string[]> = {
  'psa-birth-certificate': [
    'psa',
    'birth',
    'birth cert',
    'birth certificate',
    'kapanganakan',
    'nso',
    'live birth',
  ],
  'national-id': ['national id', 'philsys', 'philid', 'ephilid', 'natl id', 'national i.d'],
  'nbi-clearance': ['nbi'],
  'police-clearance': ['police', 'pulis', 'pnp'],
  'barangay-clearance': [
    'barangay',
    'brgy',
    'first time job',
    'first-time job',
    'ftjs',
    'residency',
    'indigency',
  ],
  'postal-id': ['postal', 'phlpost', 'philpost', 'post office'],
  tin: ['tin', 'bir', 'tax'],
  passport: ['passport', 'pasaporte', 'dfa'],
};

const TOPICS: Array<[AskTopic, string[]]> = [
  [
    'fees',
    ['how much', 'cost', 'fee', 'price', 'magkano', 'bayad', 'presyo', 'libre', 'free', 'gastos'],
  ],
  [
    'where',
    [
      'where',
      'saan',
      'office',
      'opisina',
      'branch',
      'near',
      'malapit',
      'location',
      'address',
      'nasaan',
    ],
  ],
  [
    'online',
    [
      'online',
      'register',
      'website',
      'link',
      'appointment',
      'book',
      'mag-apply',
      'apply',
      'site',
      'magparehistro',
    ],
  ],
  [
    'time',
    ['how long', 'ilang araw', 'gaano katagal', 'processing', 'release', 'kailan makukuha', 'days'],
  ],
  ['validity', ['valid', 'expire', 'expiry', 'validity', 'mag-expire', 'tatagal']],
  [
    'requirements',
    [
      'requirement',
      'bring',
      'need',
      'dalhin',
      'kailangan',
      'dala',
      'documents',
      'papers',
      'papeles',
      'ano ang',
      'what do i',
    ],
  ],
];

const GOAL_WORDS: Array<[GoalSlug, string[]]> = [
  [
    'first-job',
    ['first job', 'unang trabaho', 'job', 'trabaho', 'employment', 'work', 'apply for work'],
  ],
  ['scholarship', ['scholarship', 'iskolar', 'scholar']],
  ['bank-account', ['bank', 'bangko']],
  ['small-business', ['business', 'negosyo', 'tindahan', 'store']],
  ['college', ['college', 'kolehiyo', 'enroll', 'university', 'unibersidad']],
];

const HOLIDAY_WORDS = [
  'holiday',
  'bukas ba',
  'open today',
  'sarado',
  'closed',
  'walang pasok',
  'open tomorrow',
];
const OFFICE_WORDS = ['office near', 'nearest', 'pinakamalapit', 'office finder', 'offices'];
const GREETINGS = [
  'hi',
  'hello',
  'hey',
  'kumusta',
  'kamusta',
  'good morning',
  'good afternoon',
  'good evening',
  'magandang',
];
const THANKS = ['thank', 'thanks', 'salamat', 'ty'];

export function normalize(text: string): string {
  return ` ${text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.\- ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

/** Whole-word (or whole-phrase) match, so "tin" does not match "getting". */
function has(q: string, word: string): boolean {
  return q.includes(` ${word} `) || q.includes(` ${word}s `);
}

export function understand(question: string): AskResult {
  const q = normalize(question);
  if (q.trim().length === 0) return { kind: 'unknown' };

  const guides = Object.entries(GUIDE_ALIASES)
    .filter(([, words]) => words.some((w) => has(q, w)))
    .map(([slug]) => slug);
  const topic = TOPICS.find(([, words]) => words.some((w) => has(q, w)))?.[0];

  if (guides.length > 0) {
    // "passport" is both a goal and a guide: the guide answer is more useful.
    return { kind: 'guide', guides: guides.slice(0, 3), topic: topic ?? 'overview' };
  }
  if (HOLIDAY_WORDS.some((w) => has(q, w))) return { kind: 'holiday' };
  const goal = GOAL_WORDS.find(([, words]) => words.some((w) => has(q, w)))?.[0];
  if (goal) return { kind: 'goal', goal };
  if (OFFICE_WORDS.some((w) => has(q, w)) || topic === 'where') return { kind: 'offices' };
  if (THANKS.some((w) => has(q, w))) return { kind: 'thanks' };
  if (GREETINGS.some((w) => has(q, w))) return { kind: 'greeting' };
  return { kind: 'unknown' };
}
