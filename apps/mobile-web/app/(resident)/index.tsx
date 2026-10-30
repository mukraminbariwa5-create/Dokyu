import { Link } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GUIDES, startingFee } from '@dokyu/shared';
import { Screen, Section } from '../../components/ui/Screen';
import { Wordmark } from '../../components/ui/Wordmark';
import { AgencyTile } from '../../components/ui/AgencyTile';
import { AppText } from '../../components/ui/AppText';
import { Card, PressableCard } from '../../components/ui/Card';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { useLayout } from '../../lib/useLayout';
import { useAuth } from '../../lib/auth';
import { formatFee } from '../../lib/format';

const POPULAR = ['nbi-clearance', 'psa-birth-certificate', 'national-id'];

export default function Home() {
  const { t } = useTranslation();
  const { isDesktop } = useLayout();
  const { user } = useAuth();
  const firstName = user?.fullName.split(' ')[0];
  return (
    <Screen>
      {!isDesktop && <Wordmark />}
      <Card tone="soft" className="gap-1 p-5">
        <AppText variant="small" tone="muted">
          {firstName ? t('home.greetingName', { name: firstName }) : t('common.greeting')}
        </AppText>
        <AppText variant="h2" weight="bold" tone="primaryDark">
          {t('home.welcome')}
        </AppText>
        <AppText variant="small" tone="muted" className="mt-1">
          {t('home.tagline')}
        </AppText>
      </Card>

      <Section>
        <View className="flex-row items-center justify-between">
          <AppText variant="title">{t('home.popular')}</AppText>
          <Link href="/guides">
            <AppText variant="small" weight="semibold" tone="primary">
              {t('home.seeAll')}
            </AppText>
          </Link>
        </View>
        {POPULAR.map((slug) => {
          const g = GUIDES.find((x) => x.slug === slug);
          if (!g) return null;
          return (
            <Link key={slug} href={{ pathname: '/guides/[slug]', params: { slug } }} asChild>
              <PressableCard
                className="flex-row items-center gap-4"
                accessibilityLabel={`${g.title}, ${formatFee(startingFee(g.fees), t)}`}
              >
                <AgencyTile mono={g.mono} />
                <View className="flex-1">
                  <AppText variant="bodyLg" weight="semibold">
                    {g.title}
                  </AppText>
                  <AppText variant="small" tone="muted">
                    {g.agency}
                  </AppText>
                </View>
                <AppText variant="body" weight="semibold" tone="primary">
                  {formatFee(startingFee(g.fees), t)}
                </AppText>
              </PressableCard>
            </Link>
          );
        })}
      </Section>
      <Disclaimer />
    </Screen>
  );
}
