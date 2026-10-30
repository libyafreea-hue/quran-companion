import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan';
import tzLookup from 'tz-lookup';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

export const PRAYERS = [
  { key: 'fajr', name: 'الفجر' },
  { key: 'dhuhr', name: 'الظهر' },
  { key: 'asr', name: 'العصر' },
  { key: 'maghrib', name: 'المغرب' },
  { key: 'isha', name: 'العشاء' },
] as const;
export type PrayerKey = typeof PRAYERS[number]['key'];
export const METHODS = {
  MuslimWorldLeague: 'رابطة العالم الإسلامي',
  Egyptian: 'الهيئة المصرية للمساحة',
  UmmAlQura: 'أم القرى — مكة المكرمة',
  Karachi: 'جامعة العلوم الإسلامية — كراتشي',
  NorthAmerica: 'أمريكا الشمالية (ISNA)',
  Dubai: 'دبي',
  Kuwait: 'الكويت',
  Qatar: 'قطر',
  Turkey: 'تركيا',
} as const;
export type Method = keyof typeof METHODS;
export interface PrayerSettings {
  location: { latitude: number; longitude: number; timezone: string } | null;
  method: Method;
  hanafi: boolean;
  enabled: boolean;
  adhanEnabled: boolean;
  minutesBefore: number;
  prayers: PrayerKey[];
}
export const DEFAULT_PRAYER_SETTINGS: PrayerSettings = {
  location: null, method: 'MuslimWorldLeague', hanafi: false,
  enabled: false, adhanEnabled: false, minutesBefore: 10, prayers: PRAYERS.map(p => p.key),
};
const STORAGE_KEY = 'prayer_settings';
let nativeSettings: PrayerSettings | undefined;
function parsePrayerSettings(value: string | null): PrayerSettings {
  try {
    const raw = JSON.parse(value || 'null');
    if (!raw) return { ...DEFAULT_PRAYER_SETTINGS };
    const location = raw.location;
    const validLocation = location && Number.isFinite(location.latitude) && Math.abs(location.latitude) <= 90 &&
      Number.isFinite(location.longitude) && Math.abs(location.longitude) <= 180;
    return {
      location: validLocation ? { latitude: location.latitude, longitude: location.longitude, timezone: tzLookup(location.latitude, location.longitude) } : null,
      method: raw.method in METHODS ? raw.method : 'MuslimWorldLeague',
      hanafi: raw.hanafi === true, enabled: raw.enabled === true,
      adhanEnabled: raw.adhanEnabled === true,
      minutesBefore: [5, 10, 15, 20, 30].includes(raw.minutesBefore) ? raw.minutesBefore : 10,
      prayers: Array.isArray(raw.prayers) ? PRAYERS.filter(p => raw.prayers.includes(p.key)).map(p => p.key) : PRAYERS.map(p => p.key),
    };
  } catch { return { ...DEFAULT_PRAYER_SETTINGS }; }
}
export function readPrayerSettings(): PrayerSettings {
  if (Capacitor.isNativePlatform() && nativeSettings) return nativeSettings;
  try { return parsePrayerSettings(localStorage.getItem(STORAGE_KEY)); }
  catch { return { ...DEFAULT_PRAYER_SETTINGS }; }
}
// Hydrate before rendering routes or refreshing reminders; migrate existing installs once.
export async function loadPrayerSettings(): Promise<PrayerSettings> {
  if (!Capacitor.isNativePlatform()) return readPrayerSettings();
  if (nativeSettings) return nativeSettings;
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  let legacy: string | null = null;
  if (value === null) {
    try { legacy = localStorage.getItem(STORAGE_KEY); } catch { /* Native storage remains available. */ }
  }
  const settings = parsePrayerSettings(value ?? legacy);
  if (value === null && legacy !== null) {
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(settings) });
  }
  nativeSettings = settings;
  return settings;
}
export async function savePrayerSettings(settings: PrayerSettings): Promise<void> {
  const value = JSON.stringify(settings);
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key: STORAGE_KEY, value });
    nativeSettings = settings;
    try { localStorage.setItem(STORAGE_KEY, value); } catch { /* Optional WebView mirror. */ }
  } else {
    localStorage.setItem(STORAGE_KEY, value);
  }
}
export function locationFromCoordinates(latitude: number, longitude: number) {
  return { latitude, longitude, timezone: tzLookup(latitude, longitude) };
}
// A civil date in the location's timezone, independent of the phone's timezone.
export function locationDate(now: Date, timezone: string, offset = 0): Date {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now);
  const number = (type: string) => Number(parts.find(p => p.type === type)?.value);
  return new Date(number('year'), number('month') - 1, number('day') + offset, 12);
}
export function calculatePrayerTimes(settings: PrayerSettings, date: Date) {
  if (!settings.location) return null;
  const parameters = CalculationMethod[settings.method]();
  parameters.madhab = settings.hanafi ? Madhab.Hanafi : Madhab.Shafi;
  return new PrayerTimes(new Coordinates(settings.location.latitude, settings.location.longitude), date, parameters);
}
export function dailyEntries(settings: PrayerSettings, now: Date, offset = 0) {
  if (!settings.location) return [];
  const times = calculatePrayerTimes(settings, locationDate(now, settings.location.timezone, offset));
  if (!times) return [];
  return [
    { key: 'fajr', name: 'الفجر', time: times.fajr },
    { key: 'sunrise', name: 'الشروق', time: times.sunrise },
    ...PRAYERS.slice(1).map(p => ({ ...p, time: times[p.key] })),
  ];
}
export function reminderPlan(settings: PrayerSettings, now = new Date(), days = 30) {
  if (!settings.enabled || !settings.location) return [];
  const result: { id: number; title: string; body: string; at: Date }[] = [];
  for (let day = 0; day < days; day++) {
    const times = calculatePrayerTimes(settings, locationDate(now, settings.location.timezone, day));
    if (!times) continue;
    PRAYERS.forEach((prayer, index) => {
      const at = new Date(times[prayer.key].getTime() - settings.minutesBefore * 60_000);
      if (settings.prayers.includes(prayer.key) && Number.isFinite(at.getTime()) && at > now) {
        result.push({ id: 20000 + day * 5 + index, title: `اقترب أذان ${prayer.name}`, body: `بقي ${settings.minutesBefore} دقائق على أذان ${prayer.name}.`, at });
      }
    });
  }
  return result;
}

export function adhanPlan(settings: PrayerSettings, now = new Date(), days = 30) {
  if (!settings.adhanEnabled || !settings.location) return [];
  const result: { id: number; title: string; body: string; at: Date }[] = [];
  for (let day = 0; day < days; day++) {
    const times = calculatePrayerTimes(settings, locationDate(now, settings.location.timezone, day));
    if (!times) continue;
    PRAYERS.forEach((prayer, index) => {
      const at = times[prayer.key];
      if (settings.prayers.includes(prayer.key) && Number.isFinite(at.getTime()) && at > now) {
        result.push({ id: 20150 + day * 5 + index, title: `أذان ${prayer.name}`, body: `حان وقت صلاة ${prayer.name}.`, at });
      }
    });
  }
  return result;
}