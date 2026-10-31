import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { TextLink } from '../../components/ui/TextLink';
import { useTranslation } from 'react-i18next';
import { DEMO_EMAIL, DEMO_PASSWORD, colors, loginSchema } from '@dokyu/shared';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { AuthScreen, FormNotice } from '../../components/AuthScreen';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { useAuth } from '../../lib/auth';
import { useSettings } from '../../lib/settings';
import { checkFields, describeError, translateError } from '../../lib/errors';
import { goAfterAuth } from '../../lib/afterAuth';

export default function SignIn() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn } = useAuth();
  const { language } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const tr = (m?: string) => (m ? translateError(m, language) : undefined);

  async function submit(demo = false) {
    const creds = demo ? { email: DEMO_EMAIL, password: DEMO_PASSWORD } : { email, password };
    const local = checkFields(loginSchema, creds);
    setFields(local);
    setError('');
    if (Object.keys(local).length) return;
    setBusy(true);
    try {
      goAfterAuth(router, await signIn(creds.email, creds.password));
    } catch (e) {
      const d = describeError(e);
      setFields(d.fields);
      setError(d.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen title={t('auth.signInTitle')} intro={t('auth.signInIntro')}>
      {error ? <FormNotice tone="error">{tr(error)!}</FormNotice> : null}
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
        value={password}
        onChangeText={setPassword}
        error={tr(fields.password)}
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={() => submit()}
      />
      <TextLink align="right" onPress={() => router.push('/forgot-password')}>
        {t('auth.forgot')}
      </TextLink>
      <Button label={t('auth.signIn')} onPress={() => submit()} loading={busy} fullWidth />
      <View className="flex-row flex-wrap items-center justify-center gap-1">
        <AppText variant="small" tone="muted">
          {t('auth.noAccount')}
        </AppText>
        <TextLink onPress={() => router.replace('/sign-up')}>{t('auth.signUp')}</TextLink>
      </View>
      <Card tone="soft" className="gap-2">
        <View className="flex-row items-center gap-2">
          <Icon name="sparkle" size={18} color={colors.primary} />
          <AppText variant="body" weight="semibold" tone="primaryDark">
            {t('demo.title')}
          </AppText>
        </View>
        <AppText variant="small" tone="muted">
          {t('demo.text')}
        </AppText>
        <Button
          label={t('demo.button')}
          variant="secondary"
          size="md"
          fullWidth
          disabled={busy}
          onPress={() => submit(true)}
        />
      </Card>
      <Button
        label={t('auth.continueGuest')}
        variant="ghost"
        fullWidth
        onPress={() => router.replace('/')}
      />
    </AuthScreen>
  );
}
