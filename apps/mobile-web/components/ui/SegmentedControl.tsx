import { Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { cn } from '../../lib/cn';

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      className="flex-row gap-1 self-start rounded-lg bg-surface-alt p-1"
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            aria-checked={selected}
            onPress={() => onChange(o.value)}
            className={cn(
              'min-h-[44px] justify-center rounded-md px-4',
              selected ? 'bg-surface' : 'active:bg-line',
            )}
            style={selected ? { boxShadow: '0 1px 4px rgba(15, 23, 42, 0.12)' } : null}
          >
            <AppText
              variant="body"
              weight={selected ? 'semibold' : 'medium'}
              tone={selected ? 'primary' : 'muted'}
            >
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
