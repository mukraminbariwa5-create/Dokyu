import { View } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GUIDES, colors, pick } from '@dokyu/shared';
import { AppText } from '../ui/AppText';
import { AgencyTile } from '../ui/AgencyTile';
import { PressableCard } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { useSettings } from '../../lib/settings';
import { formatDate } from '../../lib/format';
import type { DocStatus, Person, TrackedDoc } from '../../lib/mydocs';

export const STATUS_STYLE: Record<DocStatus, { bg: string; fg: string }> = {
  need: { bg: '#F1F3F8', fg: '#4A5570' },
  preparing: { bg: colors.primarySoft, fg: colors.primary },
  applied: { bg: '#EDE9FE', fg: '#6D28D9' },
  ready: { bg: colors.goldSoft, fg: '#8A6400' },
  have: { bg: colors.successSoft, fg: colors.success },
};

export function docTitle(doc: TrackedDoc, language: 'en' | 'tl') {
  const g = doc.guide ? GUIDES.find((x) => x.slug === doc.guide) : undefined;
  return g ? pick(g.title, language) : (doc.title ?? '');
}

export function DocCard({ doc, person }: { doc: TrackedDoc; person?: Person }) {
  const { t } = useTranslation();
  const { language } = useSettings();
  const g = doc.guide ? GUIDES.find((x) => x.slug === doc.guide) : undefined;
  const s = STATUS_STYLE[doc.status];
  return (
    <Link href={{ pathname: '/docs/[id]', params: { id: doc.id } }} asChild>
      <PressableCard
        className="flex-row items-center gap-3"
        accessibilityLabel={docTitle(doc, language)}
      >
        <AgencyTile mono={g?.mono ?? 'DOC'} size={46} />
        <View className="flex-1 gap-1">
          <AppText variant="body" weight="semibold">
            {docTitle(doc, language)}
          </AppText>
          <View className="flex-row flex-wrap items-center gap-2">
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: s.bg }}>
              <AppText variant="caption" weight="semibold" style={{ color: s.fg }}>
                {t(`mydocs.status_${doc.status}`)}
              </AppText>
            </View>
            <AppText variant="caption" tone="muted">
              {person ? person.name : t('mydocs.me')}
            </AppText>
          </View>
          {doc.appointmentDate && doc.status !== 'have' ? (
            <AppText variant="caption" tone="primary" weight="medium">
              {t('mydocs.apptOn', {
                date: formatDate(doc.appointmentDate, language),
                time: doc.appointmentTime ?? '',
              })}
            </AppText>
          ) : doc.expires ? (
            <AppText variant="caption" tone="muted">
              {t('mydocs.expiresOn', { date: formatDate(doc.expires, language) })}
            </AppText>
          ) : null}
        </View>
        <Icon name="chevronRight" size={20} color={colors.textSubtle} />
      </PressableCard>
    </Link>
  );
}
