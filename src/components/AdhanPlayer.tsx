import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import adhanAsset from '@/assets/adhan.ogg.asset.json';

export default function AdhanPlayer() {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const src = new URL(adhanAsset.url, 'https://quran-art-chant.lovable.app').href;
  useEffect(() => {
    const element = audio.current;
    return () => { element?.pause(); };
  }, []);
  const toggle = async () => {
    const element = audio.current;
    if (!element) return;
    if (playing) { element.pause(); return; }
    setError(false); setLoading(true);
    try { await element.play(); } catch { setError(true); } finally { setLoading(false); }
  };
  const stop = () => {
    const element = audio.current;
    if (!element) return;
    element.pause(); element.currentTime = 0; setLoading(false);
  };
  return <div className="space-y-2">
    <div className="flex items-center justify-between gap-3">
      <span className="font-amiri text-lg">الاستماع إلى الأذان</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label={playing ? 'إيقاف الأذان مؤقتاً' : 'تشغيل الأذان'} title={playing ? 'إيقاف مؤقت' : 'تشغيل الأذان'} disabled={loading} onClick={toggle}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" aria-label="إيقاف الأذان" title="إيقاف الأذان" onClick={stop}><Square className="h-4 w-4" /></Button>
      </div>
    </div>
    <audio ref={audio} src={src} preload="none" onPlaying={() => { setPlaying(true); setLoading(false); }} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); stop(); }} onError={() => { setLoading(false); setPlaying(false); setError(true); }} />
    {error && <p role="alert" className="text-sm text-destructive">تعذر تشغيل الأذان. تحقق من اتصال الإنترنت ثم حاول مجدداً.</p>}
  </div>;
}