/**
 * The guided tour (plan §3.1 H.12): the screen dims, a gold spotlight glides to each part of the screen,
 * and Doki walks over, points at it and explains it in a speech bubble. Skip is always there.
 * With reduce motion everything still works, it just appears in place instead of moving.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { AppText } from '../ui/AppText';
import { Doki, type DokiPose } from '../ui/Doki';
import { DokiBubble } from './DokiBubble';
import { Confetti } from './Confetti';
import { useReducedMotion } from '../../lib/motion';
import { useTour, type Rect } from '../../lib/tour';
import { useSettings } from '../../lib/settings';
import { useLayout } from '../../lib/useLayout';

const native = Platform.OS !== 'web';
const PAD = 8;
const DIM = 'rgba(8, 16, 56, 0.74)';

interface Placement {
  hole: Rect;
  hasHole: boolean;
  doki: { x: number; y: number };
  facing: 'left' | 'right';
  pose: DokiPose;
  bubble:
    | { mode: 'side'; left: number; top: number; width: number; tail: 'left' | 'right' }
    | { mode: 'above'; left: number; bottom: number; width: number }
    | { mode: 'below'; left: number; top: number; width: number };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function place(rect: Rect | null, W: number, H: number, D: number, stepPose: DokiPose): Placement {
  const Dh = D * 1.2;
  const full = Math.min(340, W - 32);
  if (!rect) {
    const doki = { x: W / 2 - D / 2, y: H * 0.24 };
    return {
      hole: { x: W / 2, y: H * 0.3, width: 0, height: 0 },
      hasHole: false,
      doki,
      facing: 'right',
      pose: stepPose,
      bubble: { mode: 'below', left: (W - full) / 2, top: doki.y + Dh + 10, width: full },
    };
  }
  const hole = {
    x: rect.x - PAD,
    y: rect.y - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  };
  const cx = rect.x + rect.width / 2;
  const targetAbove = rect.y + rect.height / 2 < H * 0.55;

  if (targetAbove) {
    // Doki stands under the target and points up at it.
    const y = hole.y + hole.height + 10;
    const wide = rect.width > W * 0.6;
    let facing: 'left' | 'right' = 'right';
    let x = wide ? 16 : cx - D * 0.92;
    if (!wide && x < 8) {
      facing = 'left';
      x = cx - D * 0.08;
    }
    x = clamp(x, 8, W - D - 8);
    const rightRoom = W - (x + D) - 16;
    const leftRoom = x - 16;
    const pose: DokiPose = 'point';
    if (rightRoom >= 200)
      return {
        hole,
        hasHole: true,
        doki: { x, y },
        facing,
        pose,
        bubble: {
          mode: 'side',
          left: x + D + 4,
          top: y,
          width: Math.min(rightRoom, 320),
          tail: 'left',
        },
      };
    if (leftRoom >= 200) {
      const width = Math.min(leftRoom, 320);
      return {
        hole,
        hasHole: true,
        doki: { x, y },
        facing,
        pose,
        bubble: { mode: 'side', left: x - 4 - width, top: y, width, tail: 'right' },
      };
    }
    return {
      hole,
      hasHole: true,
      doki: { x, y },
      facing,
      pose,
      bubble: { mode: 'below', left: (W - full) / 2, top: y + Dh + 6, width: full },
    };
  }

  // Target is low on the screen (the tab bar): Doki stands above it and points down.
  const y = hole.y - Dh - 4;
  let facing: 'left' | 'right' = 'right';
  let x = cx - D * 0.92;
  if (x < 8) {
    facing = 'left';
    x = cx - D * 0.08;
  }
  x = clamp(x, 8, W - D - 8);
  return {
    hole,
    hasHole: true,
    doki: { x, y },
    facing,
    pose: 'pointDown',
    bubble: { mode: 'above', left: (W - full) / 2, bottom: H - y + 6, width: full },
  };
}

export function TourOverlay() {
  const { t } = useTranslation();
  const tour = useTour();
  const { update } = useSettings();
  const { isDesktop } = useLayout();
  const reduced = useReducedMotion();
  const { width: W, height: H } = useWindowDimensions();
  const D = isDesktop ? 110 : 92;

  const steps = tour.steps;
  const [index, setIndex] = useState(0);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [walking, setWalking] = useState(false);
  const [walkFrame, setWalkFrame] = useState(false);
  const [walkFacing, setWalkFacing] = useState<'left' | 'right'>('right');
  const [talking, setTalking] = useState(false);
  const [mouth, setMouth] = useState(false);
  const [burst, setBurst] = useState(0);

  const fade = useRef(new Animated.Value(0)).current;
  const hole = useRef({
    x: new Animated.Value(W / 2),
    y: new Animated.Value(H * 0.3),
    w: new Animated.Value(0),
    h: new Animated.Value(0),
  }).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const dokiX = useRef(new Animated.Value(-120)).current;
  const dokiY = useRef(new Animated.Value(H * 0.24)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const pos = useRef({ x: -120, y: H * 0.24 });
  const first = useRef(true);

  // Open / close.
  useEffect(() => {
    if (!steps) return;
    setIndex(0);
    first.current = true;
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: reduced ? 0 : 260,
      useNativeDriver: native,
    }).start();
  }, [steps, fade, reduced]);

  // The gold ring breathes.
  useEffect(() => {
    if (!steps || reduced) return;
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: native,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [steps, reduced, pulse]);

  // Move to each step.
  useEffect(() => {
    if (!steps) return;
    const step = steps[index];
    if (!step) return;
    let cancelled = false;
    let frames: ReturnType<typeof setInterval> | undefined;
    setPlacement((p) => (p ? { ...p } : p));
    setTalking(false);

    (async () => {
      const rect = step.target ? await tour.locate(step.target, H) : null;
      if (cancelled) return;
      const p = place(rect, W, H, D, step.pose ?? 'talk');
      const from = first.current ? { x: -D - 20, y: p.doki.y } : pos.current;
      first.current = false;
      pos.current = p.doki;

      const holeAnim = Animated.parallel([
        ...(['x', 'y', 'w', 'h'] as const).map((k) =>
          Animated.spring(hole[k], {
            toValue: { x: p.hole.x, y: p.hole.y, w: p.hole.width, h: p.hole.height }[k],
            useNativeDriver: false,
            speed: 10,
            bounciness: 4,
          }),
        ),
        Animated.timing(ringOpacity, {
          toValue: p.hasHole ? 1 : 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]);

      if (reduced) {
        (['x', 'y', 'w', 'h'] as const).forEach((k) =>
          hole[k].setValue({ x: p.hole.x, y: p.hole.y, w: p.hole.width, h: p.hole.height }[k]),
        );
        ringOpacity.setValue(p.hasHole ? 1 : 0);
        dokiX.setValue(p.doki.x);
        dokiY.setValue(p.doki.y);
        setPlacement(p);
        setTalking(true);
        if (step.confetti) setBurst((b) => b + 1);
        return;
      }

      const distance = Math.hypot(p.doki.x - from.x, p.doki.y - from.y);
      const duration = clamp(distance * 2.4, 450, 1300);
      dokiX.setValue(from.x);
      dokiY.setValue(from.y);
      setPlacement(p);
      setWalking(distance > 4);
      setWalkFacing(p.doki.x >= from.x ? 'right' : 'left');
      frames = setInterval(() => setWalkFrame((f) => !f), 170);
      const bobLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bob, { toValue: -5, duration: 85, useNativeDriver: native }),
          Animated.timing(bob, { toValue: 0, duration: 85, useNativeDriver: native }),
        ]),
      );
      bobLoop.start();
      holeAnim.start();
      Animated.parallel([
        Animated.timing(dokiX, {
          toValue: p.doki.x,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: native,
        }),
        Animated.timing(dokiY, {
          toValue: p.doki.y,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: native,
        }),
      ]).start(() => {
        if (frames) clearInterval(frames);
        bobLoop.stop();
        bob.setValue(0);
        if (cancelled) return;
        setWalking(false);
        setTalking(true);
        if (step.confetti) setBurst((b) => b + 1);
      });
    })();

    return () => {
      cancelled = true;
      if (frames) clearInterval(frames);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, index, W, H]);

  // Lip-sync while the bubble types.
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (!typing || reduced) {
      setMouth(false);
      return;
    }
    const timer = setInterval(() => setMouth((m) => !m), 120);
    return () => clearInterval(timer);
  }, [typing, reduced]);
  const onTyping = useCallback((v: boolean) => setTyping(v), []);

  const finish = useCallback(() => {
    update({ tourSeen: true });
    Animated.timing(fade, {
      toValue: 0,
      duration: reduced ? 0 : 220,
      useNativeDriver: native,
    }).start(() => {
      tour.stop();
      setPlacement(null);
      setTalking(false);
      ringOpacity.setValue(0);
    });
  }, [update, fade, reduced, tour, ringOpacity]);

  if (!steps) return null;
  const step = steps[index];
  const last = index === steps.length - 1;
  const p = placement;

  const pose: DokiPose = walking ? (walkFrame ? 'walk2' : 'walk') : (p?.pose ?? 'idle');
  const facing = walking ? walkFacing : (p?.facing ?? 'right');
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const ringFade = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] });

  const footer = (
    <View className="flex-row items-center justify-between gap-3">
      <AppText variant="caption" tone="muted">
        {t('tour.counter', { n: index + 1, total: steps.length })}
      </AppText>
      <View className="flex-row items-center gap-1">
        {!last ? (
          <Pressable
            accessibilityRole="button"
            onPress={finish}
            className="min-h-[40px] justify-center px-3"
          >
            <AppText variant="small" weight="semibold" tone="muted">
              {t('tour.skip')}
            </AppText>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => (last ? finish() : setIndex((i) => i + 1))}
          className="min-h-[40px] justify-center bg-primary px-5 active:opacity-90"
          style={{ borderRadius: 999 }}
        >
          <AppText variant="small" weight="bold" tone="inverse">
            {last ? t('tour.finish') : t('tour.next')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Animated.View
      accessibilityViewIsModal
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        opacity: fade,
      }}
      onStartShouldSetResponder={() => true}
    >
      {/* dim everything except the spotlight */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: hole.y,
          backgroundColor: DIM,
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: Animated.add(hole.y, hole.h),
          bottom: 0,
          backgroundColor: DIM,
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: hole.y,
          height: hole.h,
          width: hole.x,
          backgroundColor: DIM,
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          left: Animated.add(hole.x, hole.w),
          right: 0,
          top: hole.y,
          height: hole.h,
          backgroundColor: DIM,
        }}
      />

      {/* gold spotlight ring */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: hole.x,
          top: hole.y,
          width: hole.w,
          height: hole.h,
          opacity: ringOpacity,
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            borderRadius: 20,
            borderWidth: 3,
            borderColor: colors.goldBright,
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            borderRadius: 22,
            borderWidth: 3,
            borderColor: colors.goldBright,
            opacity: ringFade,
            transform: [{ scale: ringScale }],
          }}
        />
      </Animated.View>

      {/* Doki */}
      {p ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: [{ translateX: dokiX }, { translateY: dokiY }],
          }}
        >
          <Animated.View style={{ transform: [{ translateY: bob }] }}>
            <Doki
              size={D}
              pose={pose}
              facing={facing}
              mouthOpen={mouth}
              label={t('tour.dokiLabel')}
            />
          </Animated.View>
        </Animated.View>
      ) : null}

      {/* speech bubble */}
      {p && talking && step ? (
        <View
          style={{
            position: 'absolute',
            left: p.bubble.left,
            width: p.bubble.width,
            ...('top' in p.bubble ? { top: p.bubble.top } : { bottom: p.bubble.bottom }),
            alignItems:
              p.bubble.mode === 'side' && p.bubble.tail === 'right' ? 'flex-end' : 'flex-start',
          }}
        >
          <DokiBubble
            key={index}
            text={t(step.text)}
            tail={
              p.bubble.mode === 'side'
                ? p.bubble.tail
                : p.bubble.mode === 'above'
                  ? 'bottom'
                  : 'top'
            }
            onTyping={onTyping}
            footer={footer}
            maxWidth={p.bubble.width}
            tailAt={clamp(p.doki.x + D / 2 - p.bubble.left - 7, 20, p.bubble.width - 34)}
          />
        </View>
      ) : null}

      <Confetti fire={burst} />
    </Animated.View>
  );
}
