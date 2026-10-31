import { useState } from 'react';
import { Pressable, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { formatDate } from '../../lib/format';
import { useSettings } from '../../lib/settings';

const pad = (n: number) => String(n).padStart(2, '0');

/** Android: tap to open the system date or time picker. Value is "YYYY-MM-DD" or "HH:MM". */
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
  const { t } = useTranslation();
  const { language } = useSettings();
  const [open, setOpen] = useState(false);
  const current = value
    ? mode === 'date'
      ? new Date(`${value}T00:00:00`)
      : new Date(`2000-01-01T${value}:00`)
    : new Date();
  const shown = value
    ? mode === 'date'
      ? formatDate(value, language)
      : value
    : t('common.notSet');
  return (
    <View
      className="gap-1.5"
      style={{ flexGrow: 1, flexBasis: 160, minWidth: 0, maxWidth: '100%' }}
    >
      <AppText variant="small" weight="medium">
        {label}
      </AppText>
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${shown}`}
          onPress={() => setOpen(true)}
          className="flex-1 flex-row items-center gap-2 rounded-lg border border-line bg-surface px-3"
          style={{ minHeight: 52 }}
        >
          <Icon name={mode === 'date' ? 'calendar' : 'clock'} size={18} color={colors.primary} />
          <AppText variant="body" tone={value ? 'default' : 'subtle'}>
            {shown}
          </AppText>
        </Pressable>
        {value ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.clear')}
            onPress={() => onChange(undefined)}
            className="h-11 w-11 items-center justify-center"
          >
            <Icon name="x" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {open ? (
        <DateTimePicker
          value={current}
          mode={mode}
          onChange={(event, picked) => {
            setOpen(false);
            if (event.type !== 'set' || !picked) return;
            onChange(
              mode === 'date'
                ? `${picked.getFullYear()}-${pad(picked.getMonth() + 1)}-${pad(picked.getDate())}`
                : `${pad(picked.getHours())}:${pad(picked.getMinutes())}`,
            );
          }}
        />
      ) : null}
    </View>
  );
}
