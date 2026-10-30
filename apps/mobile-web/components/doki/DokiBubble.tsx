/**
 * Doki's speech bubble: pops in, types its text a few letters at a time, and reports while it is still typing
 * so Doki can move his mouth. Screen readers get the whole sentence at once. Tapping it shows the full text.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Platform, Pressable, View } from 'react-native';
import { colors } from '@dokyu/shared';
import { AppText } from '../ui/AppText';
import { useReducedMotion } from '../../lib/motion';

const native = Platform.OS !== 'web';

export function useTypewriter(text: string, speed = 22) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? text.length : 0);
  useEffect(() => {
    if (reduced) {
      setShown(text.length);
      return;
    }
    setShown(0);
    const timer = setInterval(() => {
      setShown((n) => {
        if (n >= text.length) {
          clearInterval(timer);
          return n;
        }
        return n + 2;
      });
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, reduced]);
  return {
    visible: text.slice(0, shown),
    typing: shown < text.length,
    finish: () => setShown(text.length),
  };
}

export function DokiBubble({
  text,
  tail = 'left',
  onTyping,
  footer,
  maxWidth = 300,
  tailAt = 28,
}: {
  text: string;
  /** Which side the little tail points to (towards Doki). */
  tail?: 'left' | 'right' | 'bottom' | 'top';
  onTyping?: (typing: boolean) => void;
  footer?: ReactNode;
  maxWidth?: number;
  /** For top and bottom tails: distance from the bubble's left edge. */
  tailAt?: number;
}) {
  const reduced = useReducedMotion();
  const { visible, typing, finish } = useTypewriter(text);
  const pop = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    onTyping?.(typing);
  }, [typing, onTyping]);

  useEffect(() => {
    if (reduced) return;
    pop.setValue(0);
    Animated.spring(pop, {
      toValue: 1,
      useNativeDriver: native,
      speed: 14,
      bounciness: 10,
    }).start();
  }, [text, pop, reduced]);

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const tailStyle = {
    left: { left: -7, top: 22 },
    right: { right: -7, top: 22 },
    top: { top: -7, left: tailAt },
    bottom: { bottom: -7, left: tailAt },
  }[tail];

  return (
    <Animated.View style={{ opacity: pop, transform: [{ scale }], maxWidth }}>
      <Pressable
        onPress={finish}
        accessibilityLabel={text}
        accessibilityLiveRegion="polite"
        className="gap-3 bg-surface p-4"
        style={{
          borderRadius: 20,
          borderWidth: 2,
          borderColor: colors.primaryTint,
          boxShadow: '0 12px 32px rgba(19,40,122,0.25)',
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: 14,
            height: 14,
            backgroundColor: colors.surface,
            borderColor: colors.primaryTint,
            borderLeftWidth: 2,
            borderBottomWidth: 2,
            transform: [
              {
                rotate: { left: '45deg', right: '225deg', top: '135deg', bottom: '-45deg' }[tail],
              },
            ],
            ...tailStyle,
          }}
        />
        <View>
          {/* the full text keeps the size steady while the visible part types over it */}
          <AppText variant="body" weight="medium" style={{ opacity: 0 }} aria-hidden>
            {text}
          </AppText>
          <AppText
            variant="body"
            weight="medium"
            style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
            aria-hidden
          >
            {visible}
          </AppText>
        </View>
        {footer}
      </Pressable>
    </Animated.View>
  );
}
