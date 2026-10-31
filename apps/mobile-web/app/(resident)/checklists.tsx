/** All "Before you go" checklists in one place (Home's Checklists tile). */
import { useCallback, useState } from 'react';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { Animated, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, pick, type Guide } from '@dokyu/shared';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { AgencyTile } from '../../components/ui/AgencyTile';
import { Card, PressableCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { BackLink } from '../../components/ui/BackLink';
import { Doki } from '../../components/ui/Doki';
import { Badge } from '../../components/ui/Badge';
import { useGuides } from '../../lib/guides';
import { useAllChecklists } from '../../lib/checklist';
import { useSettings } from '../../lib/settings';
import { FadeIn, useAnimatedProgress } from '../../lib/motion';

function Row({ guide, ticked }: { guide: Guide; ticked: number[] }) {
  const { t } = useTranslation();
  const { language } = useSettings();
  const required = guide.requirements.map((r, i) => ({ r, i })).filter(({ r }) => !r.onlyIf);
  const done = required.filter(({ i }) => ticked.includes(i)).length;
  const ready = done === required.length;
  const width = useAnimatedProgress(done / Math.max(required.length, 1));
  return (
    <Link href={{ pathname: '/guides/[slug]/checklist', params: { slug: guide.slug } }} asChild>
      <PressableCard className="flex-row items-center gap-4">
        <AgencyTile mono={guide.mono} />
        <View className="flex-1 gap-1.5">
          <View className="flex-row items-center justify-between gap-2">
            <AppText variant="body" weight="semibold" className="flex-1">
              {pick(guide.title, language)}
            </AppText>
            {ready ? <Badge tone="done" label={t('checklists.ready')} /> : null}
          </View>
          <AppText variant="small" tone="muted">
            {t('checklist.progress', { done, total: required.length })}
          </AppText>
          <View className="h-2 overflow-hidden rounded-full bg-surface-alt">
            <Animated.View
              style={{
                height: '100%',
                borderRadius: 999,
                width,
                backgroundColor: ready ? colors.success : colors.primary,
              }}
            />
          </View>
        </View>
      </PressableCard>
    </Link>
  );
}

export default function Checklists() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: guides } = useGuides();
  const [visit, setVisit] = useState(0);
  useFocusEffect(useCallback(() => setVisit((v) => v + 1), []));
  const ticks = useAllChecklists(
    guides.map((g) => g.slug),
    visit,
  );
  const started = guides.filter((g) => (ticks[g.slug]?.length ?? 0) > 0);

  return (
    <Screen>
      <BackLink label={t('nav.home')} fallback="/" />
      <View className="gap-1">
        <AppText variant="h1">{t('checklists.title')}</AppText>
        <AppText variant="body" tone="muted">
          {t('checklists.intro')}
        </AppText>
      </View>
      {started.length === 0 ? (
        <Card tone="soft" className="items-center gap-3 p-6">
          <Doki size={96} pose="point" />
          <AppText variant="title" style={{ textAlign: 'center' }}>
            {t('checklists.emptyTitle')}
          </AppText>
          <AppText variant="body" tone="muted" style={{ textAlign: 'center' }}>
            {t('checklists.empty')}
          </AppText>
          <Button
            label={t('checklists.browse')}
            icon={<Icon name="guides" size={20} color="#FFFFFF" />}
            onPress={() => router.push('/guides')}
          />
        </Card>
      ) : null}
      {started.map((g, i) => (
        <FadeIn key={g.slug} delay={i * 50}>
          <Row guide={g} ticked={ticks[g.slug] ?? []} />
        </FadeIn>
      ))}
    </Screen>
  );
}
