/**
 * Account input rules, shared by the app (form errors) and the API (request validation).
 */
import { z } from 'zod';

export const PASSWORD_MIN = 10;

/** The public demo account (its password is in the README): shared by every visitor, reset at each sign-in. */
export const DEMO_EMAIL = 'demo@example.com';
export const DEMO_PASSWORD = 'Dokyu-demo-2026';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address')
  .max(254);

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters`)
  .max(128, 'Use at most 128 characters');

export const fullNameSchema = z.string().trim().min(2, 'Enter your full name').max(100);

export const languageSchema = z.enum(['en', 'tl']);

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  language: languageSchema.default('en'),
  /** Data Privacy Act (RA 10173) consent; sign-up is refused without it. */
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please agree to the privacy notice to continue' }),
  }),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password').max(128),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const tokenSchema = z.string().trim().min(20).max(200);

export const resetPasswordSchema = z.object({ token: tokenSchema, password: passwordSchema });

export const verifyEmailSchema = z.object({ token: tokenSchema });

/** Goals offered during onboarding (plan §3.1 B). */
export const GOALS = [
  { slug: 'first-job', en: 'First job', tl: 'Unang trabaho' },
  { slug: 'passport', en: 'Passport', tl: 'Pasaporte' },
  { slug: 'scholarship', en: 'Scholarship', tl: 'Scholarship' },
  { slug: 'bank-account', en: 'Opening a bank account', tl: 'Pagbukas ng bank account' },
  {
    slug: 'small-business',
    en: 'Starting a small business',
    tl: 'Pagsisimula ng maliit na negosyo',
  },
  { slug: 'college', en: 'Enrolling in college', tl: 'Pag-enroll sa kolehiyo' },
] as const;
export type GoalSlug = (typeof GOALS)[number]['slug'];
const GOAL_SLUGS = GOALS.map((g) => g.slug) as [GoalSlug, ...GoalSlug[]];

/**
 * Provinces plus Metro Manila, for picking a general area by hand (plan §3.1 I: only the general area is saved,
 * never GPS). Maguindanao is listed as del Norte and del Sur after the 2022 split.
 */
export const PROVINCES = [
  'Abra',
  'Agusan del Norte',
  'Agusan del Sur',
  'Aklan',
  'Albay',
  'Antique',
  'Apayao',
  'Aurora',
  'Basilan',
  'Bataan',
  'Batanes',
  'Batangas',
  'Benguet',
  'Biliran',
  'Bohol',
  'Bukidnon',
  'Bulacan',
  'Cagayan',
  'Camarines Norte',
  'Camarines Sur',
  'Camiguin',
  'Capiz',
  'Catanduanes',
  'Cavite',
  'Cebu',
  'Cotabato',
  'Davao de Oro',
  'Davao del Norte',
  'Davao del Sur',
  'Davao Occidental',
  'Davao Oriental',
  'Dinagat Islands',
  'Eastern Samar',
  'Guimaras',
  'Ifugao',
  'Ilocos Norte',
  'Ilocos Sur',
  'Iloilo',
  'Isabela',
  'Kalinga',
  'La Union',
  'Laguna',
  'Lanao del Norte',
  'Lanao del Sur',
  'Leyte',
  'Maguindanao del Norte',
  'Maguindanao del Sur',
  'Marinduque',
  'Masbate',
  'Metro Manila',
  'Misamis Occidental',
  'Misamis Oriental',
  'Mountain Province',
  'Negros Occidental',
  'Negros Oriental',
  'Northern Samar',
  'Nueva Ecija',
  'Nueva Vizcaya',
  'Occidental Mindoro',
  'Oriental Mindoro',
  'Palawan',
  'Pampanga',
  'Pangasinan',
  'Quezon',
  'Quirino',
  'Rizal',
  'Romblon',
  'Samar',
  'Sarangani',
  'Siquijor',
  'Sorsogon',
  'South Cotabato',
  'Southern Leyte',
  'Sultan Kudarat',
  'Sulu',
  'Surigao del Norte',
  'Surigao del Sur',
  'Tarlac',
  'Tawi-Tawi',
  'Zambales',
  'Zamboanga del Norte',
  'Zamboanga del Sur',
  'Zamboanga Sibugay',
] as const;

export const profileUpdateSchema = z
  .object({
    fullName: fullNameSchema,
    language: languageSchema,
    textSize: z.enum(['normal', 'large']),
    province: z.enum(PROVINCES).nullable(),
    municipality: z.string().trim().min(2).max(60).nullable(),
    goals: z.array(z.enum(GOAL_SLUGS)).max(GOALS.length),
    /** Set once when the user finishes onboarding. */
    onboarded: z.literal(true),
  })
  .partial()
  .strict();

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

/** What the API returns for the signed-in user. Never includes the password hash or lockout fields. */
export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'SUPER_ADMIN';
  language: 'en' | 'tl';
  textSize: 'normal' | 'large';
  province: string | null;
  municipality: string | null;
  goals: GoalSlug[];
  emailVerified: boolean;
  onboarded: boolean;
  /** The shared demo account: reset at each sign-in, can't be deleted. */
  demo: boolean;
}
