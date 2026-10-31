/** Goal planner (plan §3.1 B): what to get for a goal, in what order, how much in total, and how long. */
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  GOALS,
  GOAL_PLANS,
  colors,
  formatPeso,
  pick,
  planTotal,
  startingFee,
  type GoalSlug,
} from '@dokyu/shared';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { AgencyTile } from '../../components/ui/AgencyTile';
import { Button } from '../../components/ui/Button';
import { Card, PressableCard } from '../../components/ui/Card';
import { ChoiceChip } from '../../components/ui/ChoiceChip';
import { Icon } from '../../components/ui/Icon';
import { BackLink } from '../../components/ui/BackLink';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { Doki } from '../../components/ui/Doki';
import { Confetti } from '../../components/doki/Confetti';
import { FadeIn, Float, PopOnChange } from '../../lib/motion';
import { useGuides } from '../../lib/guides';
import { useMyDocs } from '../../lib/mydocs';
import { useSettings } from '../../lib/settings';
import { formatFee } from '../../lib/format';

export default function Goals() {
  const { t } = useTranslation();
  const { language, goals: myGoals, update } = useSettings();
  const { data: guides } = useGuides();
  const { docs, saveDoc } = useMyDocs();
  const params = useLocalSearchParams<{ goal?: string }>();
  const initial = (GOALS.some((g) => g.slug === params.goal) ? params.goal : myGoals[0]) as
    GoalSlug | undefined;
  const [goal, setGoal] = useState<GoalSlug>(initial ?? 'first-job');
  const [added, setAdded] = useState(0);

  const steps = GOAL_PLANS[goal];
  const planGuides = useMemo(
    () => steps.map((s) => guides.find((g) => g.slug === s.guide)).filter((g) => g !== undefined),
    [steps, guides],
  );
  const total = planTotal(planGuides);
  const tracked = (slug: string) => docs.some((d) => d.guide === slug && d.personId === 'me');
  const untracked = planGuides.filter((g) => !tracked(g.slug));

  const trackAll = async () => {
    for (const g of untracked) await saveDoc({ guide: g.slug, personId: 'me', status: 'need' });
    if (!myGoals.includes(goal)) update({ goals: [...myGoals, goal] });
    setAdded((n) => n + 1);
  };

  return (
    <Screen>
      <BackLink label={t('nav.home')} fallback="/" />
      <View className="flex-row items-center gap-3">
        <Float amount={3}>
          <Doki size={72} pose="point" label="" />
        </Float>
        <View className="flex-1 gap-1">
          <AppText variant="h1">{t('goals.title')}</AppText>
          <AppText variant="body" tone="muted">
            {t('goals.intro')}
          </AppText>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {GOALS.map((g) => (
          <ChoiceChip
            key={g.slug}
            label={language === 'tl' ? g.tl : g.en}
            selected={goal === g.slug}
            onPress={() => setGoal(g.slug)}
          />
        ))}
      </View>

      <PopOnChange value={goal} from={0.92}>
        <Card tone="primary" className="flex-row flex-wrap gap-4">
          <View className="gap-0.5" style={{ minWidth: 120 }}>
            <AppText variant="caption" tone="inverse" style={{ opacity: 0.85 }}>
              {t('goals.documents')}
            </AppText>
            <AppText variant="h2" tone="inverse">
              {planGuides.length}
            </AppText>
          </View>
          <View className="gap-0.5" style={{ minWidth: 120 }}>
            <AppText variant="caption" tone="inverse" style={{ opacity: 0.85 }}>
              {t('goals.totalCost')}
            </AppText>
            <AppText variant="h2" tone="inverse">
              {total.amount === 0 && !total.atLeast
                ? t('common.free')
                : total.atLeast
                  ? t('common.from', { amount: formatPeso(total.amount) })
                  : formatPeso(total.amount)}
            </AppText>
          </View>
          <View className="gap-0.5" style={{ minWidth: 120 }}>
            <AppText variant="caption" tone="inverse" style={{ opacity: 0.85 }}>
              {t('goals.freeOnes')}
            </AppText>
            <AppText variant="h2" tone="inverse">
              {total.freeCount}
            </AppText>
          </View>
        </Card>
      </PopOnChange>
      <AppText variant="caption" tone="muted">
        {t('goals.costNote')}
      </AppText>

      {steps.map((s, i) => {
        const g = planGuides.find((x) => x.slug === s.guide);
        if (!g) return null;
        return (
          <FadeIn key={`${goal}-${s.guide}`} delay={i * 70}>
            <View className="flex-row gap-3">
              <View className="items-center">
                <View
                  className="items-center justify-center bg-primary"
                  style={{ width: 32, height: 32, borderRadius: 16 }}
                >
                  <AppText variant="small" weight="bold" tone="inverse">
                    {i + 1}
                  </AppText>
                </View>
                {i < steps.length - 1 ? (
                  <View
                    style={{ width: 2, flex: 1, backgroundColor: colors.primaryTint, marginTop: 4 }}
                  />
                ) : null}
              </View>
              <Link href={{ pathname: '/guides/[slug]', params: { slug: g.slug } }} asChild>
                <PressableCard className="mb-3 flex-1 gap-2">
                  <View className="flex-row items-center gap-3">
                    <AgencyTile mono={g.mono} size={40} />
                    <View className="flex-1">
                      <AppText variant="body" weight="semibold">
                        {pick(g.title, language)}
                      </AppText>
                      <AppText variant="caption" tone="muted">
                        {formatFee(startingFee(g.fees), t)}
                        {tracked(g.slug) ? ` · ${t('goals.inMyDocs')}` : ''}
                      </AppText>
                    </View>
                    <Icon name="chevronRight" size={20} color={colors.textSubtle} />
                  </View>
                  <AppText variant="small">{pick(s.why, language)}</AppText>
                  <View className="flex-row gap-1.5">
                    <Icon name="hourglass" size={14} color={colors.textMuted} />
                    <AppText variant="caption" tone="muted" className="flex-1">
                      {pick(g.processing, language)}
                    </AppText>
                  </View>
                </PressableCard>
              </Link>
            </View>
          </FadeIn>
        );
      })}

      {untracked.length > 0 ? (
        <Button
          label={t('goals.trackAll', { count: untracked.length })}
          icon={<Icon name="docs" size={18} color="#FFFFFF" />}
          onPress={trackAll}
        />
      ) : (
        <Card tone="soft" className="flex-row items-center gap-2">
          <Icon name="check" size={20} color={colors.success} />
          <AppText variant="body" weight="semibold" tone="success" className="flex-1">
            {t('goals.allTracked')}
          </AppText>
          <Link href="/docs">
            <AppText variant="small" weight="semibold" tone="primary">
              {t('nav.docs')}
            </AppText>
          </Link>
        </Card>
      )}
      <Confetti fire={added} />
      <Disclaimer />
    </Screen>
  );
}
