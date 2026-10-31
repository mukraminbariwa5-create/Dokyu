import { Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { AppText } from './ui/AppText';
import { Card } from './ui/Card';
import { SegmentedControl } from './ui/SegmentedControl';
import { LANGUAGES } from '../lib/i18n';
import { useSettings } from '../lib/settings';
import { useAuth } from '../lib/auth';

/** Language and large-text switches. Lives on Account and on the showcase screen. */
export function DisplaySettings() {
  const { t } = useTranslation();
  const { language, setLanguage, largeText, setLargeText } = useSettings();
  const { updateProfile } = useAuth();
  // Signed-in users keep these on their profile too, so a new phone starts the same way.
  const changeLanguage = (l: typeof language) => {
    setLanguage(l);
    updateProfile({ language: l }).catch(() => {});
  };
  const changeLargeText = (on: boolean) => {
    setLargeText(on);
    updateProfile({ textSize: on ? 'large' : 'normal' }).catch(() => {});
  };
  return (
    <View className="gap-2">
      <AppText variant="title">{t('settings.title')}</AppText>
      <Card className="gap-4">
        <View className="gap-2">
          <AppText variant="small" weight="medium" tone="muted">
            {t('settings.language')}
          </AppText>
          <SegmentedControl
            label={t('settings.language')}
            value={language}
            onChange={changeLanguage}
            options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
          />
        </View>
        <View className="flex-row items-center gap-4">
          <View className="flex-1">
            <AppText variant="body" weight="medium">
              {t('settings.largeText')}
            </AppText>
            <AppText variant="small" tone="muted">
              {t('settings.largeTextHint')}
            </AppText>
          </View>
          <Switch
            accessibilityLabel={t('settings.largeText')}
            value={largeText}
            onValueChange={changeLargeText}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
            {...({ activeThumbColor: '#FFFFFF' } as object)}
          />
        </View>
      </Card>
    </View>
  );
}
