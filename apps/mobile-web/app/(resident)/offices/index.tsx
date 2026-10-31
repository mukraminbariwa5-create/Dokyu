/** Office Finder (plan §3.1 D): offices near you or in your area, open now or not, on a map. */
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  GUIDES,
  OFFICES,
  OFFICE_AREAS,
  colors,
  distanceKm,
  pick,
  type OfficeSeed,
} from '@dokyu/shared';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ChoiceChip } from '../../../components/ui/ChoiceChip';
import { Icon } from '../../../components/ui/Icon';
import { BackLink } from '../../../components/ui/BackLink';
import { Disclaimer } from '../../../components/ui/Disclaimer';
import { OfficeCard } from '../../../components/office/OfficeCard';
import { OfficeMap } from '../../../components/office/OfficeMap';
import { FadeIn } from '../../../lib/motion';
import { AGENCY_MONO, useMyLocation, useNow } from '../../../lib/offices';
import { useSettings } from '../../../lib/settings';
import { useLayout } from '../../../lib/useLayout';

type Area = (typeof OFFICE_AREAS)[number]['key'] | 'all';

/** Default area from the user's saved province. */
function areaFromProvince(province: string | null): Area {
  if (!province) return 'all';
  if (province === 'Metro Manila') return 'metro-manila';
  if (province === 'Sulu') return 'sulu';
  if (province.startsWith('Zamboanga')) return 'zamboanga';
  return 'all';
}

export default function OfficeFinder() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language, province } = useSettings();
  const { isDesktop } = useLayout();
  const params = useLocalSearchParams<{ guide?: string; area?: string }>();
  const now = useNow();
  const { loc, ask, clear } = useMyLocation();
  const [area, setArea] = useState<Area>(
    (OFFICE_AREAS.some((a) => a.key === params.area)
      ? params.area
      : params.guide
        ? 'all'
        : areaFromProvince(province)) as Area,
  );
  const [guide, setGuide] = useState<string | undefined>(params.guide);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selected, setSelected] = useState<string | undefined>();

  const guideTitle = guide ? GUIDES.find((g) => g.slug === guide) : undefined;
  const me = useMemo(() => (loc.state === 'ok' ? { lat: loc.lat, lng: loc.lng } : null), [loc]);

  const shown = useMemo(() => {
    let list: Array<OfficeSeed & { km?: number }> = OFFICES.filter(
      (o) =>
        // Sulu residents go to Zamboanga City for a passport and the NBI regional office.
        (area === 'all' || o.area === area || (area === 'sulu' && o.area === 'zamboanga')) &&
        (!guide || o.guides.includes(guide)),
    );
    if (me) {
      list = list
        .map((o) => ({ ...o, km: distanceKm(me, o) }))
        .sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
    }
    return list;
  }, [area, guide, me]);

  const pins = useMemo(
    () =>
      shown.map((o) => ({
        slug: o.slug,
        lat: o.lat,
        lng: o.lng,
        label: o.name,
        mono: AGENCY_MONO[o.agency],
      })),
    [shown],
  );

  const showMap = isDesktop || view === 'map';

  return (
    <Screen wide={isDesktop}>
      <BackLink label={t('nav.home')} fallback="/" />
      <View className="gap-1">
        <AppText variant="h1">{t('offices.title')}</AppText>
        <AppText variant="body" tone="muted">
          {t('offices.intro')}
        </AppText>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <Button
          label={
            loc.state === 'ok'
              ? t('offices.nearMeOn')
              : loc.state === 'asking'
                ? t('offices.finding')
                : t('offices.nearMe')
          }
          variant={loc.state === 'ok' ? 'primary' : 'secondary'}
          size="md"
          loading={loc.state === 'asking'}
          icon={
            <Icon
              name="locate"
              size={18}
              color={loc.state === 'ok' ? '#FFFFFF' : colors.primaryDark}
            />
          }
          onPress={() => (loc.state === 'ok' ? clear() : ask())}
        />
        {!isDesktop ? (
          <Button
            label={view === 'list' ? t('offices.showMap') : t('offices.showList')}
            variant="ghost"
            size="md"
            icon={<Icon name={view === 'list' ? 'map' : 'list'} size={18} color={colors.primary} />}
            onPress={() => setView((v) => (v === 'list' ? 'map' : 'list'))}
          />
        ) : null}
      </View>
      {loc.state === 'denied' || loc.state === 'error' ? (
        <AppText variant="small" tone="muted" accessibilityLiveRegion="polite">
          {loc.state === 'denied' ? t('offices.locationDenied') : t('offices.locationError')}
        </AppText>
      ) : null}
      {loc.state === 'ok' ? (
        <AppText variant="caption" tone="muted">
          {t('offices.locationPrivate')}
        </AppText>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        <ChoiceChip
          label={t('offices.allAreas')}
          selected={area === 'all'}
          onPress={() => setArea('all')}
        />
        {OFFICE_AREAS.map((a) => (
          <ChoiceChip
            key={a.key}
            label={language === 'tl' ? a.tl : a.en}
            selected={area === a.key}
            onPress={() => setArea(a.key)}
          />
        ))}
      </ScrollView>

      {guideTitle ? (
        <Card tone="soft" className="flex-row items-center gap-3">
          <Icon name="guides" size={20} color={colors.primary} />
          <AppText variant="small" weight="medium" className="flex-1">
            {t('offices.forGuide', { name: pick(guideTitle.title, language) })}
          </AppText>
          <Button
            label={t('offices.showAll')}
            variant="ghost"
            size="md"
            onPress={() => {
              setGuide(undefined);
              router.setParams({ guide: undefined });
            }}
          />
        </Card>
      ) : null}

      <View className={isDesktop ? 'flex-row items-start gap-5' : 'gap-4'}>
        {showMap ? (
          <View style={isDesktop ? { flex: 1, position: 'sticky' as never, top: 24 } : undefined}>
            <OfficeMap
              pins={pins}
              me={me}
              selected={selected}
              height={isDesktop ? 520 : 340}
              onSelect={setSelected}
            />
            <AppText variant="caption" tone="muted" className="mt-2">
              {t('offices.pinNote')}
            </AppText>
          </View>
        ) : null}

        {!showMap || isDesktop ? (
          <View className="gap-3" style={isDesktop ? { flex: 1 } : undefined}>
            {shown.length === 0 ? (
              <Card tone="soft" className="gap-1">
                <AppText variant="body" weight="semibold">
                  {t('offices.none')}
                </AppText>
                <AppText variant="small" tone="muted">
                  {t('offices.noneHint')}
                </AppText>
              </Card>
            ) : null}
            {shown.map((o, n) => (
              <FadeIn key={`${o.slug}-${area}-${guide ?? ''}`} delay={Math.min(n, 8) * 45}>
                <OfficeCard
                  office={o}
                  now={now}
                  distanceKm={o.km}
                  highlighted={o.slug === selected}
                />
              </FadeIn>
            ))}
          </View>
        ) : null}

        {showMap && !isDesktop && selected ? (
          <FadeIn key={selected}>
            {(() => {
              const o = shown.find((x) => x.slug === selected);
              return o ? <OfficeCard office={o} now={now} distanceKm={o.km} highlighted /> : null;
            })()}
          </FadeIn>
        ) : null}
      </View>

      <Card tone="soft" className="gap-2">
        <AppText variant="small" weight="semibold">
          {t('offices.policeTitle')}
        </AppText>
        <AppText variant="small" tone="muted">
          {t('offices.policeText')}
        </AppText>
      </Card>
      <Disclaimer />
    </Screen>
  );
}
