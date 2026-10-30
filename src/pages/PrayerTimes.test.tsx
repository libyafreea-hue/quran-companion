import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import PrayerTimesPage from './PrayerTimes';
import { DEFAULT_PRAYER_SETTINGS, locationFromCoordinates, readPrayerSettings, savePrayerSettings } from '@/lib/prayerTimes';

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => true } }));
vi.mock('@capacitor/preferences', () => ({ Preferences: { set: vi.fn().mockResolvedValue(undefined) } }));
vi.mock('@capacitor/local-notifications', () => ({ LocalNotifications: {
  requestPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
} }));
vi.mock('@/lib/prayerNotifications', () => ({ schedulePrayerNotifications: vi.fn().mockRejectedValue(new Error('Scheduling unavailable')) }));
vi.mock('@/components/AdhanPlayer', () => ({ default: () => null }));

beforeEach(async () => {
  await savePrayerSettings({ ...DEFAULT_PRAYER_SETTINGS, location: locationFromCoordinates(32.8872, 13.1913) });
});

it('keeps advance reminders enabled when scheduling fails and the page reopens', async () => {
  const view = render(<MemoryRouter><PrayerTimesPage /></MemoryRouter>);
  fireEvent.click(screen.getByRole('switch', { name: 'تفعيل تنبيهات الأذان' }));
  await waitFor(() => expect(readPrayerSettings().enabled).toBe(true));
  await screen.findByRole('alert');
  view.unmount();
  render(<MemoryRouter><PrayerTimesPage /></MemoryRouter>);
  expect(screen.getByRole('switch', { name: 'تفعيل تنبيهات الأذان' })).toBeChecked();
});

it('keeps Adhan sound enabled when scheduling fails and the page reopens', async () => {
  const view = render(<MemoryRouter><PrayerTimesPage /></MemoryRouter>);
  fireEvent.click(screen.getByRole('switch', { name: 'صوت الأذان عند دخول وقت الصلاة' }));
  await waitFor(() => expect(readPrayerSettings().adhanEnabled).toBe(true));
  await screen.findByRole('alert');
  view.unmount();
  render(<MemoryRouter><PrayerTimesPage /></MemoryRouter>);
  expect(screen.getByRole('switch', { name: 'صوت الأذان عند دخول وقت الصلاة' })).toBeChecked();
});