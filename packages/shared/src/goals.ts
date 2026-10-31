/**
 * Goal plans (plan §3.1 B): which documents to get for a goal, in order, with the reason for the order,
 * and the total starting cost. Built only from the checked guides.
 */
import type { Guide, Localized } from './guides';
import type { GoalSlug } from './auth';
import { startingFee } from './fees';

export interface GoalStep {
  guide: string;
  why: Localized;
}

export const GOAL_PLANS: Record<GoalSlug, GoalStep[]> = {
  'first-job': [
    {
      guide: 'barangay-clearance',
      why: {
        en: 'Ask your barangay for the free First-Time Jobseeker Certification first: with it, NBI, police and PSA papers are free once.',
        tl: 'Unahin ang libreng First-Time Jobseeker Certification sa barangay: dahil dito, libre nang isang beses ang NBI, police at PSA.',
      },
    },
    {
      guide: 'psa-birth-certificate',
      why: {
        en: 'Employers and the other offices ask for it.',
        tl: 'Hinihingi ito ng employer at ng ibang opisina.',
      },
    },
    {
      guide: 'nbi-clearance',
      why: { en: 'Most employers require it.', tl: 'Hinihingi ito ng karamihan ng employer.' },
    },
    {
      guide: 'police-clearance',
      why: {
        en: 'Some employers ask for it instead of, or with, the NBI clearance.',
        tl: 'May employer na humihingi nito kapalit o kasama ng NBI clearance.',
      },
    },
    {
      guide: 'tin',
      why: {
        en: 'You need a TIN to be paid and taxed correctly; it is free.',
        tl: 'Kailangan mo ng TIN para tama ang sahod at buwis; libre ito.',
      },
    },
  ],
  passport: [
    {
      guide: 'psa-birth-certificate',
      why: { en: 'The DFA asks for it first.', tl: 'Ito ang unang hinihingi ng DFA.' },
    },
    {
      guide: 'national-id',
      why: {
        en: 'A free valid ID that the DFA accepts.',
        tl: 'Libreng valid ID na tinatanggap ng DFA.',
      },
    },
    {
      guide: 'passport',
      why: {
        en: 'Book the appointment once your papers are ready.',
        tl: 'Mag-book ng appointment kapag handa na ang papeles mo.',
      },
    },
  ],
  scholarship: [
    {
      guide: 'psa-birth-certificate',
      why: {
        en: 'Almost every scholarship asks for it.',
        tl: 'Halos lahat ng scholarship ay humihingi nito.',
      },
    },
    {
      guide: 'barangay-clearance',
      why: {
        en: 'Proof that you live in the barangay; some programs also ask for a certificate of indigency.',
        tl: 'Patunay na nakatira ka sa barangay; may programang humihingi rin ng certificate of indigency.',
      },
    },
    {
      guide: 'national-id',
      why: { en: 'A free valid ID for the forms.', tl: 'Libreng valid ID para sa mga form.' },
    },
  ],
  'bank-account': [
    {
      guide: 'national-id',
      why: { en: 'Banks accept it and it is free.', tl: 'Tinatanggap ito ng bangko at libre.' },
    },
    {
      guide: 'postal-id',
      why: {
        en: 'A second valid ID, in case the bank asks for two.',
        tl: 'Pangalawang valid ID, kung dalawa ang hingin ng bangko.',
      },
    },
  ],
  'small-business': [
    {
      guide: 'barangay-clearance',
      why: {
        en: 'The business permit starts at the barangay.',
        tl: 'Nagsisimula ang business permit sa barangay.',
      },
    },
    {
      guide: 'tin',
      why: { en: 'Register with the BIR for your TIN.', tl: 'Magparehistro sa BIR para sa TIN.' },
    },
  ],
  college: [
    {
      guide: 'psa-birth-certificate',
      why: {
        en: 'Colleges ask for it when you enroll.',
        tl: 'Hinihingi ito ng kolehiyo sa pag-enroll.',
      },
    },
    {
      guide: 'barangay-clearance',
      why: {
        en: 'Proof of residence for enrolment and school aid.',
        tl: 'Patunay ng tirahan para sa enrolment at tulong pang-eskwela.',
      },
    },
    {
      guide: 'national-id',
      why: { en: 'A free valid ID.', tl: 'Libreng valid ID.' },
    },
  ],
};

export interface PlanTotal {
  /** Centavos. */
  amount: number;
  /** Some fees are not fixed or there are pricier options. */
  atLeast: boolean;
  freeCount: number;
}

/** Adds up the cheapest way to get every document in a plan. */
export function planTotal(guides: Guide[]): PlanTotal {
  let amount = 0;
  let atLeast = false;
  let freeCount = 0;
  for (const g of guides) {
    const fee = startingFee(g.fees);
    if (fee.kind === 'free') freeCount++;
    else if (fee.kind === 'varies') atLeast = true;
    else {
      amount += fee.amount;
      if (fee.kind === 'from') atLeast = true;
    }
  }
  return { amount, atLeast, freeCount };
}
