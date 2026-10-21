export const TASBIH_KEY = 'electronic_tasbih';
export function readTasbih(): number {
  try {
    const value = Number(localStorage.getItem(TASBIH_KEY));
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  } catch { return 0; }
}
export function incrementTasbih(count: number) {
  return count < Number.MAX_SAFE_INTEGER ? count + 1 : count;
}