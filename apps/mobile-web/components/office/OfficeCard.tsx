import { View } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, type OfficeSeed } from '@dokyu/shared';
import { AppText } from '../ui/AppText';
import { AgencyTile } from '../ui/AgencyTile';
import { PressableCard } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { AGENCY_MONO, statusWords, type StatusTone } from '../../lib/offices';
import { useSettings } from '../../lib/settings';

const TONE: Record<StatusTone, { bg: string; fg: string; dot: string }> = {
  open: { bg: colors.successSoft, fg: colors.success, dot: '#22C55E' },
  soon: { bg: colors.goldSoft, fg: '#8A6400', dot: colors.gold },
  closed: { bg: '#F1F3F8', fg: '#4A5570', dot: '#94A0B8' },
  holiday: { bg: '#FDE8EA', fg: '#B42335', dot: '#E5485B' },
};

export function StatusPill({ office, now }: { office: OfficeSeed; now: Date }) {
  const { t } = useTranslation();
  const { language } = useSettings();
  const s = statusWords(office, now, t, language);
  const c = TONE[s.tone];
  return (
    <View
      className="flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1"
      style={{ backgroundColor: c.bg, maxWidth: '100%' }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.dot }} />
      <AppText variant="caption" weight="semibold" style={{ color: c.fg, flexShrink: 1 }}>
        {s.text}
      </AppText>
    </View>
  );
}

export function OfficeCard({
  office,
  now,
  distanceKm,
  highlighted,
}: {
  office: OfficeSeed;
  now: Date;
  distanceKm?: number;
  highlighted?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Link href={{ pathname: '/offices/[slug]', params: { slug: office.slug } }} asChild>
      <PressableCard
        className="flex-row gap-3"
        style={highlighted ? { borderWidth: 2, borderColor: colors.gold } : undefined}
        accessibilityLabel={office.name}
      >
        <AgencyTile mono={AGENCY_MONO[office.agency]} size={48} />
        <View className="flex-1 gap-1">
          <AppText variant="body" weight="semibold">
            {office.name}
          </AppText>
          <AppText variant="small" tone="muted" numberOfLines={2}>
            {office.address}
          </AppText>
          <View className="flex-row flex-wrap items-center gap-2">
            <StatusPill office={office} now={now} />
            {distanceKm !== undefined ? (
              <AppText variant="caption" weight="semibold" tone="primary">
                {t('offices.km', {
                  km: distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm),
                })}
              </AppText>
            ) : null}
          </View>
        </View>
        <Icon name="chevronRight" size={20} color={colors.textSubtle} />
      </PressableCard>
    </Link>
  );
}
