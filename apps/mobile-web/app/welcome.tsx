/** First-launch intro: 3 slides with Doki, Skip on every slide, shown once (plan §3.1 H.12). */
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Doki } from '../components/ui/Doki';
import { Wordmark } from '../components/ui/Wordmark';
import { Disclaimer } from '../components/ui/Disclaimer';
import { useSettings } from '../lib/settings';
import { Float, PopOnChange } from '../lib/motion';

const SLIDES = [1, 2, 3] as const;

export default function Welcome() {
  const { t } = useTranslation();
  const router = useRouter();
  const { update } = useSettings();
  const [i, setI] = useState(0);
  const slide = SLIDES[i] ?? 1;
  const last = i === SLIDES.length - 1;

  const skip = () => {
    update({ introSeen: true, setupDone: true });
    router.replace('/');
  };
  const next = () => {
    if (!last) return setI(i + 1);
    update({ introSeen: true });
    router.replace('/setup');
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="w-full flex-1 self-center px-6 pb-6 pt-4" style={{ maxWidth: 520 }}>
        <View className="flex-row items-center justify-between">
          <Wordmark />
          <Pressable
            accessibilityRole="button"
            onPress={skip}
            className="min-h-[44px] justify-center px-3"
          >
            <AppText variant="body" weight="semibold" tone="muted">
              {t('onboarding.skip')}
            </AppText>
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center gap-6">
          <View
            className="items-center justify-center rounded-full bg-primary-soft"
            style={{ width: 220, height: 220 }}
          >
            <PopOnChange value={slide}>
              <Float amount={6} duration={1500}>
                <Doki size={150} pose={slide === 1 ? 'wave' : slide === 2 ? 'point' : 'happy'} />
              </Float>
            </PopOnChange>
          </View>
          <View className="gap-3" accessibilityLiveRegion="polite">
            <AppText variant="h1" style={{ textAlign: 'center' }}>
              {t(`onboarding.slide${slide}Title`)}
            </AppText>
            <AppText variant="bodyLg" tone="muted" style={{ textAlign: 'center' }}>
              {t(`onboarding.slide${slide}Text`)}
            </AppText>
          </View>
        </View>

        <View className="gap-5">
          <View
            className="flex-row justify-center gap-2"
            accessibilityLabel={`${i + 1} / ${SLIDES.length}`}
          >
            {SLIDES.map((s, n) => (
              <View
                key={s}
                className="h-2 rounded-full"
                style={{
                  width: n === i ? 24 : 8,
                  backgroundColor: n === i ? colors.primary : colors.border,
                }}
              />
            ))}
          </View>
          <Button
            label={last ? t('onboarding.start') : t('onboarding.next')}
            onPress={next}
            fullWidth
          />
          <Disclaimer />
        </View>
      </View>
    </SafeAreaView>
  );
}
