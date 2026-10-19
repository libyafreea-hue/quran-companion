import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PRAYER_SETTINGS, locationFromCoordinates } from './prayerTimes';

const mocks = vi.hoisted(() => ({
  getPending: vi.fn(), cancel: vi.fn(), checkPermissions: vi.fn(), createChannel: vi.fn(), schedule: vi.fn(),
}));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => true } }));
vi.mock('@capacitor/local-notifications', () => ({ LocalNotifications: mocks }));
import { schedulePrayerNotifications } from './prayerNotifications';

describe('prayer notifications', () => {
  it('uses the Adhan resource only when opted in, with a separate channel', async () => {
    await schedulePrayerNotifications({ ...DEFAULT_PRAYER_SETTINGS, enabled: false, adhanEnabled: true, location: locationFromCoordinates(32.8872, 13.1913) });
    expect(mocks.createChannel).toHaveBeenCalledWith(expect.objectContaining({ id: 'prayer-adhan-audio-v1', sound: 'adhan_notification.mp3' }));
    const notifications = mocks.schedule.mock.calls[0][0].notifications;
    expect(notifications.length).toBeGreaterThan(140);
    expect(notifications.every((n: { channelId: string; sound: string }) => n.channelId === 'prayer-adhan-audio-v1' && n.sound === 'adhan_notification.mp3')).toBe(true);
  });
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPending.mockResolvedValue({ notifications: [{ id: 1001 }, { id: 20000 }] });
    mocks.cancel.mockResolvedValue(undefined);
    mocks.checkPermissions.mockResolvedValue({ display: 'granted' });
    mocks.createChannel.mockResolvedValue(undefined);
    mocks.schedule.mockResolvedValue(undefined);
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
  });
  it('does not schedule reminders without notification permission', async () => {
    mocks.checkPermissions.mockResolvedValue({ display: 'denied' });
    await expect(schedulePrayerNotifications({ ...DEFAULT_PRAYER_SETTINGS, enabled: true, location: locationFromCoordinates(32.8872, 13.1913) })).rejects.toThrow('الإشعارات');
    expect(mocks.schedule).not.toHaveBeenCalled();
  });
});