import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { BackLink } from '../../../components/ui/BackLink';
import { DocForm } from '../../../components/docs/DocForm';

export default function NewDoc() {
  const { t } = useTranslation();
  const { guide } = useLocalSearchParams<{ guide?: string }>();
  return (
    <Screen>
      <BackLink label={t('nav.docs')} fallback="/docs" />
      <AppText variant="h1">{t('mydocs.addTitle')}</AppText>
      <DocForm presetGuide={guide} />
    </Screen>
  );
}
