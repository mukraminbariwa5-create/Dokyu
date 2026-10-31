/** Account page sections: help and legal pages, and the user's data (download, delete). */
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Icon, type IconName } from '../ui/Icon';
import { PasswordInput } from '../ui/PasswordInput';
import { useAuth } from '../../lib/auth';
import { authApi } from '../../lib/api';
import { clearLocalData, readLocalData, saveJson } from '../../lib/myData';
import { useMyDocs } from '../../lib/mydocs';
import { useSettings } from '../../lib/settings';
import { describeError, translateError } from '../../lib/errors';

const LINKS: Array<{ page: string; icon: IconName }> = [
  { page: 'about', icon: 'info' },
  { page: 'help', icon: 'help' },
  { page: 'privacy', icon: 'shield' },
  { page: 'terms', icon: 'guides' },
];

/** One row of a grouped settings list. */
export function ListRow({
  icon,
  label,
  hint,
  onPress,
  first,
}: {
  icon: IconName;
  label: string;
  hint?: string;
  onPress: () => void;
  first?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={onPress}
      className={`min-h-[56px] flex-row items-center gap-3 px-4 py-3 active:bg-surface-alt ${first ? '' : 'border-t border-line'}`}
    >
      <View
        className="items-center justify-center bg-primary-soft"
        style={{ width: 36, height: 36, borderRadius: 10 }}
      >
        <Icon name={icon} size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <AppText variant="body" weight="medium">
          {label}
        </AppText>
        {hint ? (
          <AppText variant="caption" tone="muted">
            {hint}
          </AppText>
        ) : null}
      </View>
      <Icon name="chevronRight" size={20} color={colors.textSubtle} />
    </Pressable>
  );
}

/** Help and info: Doki's tour, then the about, help and legal pages, as one grouped list. */
export function InfoLinks({ onReplayTour }: { onReplayTour?: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <View className="gap-2">
      <AppText variant="title">{t('about.section')}</AppText>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {onReplayTour ? (
          <ListRow
            first
            icon="sparkle"
            label={t('tour.replay')}
            hint={t('tour.replayHint')}
            onPress={onReplayTour}
          />
        ) : null}
        {LINKS.map((l, i) => (
          <ListRow
            key={l.page}
            first={!onReplayTour && i === 0}
            icon={l.icon}
            label={t(`about.tab_${l.page}`)}
            onPress={() => router.push({ pathname: '/about', params: { page: l.page } })}
          />
        ))}
      </Card>
    </View>
  );
}

export function DataSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const { status, deleteAccount } = useAuth();
  const { language, update } = useSettings();
  const { clearAll } = useMyDocs();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [askClear, setAskClear] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const download = async () => {
    setBusy(true);
    setNote('');
    try {
      const device = await readLocalData();
      let account: unknown = null;
      if (status === 'signedIn') account = await authApi.exportMyData().catch(() => null);
      await saveJson(`dokyu-my-data-${new Date().toISOString().slice(0, 10)}.json`, {
        exportedAt: new Date().toISOString(),
        note: 'Everything Dokyu keeps about you: on this device, and in your account if you are signed in.',
        onThisDevice: device,
        account,
      });
      setNote(t('data.downloaded'));
    } catch {
      setNote(t('data.downloadFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="gap-2">
      <AppText variant="title">{t('data.title')}</AppText>
      <Card className="gap-3">
        <AppText variant="small" tone="muted">
          {t('data.intro')}
        </AppText>
        <Button
          label={t('data.download')}
          variant="secondary"
          size="md"
          fullWidth
          loading={busy}
          icon={<Icon name="download" size={18} color={colors.primaryDark} />}
          onPress={download}
        />
        <Button
          label={t('data.clearDevice')}
          variant="dangerGhost"
          size="md"
          fullWidth
          icon={<Icon name="trash" size={18} color={colors.danger} />}
          onPress={() => setAskClear(true)}
        />
        {status === 'signedIn' ? (
          <Button
            label={t('data.deleteAccount')}
            variant="dangerGhost"
            size="md"
            fullWidth
            icon={<Icon name="trash" size={18} color={colors.danger} />}
            onPress={() => setAskDelete(true)}
          />
        ) : null}
        {note ? (
          <AppText variant="small" tone="success" accessibilityLiveRegion="polite">
            {note}
          </AppText>
        ) : null}
      </Card>

      <ConfirmDialog
        visible={askClear}
        title={t('data.clearTitle')}
        message={t('data.clearText')}
        confirmLabel={t('data.clearConfirm')}
        cancelLabel={t('common.cancel')}
        danger
        onCancel={() => setAskClear(false)}
        onConfirm={async () => {
          clearAll();
          await clearLocalData();
          update({
            introSeen: false,
            setupDone: false,
            tourSeen: false,
            province: null,
            municipality: null,
            goals: [],
          });
          setAskClear(false);
          router.replace('/welcome');
        }}
      />

      <ConfirmDialog
        visible={askDelete}
        title={t('data.deleteTitle')}
        message={t('data.deleteText')}
        confirmLabel={t('data.deleteConfirm')}
        cancelLabel={t('common.cancel')}
        danger
        loading={deleting}
        onCancel={() => {
          setAskDelete(false);
          setPassword('');
          setDeleteError('');
        }}
        onConfirm={async () => {
          if (!password) {
            setDeleteError(t('data.needPassword'));
            return;
          }
          setDeleting(true);
          try {
            await deleteAccount(password);
            setAskDelete(false);
            setPassword('');
            setNote(t('data.deleted'));
          } catch (e) {
            setDeleteError(translateError(describeError(e).message, language));
          } finally {
            setDeleting(false);
          }
        }}
      >
        <PasswordInput
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          error={deleteError || undefined}
        />
      </ConfirmDialog>
    </View>
  );
}
