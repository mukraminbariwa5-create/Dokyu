import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { AuthScreen, FormNotice } from '../../components/AuthScreen';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../lib/api';

/** Opened from the confirmation email. Confirms once, then offers a way back into the app. */
export default function VerifyEmail() {
  const { t } = useTranslation();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [state, setState] = useState<'working' | 'done' | 'failed'>(token ? 'working' : 'failed');
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true; // the link works only once, so never send it twice
    authApi
      .verifyEmail(token)
      .then(() => setState('done'))
      .catch(() => setState('failed'));
  }, [token]);

  return (
    <AuthScreen title={t('auth.verifyTitle')}>
      {state === 'working' ? <ActivityIndicator color={colors.primary} size="large" /> : null}
      {state === 'done' ? <FormNotice tone="success">{t('auth.verifyDone')}</FormNotice> : null}
      {state === 'failed' ? (
        <FormNotice tone="error">
          {token ? t('auth.verifyFailed') : t('auth.missingToken')}
        </FormNotice>
      ) : null}
      {state !== 'working' ? (
        <Button label={t('auth.goHome')} fullWidth onPress={() => router.replace('/')} />
      ) : null}
    </AuthScreen>
  );
}
