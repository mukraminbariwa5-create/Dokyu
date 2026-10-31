/** Turns what Doki understood (shared/ask.ts) into his reply, in the user's language, with buttons. */
import type { TFunction } from 'i18next';
import type { Href } from 'expo-router';
import {
  GOALS,
  GOAL_PLANS,
  HOLIDAYS,
  OFFICES,
  closingHoliday,
  formatPeso,
  mainAction,
  manilaTime,
  officesForGuide,
  pick,
  planTotal,
  startingFee,
  understand,
  upcomingHolidays,
  type Guide,
} from '@dokyu/shared';
import type { DokiPose } from '../components/ui/Doki';
import { formatDate, formatFee } from './format';
import { hostOf } from '../components/guide/parts';

export interface DokiButton {
  label: string;
  href?: Href;
  url?: string;
}

export interface DokiReply {
  text: string;
  buttons: DokiButton[];
  pose: DokiPose;
}

function guideAnswer(
  g: Guide,
  topic: string,
  t: TFunction,
  language: 'en' | 'tl',
): { text: string; buttons: DokiButton[] } {
  const L = (x: { en: string; tl: string }) => pick(x, language);
  const title = L(g.title);
  const open: DokiButton = {
    label: t('ask.openGuide', { name: title }),
    href: { pathname: '/guides/[slug]', params: { slug: g.slug } },
  };
  switch (topic) {
    case 'requirements': {
      const always = g.requirements.filter((r) => !r.onlyIf);
      const lines = always.map(
        (r) =>
          `• ${r.qty > 1 ? `${r.qty}× ` : ''}${L(r.name)} (${t(`guide.bring_${r.bring}`).toLowerCase()})`,
      );
      const extra = g.requirements.length - always.length;
      return {
        text: [
          t('ask.bringIntro', { name: title }),
          ...lines,
          extra ? t('ask.bringExtra', { count: extra }) : '',
        ]
          .filter(Boolean)
          .join('\n'),
        buttons: [
          {
            label: t('ask.makeChecklist'),
            href: { pathname: '/guides/[slug]/checklist', params: { slug: g.slug } },
          },
          open,
        ],
      };
    }
    case 'fees': {
      const lines = g.fees.map(
        (f) =>
          `• ${L(f.label)}: ${f.amount === null ? (f.note ? L(f.note) : t('common.varies')) : f.amount === 0 ? t('common.free') : formatPeso(f.amount)}`,
      );
      return {
        text: [
          t('ask.feeIntro', { name: title, fee: formatFee(startingFee(g.fees), t) }),
          ...lines,
          g.firstTimeJobseekerFree ? t('ask.ftjFree') : '',
        ]
          .filter(Boolean)
          .join('\n'),
        buttons: [open],
      };
    }
    case 'where': {
      const offices = officesForGuide(OFFICES, g.slug);
      if (offices.length === 0)
        return {
          text: g.slug === 'barangay-clearance' ? t('guide.whereBarangay') : t('guide.whereOnline'),
          buttons: [open],
        };
      return {
        text: [
          t('ask.whereIntro', { name: title }),
          ...offices.slice(0, 4).map((o) => `• ${o.name} (${o.municipality})`),
        ].join('\n'),
        buttons: [
          {
            label: t('guide.findOffice'),
            href: { pathname: '/offices', params: { guide: g.slug } },
          },
          open,
        ],
      };
    }
    case 'online': {
      const action = mainAction(g);
      if (!action) return { text: t('guide.noOnline'), buttons: [open] };
      return {
        text: t('ask.onlineIntro', {
          name: title,
          label: L(action.label),
          host: hostOf(action.url),
        }),
        buttons: [{ label: L(action.label), url: action.url }, open],
      };
    }
    case 'time':
      return { text: `${title}: ${L(g.processing)}`, buttons: [open] };
    case 'validity':
      return { text: `${title}: ${L(g.validity)}`, buttons: [open] };
    default:
      return {
        text: [
          `${title}: ${L(g.summary)}`,
          `${t('guide.fee')}: ${formatFee(startingFee(g.fees), t)}`,
          `${t('guide.processing')}: ${L(g.processing)}`,
          t('ask.askMore'),
        ].join('\n'),
        buttons: [
          open,
          {
            label: t('ask.makeChecklist'),
            href: { pathname: '/guides/[slug]/checklist', params: { slug: g.slug } },
          },
        ],
      };
  }
}

export function dokiReply(
  question: string,
  guides: Guide[],
  t: TFunction,
  language: 'en' | 'tl',
  now = new Date(),
): DokiReply {
  const r = understand(question);
  switch (r.kind) {
    case 'greeting':
      return { text: t('ask.greeting'), buttons: [], pose: 'wave' };
    case 'thanks':
      return { text: t('ask.thanks'), buttons: [], pose: 'happy' };
    case 'guide': {
      const parts = r.guides
        .map((slug) => guides.find((g) => g.slug === slug))
        .filter((g): g is Guide => g !== undefined)
        .slice(0, 2)
        .map((g) => guideAnswer(g, r.topic, t, language));
      return {
        text: parts.map((p) => p.text).join('\n\n'),
        buttons: parts.flatMap((p) => p.buttons).slice(0, 4),
        pose: 'talk',
      };
    }
    case 'goal': {
      const plan = GOAL_PLANS[r.goal];
      const planGuides = plan
        .map((s) => guides.find((g) => g.slug === s.guide))
        .filter((g): g is Guide => g !== undefined);
      const total = planTotal(planGuides);
      const goalName = GOALS.find((g) => g.slug === r.goal);
      return {
        text: [
          t('ask.goalIntro', {
            goal: goalName ? (language === 'tl' ? goalName.tl : goalName.en) : '',
          }),
          ...planGuides.map((g, i) => `${i + 1}. ${pick(g.title, language)}`),
          t('ask.goalTotal', {
            amount: total.atLeast
              ? t('common.from', { amount: formatPeso(total.amount) })
              : formatPeso(total.amount),
          }),
        ].join('\n'),
        buttons: [
          { label: t('ask.seePlan'), href: { pathname: '/goals', params: { goal: r.goal } } },
        ],
        pose: 'point',
      };
    }
    case 'holiday': {
      const today = manilaTime(now);
      const h = closingHoliday(today.iso, HOLIDAYS);
      const next = upcomingHolidays(HOLIDAYS, now).find(
        (x) => x.date > today.iso && x.kind !== 'specialWorking',
      );
      const weekend = today.dow === 0 || today.dow === 6;
      const head = h
        ? t('holidays.todayOff', { name: pick(h.name, language) })
        : weekend
          ? t('holidays.todayWeekend')
          : t('holidays.todayWorking');
      return {
        text: next
          ? `${head}\n${t('ask.nextHoliday', { name: pick(next.name, language), date: formatDate(next.date, language) })}`
          : head,
        buttons: [{ label: t('holidays.title'), href: '/holidays' }],
        pose: h ? 'worried' : 'talk',
      };
    }
    case 'offices':
      return {
        text: t('ask.offices'),
        buttons: [{ label: t('offices.title'), href: '/offices' }],
        pose: 'point',
      };
    default:
      return {
        text: t('ask.unknown'),
        buttons: [{ label: t('nav.guides'), href: '/guides' }],
        pose: 'worried',
      };
  }
}
