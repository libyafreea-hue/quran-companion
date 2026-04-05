import { useState, useRef, useEffect } from "react";
import { Volume2, Play, Pause, Square, Loader2 } from "lucide-react";
import { createAudioController, AudioController } from "@/lib/audioPlayer";
import { Progress } from "@/components/ui/progress";

interface AudioPlayerProps {
  surahNumber: number;
}

const AudioPlayer = ({ surahNumber }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [currentAyah, setCurrentAyah] = useState(0);
  const [totalAyahs, setTotalAyahs] = useState(0);
  const controllerRef = useRef<AudioController | null>(null);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setAudioReady(false);
    setDownloadProgress(null);
    setCurrentAyah(0);
    controllerRef.current?.stop();
    controllerRef.current = null;

    setIsLoading(true);
    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`)
      .then((res) => res.json())
      .then((json) => {
        if (json.code === 200) {
          urlsRef.current = json.data.ayahs.map((a: any) => a.audio);
          setTotalAyahs(json.data.ayahs.length);
          setAudioReady(true);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    return () => {
      controllerRef.current?.stop();
      controllerRef.current = null;
    };
  }, [surahNumber]);

  const startPlaying = async () => {
    if (urlsRef.current.length === 0) return;

    // If paused, resume
    if (isPaused && controllerRef.current) {
      controllerRef.current.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);
    const controller = await createAudioController(urlsRef.current, {
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setDownloadProgress(null);
        setCurrentAyah(0);
        controllerRef.current = null;
      },
      onAyahChange: (index) => {
        setCurrentAyah(index + 1);
        setDownloadProgress(null);
      },
      onDownloadProgress: (percent) => {
        setDownloadProgress(percent);
      },
    });
    controllerRef.current = controller;
    await controller.play();
  };

  const pauseAudio = () => {
    controllerRef.current?.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const stopAudio = () => {
    controllerRef.current?.stop();
    controllerRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
    setDownloadProgress(null);
    setCurrentAyah(0);
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xs">
      <div className="flex items-center gap-2">
        {/* Play / Pause button */}
        <button
          onClick={isPlaying ? pauseAudio : startPlaying}
          disabled={isLoading || !audioReady}
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
            {isLoading
              ? "جاري التحميل..."
              : isPlaying
              ? "إيقاف مؤقت"
              : isPaused
              ? "متابعة"
              : "استماع"}
          </span>
          {isPlaying ? (
            <Volume2 className="w-4 h-4 animate-pulse" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        {/* Stop button - only show when playing or paused */}
        {(isPlaying || isPaused) && (
          <button
            onClick={stopAudio}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity shadow-islamic"
            title="إيقاف كامل"
          >
            <Square className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Download progress */}
      {downloadProgress !== null && downloadProgress < 100 && (
        <div className="w-full space-y-1">
          <Progress value={downloadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            جاري تحميل الآية... {downloadProgress}%
          </p>
        </div>
      )}

      {/* Current ayah indicator */}
      {(isPlaying || isPaused) && currentAyah > 0 && (
        <p className="text-xs text-muted-foreground">
          الآية {currentAyah} من {totalAyahs}
        </p>
      )}
    </div>
  );
};

export default AudioPlayer;
