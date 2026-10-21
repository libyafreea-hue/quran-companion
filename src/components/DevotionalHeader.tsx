import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import islamicHeader from '@/assets/islamic-header.jpg';

export default function DevotionalHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  return <header className="relative overflow-hidden bg-primary text-primary-foreground">
    <img src={islamicHeader} alt="" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-primary/70" />
    <div className="relative mx-auto flex max-w-3xl items-center gap-3 px-4 py-7">
      <Button variant="ghost" size="icon" aria-label="الصفحة الرئيسية" onClick={() => navigate('/')} className="shrink-0 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><ArrowRight /></Button>
      <h1 className="font-amiri text-3xl font-bold">{title}</h1>
    </div>
  </header>;
}