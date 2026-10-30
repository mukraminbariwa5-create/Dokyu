import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GOALS, colors } from '@dokyu/shared';
import { Screen, Section } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Doki } from '../../components/ui/Doki';
import { Icon } from '../../components/ui/Icon';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { DisplaySettings } from '../../components/DisplaySettings';
import { useAuth } from '../../lib/auth';
import { api, authApi } from '../../lib/api';
import { useSettings } from '../../lib/settings';
import { formatDate } from '../../lib/format';

interface Session {
  id: string;
  device: string;
  signedInAt: string;
  current: boolean;
}

export default function Account() {
  const { t } = useTranslation();
  const router = useRouter();
  const { status, user, signOut } = useAuth();
  const settings = useSettings();

  const goalNames = settings.goals
    .map((slug) => GOALS.find((g) => g.slug === slug))
    .filter((g) => g !== undefined)
    .map((g) => (settings.language === 'tl' ? g.tl : g.en));
  const area = [settings.municipality, settings.province].filter(Boolean).join(', ');

  return (
    <Screen>
      <AppText variant="h1">{t('nav.account')}</AppText>

      {status === 'loading' ? <ActivityIndicator color={colors.primary} /> : null}

      {status === 'signedOut' ? (
        <Card tone="soft" className="flex-row items-center gap-4 p-5">
          <Doki size={88} />
          <View className="flex-1 gap-3">
            <View className="gap-1">
              <AppText variant="title" tone="primaryDark">
                {t('account.guestTitle')}
              </AppText>
              <AppText variant="small" tone="muted">
                {t('account.guestText')}
              </AppText>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <Button label={t('auth.signUp')} size="md" onPress={() => router.push('/sign-up')} />
              <Button
                label={t('auth.signIn')}
                size="md"
                variant="secondary"
                onPress={() => router.push('/sign-in')}
              />
            </View>
          </View>
        </Card>
      ) : null}

      {status === 'signedIn' && user ? (
        <>
          <Card className="gap-1 p-5">
            <View className="flex-row flex-wrap items-center gap-2">
              <AppText variant="title">{user.fullName}</AppText>
              {user.role === 'SUPER_ADMIN' ? (
                <Badge tone="inProgress" label={t('account.admin')} />
              ) : null}
            </View>
            <AppText variant="body" tone="muted">
              {user.email}
            </AppText>
          </Card>
          {!user.emailVerified ? <VerifyBanner email={user.email} /> : null}
        </>
      ) : null}

      <Card className="gap-3">
        <Row icon="pin" label={t('account.area')} value={area || t('account.notSet')} />
        <Row
          icon="check"
          label={t('account.goals')}
          value={goalNames.join(', ') || t('account.notSet')}
        />
        <Button
          label={t('account.editSetup')}
          variant="ghost"
          size="md"
          onPress={() => router.push('/setup')}
        />
      </Card>

      <DisplaySettings />

      {status === 'signedIn' ? <Devices /> : null}

      {status === 'signedIn' ? (
        <Button
          label={t('auth.signOut')}
          variant="secondary"
          icon={<Icon name="logout" size={18} color={colors.primaryDark} />}
          onPress={() => signOut()}
        />
      ) : null}
      <Disclaimer />
    </Screen>
  );
}

function Row({ icon, label, value }: { icon: 'pin' | 'check'; label: string; value: string }) {
  return (
    <View className="flex-row items-start gap-3">
      <Icon name={icon} size={20} color={colors.primary} />
      <View className="flex-1">
        <AppText variant="small" tone="muted">
          {label}
        </AppText>
        <AppText variant="body" weight="medium">
          {value}
        </AppText>
      </View>
    </View>
  );
}

function VerifyBanner({ email }: { email: string }) {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  return (
    <View className="gap-2 rounded-lg bg-gold-soft p-4" accessibilityRole="alert">
      <View className="flex-row gap-2">
        <Icon name="mail" size={20} color="#8A6400" />
        <AppText variant="small" className="flex-1" style={{ color: '#5C4300' }}>
          {sent ? t('account.resent') : t('account.unverified', { email })}
        </AppText>
      </View>
      {!sent ? (
        <Button
          label={t('account.resend')}
          variant="ghost"
          size="md"
          onPress={() =>
            authApi
              .resendVerification()
              .then(() => setSent(true))
              .catch(() => setSent(true))
          }
        />
      ) : null}
    </View>
  );
}

/** Where this account is signed in, with a way to sign out other devices. */
function Devices() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const [sessions, setSessions] = useState<Session[] | null>(null);

  const load = useCallback(() => {
    api<{ data: Session[] }>('/me/sessions')
      .then((r) => setSessions(r.data))
      .catch(() => setSessions([]));
  }, []);
  useEffect(load, [load]);

  return (
    <Section>
      <AppText variant="title">{t('account.devices')}</AppText>
      {sessions === null ? <ActivityIndicator color={colors.primary} /> : null}
      {sessions?.map((s) => (
        <Card key={s.id} className="flex-row items-center gap-3">
          <View className="flex-1">
            <AppText variant="body" weight="medium">
              {s.device}
            </AppText>
            <AppText variant="small" tone="muted">
              {s.current
                ? t('account.thisDevice')
                : t('account.since', { date: formatDate(s.signedInAt.slice(0, 10), language) })}
            </AppText>
          </View>
          {!s.current ? (
            <Button
              label={t('account.signOutDevice')}
              variant="ghost"
              size="md"
              onPress={() =>
                api(`/me/sessions/${s.id}`, { method: 'DELETE' }).then(load).catch(load)
              }
            />
          ) : (
            <Badge tone="done" label={t('account.thisDevice')} />
          )}
        </Card>
      ))}
    </Section>
  );
}
