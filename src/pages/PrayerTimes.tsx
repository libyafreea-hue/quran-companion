import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ArrowRight, Bell, ChevronLeft, ChevronRight, MapPin, Moon, Navigation, Sunrise, Sun, Sunset, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dailyEntries, locationDate, locationFromCoordinates, METHODS, PRAYERS, readPrayerSettings, savePrayerSettings, type Method, type PrayerSettings } from '@/lib/prayerTimes';
import { schedulePrayerNotifications } from '@/lib/prayerNotifications';
import islamicHeader from '@/assets/islamic-header.jpg';
import AdhanPlayer from '@/components/AdhanPlayer';

const icons = [Moon, Sunrise, Sun, Sun, Sunset, Moon];
const PrayerTimesPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(readPrayerSettings);
  const [now, setNow] = useState(new Date());
  const [day, setDay] = useState(0);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const native = Capacitor.isNativePlatform();
  const timezone = settings.location?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const entries = dailyEntries(settings, now, day);
  const next = [...dailyEntries(settings, now), ...dailyEntries(settings, now, 1)]
    .find(p => p.key !== 'sunrise' && p.time > now);
  const remaining = next ? Math.max(0, Math.ceil((next.time.getTime() - now.getTime()) / 60_000)) : 0;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const updateSettings = async (updated: PrayerSettings) => {
    setSaving(true); setError(''); setStatus('');
    try {
      await schedulePrayerNotifications(updated);
      savePrayerSettings(updated);
      setSettings(updated);
      if (updated.enabled || updated.adhanEnabled) setStatus('تمت جدولة التنبيهات لـ٣٠ يوماً، وتتجدد عند فتح التطبيق. قد يؤخرها توفير البطارية.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر حفظ التنبيهات، حاول مرة أخرى.');
    } finally { setSaving(false); }
  };

  const locate = async () => {
    setLocating(true); setError(''); setStatus('');
    try {
      if (native) {
        const permission = await Geolocation.requestPermissions({ permissions: ['coarseLocation'] });
        if (permission.coarseLocation !== 'granted') throw new Error('لم يُسمح بالوصول للموقع. يمكنك السماح به من إعدادات الهاتف ثم المحاولة مجدداً.');
      }
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
      const location = locationFromCoordinates(position.coords.latitude, position.coords.longitude);
      const updated = { ...settings, location };
      // Keep a successfully detected location even when notification scheduling fails.
      savePrayerSettings(updated); setSettings(updated); setDay(0); setNow(new Date());
      await schedulePrayerNotifications(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setError(message.includes('لم يُسمح') || message.includes('الإشعارات') ? message : 'تعذر تحديد الموقع. فعّل خدمة الموقع واسمح للتطبيق بالوصول إليه ثم أعد المحاولة.');
    } finally { setLocating(false); }
  };

  const toggleReminders = async (enabled: boolean, field: 'enabled' | 'adhanEnabled' = 'enabled') => {
    if (enabled) {
      setError('');
      try {
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display !== 'granted') { setError('يرجى السماح بالإشعارات من إعدادات الهاتف.'); return; }
      } catch { setError('تعذر طلب الإشعارات. تحقق من إعدادات الهاتف.'); return; }
    }
    await updateSettings({ ...settings, [field]: enabled });
  };
  const formatTime = (time?: Date) => time && Number.isFinite(time.getTime())
    ? new Intl.DateTimeFormat('ar-LY', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: true }).format(time)
    : '—';
  const date = locationDate(now, timezone, day);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="relative overflow-hidden bg-primary text-primary-foreground">
        <img src={islamicHeader} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative max-w-3xl mx-auto px-4 pt-4 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" aria-label="الصفحة الرئيسية" onClick={() => navigate('/')} className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><ArrowRight className="h-6 w-6" /></Button>
            <h1 className="font-amiri text-3xl font-bold">الأذان ومواقيت الصلاة</h1>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-primary-foreground/80"><MapPin className="h-4 w-4" />{settings.location ? timezone.replace(/_/g, ' ').split('/').pop() : 'لم يتم تحديد الموقع'}</p>
              {settings.location && <p className="mt-1 text-sm text-primary-foreground/70" dir="ltr">{settings.location.latitude.toFixed(3)}°, {settings.location.longitude.toFixed(3)}°</p>}
            </div>
            <Button variant="secondary" onClick={locate} disabled={locating || saving} className="gap-2">
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              {locating ? 'جارٍ تحديد الموقع…' : settings.location ? 'تحديث الموقع' : 'تحديد موقعي'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {error && <p role="alert" className="mb-5 border border-destructive/30 bg-destructive/10 text-destructive rounded-md p-3">{error}</p>}
        {next && <section className="flex items-center justify-between gap-3 border-b border-border pb-6 mb-6">
          <div><p className="text-sm text-muted-foreground">الصلاة القادمة</p><h2 className="text-3xl font-amiri font-bold text-primary mt-1">{next.name}</h2></div>
          <div className="text-left"><p className="text-2xl tabular-nums font-bold">{formatTime(next.time)}</p><p className="text-sm text-muted-foreground mt-1">بعد {Math.floor(remaining / 60)} ساعة و{remaining % 60} دقيقة</p></div>
        </section>}

        <section aria-label="مواقيت الصلاة">
          <div className="flex items-center justify-between gap-2 mb-5">
            <Button variant="ghost" size="icon" aria-label="اليوم السابق" onClick={() => setDay(d => d - 1)}><ChevronRight className="h-5 w-5" /></Button>
            <div className="text-center"><h2 className="font-bold text-lg">{day === 0 ? 'اليوم' : day === 1 ? 'غداً' : new Intl.DateTimeFormat('ar-LY', { weekday: 'long' }).format(date)}</h2><p className="text-sm text-muted-foreground">{new Intl.DateTimeFormat('ar-LY', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)}</p></div>
            <Button variant="ghost" size="icon" aria-label="اليوم التالي" onClick={() => setDay(d => d + 1)}><ChevronLeft className="h-5 w-5" /></Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(entries.length ? entries : [{ key: 'fajr', name: 'الفجر' }, { key: 'sunrise', name: 'الشروق' }, ...PRAYERS.slice(1)]).map((entry, i) => {
              const Icon = icons[i];
              const time = 'time' in entry ? entry.time : undefined;
              const active = day === 0 && entry.key === next?.key;
              return <div key={entry.key} className={`rounded-lg border p-4 ${active ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                <div className="flex items-center gap-2 mb-3"><Icon className={`h-5 w-5 ${entry.key === 'sunrise' ? 'text-accent' : 'text-primary'}`} /><h3 className="font-amiri text-xl">{entry.name}</h3></div>
                <p className="text-xl font-bold tabular-nums min-h-7">{formatTime(time)}</p>
              </div>;
            })}
          </div>
        </section>

        <section className="border-t border-border mt-8 pt-6 space-y-5" aria-label="إعدادات المواقيت">
          <h2 className="text-xl font-amiri font-bold">إعدادات المواقيت</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2"><label htmlFor="calculation-method" className="text-sm">طريقة الحساب</label>
              <Select value={settings.method} onValueChange={method => updateSettings({ ...settings, method: method as Method })} disabled={saving || locating} dir="rtl"><SelectTrigger id="calculation-method"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(METHODS).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-2"><label htmlFor="asr-method" className="text-sm">حساب صلاة العصر</label>
              <Select value={settings.hanafi ? 'hanafi' : 'standard'} onValueChange={v => updateSettings({ ...settings, hanafi: v === 'hanafi' })} disabled={saving || locating} dir="rtl"><SelectTrigger id="asr-method"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="standard">الجمهور (الشافعي، المالكي، الحنبلي)</SelectItem><SelectItem value="hanafi">الحنفي</SelectItem></SelectContent></Select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">المواقيت حسابية؛ قد تختلف عن أذان المسجد المحلي. في المناطق القطبية قد يتعذر حساب بعض المواقيت.</p>
        </section>

        <section className="border-t border-border mt-6 pt-6 space-y-5" aria-label="تنبيهات قبل الأذان">
          <div className="flex items-center justify-between gap-4"><h2 className="flex items-center gap-2 text-xl font-amiri font-bold"><Bell className="h-5 w-5 text-primary" />تنبيه قبل الأذان</h2><Switch aria-label="تفعيل تنبيهات الأذان" dir="ltr" checked={settings.enabled} disabled={!native || !settings.location || saving || locating} onCheckedChange={enabled => toggleReminders(enabled)} /></div>
          {!native && <p className="text-sm text-muted-foreground">تنبيهات الأذان متاحة في تطبيق أندرويد، وليست في نسخة المتصفح.</p>}
          <div className="space-y-2 max-w-xs"><label htmlFor="reminder-lead" className="text-sm">وقت التنبيه</label>
            <Select value={String(settings.minutesBefore)} onValueChange={v => updateSettings({ ...settings, minutesBefore: Number(v) })} disabled={saving || locating} dir="rtl"><SelectTrigger id="reminder-lead"><SelectValue /></SelectTrigger><SelectContent>{[5, 10, 15, 20, 30].map(n => <SelectItem key={n} value={String(n)}>قبل الأذان بـ{n} دقائق</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-4">{PRAYERS.map(p => <label key={p.key} className="flex items-center gap-2"><Checkbox checked={settings.prayers.includes(p.key)} disabled={saving || locating} aria-label={`تنبيه ${p.name}`} onCheckedChange={checked => updateSettings({ ...settings, prayers: checked ? [...settings.prayers, p.key] : settings.prayers.filter(key => key !== p.key) })} />{p.name}</label>)}</div>
          <div className="flex items-center justify-between gap-4"><label htmlFor="adhan-sound" className="text-lg font-amiri">صوت الأذان عند دخول وقت الصلاة</label><Switch id="adhan-sound" dir="ltr" checked={settings.adhanEnabled} disabled={!native || !settings.location || saving || locating} onCheckedChange={enabled => toggleReminders(enabled, 'adhanEnabled')} /></div>
          <p className="text-sm text-muted-foreground">صوت تنبيه الأذان مقطع قصير عند وقت الصلاة، منفصل عن التذكير السابق لها. يخضع لإعدادات الصوت وعدم الإزعاج في الهاتف.</p>
          <AdhanPlayer />
          {(settings.enabled || settings.adhanEnabled) && settings.prayers.length === 0 && <p className="text-sm text-muted-foreground">لم تُحدَّد أي صلاة للتنبيه.</p>}
          {status && <p role="status" className="text-sm text-primary">{status}</p>}
        </section>
      </main>
    </div>
  );
};
export default PrayerTimesPage;