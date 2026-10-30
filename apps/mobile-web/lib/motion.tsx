/**
 * Small, purposeful motion (plan §4.2: 150–250 ms). Everything here turns itself off when the phone's
 * "reduce motion" setting is on, and uses React Native's Animated API so it behaves the same on Android and web.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { motion } from '@dokyu/shared';

const native = Platform.OS !== 'web';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => alive && setReduced(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

/** Fades content in while it rises a few pixels. `delay` staggers a list. */
export function FadeIn({
  children,
  delay = 0,
  distance = 10,
  style,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) {
      v.setValue(1);
      return;
    }
    Animated.timing(v, {
      toValue: 1,
      duration: motion.slow,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: native,
    }).start();
  }, [v, delay, reduced]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });
  return (
    <Animated.View style={[{ opacity: v, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

/** Press feedback: shrinks slightly while pressed. Spread the handlers onto a Pressable. */
export function usePressScale(to = 0.97) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const go = (value: number) =>
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: native,
      speed: 40,
      bounciness: 6,
    }).start();
  return {
    style: { transform: [{ scale }] },
    handlers: {
      onPressIn: () => !reduced && go(to),
      onPressOut: () => !reduced && go(1),
    },
  };
}

/** A gentle up-and-down float, used for the placeholder Doki so he feels alive. */
export function Float({
  children,
  amount = 4,
  duration = 1800,
}: {
  children: ReactNode;
  amount?: number;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: native,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: native,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration, reduced]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, -amount] });
  return <Animated.View style={{ transform: [{ translateY }] }}>{children}</Animated.View>;
}

/** Animates a 0–1 progress value (checklist bars). */
export function useAnimatedProgress(value: number) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(value)).current;
  useEffect(() => {
    if (reduced) {
      v.setValue(value);
      return;
    }
    Animated.timing(v, {
      toValue: value,
      duration: motion.slow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [v, value, reduced]);
  return v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
}
