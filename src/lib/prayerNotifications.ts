import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { adhanPlan, loadPrayerSettings, reminderPlan, type PrayerSettings } from './prayerTimes';

// Serialize refreshes so navigating or resuming cannot cancel a newer schedule.
let queue: Promise<void> = Promise.resolve();
export function schedulePrayerNotifications(settings: PrayerSettings): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  const run = async () => {
    const pending = await LocalNotifications.getPending();
    const prayerNotifications = pending.notifications.filter(n => n.id >= 20000 && n.id < 20300);
    if (prayerNotifications.length) await LocalNotifications.cancel({ notifications: prayerNotifications });
    if (!settings.enabled && !settings.adhanEnabled) return;
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') throw new Error('يرجى السماح بالإشعارات من إعدادات الهاتف.');
    const plan = reminderPlan(settings);
    const calls = adhanPlan(settings);
    if (!plan.length && !calls.length) return;
    await LocalNotifications.createChannel({ id: 'prayer-reminders', name: 'تنبيهات الصلاة', importance: 4, sound: 'default' });
    if (calls.length) await LocalNotifications.createChannel({ id: 'prayer-adhan-audio-v1', name: 'صوت الأذان عند الصلاة', importance: 4, sound: 'adhan_notification.mp3' });
    await LocalNotifications.schedule({ notifications: [...plan.map(n => ({
      id: n.id, title: n.title, body: n.body, channelId: 'prayer-reminders', sound: 'default',
      schedule: { at: n.at, allowWhileIdle: true }, extra: { section: 'prayer-times' },
    })), ...calls.map(n => ({
      id: n.id, title: n.title, body: n.body, channelId: 'prayer-adhan-audio-v1', sound: 'adhan_notification.mp3',
      schedule: { at: n.at, allowWhileIdle: true }, extra: { section: 'prayer-times' },
    }))] });
  };
  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
}
export async function refreshPrayerNotifications() {
  const settings = await loadPrayerSettings();
  if (settings.enabled || settings.adhanEnabled) return schedulePrayerNotifications(settings);
  return Promise.resolve();
}