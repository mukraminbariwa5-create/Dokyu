/**
 * A short burst of paper confetti in the app's colours. Fires once when `fire` changes to a new value.
 * Purely decorative: hidden from screen readers, never takes touches, skipped with reduce motion.
 */
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import { useReducedMotion } from '../../lib/motion';

const native = Platform.OS !== 'web';
const COLORS = ['#2042C4', '#FFD452', '#E5485B', '#3D66F2', '#15A05A', '#E0A800', '#FF8FA6'];

interface Piece {
  dx: number;
  dy: number;
  spin: number;
  color: string;
  w: number;
  h: number;
  delay: number;
}

export function Confetti({
  fire,
  count = 36,
  spread = 180,
}: {
  /** Change this (e.g. a counter) to fire a burst. 0 or false = nothing. */
  fire: number | boolean;
  count?: number;
  spread?: number;
}) {
  const reduced = useReducedMotion();
  const t = useRef(new Animated.Value(0)).current;
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const power = spread * (0.5 + Math.random() * 0.6);
        return {
          dx: Math.cos(angle) * power,
          dy: Math.sin(angle) * power * 0.7 - 40,
          spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
          color: COLORS[i % COLORS.length] ?? '#2042C4',
          w: 6 + Math.random() * 6,
          h: 9 + Math.random() * 8,
          delay: Math.random() * 0.15,
        };
      }),
    // a new pattern for every burst
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, spread, fire],
  );

  useEffect(() => {
    if (!fire || reduced) return;
    t.setValue(0);
    Animated.timing(t, {
      toValue: 1,
      duration: 1400,
      easing: Easing.linear,
      useNativeDriver: native,
    }).start();
  }, [fire, reduced, t]);

  if (!fire || reduced) return null;
  return (
    <View
      aria-hidden
      pointerEvents="none"
      style={{ position: 'absolute', left: '50%', top: '45%', width: 0, height: 0 }}
    >
      {pieces.map((p, i) => {
        const start = p.delay;
        const burst = t.interpolate({
          inputRange: [0, start, start + 0.35, 1],
          outputRange: [0, 0, 1, 1],
          extrapolate: 'clamp',
        });
        const translateX = burst.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] });
        // out with the burst, then gravity pulls them down
        const translateY = t.interpolate({
          inputRange: [0, start, start + 0.35, 1],
          outputRange: [0, 0, p.dy, p.dy + 220],
          extrapolate: 'clamp',
        });
        const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] });
        const opacity = t.interpolate({
          inputRange: [0, start, start + 0.05, 0.75, 1],
          outputRange: [0, 0, 1, 1, 0],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: p.w,
              height: p.h,
              borderRadius: 2,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateX }, { translateY }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}
