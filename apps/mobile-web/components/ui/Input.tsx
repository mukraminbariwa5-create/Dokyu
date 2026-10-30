import { useId, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '@dokyu/shared';
import { AppText } from './AppText';
import { useSettings } from '../../lib/settings';
import { cn } from '../../lib/cn';

export interface InputProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
}

/** Labelled text field. The label, hint and error are read out by screen readers. */
export function Input({ label, hint, error, className, onFocus, onBlur, ...rest }: InputProps) {
  const { textSize } = useSettings();
  const [focused, setFocused] = useState(false);
  const id = useId();
  const describedBy = error ?? hint;
  return (
    <View className={cn('gap-1.5', className)}>
      <AppText variant="small" weight="medium" nativeID={`${id}-label`}>
        {label}
      </AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityLabelledBy={`${id}-label`}
        accessibilityHint={describedBy}
        aria-invalid={!!error}
        placeholderTextColor={colors.textSubtle}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          'min-h-[52px] rounded-lg border bg-surface px-4 font-poppins text-ink',
          error ? 'border-danger' : focused ? 'border-primary' : 'border-line',
        )}
        style={[
          { fontSize: textSize('bodyLg') },
          focused && !error ? { boxShadow: `0 0 0 3px ${colors.primaryTint}` } : null,
        ]}
        {...rest}
      />
      {error ? (
        <AppText variant="small" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="small" tone="muted">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}
