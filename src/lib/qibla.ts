import { Coordinates, Qibla } from 'adhan';

export function qiblaBearing(latitude: number, longitude: number) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error('إحداثيات الموقع غير صالحة.');
  }
  if (Math.abs(latitude - 21.4225241) < 0.00001 && Math.abs(longitude - 39.8261818) < 0.00001) return null;
  return Qibla(new Coordinates(latitude, longitude));
}

export function relativeBearing(bearing: number, heading: number) {
  return ((bearing - heading + 540) % 360) - 180;
}