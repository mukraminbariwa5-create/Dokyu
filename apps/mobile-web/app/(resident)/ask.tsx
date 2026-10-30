import { useTranslation } from 'react-i18next';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Disclaimer } from '../../components/ui/Disclaimer';

export default function Placeholder() {
  const { t } = useTranslation();
  return (
    <Screen>
      <AppText variant="h1">{t('nav.ask')}</AppText>
      <AppText variant="body">{t('common.comingInPhase', { phase: 6 })}</AppText>
      <Disclaimer />
    </Screen>
  );
}
