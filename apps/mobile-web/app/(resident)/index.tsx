/** Home, following the locked Bayan Blue prototype (plan §4.2), adapted to the citizen-first scope (v1.6). */
import { useCallback, useState } from 'react';
import { HOME_TOUR, useTour, useTourTarget } from '../../lib/tour';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, pick, startingFee } from '@dokyu/shared';
import { Screen } from '../../components/ui/Screen';
import { Wordmark } from '../../components/ui/Wordmark';
import { AgencyTile } from '../../components/ui/AgencyTile';
import { AppText } from '../../components/ui/AppText';
import { PressableCard } from '../../components/ui/Card';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { Icon } from '../../components/ui/Icon';
import { GreetingCard } from '../../components/home/GreetingCard';
import { ServiceGrid, type Tile } from '../../components/home/ServiceGrid';
import { ForYouCard } from '../../components/home/ForYouCard';
import { FadeIn } from '../../lib/motion';
import { useLayout } from '../../lib/useLayout';
import { useAuth } from '../../lib/auth';
import { useGuides } from '../../lib/guides';
import { useSettings } from '../../lib/settings';
import { useAllChecklists } from '../../lib/checklist';
import { forYou } from '../../lib/forYou';
import { formatFee } from '../../lib/format';
import { TextLink } from '../../components/ui/TextLink';
import { docAlerts, useMyDocs } from '../../lib/mydocs';
import { manilaTime } from '@dokyu/shared';
import { useNow } from '../../lib/offices';

const POPULAR = [
  'nbi-clearance',
  'psa-birth-certificate',
  'national-id',
  'passport',
  'police-clearance',
];

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDesktop } = useLayout();
  const { user } = useAuth();
  const { language, goals, tourSeen, ready } = useSettings();
  const tour = useTour();
  const servicesRef = useTourTarget('home.services');
  const forYouRef = useTourTarget('home.forYou');
  const startTour = tour.start;
  const touring = tour.steps !== null;
  // First visit: Doki shows the user around once.
  useFocusEffect(
    useCallback(() => {
      if (!ready || tourSeen || touring) return;
      const timer = setTimeout(() => startTour(HOME_TOUR), 900);
      return () => clearTimeout(timer);
    }, [ready, tourSeen, touring, startTour]),
  );
  const { data: guides } = useGuides();

  // Re-read checklist progress whenever Home comes back into view.
  const [visit, setVisit] = useState(0);
  useFocusEffect(useCallback(() => setVisit((v) => v + 1), []));
  const ticks = useAllChecklists(
    guides.map((g) => g.slug),
    visit,
  );
  const next = forYou(guides, goals, ticks);
  const { docs } = useMyDocs();
  const now = useNow();
  // One line per document, even if a document has two alerts (ready + expired).
  const alerts = [...new Set(docAlerts(docs, manilaTime(now).iso).map((a) => a.doc.id))];
  const firstName = user?.fullName.split(' ')[0];

  const tiles: Tile[] = [
    {
      key: 'guides',
      icon: 'guides',
      label: t('tiles.guides'),
      onPress: () => router.push('/guides'),
    },
    {
      key: 'checklists',
      icon: 'checklist',
      label: t('tiles.checklists'),
      onPress: () => router.push('/checklists'),
    },
    {
      key: 'ids',
      icon: 'account',
      label: t('tiles.ids'),
      onPress: () => router.push({ pathname: '/guides', params: { category: 'identity' } }),
    },
    {
      key: 'clearances',
      icon: 'shield',
      label: t('tiles.clearances'),
      onPress: () => router.push({ pathname: '/guides', params: { category: 'clearances' } }),
    },
    {
      key: 'travel',
      icon: 'plane',
      label: t('tiles.travel'),
      onPress: () => router.push({ pathname: '/guides', params: { category: 'travel' } }),
    },
    {
      key: 'offices',
      icon: 'pin',
      label: t('tiles.offices'),
      onPress: () => router.push('/offices'),
    },
    {
      key: 'holidays',
      icon: 'calendar',
      label: t('tiles.holidays'),
      onPress: () => router.push('/holidays'),
    },
    {
      key: 'docs',
      icon: 'docs',
      label: t('tiles.myDocs'),
      onPress: () => router.push('/docs'),
    },
  ];

  return (
    <Screen tourScroll>
      {!isDesktop && (
        <FadeIn>
          <View className="flex-row items-center justify-between">
            <Wordmark />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('nav.account')}
              onPress={() => router.push('/account')}
              className="h-11 w-11 items-center justify-center bg-surface-alt active:opacity-80"
              style={{ borderRadius: 14 }}
            >
              {firstName ? (
                <AppText variant="body" weight="bold" tone="primary">
                  {firstName[0]?.toUpperCase()}
                </AppText>
              ) : (
                <Icon name="account" size={20} color={colors.primary} />
              )}
            </Pressable>
          </View>
        </FadeIn>
      )}

      <FadeIn delay={40}>
        <GreetingCard name={firstName} />
      </FadeIn>

      {alerts.length ? (
        <FadeIn delay={70}>
          <PressableCard
            tone="gold"
            className="flex-row items-center gap-3"
            onPress={() => router.push('/docs')}
          >
            <Icon name="bell" size={22} color="#8A6400" />
            <AppText
              variant="body"
              weight="semibold"
              className="flex-1"
              style={{ color: '#5C4300' }}
            >
              {t('home.docAlerts', { count: alerts.length })}
            </AppText>
            <Icon name="chevronRight" size={20} color="#8A6400" />
          </PressableCard>
        </FadeIn>
      ) : null}

      <FadeIn delay={100}>
        <View className="gap-3 rounded-[22px] py-2">
          <AppText variant="title">{t('home.whatToDo')}</AppText>
          <View ref={servicesRef} collapsable={false}>
            <ServiceGrid tiles={tiles} />
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={160}>
        <View className="gap-2.5">
          <AppText variant="title">{t('home.forYou')}</AppText>
          <View ref={forYouRef} collapsable={false}>
            <ForYouCard item={next} />
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={220}>
        <View className="gap-2.5">
          <View className="flex-row items-center justify-between">
            <AppText variant="title">{t('home.popular')}</AppText>
            <TextLink align="right" onPress={() => router.push('/guides')}>
              {t('home.seeAll')}
            </TextLink>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 pb-1.5"
          >
            {POPULAR.map((slug) => {
              const g = guides.find((x) => x.slug === slug);
              if (!g) return null;
              return (
                <Link key={slug} href={{ pathname: '/guides/[slug]', params: { slug } }} asChild>
                  <PressableCard className="gap-2.5" style={{ width: 164 }}>
                    <AgencyTile mono={g.mono} size={40} />
                    <AppText variant="body" weight="semibold" numberOfLines={2}>
                      {pick(g.title, language)}
                    </AppText>
                    <AppText variant="caption" tone="muted">
                      {t('home.steps', { n: g.steps.length })} · {formatFee(startingFee(g.fees), t)}
                    </AppText>
                  </PressableCard>
                </Link>
              );
            })}
          </ScrollView>
        </View>
      </FadeIn>

      <Disclaimer />
    </Screen>
  );
}
