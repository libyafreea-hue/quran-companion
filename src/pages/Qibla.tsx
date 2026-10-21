import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Compass as CompassIcon, Loader2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DevotionalHeader from '@/components/DevotionalHeader';
import { readPrayerSettings } from '@/lib/prayerTimes';
import { Compass } from '@/lib/compass';
import { qiblaBearing, relativeBearing } from '@/lib/qibla';

type AbsoluteOrientation = DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };
type PermissionOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };

export default function QiblaPage() {
  const [location, setLocation] = useState(() => readPrayerSettings().location);
  const [locating, setLocating] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState(0);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [compassStatus, setCompassStatus] = useState('');
  const cleanup = useRef<(() => void) | null>(null);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);
  const bearing = location ? qiblaBearing(location.latitude, location.longitude) : null;
  const angle = bearing === null ? 0 : relativeBearing(bearing, heading ?? 0);

  const stopCompass = () => {
    generation.current += 1;
    cleanup.current?.(); cleanup.current = null;
    if (pendingTimer.current) clearTimeout(pendingTimer.current);
    pendingTimer.current = null;
  };

  useEffect(() => {
    const hide = () => {
      if (document.visibilityState === 'hidden') {
        stopCompass(); setHeading(null); setStarting(false);
        setCompassStatus('أعد تفعيل البوصلة بعد العودة للتطبيق.');
      }
    };
    document.addEventListener('visibilitychange', hide);
    return () => { document.removeEventListener('visibilitychange', hide); stopCompass(); };
  }, []);

  const locate = async () => {
    stopCompass(); setHeading(null); setCompassStatus(''); setStarting(false);
    setLocating(true); setError('');
    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await Geolocation.requestPermissions({ permissions: ['coarseLocation'] });
        if (permission.coarseLocation !== 'granted') throw new Error('اسمح بالوصول إلى الموقع من إعدادات الهاتف.');
      }
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
      setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, timezone: '' });
    } catch (err) {
      setError(err instanceof Error && err.message.includes('اسمح') ? err.message : 'تعذر تحديد الموقع. فعّل خدمة الموقع واسمح للتطبيق بالوصول إليه.');
    } finally { setLocating(false); }
  };

  const startCompass = async () => {
    if (!location) return;
    stopCompass(); setHeading(null); setAccuracy(0); setStarting(true); setCompassStatus('');
    const current = generation.current;
    let received = false;
    const receive = (value: number, quality: number) => {
      if (generation.current !== current || !Number.isFinite(value)) return;
      received = true;
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
      setHeading(value); setAccuracy(quality); setStarting(false);
    };
    let handle: PluginListenerHandle | undefined;
    try {
      if (Capacitor.isNativePlatform()) {
        handle = await Compass.addListener('heading', data => receive(data.heading, data.accuracy));
        if (generation.current !== current) { await handle.remove(); return; }
        cleanup.current = () => { void handle?.remove(); void Compass.stop(); };
        await Compass.start({ latitude: location.latitude, longitude: location.longitude });
      } else {
        if (typeof DeviceOrientationEvent === 'undefined') throw new Error('البوصلة غير متاحة في هذا المتصفح.');
        const orientation = DeviceOrientationEvent as PermissionOrientation;
        if (orientation.requestPermission && await orientation.requestPermission() !== 'granted') throw new Error('لم يتم السماح بالوصول إلى البوصلة.');
        if (generation.current !== current) return;
        const listener = (raw: DeviceOrientationEvent) => {
          const event = raw as AbsoluteOrientation;
          // Relative alpha is not a north reference and must never drive the Qibla arrow.
          if (typeof event.webkitCompassHeading === 'number') {
            receive(event.webkitCompassHeading, event.webkitCompassAccuracy !== undefined && event.webkitCompassAccuracy >= 0 && event.webkitCompassAccuracy <= 15 ? 3 : 1);
          } else if (event.absolute && event.alpha !== null) {
            const rotation = window.screen.orientation?.angle ?? 0;
            receive((360 - event.alpha + rotation + 360) % 360, 1);
          }
        };
        window.addEventListener('deviceorientationabsolute', listener);
        window.addEventListener('deviceorientation', listener);
        cleanup.current = () => {
          window.removeEventListener('deviceorientationabsolute', listener);
          window.removeEventListener('deviceorientation', listener);
        };
      }
      if (generation.current !== current || received) return;
      pendingTimer.current = setTimeout(() => {
        if (generation.current !== current) return;
        stopCompass(); setStarting(false); setHeading(null);
        setCompassStatus('لم تصل قراءة البوصلة. يمكنك استخدام زاوية القبلة من الشمال الحقيقي.');
      }, 10000);
    } catch (err) {
      if (generation.current !== current) return;
      stopCompass(); setStarting(false);
      setCompassStatus(err instanceof Error ? err.message : 'تعذر تشغيل البوصلة.');
    }
  };

  return <div className="min-h-screen bg-background" dir="rtl">
    <DevotionalHeader title="اتجاه القبلة" />
    <main className="mx-auto max-w-xl px-4 py-7 text-center">
      <Button variant="outline" onClick={locate} disabled={locating || starting} className="gap-2">{locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}{locating ? 'جارٍ تحديد الموقع…' : location ? 'تحديث موقعي' : 'تحديد موقعي'}</Button>
      {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
      {location && <p className="mt-3 text-sm text-muted-foreground" dir="ltr">{location.latitude.toFixed(3)}°, {location.longitude.toFixed(3)}°</p>}
      <div className="relative mx-auto my-8 aspect-square w-72 max-w-full rounded-full border-2 border-gold bg-card shadow-islamic" aria-label="بوصلة القبلة">
        <span className="absolute left-1/2 top-3 -translate-x-1/2 text-primary">{heading === null ? 'شمال' : 'أعلى الهاتف'}</span>
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-muted-foreground">{heading === null ? 'جنوب' : ''}</span>
        {heading === null && <><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">شرق</span><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">غرب</span></>}
        <div className="absolute inset-12" style={{ transform: `rotate(${angle}deg)` }}>
          <div className="absolute left-1/2 top-2 h-24 w-1 -translate-x-1/2 bg-primary" />
          <Navigation className={`absolute left-1/2 top-0 h-10 w-10 -translate-x-1/2 -rotate-45 ${location && bearing !== null ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold bg-background" />
        </div>
      </div>
      <p className="text-3xl font-amiri font-bold text-primary">{location ? bearing === null ? 'أنت عند موقع الكعبة' : `${bearing.toLocaleString('ar-LY', { maximumFractionDigits: 1 })}° من الشمال الحقيقي` : 'حدّد موقعك لمعرفة القبلة'}</p>
      {bearing !== null && <>
        <Button onClick={startCompass} disabled={starting || locating} className="mt-6 gap-2">{starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CompassIcon className="h-4 w-4" />}{starting ? 'جارٍ تشغيل البوصلة…' : heading === null ? 'تفعيل البوصلة' : 'تحديث البوصلة'}</Button>
        {heading !== null && <p role="status" className="mt-4 font-bold text-primary">{Math.abs(angle) < 5 ? 'الهاتف باتجاه القبلة' : `${angle > 0 ? 'اتجه يميناً' : 'اتجه يساراً'} ${Math.round(Math.abs(angle)).toLocaleString('ar-LY')}°`}</p>}
      </>}
      {compassStatus && <p role="status" className="mt-4 text-muted-foreground">{compassStatus}</p>}
      {bearing !== null && <p className="mt-5 text-sm leading-7 text-muted-foreground">{heading === null ? 'الرسم ثابت بالنسبة للشمال، ولا يمثل اتجاه الهاتف حتى تفعيل البوصلة.' : Capacitor.isNativePlatform() ? accuracy < 2 ? 'دقة البوصلة منخفضة؛ حرّك الهاتف بشكل ٨ للمعايرة.' : 'أبقِ الهاتف مستوياً وبعيداً عن المعادن والمغناطيس.' : 'قراءة المتصفح تقريبية وقد تعتمد على الشمال المغناطيسي. أبقِ الهاتف مستوياً.'}</p>}
    </main>
  </div>;
}