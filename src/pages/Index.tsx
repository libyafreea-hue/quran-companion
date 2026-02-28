import SurahList from "@/components/SurahList";
import SurahDisplay from "@/components/SurahDisplay";
import AudioPlayer from "@/components/AudioPlayer";
import islamicHeader from "@/assets/islamic-header.jpg";
import islamicBg from "@/assets/islamic-bg-pattern.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div
        className="relative h-48 md:h-56 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${islamicHeader})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/30" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-amiri font-bold text-primary-foreground drop-shadow-lg">
            ختمة القرآن الكريم
          </h1>
          <p className="text-primary-foreground/80 mt-2 text-lg font-amiri">
            اقرأ واستمع إلى القرآن الكريم كاملاً
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6" dir="rtl">
          {/* Right Side - Al-Fatiha */}
          <div className="flex-1 order-1">
            <div
              className="bg-card rounded-xl border border-gold-light p-6 md:p-8 shadow-islamic relative overflow-hidden"
              style={{
                backgroundImage: `url(${islamicBg})`,
                backgroundSize: "300px",
                backgroundRepeat: "repeat",
                backgroundBlendMode: "soft-light",
              }}
            >
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <AudioPlayer surahNumber={1} />
                </div>
                <SurahDisplay surahNumber={1} large />
              </div>
            </div>
          </div>

          {/* Left Side - Surah List */}
          <div className="w-full md:w-80 order-2 h-[calc(100vh-20rem)]">
            <SurahList activeSurah={1} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-border space-y-2">
        <p className="text-sm text-muted-foreground font-amiri">
          ﴿ إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ ﴾
        </p>
      </footer>
    </div>
  );
};

export default Index;
