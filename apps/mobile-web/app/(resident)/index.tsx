/** Home, following the locked Bayan Blue prototype (plan §4.2), adapted to the citizen-first scope (v1.6). */
import { useCallback, useState, type ReactNode } from 'react';
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

  // Document types: each opens Guides on that category.
  const findTiles: Tile[] = [
    { key: 'ids', icon: 'account', label: t('tiles.ids'), category: 'identity' },
    { key: 'clearances', icon: 'shield', label: t('tiles.clearances'), category: 'clearances' },
    { key: 'civil', icon: 'people', label: t('tiles.civilRegistry'), category: 'civilRegistry' },
    { key: 'travel', icon: 'plane', label: t('tiles.travel'), category: 'travel' },
  ].map(({ category, ...tile }) => ({
    ...tile,
    icon: tile.icon as Tile['icon'],
    onPress: () => router.push({ pathname: '/guides', params: { category } }),
  }));
  // Tools for the trip itself.
  const planTiles: Tile[] = [
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
      key: 'checklists',
      icon: 'checklist',
      label: t('tiles.checklists'),
      onPress: () => router.push('/checklists'),
    },
    { key: 'docs', icon: 'docs', label: t('tiles.myDocs'), onPress: () => router.push('/docs') },
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

      <FadeIn delay={70}>
        <Pressable
          accessibilityRole="search"
          accessibilityLabel={t('home.search')}
          onPress={() => router.push({ pathname: '/guides', params: { focus: '1' } })}
          className="min-h-[52px] flex-row items-center gap-3 rounded-lg border border-line bg-surface px-4 active:opacity-80"
        >
          <Icon name="search" size={20} color={colors.textMuted} />
          <AppText variant="body" tone="subtle" className="flex-1" numberOfLines={1}>
            {t('home.search')}
          </AppText>
        </Pressable>
      </FadeIn>

      <FadeIn delay={100}>
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <AppText variant="title">{t('home.findDoc')}</AppText>
            <TextLink align="right" onPress={() => router.push('/guides')}>
              {t('home.allGuides')}
            </TextLink>
          </View>
          <View ref={servicesRef} collapsable={false}>
            <ServiceGrid tiles={findTiles} />
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

      <FadeIn delay={190}>
        <View className="gap-3">
          <AppText variant="title">{t('home.planVisit')}</AppText>
          <ServiceGrid tiles={planTiles} />
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
          <PopularRow desktop={isDesktop}>
            {POPULAR.map((slug) => {
              const g = guides.find((x) => x.slug === slug);
              if (!g) return null;
              return (
                // `Link asChild` replaces the card's style, so the width lives on a wrapping View.
                <View key={slug} style={isDesktop ? { flex: 1, minWidth: 0 } : { width: 164 }}>
                  <Link href={{ pathname: '/guides/[slug]', params: { slug } }} asChild>
                    <PressableCard className="gap-2.5 flex-1">
                      <AgencyTile mono={g.mono} size={40} />
                      <AppText variant="body" weight="semibold" numberOfLines={2}>
                        {pick(g.title, language)}
                      </AppText>
                      <AppText variant="caption" tone="muted">
                        {t('home.steps', { n: g.steps.length })} ·{' '}
                        {formatFee(startingFee(g.fees), t)}
                      </AppText>
                    </PressableCard>
                  </Link>
                </View>
              );
            })}
          </PopularRow>
        </View>
      </FadeIn>

      <Disclaimer />
    </Screen>
  );
}

/** Popular guides: a swipeable row on phones, all cards side by side on desktop (a mouse can't swipe). */
function PopularRow({ desktop, children }: { desktop: boolean; children: ReactNode }) {
  if (desktop) return <View className="flex-row gap-3">{children}</View>;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-3 pb-1.5"
    >
      {children}
    </ScrollView>
  );
}
