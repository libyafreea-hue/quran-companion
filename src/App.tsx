import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SurahReader from "./pages/SurahReader";
import Adhkar from "./pages/Adhkar";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import PrayerTimesPage from "./pages/PrayerTimes";
import Tasbih from "./pages/Tasbih";
import QiblaPage from "./pages/Qibla";
import { useEffect, useState } from "react";
import { refreshPrayerNotifications } from "./lib/prayerNotifications";
import { loadPrayerSettings } from "./lib/prayerTimes";
import { Button } from "./components/ui/button";

const queryClient = new QueryClient();

const App = () => {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoadError(false);
    void loadPrayerSettings().then(() => {
      if (active) setReady(true);
    }).catch(() => {
      if (active) setLoadError(true);
    });
    return () => { active = false; };
  }, [attempt]);
  useEffect(() => {
    if (!ready) return;
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        void refreshPrayerNotifications().catch(error => console.warn('Prayer reminders could not be refreshed', error));
      }
    };
    refresh();
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, [ready]);
  if (!ready) return <main dir="rtl" className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
    <p role={loadError ? 'alert' : 'status'}>{loadError ? 'تعذر استعادة الإعدادات المحفوظة.' : 'جارٍ استعادة الإعدادات…'}</p>
    {loadError && <Button onClick={() => setAttempt(value => value + 1)}>إعادة المحاولة</Button>}
  </main>;
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/surah/:id" element={<SurahReader />} />
          <Route path="/adhkar" element={<Adhkar />} />
          <Route path="/prayer-times" element={<PrayerTimesPage />} />
          <Route path="/tasbih" element={<Tasbih />} />
          <Route path="/qibla" element={<QiblaPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
