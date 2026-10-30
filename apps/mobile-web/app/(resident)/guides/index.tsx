import { Link } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GUIDES, colors } from '@dokyu/shared';
import { Screen } from '../../../components/ui/Screen';
import { AgencyTile } from '../../../components/ui/AgencyTile';
import { AppText } from '../../../components/ui/AppText';
import { PressableCard } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { useSettings } from '../../../lib/settings';
import { formatDate } from '../../../lib/format';
import { useLayout } from '../../../lib/useLayout';

export default function Guides() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const { isDesktop } = useLayout();
  return (
    <Screen wide={isDesktop}>
      <View className="gap-1">
        <AppText variant="h1">{t('guides.title')}</AppText>
        <AppText variant="small" tone="muted">
          {t('guides.intro')}{' '}
          {t('guides.lastVerified', { date: formatDate(GUIDES[0]?.lastVerified ?? '', language) })}.
        </AppText>
      </View>
      <View className={isDesktop ? 'flex-row flex-wrap gap-3' : 'gap-3'}>
        {GUIDES.map((g) => (
          // The width lives on a wrapper: Link asChild replaces the child's style.
          <View key={g.slug} style={isDesktop ? { width: '49%', flexGrow: 1 } : undefined}>
            <Link href={{ pathname: '/guides/[slug]', params: { slug: g.slug } }} asChild>
              <PressableCard className="flex-row items-center gap-4">
                <AgencyTile mono={g.mono} />
                <View className="flex-1">
                  <AppText variant="bodyLg" weight="semibold">
                    {g.title}
                  </AppText>
                  <AppText variant="small" tone="muted">
                    {g.category}
                  </AppText>
                </View>
                <Icon name="chevronRight" size={20} color={colors.textSubtle} />
              </PressableCard>
            </Link>
          </View>
        ))}
      </View>
    </Screen>
  );
}
