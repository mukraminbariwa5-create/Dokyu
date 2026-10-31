import { createElement, useId } from 'react';
import { View } from 'react-native';
import { colors } from '@dokyu/shared';
import { AppText } from './AppText';
import { Icon } from './Icon';

/** Web: the browser's own date/time picker, styled like the other inputs. Value is "YYYY-MM-DD" or "HH:MM". */
export function DateField({
  label,
  value,
  onChange,
  mode = 'date',
}: {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  mode?: 'date' | 'time';
}) {
  const id = useId();
  return (
    <View className="gap-1.5" style={{ flexGrow: 1, minWidth: 150 }}>
      <AppText variant="small" weight="medium" nativeID={`${id}-label`}>
        {label}
      </AppText>
      <View
        className="flex-row items-center gap-2 rounded-lg border border-line bg-surface px-3"
        style={{ minHeight: 52 }}
      >
        <Icon name={mode === 'date' ? 'calendar' : 'clock'} size={18} color={colors.primary} />
        {createElement('input', {
          type: mode,
          value: value ?? '',
          'aria-labelledby': `${id}-label`,
          onChange: (e: { target: { value: string } }) => onChange(e.target.value || undefined),
          style: {
            flex: 1,
            border: 0,
            outline: 'none',
            background: 'transparent',
            fontFamily: 'Poppins_400Regular, system-ui, sans-serif',
            fontSize: 16,
            color: colors.text,
            minHeight: 48,
          },
        })}
      </View>
    </View>
  );
}
