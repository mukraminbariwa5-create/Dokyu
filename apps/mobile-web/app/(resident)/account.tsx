import { useTranslation } from 'react-i18next';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { DisplaySettings } from '../../components/DisplaySettings';

export default function Account() {
  const { t } = useTranslation();
  return (
    <Screen>
      <AppText variant="h1">{t('nav.account')}</AppText>
      <DisplaySettings />
      <AppText variant="body" tone="muted">
        {t('common.comingInPhase', { phase: 2 })}
      </AppText>
      <Disclaimer />
    </Screen>
  );
}
