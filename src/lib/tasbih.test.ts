import { beforeEach, describe, expect, it } from 'vitest';
import { incrementTasbih, readTasbih, TASBIH_KEY } from './tasbih';

describe('electronic tasbih', () => {
  beforeEach(() => localStorage.clear());
  it('counts one tasbih per increment', () => {
    expect(incrementTasbih(0)).toBe(1);
    expect(incrementTasbih(33)).toBe(34);
  });
  it('restores saved counts and resets to zero', () => {
    localStorage.setItem(TASBIH_KEY, '33');
    expect(readTasbih()).toBe(33);
    localStorage.setItem(TASBIH_KEY, '0');
    expect(readTasbih()).toBe(0);
  });
  it('rejects corrupt or negative stored counts', () => {
    localStorage.setItem(TASBIH_KEY, '-1');
    expect(readTasbih()).toBe(0);
    localStorage.setItem(TASBIH_KEY, 'NaN');
    expect(readTasbih()).toBe(0);
  });
});