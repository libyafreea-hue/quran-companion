import { useEffect, useState } from 'react';
import { Minus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import DevotionalHeader from '@/components/DevotionalHeader';
import { incrementTasbih, readTasbih, TASBIH_KEY } from '@/lib/tasbih';

export default function Tasbih() {
  const [count, setCount] = useState(readTasbih);
  const [dhikr, setDhikr] = useState('سبحان الله');
  const [reset, setReset] = useState(false);
  useEffect(() => { try { localStorage.setItem(TASBIH_KEY, String(count)); } catch { /* Counting remains usable without storage. */ } }, [count]);
  return <div className="min-h-screen bg-background" dir="rtl">
    <DevotionalHeader title="السبحة الإلكترونية" />
    <main className="mx-auto max-w-xl px-4 py-8 text-center">
      <div className="mx-auto mb-8 max-w-xs"><Select value={dhikr} onValueChange={setDhikr} dir="rtl"><SelectTrigger aria-label="الذكر"><SelectValue /></SelectTrigger><SelectContent>{['سبحان الله', 'الحمد لله', 'الله أكبر', 'لا إله إلا الله', 'أستغفر الله', 'اللهم صلِّ على محمد'].map(text => <SelectItem key={text} value={text}>{text}</SelectItem>)}</SelectContent></Select></div>
      <p className="mb-6 font-amiri text-3xl text-primary">{dhikr}</p>
      <Button onClick={() => setCount(incrementTasbih)} aria-label="تسبيح" className="h-64 w-64 max-w-full flex-col gap-3 rounded-full border-8 border-gold-light shadow-islamic active:scale-95 motion-reduce:transform-none">
        <span className="max-w-full break-all text-5xl tabular-nums" aria-live="polite">{count.toLocaleString('ar-LY')}</span>
        <span className="text-xl">تسبيح</span>
      </Button>
      <div className="mt-8 flex justify-center gap-5">
        <Button variant="outline" size="icon" aria-label="تراجع عن تسبيحة" title="تراجع عن تسبيحة" disabled={count === 0} onClick={() => setCount(c => Math.max(0, c - 1))}><Minus /></Button>
        <Button variant="outline" size="icon" aria-label="تصفير العداد" title="تصفير العداد" disabled={count === 0} onClick={() => setReset(true)}><RotateCcw /></Button>
      </div>
      <AlertDialog open={reset} onOpenChange={setReset}><AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>تصفير العداد؟</AlertDialogTitle><AlertDialogDescription>سيعود عدد التسبيحات إلى صفر.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => setCount(0)}>تصفير</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </main>
  </div>;
}