import { Text, type TextProps } from 'react-native';
import type { TextVariant } from '@dokyu/shared';
import { useSettings } from '../../lib/settings';
import { cn } from '../../lib/cn';

const WEIGHT = {
  regular: 'font-poppins',
  medium: 'font-poppins-medium',
  semibold: 'font-poppins-semibold',
  bold: 'font-poppins-bold',
} as const;

const TONE = {
  default: 'text-ink',
  muted: 'text-ink-muted',
  subtle: 'text-ink-subtle',
  primary: 'text-primary',
  primaryDark: 'text-primary-dark',
  inverse: 'text-white',
  danger: 'text-danger',
  success: 'text-success',
} as const;

const DEFAULT_WEIGHT: Record<TextVariant, keyof typeof WEIGHT> = {
  caption: 'regular',
  small: 'regular',
  body: 'regular',
  bodyLg: 'regular',
  title: 'semibold',
  h2: 'semibold',
  h1: 'bold',
  display: 'bold',
};

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  weight?: keyof typeof WEIGHT;
  tone?: keyof typeof TONE;
  className?: string;
}

/**
 * All text in Dokyu goes through this component so large-text mode (20px body) applies everywhere.
 * Headings get the header role for screen readers.
 */
export function AppText({
  variant = 'body',
  weight,
  tone = 'default',
  className,
  style,
  ...rest
}: AppTextProps) {
  const { textSize } = useSettings();
  const size = textSize(variant);
  const isHeading = variant === 'h1' || variant === 'h2' || variant === 'display';
  return (
    <Text
      accessibilityRole={isHeading ? 'header' : rest.accessibilityRole}
      className={cn(WEIGHT[weight ?? DEFAULT_WEIGHT[variant]], TONE[tone], className)}
      style={[{ fontSize: size, lineHeight: Math.round(size * 1.45) }, style]}
      {...rest}
    />
  );
}
