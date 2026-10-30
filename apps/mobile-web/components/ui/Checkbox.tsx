import { Pressable, View } from 'react-native';
import { colors } from '@dokyu/shared';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { cn } from '../../lib/cn';

/** A checkbox with a large tap area: the whole row toggles. */
export function Checkbox({
  checked,
  onChange,
  label,
  error,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  error?: string;
}) {
  return (
    <View className="gap-1">
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
        onPress={() => onChange(!checked)}
        className="min-h-[44px] flex-row items-center gap-3"
      >
        <View
          className={cn(
            'h-6 w-6 items-center justify-center border-2',
            checked ? 'border-primary bg-primary' : 'bg-surface',
          )}
          style={{
            borderRadius: 6,
            ...(checked ? {} : { borderColor: error ? colors.danger : colors.textSubtle }),
          }}
        >
          {checked ? <Icon name="check" size={16} color="#FFFFFF" strokeWidth={3} /> : null}
        </View>
        <AppText variant="body" className="flex-1">
          {label}
        </AppText>
      </Pressable>
      {error ? (
        <AppText variant="small" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
