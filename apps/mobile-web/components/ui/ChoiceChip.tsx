import { Pressable } from 'react-native';
import { colors } from '@dokyu/shared';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { cn } from '../../lib/cn';

/** A selectable option for "pick any that apply" lists (onboarding goals). */
export function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      onPress={onPress}
      className={cn(
        'min-h-[52px] flex-row items-center gap-2 rounded-lg border px-4',
        selected
          ? 'border-primary bg-primary-soft'
          : 'border-line bg-surface active:bg-surface-alt',
      )}
    >
      {selected ? <Icon name="check" size={18} color={colors.primary} strokeWidth={2.4} /> : null}
      <AppText
        variant="body"
        weight={selected ? 'semibold' : 'medium'}
        tone={selected ? 'primaryDark' : 'default'}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
