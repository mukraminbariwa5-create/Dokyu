import { View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from './ui/Screen';
import { AppText } from './ui/AppText';
import { Button } from './ui/Button';
import { Doki } from './ui/Doki';
import { BackLink } from './ui/BackLink';
import { Float } from '../lib/motion';

/** Friendly "not found" page with Doki and a way out. */
export function NotFound({
  title,
  back,
  backLabel,
}: {
  title?: string;
  back?: Href;
  backLabel?: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Screen>
      {back && backLabel ? <BackLink label={backLabel} fallback={back} /> : null}
      <View className="items-center gap-4 py-8">
        <Float amount={4}>
          <Doki size={130} pose="worried" label="" />
        </Float>
        <AppText variant="h2" style={{ textAlign: 'center' }}>
          {title ?? t('notFound.title')}
        </AppText>
        <AppText variant="body" tone="muted" style={{ textAlign: 'center' }}>
          {t('notFound.text')}
        </AppText>
        <Button label={t('notFound.home')} onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
