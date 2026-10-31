import { ActivityIndicator, Animated, Pressable, View, type PressableProps } from 'react-native';
import type { ReactNode } from 'react';
import { colors } from '@dokyu/shared';
import { AppText } from './AppText';
import { cn } from '../../lib/cn';
import { usePressScale } from '../../lib/motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const BOX: Record<Variant, string> = {
  primary: 'bg-primary active:bg-primary-dark',
  secondary: 'bg-primary-soft border border-primary-tint active:bg-primary-tint',
  ghost: 'bg-transparent active:bg-surface-alt',
  danger: 'bg-danger active:opacity-90',
};
const TEXT: Record<Variant, 'inverse' | 'primary' | 'primaryDark'> = {
  primary: 'inverse',
  secondary: 'primaryDark',
  ghost: 'primary',
  danger: 'inverse',
};

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  size?: 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

/** Big, clear tap targets (min 44px, 52px by default) for seniors (plan §3.1 H.3). */
export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled,
  icon,
  fullWidth,
  className,
  ...rest
}: ButtonProps) {
  const inactive = disabled || loading;
  const press = usePressScale();
  return (
    <Animated.View style={[press.style, { alignSelf: fullWidth ? 'stretch' : 'flex-start' }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!inactive, busy: loading }}
        aria-disabled={!!inactive}
        aria-busy={loading}
        disabled={inactive}
        {...press.handlers}
        className={cn(
          'flex-row items-center justify-center gap-2 rounded-lg px-5',
          size === 'lg' ? 'min-h-[52px]' : 'min-h-[44px]',
          BOX[variant],
          inactive && 'opacity-50',
          className,
        )}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.primary}
          />
        ) : (
          icon && <View>{icon}</View>
        )}
        <AppText variant={size === 'lg' ? 'bodyLg' : 'body'} weight="semibold" tone={TEXT[variant]}>
          {label}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}
