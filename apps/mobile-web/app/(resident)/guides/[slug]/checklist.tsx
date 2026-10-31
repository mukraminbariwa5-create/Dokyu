/** "Before you go" checklist (plan v1.6 §3.1 A): tick off each requirement the night before. */
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, pick } from '@dokyu/shared';
import { Screen } from '../../../../components/ui/Screen';
import { AppText } from '../../../../components/ui/AppText';
import { Button } from '../../../../components/ui/Button';
import { Icon } from '../../../../components/ui/Icon';
import { Doki } from '../../../../components/ui/Doki';
import { RequirementCard } from '../../../../components/guide/parts';
import { useGuide } from '../../../../lib/guides';
import { useChecklist } from '../../../../lib/checklist';
import { useSettings } from '../../../../lib/settings';
import { Confetti } from '../../../../components/doki/Confetti';
import { FadeIn, PopOnChange, useAnimatedProgress } from '../../../../lib/motion';
import { Animated } from 'react-native';

export default function Checklist() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useSettings();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const g = useGuide(slug);
  const { ticked, toggle, clear } = useChecklist(slug);
  const [burst, setBurst] = useState(0);
  const wasAllSet = useRef<boolean | null>(null);
  const required0 = g ? g.requirements.filter((r) => !r.onlyIf).length : 0;
  const done0 = g ? g.requirements.filter((r, i) => !r.onlyIf && ticked.includes(i)).length : 0;
  const allSet0 = required0 > 0 && done0 === required0;
  const progress = useAnimatedProgress(required0 ? done0 / required0 : 0);
  // Confetti only when the last item gets ticked, not when opening an already-finished list.
  useEffect(() => {
    if (wasAllSet.current === false && allSet0) setBurst((b) => b + 1);
    wasAllSet.current = allSet0;
  }, [allSet0]);
  if (!g) return null;

  const required = g.requirements.map((r, i) => ({ r, i })).filter(({ r }) => !r.onlyIf);
  const optional = g.requirements.map((r, i) => ({ r, i })).filter(({ r }) => r.onlyIf);
  const done = required.filter(({ i }) => ticked.includes(i)).length;
  const total = required.length;
  const allSet = done === total;

  return (
    <Screen>
      <Pressable
        accessibilityRole="link"
        onPress={() => router.navigate({ pathname: '/guides/[slug]', params: { slug: g.slug } })}
        className="min-h-[44px] flex-row items-center gap-1 self-start"
      >
        <Icon name="chevronLeft" size={20} color={colors.primary} />
        <AppText variant="body" weight="medium" tone="primary">
          {pick(g.title, language)}
        </AppText>
      </Pressable>
      <View className="gap-1">
        <AppText variant="h1">{t('checklist.title')}</AppText>
        <AppText variant="body" tone="muted">
          {t('checklist.intro')}
        </AppText>
      </View>

      <View className="gap-2" accessibilityLiveRegion="polite">
        <AppText variant="small" weight="semibold" tone={allSet ? 'success' : 'primary'}>
          {t('checklist.progress', { done, total })}
        </AppText>
        <View className="h-2.5 overflow-hidden rounded-full bg-surface-alt">
          <Animated.View
            style={{
              height: '100%',
              borderRadius: 999,
              width: progress,
              backgroundColor: allSet ? colors.success : colors.primary,
            }}
          />
        </View>
      </View>

      {allSet ? (
        <FadeIn>
          <View className="flex-row items-center gap-3 rounded-card bg-success-soft p-4">
            <PopOnChange value={burst} from={0.3}>
              <Doki size={56} pose="happy" />
            </PopOnChange>
            <AppText variant="body" weight="semibold" tone="success" className="flex-1">
              {t('checklist.allSet')}
            </AppText>
          </View>
        </FadeIn>
      ) : null}

      <View className="gap-3">
        {required.map(({ r, i }, n) => (
          <FadeIn key={i} delay={Math.min(n, 8) * 50}>
            <RequirementCard req={r} checked={ticked.includes(i)} onToggle={() => toggle(i)} />
          </FadeIn>
        ))}
      </View>
      {optional.length ? (
        <View className="gap-3">
          <AppText variant="small" weight="semibold" tone="muted">
            {t('checklist.optional')}
          </AppText>
          {optional.map(({ r, i }) => (
            <RequirementCard
              key={i}
              req={r}
              checked={ticked.includes(i)}
              onToggle={() => toggle(i)}
            />
          ))}
        </View>
      ) : null}
      {ticked.length ? (
        <Button label={t('checklist.reset')} variant="ghost" onPress={clear} />
      ) : null}
      <Confetti fire={burst} count={44} spread={200} />
    </Screen>
  );
}
