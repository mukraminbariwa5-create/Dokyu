import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { forgotPasswordSchema } from '@dokyu/shared';
import { AuthScreen, FormNotice } from '../../components/AuthScreen';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../lib/api';
import { useSettings } from '../../lib/settings';
import { checkFields, describeError, translateError } from '../../lib/errors';
import { useServerFeatures } from '../../lib/serverFeatures';
import { CONTACT_EMAIL } from '../../lib/legal';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useSettings();
  const [email, setEmail] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const tr = (m?: string) => (m ? translateError(m, language) : undefined);
  const { email: emailOn } = useServerFeatures();

  async function submit() {
    const local = checkFields(forgotPasswordSchema, { email });
    setFields(local);
    setError('');
    if (Object.keys(local).length) return;
    setBusy(true);
    try {
      await authApi.forgot(email);
      setSent(true);
    } catch (e) {
      const d = describeError(e);
      setFields(d.fields);
      setError(d.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen title={t('auth.forgotTitle')} intro={t('auth.forgotIntro')}>
      {error ? <FormNotice tone="error">{tr(error)!}</FormNotice> : null}
      {!emailOn ? (
        <FormNotice tone="error">{t('auth.noEmail', { email: CONTACT_EMAIL })}</FormNotice>
      ) : sent ? (
        <>
          <FormNotice tone="success">{t('auth.linkSent')}</FormNotice>
          <Button
            label={t('auth.backToSignIn')}
            variant="secondary"
            fullWidth
            onPress={() => router.replace('/sign-in')}
          />
        </>
      ) : (
        <>
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            error={tr(fields.email)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            onSubmitEditing={submit}
          />
          <Button label={t('auth.sendLink')} onPress={submit} loading={busy} fullWidth />
        </>
      )}
    </AuthScreen>
  );
}
