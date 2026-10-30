import { beforeEach, describe, expect, it, vi } from 'vitest';

const device = vi.hoisted(() => ({ values: new Map<string, string>(), native: true, failRead: false }));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => device.native } }));
vi.mock('@capacitor/preferences', () => ({ Preferences: {
  get: vi.fn(async ({ key }: { key: string }) => {
    if (device.failRead) throw new Error('Device storage unavailable');
    return { value: device.values.get(key) ?? null };
  }),
  set: vi.fn(async ({ key, value }: { key: string; value: string }) => { device.values.set(key, value); }),
} }));

describe('saved prayer settings', () => {
  beforeEach(() => {
    vi.resetModules(); device.values.clear(); device.native = true; device.failRead = false;
    localStorage.clear();
  });
  const chosen = async () => {
    const lib = await import('./prayerTimes');
    return { ...lib.DEFAULT_PRAYER_SETTINGS, location: lib.locationFromCoordinates(32.8872, 13.1913),
      enabled: true, adhanEnabled: true, minutesBefore: 20, prayers: ['fajr', 'isha'] as const };
  };
  it('restores detected location after a cold native restart without WebView storage', async () => {
    const settings = await chosen();
    await (await import('./prayerTimes')).savePrayerSettings({ ...settings, prayers: [...settings.prayers] });
    localStorage.clear(); vi.resetModules();
    const lib = await import('./prayerTimes');
    expect((await lib.loadPrayerSettings()).location).toEqual({ latitude: 32.8872, longitude: 13.1913, timezone: 'Africa/Tripoli' });
    expect(lib.readPrayerSettings().location).toEqual(settings.location);
  });
  it('restores both notification choices, lead time and selected prayers after restarting', async () => {
    const settings = await chosen();
    await (await import('./prayerTimes')).savePrayerSettings({ ...settings, prayers: [...settings.prayers] });
    localStorage.clear(); vi.resetModules();
    const saved = await (await import('./prayerTimes')).loadPrayerSettings();
    expect(saved.enabled).toBe(true);
    expect(saved.adhanEnabled).toBe(true);
    expect(saved.minutesBefore).toBe(20);
    expect(saved.prayers).toEqual(['fajr', 'isha']);
  });
  it('migrates existing saved choices before the first native launch', async () => {
    const settings = await chosen();
    localStorage.setItem('prayer_settings', JSON.stringify(settings));
    const lib = await import('./prayerTimes');
    expect(await lib.loadPrayerSettings()).toEqual(settings);
    expect(JSON.parse(device.values.get('prayer_settings') ?? 'null')).toEqual(settings);
  });
  it('does not replace saved choices with defaults if native storage fails to load', async () => {
    const settings = await chosen();
    device.values.set('prayer_settings', JSON.stringify(settings)); device.failRead = true;
    const lib = await import('./prayerTimes');
    await expect(lib.loadPrayerSettings()).rejects.toThrow('Device storage unavailable');
    device.failRead = false;
    expect(await lib.loadPrayerSettings()).toEqual(settings);
  });
  it('keeps browser settings across reopening without native storage', async () => {
    device.native = false;
    const settings = await chosen();
    await (await import('./prayerTimes')).savePrayerSettings({ ...settings, prayers: [...settings.prayers] });
    vi.resetModules();
    expect(await (await import('./prayerTimes')).loadPrayerSettings()).toEqual(settings);
    expect(device.values.size).toBe(0);
  });
});