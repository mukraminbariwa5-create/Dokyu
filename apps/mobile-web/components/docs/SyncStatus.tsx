/** One line under the My Docs title: where the list is saved, and whether it is synced. */
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { AppText } from '../ui/AppText';
import { Icon, type IconName } from '../ui/Icon';
import { useMyDocs } from '../../lib/mydocs';
import { useAuth } from '../../lib/auth';
import { ACCOUNTS_ENABLED } from '../../lib/api';

export function SyncStatus() {
  const { t } = useTranslation();
  const router = useRouter();
  const { status, user } = useAuth();
  const { sync, syncNow } = useMyDocs();

  let icon: IconName = 'check';
  let color: string = colors.success;
  let text = t('mydocs.syncOn');
  let action: { label: string; onPress: () => void } | null = null;

  if (status === 'signedIn' && user?.demo) {
    icon = 'alert';
    color = colors.warning;
    text = t('demo.notice');
  } else if (status !== 'signedIn') {
    icon = 'info';
    color = colors.textMuted;
    text = t('mydocs.syncGuest');
    if (ACCOUNTS_ENABLED)
      action = { label: t('auth.signIn'), onPress: () => router.push('/sign-in') };
  } else if (sync === 'syncing' || sync === 'off') {
    icon = 'clock';
    color = colors.primary;
    text = t('mydocs.syncing');
  } else if (sync === 'offline') {
    icon = 'alert';
    color = colors.warning;
    text = t('mydocs.syncOffline');
    action = { label: t('mydocs.syncRetry'), onPress: syncNow };
  }

  return (
    <View
      className="flex-row items-center gap-2 rounded-lg bg-surface-alt px-3 py-2"
      accessibilityLiveRegion="polite"
    >
      <Icon name={icon} size={18} color={color} />
      <AppText variant="small" tone="muted" className="flex-1">
        {text}
      </AppText>
      {action ? (
        <Pressable
          accessibilityRole="button"
          onPress={action.onPress}
          className="min-h-[44px] justify-center px-1"
        >
          <AppText variant="small" weight="semibold" tone="primary">
            {action.label}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
