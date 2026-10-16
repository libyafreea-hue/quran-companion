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
import { useEffect } from "react";
import { refreshPrayerNotifications } from "./lib/prayerNotifications";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        void refreshPrayerNotifications().catch(error => console.warn('Prayer reminders could not be refreshed', error));
      }
    };
    refresh();
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, []);
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
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
