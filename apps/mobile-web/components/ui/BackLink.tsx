import { Pressable } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { colors } from '@dokyu/shared';
import { AppText } from './AppText';
import { Icon } from './Icon';

/**
 * "‹ My Docs", "‹ Home"…: always goes to the page its label names (`fallback`), never just "back in history",
 * so the label is never wrong (e.g. after Guide → Track in My Docs, "‹ My Docs" opens My Docs, not the guide).
 * `navigate` returns to that page if it is already open, so its scroll position is kept.
 */
export function BackLink({ label, fallback }: { label: string; fallback: Href }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.navigate(fallback)}
      className="min-h-[44px] flex-row items-center gap-1 self-start"
    >
      <Icon name="chevronLeft" size={20} color={colors.primary} />
      <AppText variant="body" weight="medium" tone="primary">
        {label}
      </AppText>
    </Pressable>
  );
}
