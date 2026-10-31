import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Link } from 'expo-router';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { BackLink } from '../../../components/ui/BackLink';
import { DocForm } from '../../../components/docs/DocForm';
import { docTitle } from '../../../components/docs/DocCard';
import { useMyDocs } from '../../../lib/mydocs';
import { useSettings } from '../../../lib/settings';
import { NotFound } from '../../../components/NotFound';

export default function EditDoc() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { docs, ready } = useMyDocs();
  const doc = docs.find((d) => d.id === id);
  if (!ready) return <Screen>{null}</Screen>;
  if (!doc) {
    return <NotFound title={t('mydocs.notFound')} back="/docs" backLabel={t('nav.docs')} />;
  }
  return (
    <Screen>
      <BackLink label={t('nav.docs')} fallback="/docs" />
      <AppText variant="h1">{docTitle(doc, language)}</AppText>
      {doc.guide ? (
        <Link href={{ pathname: '/guides/[slug]', params: { slug: doc.guide } }} asChild>
          <Button label={t('mydocs.openGuide')} variant="secondary" size="md" />
        </Link>
      ) : null}
      <DocForm key={doc.id} existing={doc} />
    </Screen>
  );
}
