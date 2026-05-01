import { useState } from "react";
import { morningAdhkar, eveningAdhkar, type Dhikr } from "@/data/adhkar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sun, Moon, Bell, BellOff, RotateCcw } from "lucide-react";
import islamicBg from "@/assets/islamic-bg-pattern.jpg";
import {
  requestNotificationPermission,
  scheduleAdhkarReminders,
  scheduleQuranReminder,
  cancelAllReminders,
  getStoredReminderSettings,
  saveReminderSettings,
} from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from "@capacitor/core";
import { showInterstitial } from "@/lib/ads";

type Tab = "morning" | "evening";

const Adhkar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("morning");
  const [settings] = useState(getStoredReminderSettings);
  const [remindersActive, setRemindersActive] = useState(settings.adhkarEnabled);

  const adhkarList = activeTab === "morning" ? morningAdhkar : eveningAdhkar;

  const handleTabChange = async (tab: Tab) => {
    if (tab === activeTab) return;
    await showInterstitial(tab === "morning" ? "morning" : "evening");
    setActiveTab(tab);
  };

  const handleToggleReminders = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast({ title: "التنبيهات متاحة فقط في تطبيق الهاتف", variant: "destructive" });
      return;
    }

    if (remindersActive) {
      await cancelAllReminders();
      saveReminderSettings({ ...settings, adhkarEnabled: false, quranEnabled: false });
      setRemindersActive(false);
      toast({ title: "تم إيقاف التنبيهات" });
    } else {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast({ title: "يرجى السماح بالإشعارات من إعدادات الجهاز", variant: "destructive" });
        return;
      }
      await scheduleAdhkarReminders(settings.morningHour, settings.morningMinute, settings.eveningHour, settings.eveningMinute);
      await scheduleQuranReminder(settings.quranHour, settings.quranMinute);
      saveReminderSettings({ ...settings, adhkarEnabled: true, quranEnabled: true });
      setRemindersActive(true);
      toast({ title: "تم تفعيل التنبيهات اليومية ✅" });
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="gradient-islamic px-4 py-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-primary-foreground">
          <ArrowRight className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-amiri font-bold text-primary-foreground">الأذكار</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleReminders}
          className="text-primary-foreground"
          title={remindersActive ? "إيقاف التنبيهات" : "تفعيل التنبيهات"}
        >
          {remindersActive ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => handleTabChange("morning")}
          className={`flex-1 py-3 text-center font-amiri text-lg font-bold transition-colors flex items-center justify-center gap-2 ${
            activeTab === "morning"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sun className="h-5 w-5" />
          أذكار الصباح
        </button>
        <button
          onClick={() => handleTabChange("evening")}
          className={`flex-1 py-3 text-center font-amiri text-lg font-bold transition-colors flex items-center justify-center gap-2 ${
            activeTab === "evening"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Moon className="h-5 w-5" />
          أذكار المساء
        </button>
      </div>

      {/* Adhkar List */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {adhkarList.map((dhikr) => (
          <DhikrCard key={dhikr.id} dhikr={dhikr} />
        ))}
      </div>
    </div>
  );
};

const DhikrCard = ({ dhikr }: { dhikr: Dhikr }) => {
  const [remaining, setRemaining] = useState(dhikr.count);
  const completed = remaining === 0;

  const handleTap = () => {
    if (remaining > 0) setRemaining((r) => r - 1);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRemaining(dhikr.count);
  };

  return (
    <div
      onClick={handleTap}
      className={`relative rounded-xl border p-5 cursor-pointer select-none transition-all duration-300 overflow-hidden ${
        completed
          ? "border-primary/40 bg-primary/5 opacity-60"
          : "border-gold-light bg-card shadow-islamic hover:shadow-lg active:scale-[0.98]"
      }`}
      style={{
        backgroundImage: completed ? "none" : `url(${islamicBg})`,
        backgroundSize: "300px",
        backgroundRepeat: "repeat",
        backgroundBlendMode: "soft-light",
      }}
    >
      <div className="relative z-10">
        <p className="text-xl leading-[2.2] font-amiri text-foreground text-center mb-4">
          {dhikr.text}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center min-w-[2.5rem] h-10 rounded-full text-lg font-bold px-3 ${
                completed
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent/20 text-accent-foreground"
              }`}
            >
              {completed ? "✓" : remaining}
            </span>
            {!completed && (
              <span className="text-xs text-muted-foreground">/ {dhikr.count}</span>
            )}
            {completed && (
              <button onClick={handleReset} className="text-muted-foreground hover:text-foreground p-1">
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
          {dhikr.reference && (
            <span className="text-xs text-muted-foreground">{dhikr.reference}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Adhkar;
