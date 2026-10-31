import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PRAYER_SETTINGS, locationFromCoordinates } from './prayerTimes';
import { adhanPlan } from './prayerTimes';

const mocks = vi.hoisted(() => ({
  getPending: vi.fn(), cancel: vi.fn(), checkPermissions: vi.fn(), createChannel: vi.fn(), schedule: vi.fn(),
  nativeSchedule: vi.fn(),
}));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => true, getPlatform: () => 'android' } }));
vi.mock('@capacitor/local-notifications', () => ({ LocalNotifications: mocks }));
vi.mock('./adhanAlarm', () => ({ AdhanAlarm: { schedule: mocks.nativeSchedule } }));
import { schedulePrayerNotifications } from './prayerNotifications';

describe('prayer notifications', () => {
  afterEach(() => vi.useRealTimers());
  it('schedules opted-in full native playback at prayer times instead of short notification sounds', async () => {
    const settings = { ...DEFAULT_PRAYER_SETTINGS, enabled: false, adhanEnabled: true, location: locationFromCoordinates(32.8872, 13.1913) };
    await schedulePrayerNotifications(settings);
    expect(mocks.nativeSchedule).toHaveBeenCalledExactlyOnceWith({
      alarms: adhanPlan(settings).map(n => ({ id: n.id, at: n.at.getTime(), title: n.title })),
    });
    expect(mocks.schedule).not.toHaveBeenCalled();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPending.mockResolvedValue({ notifications: [{ id: 1001 }, { id: 20000 }] });
    mocks.cancel.mockResolvedValue(undefined);
    mocks.checkPermissions.mockResolvedValue({ display: 'granted' });
    mocks.createChannel.mockResolvedValue(undefined);
    mocks.schedule.mockResolvedValue(undefined);
    mocks.nativeSchedule.mockResolvedValue(undefined);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-31T10:00:00Z'));
  });
  it('schedules selected prayers before Adhan without cancelling Adhkar reminders', async () => {
    await schedulePrayerNotifications({ ...DEFAULT_PRAYER_SETTINGS, enabled: true, location: locationFromCoordinates(32.8872, 13.1913) });
    expect(mocks.cancel).toHaveBeenCalledWith({ notifications: [{ id: 20000 }] });
    const notifications = mocks.schedule.mock.calls[0][0].notifications;
    expect(notifications.length).toBeGreaterThan(140);
    expect(notifications.every((n: { id: number }) => n.id >= 20000 && n.id < 20150)).toBe(true);
  });
  it('cancels only prayer reminders when switched off', async () => {
    await schedulePrayerNotifications({ ...DEFAULT_PRAYER_SETTINGS, enabled: false });
    expect(mocks.cancel).toHaveBeenCalledWith({ notifications: [{ id: 20000 }] });
    expect(mocks.schedule).not.toHaveBeenCalled();
    expect(mocks.nativeSchedule).toHaveBeenCalledWith({ alarms: [] });
  });
  it('does not schedule reminders without notification permission', async () => {
    mocks.checkPermissions.mockResolvedValue({ display: 'denied' });
    await expect(schedulePrayerNotifications({ ...DEFAULT_PRAYER_SETTINGS, enabled: true, location: locationFromCoordinates(32.8872, 13.1913) })).rejects.toThrow('الإشعارات');
    expect(mocks.schedule).not.toHaveBeenCalled();
    expect(mocks.nativeSchedule).toHaveBeenCalledWith({ alarms: [] });
  });
  it('reports missing exact alarm access without losing the advance reminder schedule', async () => {
    mocks.nativeSchedule.mockRejectedValue(new Error('يرجى السماح بالتنبيهات الدقيقة'));
    await expect(schedulePrayerNotifications({ ...DEFAULT_PRAYER_SETTINGS, enabled: true, adhanEnabled: true,
      location: locationFromCoordinates(32.8872, 13.1913) })).rejects.toThrow('التنبيهات الدقيقة');
    // At this fixed instant today's Fajr reminder has already passed.
    expect(mocks.schedule.mock.calls[0][0].notifications).toHaveLength(149);
  });
});