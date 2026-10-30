/**
 * Doki walks in from the left, stops beside a target and points at it. This is the base for the Phase 7 guided
 * tour (walk to a button, point, say a line). Never blocks touches; with reduce motion he just stands and points.
 */
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { Doki, type DokiPose } from './Doki';
import { useReducedMotion } from '../../lib/motion';

const native = Platform.OS !== 'web';
const SIZE = 84;

export function DokiStroll({ message = 'Tap here to see what to bring.' }: { message?: string }) {
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const [pose, setPose] = useState<DokiPose>('idle');
  const [run, setRun] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!width) return;
    const stop = Math.max(0, width - SIZE - 150);
    if (reduced) {
      x.setValue(stop);
      setPose('point');
      return;
    }
    x.setValue(-SIZE);
    setPose('walk');
    // Swap the two walking frames and bob a little with each step.
    let frame = 0;
    const steps = setInterval(() => {
      frame += 1;
      setPose(frame % 2 ? 'walk2' : 'walk');
    }, 220);
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -4, duration: 110, useNativeDriver: native }),
        Animated.timing(bob, { toValue: 0, duration: 110, useNativeDriver: native }),
      ]),
    );
    bobLoop.start();
    const walk = Animated.timing(x, {
      toValue: stop,
      duration: 2200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: native,
    });
    walk.start(({ finished }) => {
      clearInterval(steps);
      bobLoop.stop();
      bob.setValue(0);
      if (finished) setPose('point');
    });
    return () => {
      clearInterval(steps);
      walk.stop();
      bobLoop.stop();
    };
  }, [width, run, reduced, x, bob]);

  return (
    <View className="gap-2">
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={{ height: SIZE * 1.2 + 8, overflow: 'hidden' }}
        className="rounded-card bg-primary-soft"
        pointerEvents="box-none"
      >
        <View
          style={{ position: 'absolute', right: 16, top: 30, borderRadius: 999 }}
          className="bg-primary px-4 py-2"
        >
          <AppText variant="small" weight="semibold" style={{ color: '#FFFFFF' }}>
            View guide
          </AppText>
        </View>
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 0,
            transform: [{ translateX: x }, { translateY: bob }],
          }}
        >
          <Doki size={SIZE} pose={pose} alive={pose === 'point'} />
        </Animated.View>
      </View>
      <View className="flex-row items-center justify-between">
        <AppText variant="small" tone="muted" accessibilityLiveRegion="polite" className="flex-1">
          {pose === 'point' ? `Doki: ${message}` : ' '}
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => setRun((n) => n + 1)}
          className="min-h-[44px] justify-center px-3"
        >
          <AppText variant="small" weight="semibold" tone="primary">
            Replay
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
