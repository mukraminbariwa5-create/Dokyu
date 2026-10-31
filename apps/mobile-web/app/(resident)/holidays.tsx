/** Holidays and closures (plan §3.1 D): is today a working day, the next day off, and the full list. */
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  HOLIDAYS,
  HOLIDAYS_PENDING,
  closingHoliday,
  colors,
  manilaTime,
  pick,
  upcomingHolidays,
  type Holiday,
} from '@dokyu/shared';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { ChoiceChip } from '../../components/ui/ChoiceChip';
import { Icon } from '../../components/ui/Icon';
import { BackLink } from '../../components/ui/BackLink';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { Doki } from '../../components/ui/Doki';
import { FadeIn, Float } from '../../lib/motion';
import { useNow } from '../../lib/offices';
import { useSettings } from '../../lib/settings';

const KIND_STYLE: Record<Holiday['kind'], { bg: string; fg: string }> = {
  regular: { bg: '#FDE8EA', fg: '#B42335' },
  special: { bg: colors.goldSoft, fg: '#8A6400' },
  specialWorking: { bg: colors.successSoft, fg: colors.success },
};

function daysBetween(fromIso: string, toIso: string) {
  return Math.round(
    (Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000,
  );
}

export default function Holidays() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const now = useNow();
  const today = manilaTime(now);
  const [showPast, setShowPast] = useState(false);

  const todayHoliday = closingHoliday(today.iso, HOLIDAYS);
  const weekend = today.dow === 0 || today.dow === 6;
  const upcoming = useMemo(() => upcomingHolidays(HOLIDAYS, now), [now]);
  const next = upcoming.find((h) => h.date > today.iso && h.kind !== 'specialWorking');
  const list = showPast ? HOLIDAYS : upcoming;

  const months = useMemo(() => {
    const groups = new Map<string, Holiday[]>();
    for (const h of list) {
      const key = h.date.slice(0, 7);
      groups.set(key, [...(groups.get(key) ?? []), h]);
    }
    return [...groups.entries()];
  }, [list]);

  const locale = language === 'tl' ? 'fil-PH' : 'en-PH';
  const fmtMonth = (key: string) =>
    new Date(`${key}-01T00:00:00Z`).toLocaleDateString(locale, {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  const fmtDay = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });

  const headline = todayHoliday
    ? t('holidays.todayOff', { name: pick(todayHoliday.name, language) })
    : weekend
      ? t('holidays.todayWeekend')
      : t('holidays.todayWorking');

  return (
    <Screen>
      <BackLink label={t('nav.home')} fallback="/" />
      <AppText variant="h1">{t('holidays.title')}</AppText>

      <FadeIn>
        <Card
          tone={todayHoliday || weekend ? 'gold' : 'soft'}
          className="flex-row items-center gap-3"
        >
          <Float amount={3}>
            <Doki size={64} pose={todayHoliday ? 'happy' : weekend ? 'wave' : 'point'} label="" />
          </Float>
          <View className="flex-1 gap-1">
            <AppText variant="caption" weight="semibold" tone="muted">
              {t('holidays.today').toUpperCase()}
            </AppText>
            <AppText variant="bodyLg" weight="bold" accessibilityLiveRegion="polite">
              {headline}
            </AppText>
            {next ? (
              <AppText variant="small" tone="muted">
                {t('holidays.next', {
                  name: pick(next.name, language),
                  count: daysBetween(today.iso, next.date),
                })}
              </AppText>
            ) : null}
          </View>
        </Card>
      </FadeIn>

      <View className="flex-row flex-wrap gap-2">
        <ChoiceChip
          label={t('holidays.upcoming')}
          selected={!showPast}
          onPress={() => setShowPast(false)}
        />
        <ChoiceChip
          label={t('holidays.all')}
          selected={showPast}
          onPress={() => setShowPast(true)}
        />
      </View>

      <View className="flex-row flex-wrap gap-3">
        {(['regular', 'special', 'specialWorking'] as const).map((k) => (
          <View key={k} className="flex-row items-center gap-1.5">
            <View
              style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: KIND_STYLE[k].fg }}
            />
            <AppText variant="caption" tone="muted">
              {t(`holidays.kind_${k}`)}
            </AppText>
          </View>
        ))}
      </View>

      {months.map(([key, items], m) => (
        <FadeIn key={`${key}-${showPast}`} delay={Math.min(m, 6) * 50} style={{ gap: 8 }}>
          <AppText variant="title">{fmtMonth(key)}</AppText>
          {items.map((h) => {
            const isToday = h.date === today.iso;
            const past = h.date < today.iso;
            const s = KIND_STYLE[h.kind];
            return (
              <Card
                key={h.date}
                className="flex-row items-center gap-3"
                style={[
                  isToday ? { borderWidth: 2, borderColor: colors.gold } : null,
                  past ? { opacity: 0.55 } : null,
                ]}
              >
                <View
                  className="items-center justify-center"
                  style={{ width: 54, height: 54, borderRadius: 16, backgroundColor: s.bg }}
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    style={{ color: s.fg, textAlign: 'center' }}
                  >
                    {fmtDay(h.date)}
                  </AppText>
                </View>
                <View className="flex-1 gap-0.5">
                  <AppText variant="body" weight="semibold">
                    {pick(h.name, language)}
                  </AppText>
                  <AppText variant="caption" weight="medium" style={{ color: s.fg }}>
                    {t(`holidays.kind_${h.kind}`)}
                    {h.kind === 'specialWorking' ? ` · ${t('holidays.officesOpen')}` : ''}
                  </AppText>
                </View>
                {isToday ? <Icon name="sparkle" size={20} color={colors.gold} /> : null}
              </Card>
            );
          })}
        </FadeIn>
      ))}

      <Card tone="soft" className="gap-1">
        <AppText variant="small" tone="muted">
          {pick(HOLIDAYS_PENDING, language)}
        </AppText>
        <AppText variant="caption" tone="muted">
          {t('holidays.source')}
        </AppText>
      </Card>
      <Disclaimer />
    </Screen>
  );
}
