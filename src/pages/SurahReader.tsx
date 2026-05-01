import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuranSurah } from "@/hooks/useQuranData";
import { surahs } from "@/data/surahs";
import AudioPlayer from "@/components/AudioPlayer";
import SurahList from "@/components/SurahList";
import { ChevronRight, ChevronLeft, Home, Loader2, Menu, X } from "lucide-react";
import islamicHeader from "@/assets/islamic-header.jpg";
import { showInterstitial } from "@/lib/ads";

const AYAHS_PER_PAGE = 10;

const SurahReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const surahNumber = parseInt(id || "1");
  const { data, loading, error } = useQuranSurah(surahNumber);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSidebar, setShowSidebar] = useState(false);
  const surahInfo = surahs.find((s) => s.number === surahNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [surahNumber]);

  const totalPages = data ? Math.ceil(data.ayahs.length / AYAHS_PER_PAGE) : 0;
  const currentAyahs = data
    ? data.ayahs.slice(
        (currentPage - 1) * AYAHS_PER_PAGE,
        currentPage * AYAHS_PER_PAGE
      )
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="relative h-32 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${islamicHeader})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
        <div className="relative z-10 text-center">
          <h1 className="text-3xl font-amiri font-bold text-primary-foreground drop-shadow-lg">
            سورة {surahInfo?.name}
          </h1>
        </div>
        <button
          onClick={async () => {
            await showInterstitial("home");
            navigate("/");
          }}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
        >
          <Home className="w-5 h-5" />
        </button>
        <button
          onClick={async () => {
            const opening = !showSidebar;
            if (opening) await showInterstitial("menu");
            setShowSidebar(opening);
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
        >
          {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex relative">
        {/* Sidebar */}
        <div
          className={`fixed top-32 right-0 h-[calc(100vh-8rem)] w-72 z-20 transition-transform duration-300 ${
            showSidebar ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <SurahList activeSurah={surahNumber} />
        </div>

        {/* Overlay */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-foreground/30 z-10 top-32"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 max-w-4xl mx-auto px-4 py-6">
          {/* Audio player */}
          <div className="flex justify-center mb-6">
            <AudioPlayer surahNumber={surahNumber} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-muted-foreground">{error}</div>
          ) : (
            <div className="animate-fade-in" dir="rtl">
              {/* Bismillah */}
              {surahNumber !== 1 && surahNumber !== 9 && currentPage === 1 && (
                <p className="text-center font-amiri text-2xl text-gold-dark mb-8">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              )}

              {/* Ayahs */}
              <div className="bg-card rounded-xl border border-gold-light p-6 shadow-islamic mb-6">
                <div className="quran-text text-2xl leading-[3.2]">
                  {currentAyahs.map((ayah) => (
                    <span key={ayah.number}>
                      <span>{ayah.text}</span>
                      <span className="ayah-number">{ayah.numberInSurah}</span>{" "}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-4 mt-6" dir="ltr">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm">السابق</span>
                </button>
                <span className="text-sm text-muted-foreground font-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  <span className="text-sm">التالي</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Page info */}
              <p className="text-center text-xs text-muted-foreground mt-3">
                الآيات {(currentPage - 1) * AYAHS_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * AYAHS_PER_PAGE, data?.ayahs.length || 0)} من{" "}
                {data?.ayahs.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurahReader;
