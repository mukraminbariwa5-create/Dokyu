import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, shadow } from '@dokyu/shared';
import { Screen } from './ui/Screen';
import { AppText } from './ui/AppText';
import { Wordmark } from './ui/Wordmark';
import { Disclaimer } from './ui/Disclaimer';
import { Icon } from './ui/Icon';
import { useLayout } from '../lib/useLayout';
import { ACCOUNTS_ENABLED } from '../lib/api';
import { Button } from './ui/Button';

/** Layout for sign-in and related pages: full width on phones, a centred card on desktop. */
export function AuthScreen({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  const { isDesktop } = useLayout();
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <Screen className="gap-6">
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t('onboarding.back')}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          className="h-11 w-11 items-center justify-center rounded-md active:bg-surface-alt"
        >
          <Icon name="chevronLeft" color={colors.primary} />
        </Pressable>
        <Wordmark />
        <View className="w-11" />
      </View>
      <View
        className={
          isDesktop
            ? 'w-full self-center gap-5 rounded-card border border-line bg-surface p-8'
            : 'gap-5'
        }
        style={isDesktop ? { maxWidth: 480, boxShadow: shadow.raised } : undefined}
      >
        <View className="gap-1">
          <AppText variant="h1">{title}</AppText>
          {intro ? (
            <AppText variant="body" tone="muted">
              {intro}
            </AppText>
          ) : null}
        </View>
        {ACCOUNTS_ENABLED ? (
          children
        ) : (
          <View className="gap-3 rounded-lg bg-primary-soft p-4" accessibilityRole="alert">
            <AppText variant="body" weight="semibold">
              {t('preview.title')}
            </AppText>
            <AppText variant="small" tone="muted">
              {t('preview.text')}
            </AppText>
            <Button label={t('preview.home')} size="md" onPress={() => router.replace('/')} />
          </View>
        )}
      </View>
      <Disclaimer />
    </Screen>
  );
}

/** Message box above a form: red for errors, green for success. */
export function FormNotice({ tone, children }: { tone: 'error' | 'success'; children: string }) {
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      className={
        tone === 'error'
          ? 'flex-row gap-2 rounded-lg bg-red-soft p-3'
          : 'flex-row gap-2 rounded-lg bg-success-soft p-3'
      }
    >
      <Icon
        name={tone === 'error' ? 'alert' : 'check'}
        size={20}
        color={tone === 'error' ? colors.danger : colors.success}
      />
      <AppText variant="small" tone={tone === 'error' ? 'danger' : 'success'} className="flex-1">
        {children}
      </AppText>
    </View>
  );
}
