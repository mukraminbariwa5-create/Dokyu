import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { passwordSchema } from '@dokyu/shared';
import { z } from 'zod';
import { AuthScreen, FormNotice } from '../../components/AuthScreen';
import { Button } from '../../components/ui/Button';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { authApi } from '../../lib/api';
import { useSettings } from '../../lib/settings';
import { checkFields, describeError, translateError } from '../../lib/errors';

export default function ResetPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useSettings();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const tr = (m?: string) => (m ? translateError(m, language) : undefined);

  async function submit() {
    const local = checkFields(z.object({ password: passwordSchema }), { password });
    setFields(local);
    setError('');
    if (Object.keys(local).length || !token) return;
    setBusy(true);
    try {
      await authApi.reset(token, password);
      setDone(true);
    } catch (e) {
      const d = describeError(e);
      setFields(d.fields);
      setError(d.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen title={t('auth.resetTitle')}>
      {!token ? <FormNotice tone="error">{t('auth.missingToken')}</FormNotice> : null}
      {error ? <FormNotice tone="error">{tr(error)!}</FormNotice> : null}
      {done ? (
        <>
          <FormNotice tone="success">{t('auth.resetDone')}</FormNotice>
          <Button label={t('auth.signIn')} fullWidth onPress={() => router.replace('/sign-in')} />
        </>
      ) : (
        <>
          <PasswordInput
            label={t('auth.newPassword')}
            hint={t('auth.passwordHint')}
            value={password}
            onChangeText={setPassword}
            error={tr(fields.password)}
            autoComplete="new-password"
            onSubmitEditing={submit}
          />
          <Button
            label={t('auth.savePassword')}
            onPress={submit}
            loading={busy}
            disabled={!token}
            fullWidth
          />
        </>
      )}
    </AuthScreen>
  );
}
