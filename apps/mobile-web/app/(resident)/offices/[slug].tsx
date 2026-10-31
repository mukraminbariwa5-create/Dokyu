/** One office: open now or not, hours, holidays coming up, landmark, map, directions, call and booking. */
import { useMemo } from 'react';
import { Linking, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  GUIDES,
  HOLIDAYS,
  addDays,
  closingHoliday,
  colors,
  directionsUrl,
  hoursText,
  manilaTime,
  pick,
  telUrl,
} from '@dokyu/shared';
import { Screen, Section } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { AgencyTile } from '../../../components/ui/AgencyTile';
import { Button } from '../../../components/ui/Button';
import { Card, PressableCard } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { BackLink } from '../../../components/ui/BackLink';
import { Disclaimer } from '../../../components/ui/Disclaimer';
import { StatusPill } from '../../../components/office/OfficeCard';
import { OfficeMap } from '../../../components/office/OfficeMap';
import { TipBox, hostOf, openOfficial } from '../../../components/guide/parts';
import { AGENCY_MONO, useNow, useOffice } from '../../../lib/offices';
import { useSettings } from '../../../lib/settings';
import { formatDate } from '../../../lib/format';
import { FadeIn } from '../../../lib/motion';
import { NotFound } from '../../../components/NotFound';
import { TextLink } from '../../../components/ui/TextLink';
import { useRouter } from 'expo-router';

