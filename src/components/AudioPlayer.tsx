import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Loader2 } from "lucide-react";

interface AudioPlayerProps {
  surahNumber: number;
}

const AudioPlayer = ({ surahNumber }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset on surah change
    setIsPlaying(false);
    setCurrentAyahIndex(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsLoading(true);
    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`)
      .then((res) => res.json())
      .then((json) => {
        if (json.code === 200) {
          setAudioUrls(json.data.ayahs.map((a: any) => a.audio));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [surahNumber]);

  const playAudio = () => {
    if (audioUrls.length === 0) return;

    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(audioUrls[currentAyahIndex]);
    audioRef.current = audio;

    audio.onended = () => {
      const nextIndex = currentAyahIndex + 1;
      if (nextIndex < audioUrls.length) {
        setCurrentAyahIndex(nextIndex);
        const nextAudio = new Audio(audioUrls[nextIndex]);
        audioRef.current = nextAudio;
        nextAudio.onended = audio.onended;
        nextAudio.play();
      } else {
        setIsPlaying(false);
        setCurrentAyahIndex(0);
      }
    };

    audio.play();
    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentAyahIndex(0);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isPlaying ? stopAudio : playAudio}
        disabled={isLoading || audioUrls.length === 0}
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
