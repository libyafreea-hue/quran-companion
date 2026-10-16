import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { readPrayerSettings, reminderPlan, type PrayerSettings } from './prayerTimes';

// Serialize refreshes so navigating or resuming cannot cancel a newer schedule.
let queue: Promise<void> = Promise.resolve();
export function schedulePrayerNotifications(settings: PrayerSettings): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  const run = async () => {
    const pending = await LocalNotifications.getPending();
    const prayerNotifications = pending.notifications.filter(n => n.id >= 20000 && n.id < 20150);
    if (prayerNotifications.length) await LocalNotifications.cancel({ notifications: prayerNotifications });
    if (!settings.enabled) return;
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') throw new Error('يرجى السماح بالإشعارات من إعدادات الهاتف.');
    const plan = reminderPlan(settings);
    if (!plan.length) return;
    await LocalNotifications.createChannel({ id: 'prayer-reminders', name: 'تنبيهات الصلاة', importance: 4, sound: 'default' });
    await LocalNotifications.schedule({ notifications: plan.map(n => ({
      id: n.id, title: n.title, body: n.body, channelId: 'prayer-reminders', sound: 'default',
      schedule: { at: n.at, allowWhileIdle: true }, extra: { section: 'prayer-times' },
    })) });
  };
  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
}
export function refreshPrayerNotifications() {
  const settings = readPrayerSettings();
  if (settings.enabled) return schedulePrayerNotifications(settings);
  return Promise.resolve();
}