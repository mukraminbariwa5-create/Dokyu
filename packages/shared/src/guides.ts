/**
 * The shape of a document guide (plan v1.6 §3.1 A). One Zod schema checks the seed content, the API's answers
 * and, later, the Super Admin editor, so every guide always has the same parts.
 *
 * Goal: the user leaves home with everything the office will ask for. So each requirement says how many and
 * whether to bring originals or photocopies, each step says whether it is done at home or at the office,
 * and every official link sits on the step where it is used, with a label that says what it does.
 */
import { z } from 'zod';

/** Text in both app languages. */
export const localizedSchema = z.object({ en: z.string().min(1), tl: z.string().min(1) });
export type Localized = z.infer<typeof localizedSchema>;

export const GUIDE_CATEGORIES = [
  'identity',
  'clearances',
  'civilRegistry',
  'work',
  'travel',
  'barangay',
] as const;
export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

/** What an official link does, so the button can say it and show the right icon. */
export const ACTION_KINDS = ['register', 'book', 'order', 'download', 'info'] as const;

export const guideActionSchema = z.object({
  kind: z.enum(ACTION_KINDS),
  label: localizedSchema,
  /** Official sites only (.gov.ph or a channel the agency itself names). */
  url: z.string().url().startsWith('https://'),
});
export type GuideAction = z.infer<typeof guideActionSchema>;

/**
 * How to bring a requirement:
 * - original: the real document only, photocopies are refused
 * - originalAndCopy: the original to show plus photocopies to leave behind
 * - printout: print it at home
 * - phoneOk: a screenshot or the email on your phone is enough
 * - fillOut: a form to fill in (at home if you can download it)
 */
export const BRING_KINDS = [
  'original',
  'originalAndCopy',
  'printout',
  'phoneOk',
  'fillOut',
] as const;

export const requirementSchema = z.object({
  name: localizedSchema,
  qty: z.number().int().min(1).max(10).default(1),
  bring: z.enum(BRING_KINDS),
  /** Which IDs count, how recent, etc. */
  note: localizedSchema.optional(),
  /** Only some people need it (e.g. first-time jobseekers). */
  onlyIf: localizedSchema.optional(),
});
export type Requirement = z.infer<typeof requirementSchema>;

export const guideStepSchema = z.object({
  where: z.enum(['home', 'office']),
  text: localizedSchema,
  action: guideActionSchema.optional(),
});
export type GuideStep = z.infer<typeof guideStepSchema>;

export const guideTipSchema = z.object({
  /** tip = helpful (blue); warning = scams, mistakes that cost a trip (red). */
  tone: z.enum(['tip', 'warning']),
  text: localizedSchema,
});

export const guideFeeSchema = z.object({
  label: localizedSchema,
  /** centavos; null = varies */
  amount: z.number().int().min(0).nullable(),
  note: localizedSchema.optional(),
  /** Paid on top of the main fee (e.g. an e-payment or payment-center fee), not an alternative to it. */
  addOn: z.boolean().optional(),
});
export type GuideFee = z.infer<typeof guideFeeSchema>;

export const guideSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{2,60}$/),
  title: localizedSchema,
  summary: localizedSchema,
  agency: localizedSchema,
  /** Letters on the coloured tile (no real agency seals, plan §4.2). */
  mono: z.string().min(2).max(5),
  category: z.enum(GUIDE_CATEGORIES),
  fees: z.array(guideFeeSchema).min(1),
  processing: localizedSchema,
  validity: localizedSchema,
  requirements: z.array(requirementSchema).min(1),
  /** Things people often bring for nothing (e.g. photos the office takes itself). */
  noNeed: z.array(localizedSchema).default([]),
  steps: z.array(guideStepSchema).min(3),
  tips: z.array(guideTipSchema).default([]),
  firstTimeJobseekerFree: z.boolean(),
  sources: z.array(z.string().url()).min(1),
  lastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** false = some facts are only on independent guide sites; the app asks people to confirm on the official site. */
  verified: z.boolean(),
});
export type Guide = z.infer<typeof guideSchema>;
export type GuideInput = z.input<typeof guideSchema>;

/** Picks the right language, falling back to English. */
export function pick(text: Localized, language: string): string {
  return language === 'tl' ? text.tl : text.en;
}

/** The main thing to do online for this guide: the first step done at home that has an official link. */
export function mainAction(guide: Pick<Guide, 'steps'>): GuideAction | undefined {
  return (
    guide.steps.find((s) => s.where === 'home' && s.action)?.action ??
    guide.steps.find((s) => s.action)?.action
  );
}
