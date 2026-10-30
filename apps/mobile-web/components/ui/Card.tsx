import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';
import { shadow } from '@dokyu/shared';
import { cn } from '../../lib/cn';

type Tone = 'plain' | 'soft' | 'primary' | 'gold';

const TONE: Record<Tone, string> = {
  plain: 'bg-surface border border-line',
  soft: 'bg-primary-soft',
  primary: 'bg-primary',
  gold: 'bg-gold-soft',
};

interface CardProps extends ViewProps {
  tone?: Tone;
  className?: string;
}

/** Rounded 20px card with a soft blue-tinted shadow (plan §4.2). */
export function Card({ tone = 'plain', className, style, ...rest }: CardProps) {
  return (
    <View
      className={cn('rounded-card p-4', TONE[tone], className)}
      style={[tone === 'plain' ? { boxShadow: shadow.card } : null, style]}
      {...rest}
    />
  );
}

interface PressableCardProps extends PressableProps {
  tone?: Tone;
  className?: string;
}

export function PressableCard({ tone = 'plain', className, style, ...rest }: PressableCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn('rounded-card p-4 active:opacity-80', TONE[tone], className)}
      style={(state) => [
        tone === 'plain' ? { boxShadow: shadow.card } : null,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    />
  );
}
