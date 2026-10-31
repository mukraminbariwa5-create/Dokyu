/**
 * Phone reminders for My Docs (Android): the day before an appointment at 8 AM, and 30 days before a
 * document expires at 9 AM. Local notifications only, nothing goes through a server.
 * On the web the app shows the same reminders inside My Docs and on Home instead.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { i18n } from './i18n';
import type { TrackedDoc } from './mydocs';
import { GUIDES, pick } from '@dokyu/shared';

const AT = (iso: string, hour: number, daysBefore: number) => {
  // Philippine time (UTC+8) regardless of the phone's setting.
  const t =
    Date.parse(`${iso}T00:00:00Z`) - 8 * 3600_000 + hour * 3600_000 - daysBefore * 86_400_000;
  return new Date(t);
};

function docName(doc: TrackedDoc) {
  const g = doc.guide ? GUIDES.find((x) => x.slug === doc.guide) : undefined;
  return g ? pick(g.title, i18n.language === 'tl' ? 'tl' : 'en') : (doc.title ?? '');
}

let handlerSet = false;

export async function scheduleReminders(doc: TrackedDoc): Promise<string[]> {
  if (Platform.OS === 'web') return [];
  try {
    if (!handlerSet) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      handlerSet = true;
    }
    const wanted: Array<{ when: Date; title: string; body: string }> = [];
    const name = docName(doc);
    if (doc.appointmentDate && doc.status !== 'have')
      wanted.push({
        when: AT(doc.appointmentDate, 8, 1),
        title: i18n.t('mydocs.remindApptTitle'),
        body: i18n.t('mydocs.remindApptBody', { name, place: doc.appointmentPlace ?? '' }),
      });
    if (doc.expires)
      wanted.push({
        when: AT(doc.expires, 9, 30),
        title: i18n.t('mydocs.remindExpiryTitle'),
        body: i18n.t('mydocs.remindExpiryBody', { name }),
      });
    const future = wanted.filter((w) => w.when.getTime() > Date.now());
    if (future.length === 0) return [];
    const perm = await Notifications.getPermissionsAsync();
    const granted = perm.granted || (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return [];
    const ids: string[] = [];
    for (const w of future) {
      ids.push(
        await Notifications.scheduleNotificationAsync({
          content: { title: w.title, body: w.body },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: w.when },
        }),
      );
    }
    return ids;
  } catch {
    return [];
  }
}

export async function cancelReminders(ids: string[]): Promise<void> {
  if (Platform.OS === 'web') return;
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})),
  );
}
