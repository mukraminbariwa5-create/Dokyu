import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { TextLink } from '../../components/ui/TextLink';
import { useTranslation } from 'react-i18next';
import { signupSchema } from '@dokyu/shared';
import { AuthScreen, FormNotice } from '../../components/AuthScreen';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Checkbox } from '../../components/ui/Checkbox';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { useAuth } from '../../lib/auth';
import { useSettings } from '../../lib/settings';
import { checkFields, describeError, translateError } from '../../lib/errors';
import { goAfterAuth } from '../../lib/afterAuth';

export default function SignUp() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signUp } = useAuth();
  const { language } = useSettings();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const tr = (m?: string) => (m ? translateError(m, language) : undefined);

  async function submit() {
    const values = { fullName, email, password, consent, language };
    const local = checkFields(signupSchema, values);
    setFields(local);
    setError('');
    if (Object.keys(local).length) return;
    setBusy(true);
    try {
      goAfterAuth(router, await signUp({ fullName, email, password, consent }));
    } catch (e) {
      const d = describeError(e);
      setFields(d.fields);
      setError(d.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen title={t('auth.signUpTitle')} intro={t('auth.signUpIntro')}>
      {error ? <FormNotice tone="error">{tr(error)!}</FormNotice> : null}
      <Input
        label={t('auth.fullName')}
        hint={t('auth.fullNameHint')}
        value={fullName}
        onChangeText={setFullName}
        error={tr(fields.fullName)}
        autoComplete="name"
        textContentType="name"
      />
      <Input
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        error={tr(fields.email)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <PasswordInput
        label={t('auth.password')}
        hint={t('auth.passwordHint')}
        value={password}
        onChangeText={setPassword}
        error={tr(fields.password)}
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Card tone="soft" className="gap-2">
        <AppText variant="small" weight="semibold" tone="primaryDark">
          {t('auth.privacyTitle')}
        </AppText>
        <AppText variant="small" tone="muted">
          {t('auth.privacyText')}
        </AppText>
      </Card>
      <Checkbox
        checked={consent}
        onChange={setConsent}
        label={t('auth.consentLabel')}
        error={tr(fields.consent)}
      />
      <Button label={t('auth.signUp')} onPress={submit} loading={busy} fullWidth />
      <View className="flex-row flex-wrap items-center justify-center gap-1">
        <AppText variant="small" tone="muted">
          {t('auth.haveAccount')}
        </AppText>
        <TextLink onPress={() => router.replace('/sign-in')}>{t('auth.signIn')}</TextLink>
      </View>
    </AuthScreen>
  );
}