export default function OfficeDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useSettings();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const office = useOffice(slug);
  const now = useNow();
  const L = (x: { en: string; tl: string }) => pick(x, language);

  const pins = useMemo(
    () =>
      office
        ? [
            {
              slug: office.slug,
              lat: office.lat,
              lng: office.lng,
              label: office.name,
              mono: AGENCY_MONO[office.agency],
            },
          ]
        : [],
    [office],
  );

  // Closures in the next 7 days, so nobody travels on a holiday.
  const comingClosures = useMemo(() => {
    if (!office) return [];
    const out: Array<{ iso: string; name: string }> = [];
    for (let i = 1; i <= 7; i++) {
      const d = manilaTime(addDays(now, i));
      // Only days the office would normally be open (a holiday on a Sunday changes nothing).
      if (!office.hours.some((h) => h.days.includes(d.dow))) continue;
      const h = closingHoliday(d.iso, HOLIDAYS);
      if (h) out.push({ iso: d.iso, name: L(h.name) });
      const local = office.usuallyClosed?.find((c) => c.month === d.month && c.day === d.day);
      if (local) out.push({ iso: d.iso, name: L(local.reason) });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [office, now, language]);

  if (!office) {
    return (
      <NotFound title={t('offices.notFound')} back="/offices" backLabel={t('offices.title')} />
    );
  }

  const guides = GUIDES.filter((g) => office.guides.includes(g.slug));

  return (
    <Screen>
      <BackLink label={t('offices.title')} fallback="/offices" />
      <FadeIn>
        <View className="flex-row items-center gap-4">
          <AgencyTile mono={AGENCY_MONO[office.agency]} size={60} />
          <View className="flex-1 gap-1">
            <AppText variant="h2">{office.name}</AppText>
            <StatusPill office={office} now={now} />
          </View>
        </View>
      </FadeIn>

      {comingClosures.length ? (
        <TipBox
          tone="warning"
          text={t('offices.closingDays', {
            days: comingClosures
              .map((c) => `${formatDate(c.iso, language)} (${c.name})`)
              .join(', '),
          })}
        />
      ) : null}

      {/* Main action first and full width; contact actions share one row. */}
      <View className="gap-2">
        <Button
          label={t('offices.directions')}
          fullWidth
          icon={<Icon name="directions" size={20} color="#FFFFFF" />}
          onPress={() => openOfficial(directionsUrl(office))}
        />
        {office.phone || office.email ? (
          <View className="flex-row gap-2">
            {office.phone ? (
              <View className="flex-1">
                <Button
                  label={t('offices.call')}
                  variant="secondary"
                  size="md"
                  fullWidth
                  icon={<Icon name="call" size={18} color={colors.primaryDark} />}
                  accessibilityHint={office.phone}
                  onPress={() => Linking.openURL(telUrl(office.phone!)).catch(() => {})}
                />
              </View>
            ) : null}
            {office.email ? (
              <View className="flex-1">
                <Button
                  label={t('offices.email')}
                  variant="secondary"
                  size="md"
                  fullWidth
                  icon={<Icon name="mail" size={18} color={colors.primaryDark} />}
                  onPress={() => Linking.openURL(`mailto:${office.email}`).catch(() => {})}
                />
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {office.appointment ? (
        <PressableCard
          tone="primary"
          className="flex-row items-center gap-3"
          onPress={() => openOfficial(office.appointment!.url)}
          accessibilityRole="link"
          accessibilityHint={t('guide.opens', { host: hostOf(office.appointment.url) })}
        >
          <Icon name="calendar" size={22} color="#FFFFFF" />
          <View className="flex-1">
            <AppText variant="body" weight="semibold" tone="inverse">
              {L(office.appointment.label)}
            </AppText>
            <AppText variant="caption" tone="inverse" style={{ opacity: 0.85 }}>
              {hostOf(office.appointment.url)}
            </AppText>
          </View>
          <Icon name="external" size={18} color="#FFFFFF" />
        </PressableCard>
      ) : null}

      <Section>
        <AppText variant="title">{t('offices.hours')}</AppText>
        <Card className="gap-2">
          {hoursText(office, language).map((line) => (
            <View key={line} className="flex-row items-center gap-2">
              <Icon name="clock" size={18} color={colors.primary} />
              <AppText variant="body" weight="medium">
                {line}
              </AppText>
            </View>
          ))}
          <AppText variant="small" tone="muted">
            {office.hoursConfirmed ? t('offices.hoursOfficial') : t('offices.hoursCheck')}
          </AppText>
          {office.hoursNote ? (
            <AppText variant="small" tone="muted">
              {L(office.hoursNote)}
            </AppText>
          ) : null}
          <TextLink onPress={() => router.push('/holidays')}>{t('offices.seeHolidays')}</TextLink>
        </Card>
      </Section>

      <Section>
        <AppText variant="title">{t('offices.whereIsIt')}</AppText>
        <Card className="gap-2">
          <View className="flex-row gap-2">
            <Icon name="pin" size={18} color={colors.primary} />
            <AppText variant="body" className="flex-1">
              {office.address}
            </AppText>
          </View>
          {office.landmark ? (
            <View className="flex-row gap-2">
              <Icon name="flag" size={18} color={colors.primary} />
              <AppText variant="body" tone="muted" className="flex-1">
                <AppText variant="body" weight="semibold" tone="muted">
                  {t('offices.landmark')}{' '}
                </AppText>
                {L(office.landmark)}
              </AppText>
            </View>
          ) : null}
          {office.phone ? (
            <View className="flex-row gap-2">
              <Icon name="call" size={18} color={colors.primary} />
              <AppText variant="body" tone="muted" selectable>
                {office.phone}
              </AppText>
            </View>
          ) : null}
        </Card>
        <OfficeMap pins={pins} selected={office.slug} height={240} />
        <AppText variant="caption" tone="muted">
          {t('offices.pinNote')}
        </AppText>
      </Section>

      <Section>
        <AppText variant="title">{t('offices.whatHere')}</AppText>
        <AppText variant="body" tone="muted">
          {L(office.services)}
        </AppText>
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={{ pathname: '/guides/[slug]', params: { slug: g.slug } }}
            asChild
          >
            <PressableCard className="flex-row items-center gap-3">
              <AgencyTile mono={g.mono} size={40} />
              <View className="flex-1">
                <AppText variant="body" weight="semibold">
                  {pick(g.title, language)}
                </AppText>
                <AppText variant="caption" tone="muted">
                  {t('offices.seeWhatToBring')}
                </AppText>
              </View>
              <Icon name="chevronRight" size={20} color={colors.textSubtle} />
            </PressableCard>
          </Link>
        ))}
      </Section>

      {office.tip ? <TipBox tone="tip" text={L(office.tip)} /> : null}

      <Card tone="soft" className="gap-1">
        <AppText variant="caption" tone="muted">
          {t('offices.checked', { date: formatDate(office.lastVerified, language) })}
        </AppText>
        <TextLink onPress={() => openOfficial(office.source)}>
          {t('offices.source', { host: hostOf(office.source) })}
        </TextLink>
      </Card>
      <Disclaimer />
    </Screen>
  );
}
