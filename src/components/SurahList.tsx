import { surahs, SurahInfo } from "@/data/surahs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface SurahListProps {
  activeSurah?: number;
}

const SurahList = ({ activeSurah }: SurahListProps) => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-gold-light shadow-islamic overflow-hidden">
      <div className="gradient-islamic px-4 py-3 text-center">
        <h2 className="text-lg font-bold text-primary-foreground font-amiri">فهرس السور</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {surahs.map((surah) => (
            <SurahItem
              key={surah.number}
              surah={surah}
              isActive={activeSurah === surah.number}
              onClick={() => navigate(`/surah/${surah.number}`)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const SurahItem = ({
  surah,
  isActive,
  onClick,
}: {
  surah: SurahInfo;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-right transition-all duration-200 group ${
        isActive
          ? "bg-primary text-primary-foreground shadow-md"
          : "hover:bg-muted"
      }`}
      dir="rtl"
    >
      <span
        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2 shrink-0 ${
          isActive
            ? "border-primary-foreground text-primary-foreground"
            : "border-gold text-gold-dark"
        }`}
      >
        {surah.number}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-bold font-amiri text-base truncate">{surah.name}</p>
        <p
          className={`text-xs ${
            isActive ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {surah.revelationType} • {surah.ayahCount} آيات
        </p>
      </div>
    </button>
  );
};

export default SurahList;
