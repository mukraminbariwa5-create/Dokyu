import type { TFunction } from 'i18next';
import { formatPeso, type FeeSummary } from '@dokyu/shared';

export function formatFee(fee: FeeSummary, t: TFunction): string {
  switch (fee.kind) {
    case 'free':
      return t('common.free');
    case 'varies':
      return t('common.varies');
    case 'exact':
      return formatPeso(fee.amount);
    case 'from':
      return t('common.from', { amount: formatPeso(fee.amount) });
  }
}

/** 2026-10-30 → "Oct 30, 2026" (English) or "Okt 30, 2026"-style per locale. */
export function formatDate(iso: string, language: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(language === 'tl' ? 'fil-PH' : 'en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
