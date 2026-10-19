import { describe, expect, it } from 'vitest';
import { adhanPlan, DEFAULT_PRAYER_SETTINGS, dailyEntries, locationFromCoordinates, reminderPlan, type PrayerSettings } from './prayerTimes';

const settings: PrayerSettings = {
  ...DEFAULT_PRAYER_SETTINGS, location: locationFromCoordinates(32.8872, 13.1913), enabled: true,
};
describe('location-based prayer times', () => {
  it('plays optional Adhan alerts at prayer time independently of advance reminders', () => {
    const now = new Date('2026-10-17T00:00:00Z');
    expect(adhanPlan(settings, now, 1)).toEqual([]);
    const calls = adhanPlan({ ...settings, enabled: false, adhanEnabled: true }, now, 1);
    const prayers = dailyEntries(settings, now).filter(p => p.key !== 'sunrise');
    expect(calls).toHaveLength(5);
    calls.forEach((call, i) => expect(call.at.getTime()).toBe(prayers[i].time.getTime()));
  });
  it('calculates all five prayers and sunrise for the geographic location', () => {
    const entries = dailyEntries(settings, new Date('2026-10-17T00:00:00Z'));
    expect(entries.map(p => p.key)).toEqual(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']);
    expect(settings.location?.timezone).toBe('Africa/Tripoli');
    expect(entries.every(p => Number.isFinite(p.time.getTime()))).toBe(true);
    expect(entries.every((p, i) => i === 0 || p.time > entries[i - 1].time)).toBe(true);
    const other = dailyEntries({ ...settings, location: locationFromCoordinates(51.5074, -0.1278) }, new Date('2026-10-17T00:00:00Z'));
    expect(entries[0].time.getTime()).not.toBe(other[0].time.getTime());
  });
  it('schedules notifications before each Adhan, never at sunrise', () => {
    const now = new Date('2026-10-17T00:00:00Z');
    const entries = dailyEntries(settings, now).filter(p => p.key !== 'sunrise');
    const plan = reminderPlan(settings, now, 1);
    expect(plan).toHaveLength(5);
    plan.forEach((n, i) => expect(entries[i].time.getTime() - n.at.getTime()).toBe(10 * 60_000));
  });
  it('respects selected prayers, disabled reminders and future-only scheduling', () => {
    const now = new Date('2026-10-17T12:00:00Z');
    expect(reminderPlan({ ...settings, enabled: false }, now)).toEqual([]);
    const plan = reminderPlan({ ...settings, prayers: ['isha'], minutesBefore: 30 }, now, 1);
    expect(plan).toHaveLength(1);
    const isha = dailyEntries(settings, now).find(p => p.key === 'isha');
    expect((isha?.time.getTime() ?? 0) - plan[0].at.getTime()).toBe(30 * 60_000);
    expect(plan[0].at.getTime()).toBeGreaterThan(now.getTime());
  });
});