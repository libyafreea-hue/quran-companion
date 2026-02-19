import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Loader2 } from "lucide-react";

interface AudioPlayerProps {
  surahNumber: number;
}

const AudioPlayer = ({ surahNumber }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);
  const audioUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    // Reset on surah change
    setIsPlaying(false);
    indexRef.current = 0;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsLoading(true);
    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`)
      .then((res) => res.json())
      .then((json) => {
        if (json.code === 200) {
          const urls = json.data.ayahs.map((a: any) => a.audio);
          setAudioUrls(urls);
          audioUrlsRef.current = urls;
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [surahNumber]);

  const playNextAyah = (index: number) => {
    const urls = audioUrlsRef.current;
    if (index >= urls.length) {
      setIsPlaying(false);
      indexRef.current = 0;
      return;
    }

    const audio = new Audio(urls[index]);
    audioRef.current = audio;
    indexRef.current = index;

    audio.onended = () => {
      playNextAyah(index + 1);
    };

    audio.play().catch(() => {
      setIsPlaying(false);
    });
  };

  const playAudio = () => {
    if (audioUrlsRef.current.length === 0) return;

    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    playNextAyah(indexRef.current);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    indexRef.current = 0;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isPlaying ? stopAudio : playAudio}
        disabled={isLoading || audioUrlsRef.current.length === 0}
        className="flex items-center gap-2 px-4 py-2 rounded-full gradient-islamic text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shadow-islamic"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
        <span className="text-sm font-bold">
          {isLoading ? "جاري التحميل..." : isPlaying ? "إيقاف" : "استماع"}
        </span>
        {isPlaying ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default AudioPlayer;
