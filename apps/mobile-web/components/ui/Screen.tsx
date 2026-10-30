import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { Animated, Platform, ScrollView, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTourMaybe, type Scrollable } from '../../lib/tour';
import { useReducedMotion } from '../../lib/motion';
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
  tourScroll = false,
}: {
  children: ReactNode;
  wide?: boolean;
  className?: string;
  /** Let the guided tour scroll this screen to its targets. */
  tourScroll?: boolean;
}) {
  const { isDesktop } = useLayout();
  const reduced = useReducedMotion();
  const tour = useTourMaybe();
  const scroll = useRef<Scrollable | null>(null);
  const offset = useRef(0);
  const setScroller = tour?.setScroller;
  useEffect(() => {
    if (!tourScroll || !scroll.current || !setScroller) return;
    setScroller({ ref: scroll.current, offset: () => offset.current });
    return () => setScroller(null);
  }, [tourScroll, setScroller]);

  // Every time the screen comes into view it slides up and fades in a little.
  const enter = useRef(new Animated.Value(1)).current;
  useFocusEffect(
    useCallback(() => {
      if (reduced) return;
      enter.setValue(0);
      Animated.spring(enter, {
        toValue: 1,
        speed: 16,
        bounciness: 5,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }, [enter, reduced]),
  );
  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const opacity = enter.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] });

  return (
    <SafeAreaView edges={isDesktop ? [] : ['top']} className="flex-1 bg-surface">
      <ScrollView
        ref={(node: Scrollable | null) => {
          scroll.current = node;
        }}
        onScroll={(e) => {
          offset.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={32}
        contentContainerClassName={isDesktop ? 'px-10 pb-16 pt-10' : 'px-5 pb-10 pt-5'}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
          <View
            className={cn('w-full self-center gap-5', className)}
            style={{ maxWidth: wide ? 1080 : 760 }}
          >
            {children}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** A titled block inside a screen. */
export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <View className={cn('gap-3', className)}>{children}</View>;
}
