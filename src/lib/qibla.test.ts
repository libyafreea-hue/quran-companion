import { describe, expect, it } from 'vitest';
import { qiblaBearing, relativeBearing } from './qibla';

describe('location-based Qibla', () => {
  it('points from Tripoli towards the Kaaba, southeast from true north', () => {
    expect(qiblaBearing(32.8872, 13.1913)).toBeCloseTo(109.25, 0);
    expect(qiblaBearing(51.5074, -0.1278)).toBeCloseTo(118.99, 0);
  });
  it('wraps device heading correctly across north', () => {
    expect(relativeBearing(10, 350)).toBe(20);
    expect(relativeBearing(350, 10)).toBe(-20);
    expect(relativeBearing(109, 109)).toBe(0);
  });
  it('does not invent a direction at the Kaaba or for invalid coordinates', () => {
    expect(qiblaBearing(21.4225241, 39.8261818)).toBeNull();
    expect(() => qiblaBearing(91, 13)).toThrow();
  });
});