import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const MORNING_ADHKAR_ID = 1001;
const EVENING_ADHKAR_ID = 1002;
const QURAN_REMINDER_ID = 1003;

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  
  const permission = await LocalNotifications.requestPermissions();
  return permission.display === 'granted';
}

export async function scheduleAdhkarReminders(
  morningHour: number = 6,
  morningMinute: number = 0,
  eveningHour: number = 16,
  eveningMinute: number = 0
) {
  if (!Capacitor.isNativePlatform()) return;

  // Cancel existing adhkar notifications
  await LocalNotifications.cancel({ notifications: [{ id: MORNING_ADHKAR_ID }, { id: EVENING_ADHKAR_ID }] });

  await LocalNotifications.schedule({
    notifications: [
      {
        id: MORNING_ADHKAR_ID,
        title: '☀️ أذكار الصباح',
        body: 'حان وقت أذكار الصباح، لا تنسَ ذكر الله.',
        schedule: {
          on: { hour: morningHour, minute: morningMinute },
          allowWhileIdle: true,
        },
        smallIcon: 'ic_launcher',
        sound: 'default',
      },
      {
        id: EVENING_ADHKAR_ID,
        title: '🌙 أذكار المساء',
        body: 'حان وقت أذكار المساء، لا تنسَ ذكر الله.',
        schedule: {
          on: { hour: eveningHour, minute: eveningMinute },
          allowWhileIdle: true,
        },
        smallIcon: 'ic_launcher',
        sound: 'default',
      },
    ],
  });
}

export async function scheduleQuranReminder(hour: number = 20, minute: number = 0) {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.cancel({ notifications: [{ id: QURAN_REMINDER_ID }] });

  await LocalNotifications.schedule({
    notifications: [
      {
        id: QURAN_REMINDER_ID,
        title: '📖 تذكير بقراءة القرآن',
        body: 'لا تنسَ وِردك اليومي من القرآن الكريم.',
        schedule: {
          on: { hour, minute },
          allowWhileIdle: true,
        },
        smallIcon: 'ic_launcher',
        sound: 'default',
      },
    ],
  });
}

export async function cancelAllReminders() {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.cancel({
    notifications: [
      { id: MORNING_ADHKAR_ID },
      { id: EVENING_ADHKAR_ID },
      { id: QURAN_REMINDER_ID },
    ],
  });
}

export function getStoredReminderSettings() {
  const stored = localStorage.getItem('reminder_settings');
  if (stored) return JSON.parse(stored);
  return {
    adhkarEnabled: true,
    quranEnabled: true,
    morningHour: 6,
    morningMinute: 0,
    eveningHour: 16,
    eveningMinute: 0,
    quranHour: 20,
    quranMinute: 0,
  };
}

export function saveReminderSettings(settings: ReturnType<typeof getStoredReminderSettings>) {
  localStorage.setItem('reminder_settings', JSON.stringify(settings));
}
