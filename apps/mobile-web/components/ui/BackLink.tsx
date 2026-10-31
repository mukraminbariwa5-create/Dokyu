import { Pressable } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { colors } from '@dokyu/shared';
import { AppText } from './AppText';
import { Icon } from './Icon';

/** "‹ Back" that goes back, or to `fallback` when the page was opened directly. */
export function BackLink({ label, fallback }: { label: string; fallback: Href }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
      className="min-h-[44px] flex-row items-center gap-1 self-start"
    >
      <Icon name="chevronLeft" size={20} color={colors.primary} />
      <AppText variant="body" weight="medium" tone="primary">
        {label}
      </AppText>
    </Pressable>
  );
}
