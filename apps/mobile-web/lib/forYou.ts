/**
 * "For you today" on Home. Picks one useful next step:
 * 1. a "Before you go" checklist you started but haven't finished,
 * 2. otherwise the first document for one of your goals (the order matters, plan §3.1 B),
 * 3. otherwise an invitation to pick a goal.
 */
import type { Guide, GoalSlug, Localized } from '@dokyu/shared';

/** The first document to get for each goal, and why it comes first. */
export const GOAL_START: Record<GoalSlug, { slug: string; why: Localized }> = {
  'first-job': {
    slug: 'barangay-clearance',
    why: {
      en: 'Start with the free First-Time Jobseeker Certification at your barangay: it makes NBI, police and PSA papers free.',
      tl: 'Magsimula sa libreng First-Time Jobseeker Certification sa barangay mo: libre na ang NBI, police at PSA.',
    },
  },
  passport: {
    slug: 'psa-birth-certificate',
    why: {
      en: 'The DFA asks for your PSA birth certificate, so get it first.',
      tl: 'Hinihingi ng DFA ang PSA birth certificate mo, kaya unahin ito.',
    },
  },
  scholarship: {
    slug: 'psa-birth-certificate',
    why: {
      en: 'Almost every scholarship asks for a PSA birth certificate.',
      tl: 'Halos lahat ng scholarship ay humihingi ng PSA birth certificate.',
    },
  },
  'bank-account': {
    slug: 'national-id',
    why: {
      en: 'Banks accept the National ID, and it is free.',
      tl: 'Tinatanggap ng bangko ang National ID, at libre ito.',
    },
  },
  'small-business': {
    slug: 'barangay-clearance',
    why: {
      en: 'A business permit starts with a barangay clearance.',
      tl: 'Nagsisimula ang business permit sa barangay clearance.',
    },
  },
  college: {
    slug: 'psa-birth-certificate',
    why: {
      en: 'Colleges ask for a PSA birth certificate when you enroll.',
      tl: 'Humihingi ng PSA birth certificate ang kolehiyo sa pag-enroll.',
    },
  },
};

export type ForYou =
  | { kind: 'continue'; guide: Guide; done: number; total: number }
  | { kind: 'goal'; guide: Guide; goal: GoalSlug; why: Localized }
  | { kind: 'pickGoal' };

export function forYou(
  guides: Guide[],
  goals: GoalSlug[],
  ticks: Record<string, number[]>,
): ForYou {
  for (const g of guides) {
    const required = g.requirements.map((r, i) => ({ r, i })).filter(({ r }) => !r.onlyIf);
    const done = required.filter(({ i }) => ticks[g.slug]?.includes(i)).length;
    if (done > 0 && done < required.length)
      return { kind: 'continue', guide: g, done, total: required.length };
  }
  for (const goal of goals) {
    const start = GOAL_START[goal];
    const guide = guides.find((g) => g.slug === start?.slug);
    if (guide && start) return { kind: 'goal', guide, goal, why: start.why };
  }
  return { kind: 'pickGoal' };
}
