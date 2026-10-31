import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import AdhanPlayer from './AdhanPlayer';

const stop = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock('@capacitor/core', () => ({ Capacitor: { getPlatform: () => 'android' } }));
vi.mock('@/lib/adhanAlarm', () => ({ AdhanAlarm: { stop } }));

it('lets the user stop scheduled native Adhan manually', () => {
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  render(<AdhanPlayer />);
  fireEvent.click(screen.getByRole('button', { name: /^إيقاف الأذان$/ }));
  expect(stop).toHaveBeenCalledTimes(1);
});