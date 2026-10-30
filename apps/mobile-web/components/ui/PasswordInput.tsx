import { useState } from 'react';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { Input, type InputProps } from './Input';
import { Icon } from './Icon';

/** Password field with a show/hide button, so people can check what they typed. */
export function PasswordInput(props: Omit<InputProps, 'secureTextEntry' | 'accessory'>) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  return (
    <Input
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      secureTextEntry={!visible}
      accessory={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? t('auth.hidePassword') : t('auth.showPassword')}
          onPress={() => setVisible((v) => !v)}
          className="h-11 w-11 items-center justify-center rounded-md active:bg-surface-alt"
        >
          <Icon name={visible ? 'eyeOff' : 'eye'} size={22} color={colors.textMuted} />
        </Pressable>
      }
    />
  );
}
