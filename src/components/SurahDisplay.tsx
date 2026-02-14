import { useQuranSurah } from "@/hooks/useQuranData";
import { surahs } from "@/data/surahs";
import { Loader2 } from "lucide-react";

interface SurahDisplayProps {
  surahNumber: number;
  large?: boolean;
}

const SurahDisplay = ({ surahNumber, large = false }: SurahDisplayProps) => {
  const { data, loading, error } = useQuranSurah(surahNumber);
  const surahInfo = surahs.find((s) => s.number === surahNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="animate-fade-in" dir="rtl">
      {/* Surah header */}
      <div className="text-center mb-6">
        <div className="inline-block px-8 py-3 gradient-islamic rounded-xl shadow-islamic">
          <h2 className={`font-amiri text-primary-foreground font-bold ${large ? "text-3xl" : "text-2xl"}`}>
            سورة {surahInfo?.name}
          </h2>
          <p className="text-primary-foreground/70 text-sm mt-1">
            {surahInfo?.revelationType} • {surahInfo?.ayahCount} آيات
          </p>
        </div>
      </div>

      {/* Bismillah */}
      {surahNumber !== 1 && surahNumber !== 9 && (
        <p className="text-center font-amiri text-2xl text-gold-dark mb-6">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
      )}

      {/* Ayahs */}
      <div className={`quran-text ${large ? "text-2xl leading-[3.2]" : ""}`}>
        {data.ayahs.map((ayah) => (
          <span key={ayah.number}>
            <span>{ayah.text}</span>
            <span className="ayah-number">{ayah.numberInSurah}</span>{" "}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SurahDisplay;
