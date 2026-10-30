import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLayout } from '../../lib/useLayout';
import { cn } from '../../lib/cn';

/**
 * Page wrapper: scrolls, respects the notch, and centres content with a readable max width.
 * Desktop gets more padding and a wider column; `wide` is for dashboards and the showcase.
 */
export function Screen({
  children,
  wide = false,
  className,
}: {
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  const { isDesktop } = useLayout();
  return (
    <SafeAreaView edges={isDesktop ? [] : ['top']} className="flex-1 bg-surface">
      <ScrollView
        contentContainerClassName={isDesktop ? 'px-10 pb-16 pt-10' : 'px-5 pb-10 pt-5'}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className={cn('w-full self-center gap-5', className)}
          style={{ maxWidth: wide ? 1080 : 760 }}
        >
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** A titled block inside a screen. */
export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <View className={cn('gap-3', className)}>{children}</View>;
}
