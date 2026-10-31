import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { AppText } from './AppText';

/** A text link with a full-size tap area (44 px tall), for small "See all"-style links. */
export function TextLink({
  children,
  onPress,
  role = 'link',
  align = 'left',
}: {
  children: ReactNode;
  onPress: () => void;
  role?: 'link' | 'button';
  align?: 'left' | 'right';
}) {
  return (
    <Pressable
      accessibilityRole={role}
      onPress={onPress}
      hitSlop={8}
      className="justify-center active:opacity-70"
      style={{
        minHeight: 44,
        minWidth: 44,
        alignSelf: align === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      <AppText variant="small" weight="semibold" tone="primary">
        {children}
      </AppText>
    </Pressable>
  );
}
