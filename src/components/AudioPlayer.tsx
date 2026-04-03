import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Loader2 } from "lucide-react";
import { createAudioController, AudioController } from "@/lib/audioPlayer";
import { Progress } from "@/components/ui/progress";

interface AudioPlayerProps {
  surahNumber: number;
}

const AudioPlayer = ({ surahNumber }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [currentAyah, setCurrentAyah] = useState(0);
  const [totalAyahs, setTotalAyahs] = useState(0);
  const controllerRef = useRef<AudioController | null>(null);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    setIsPlaying(false);
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

  const playAudio = async () => {
    if (urlsRef.current.length === 0) return;

    if (controllerRef.current && isPlaying) {
      controllerRef.current.stop();
      controllerRef.current = null;
      setIsPlaying(false);
      setDownloadProgress(null);
      return;
    }

    setIsPlaying(true);
    const controller = await createAudioController(urlsRef.current, {
      onEnd: () => {
        setIsPlaying(false);
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

  const stopAudio = () => {
    controllerRef.current?.stop();
    controllerRef.current = null;
    setIsPlaying(false);
    setDownloadProgress(null);
    setCurrentAyah(0);
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xs">
      <button
        onClick={isPlaying ? stopAudio : playAudio}
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
          {isLoading ? "جاري التحميل..." : isPlaying ? "إيقاف" : "استماع"}
        </span>
        {isPlaying ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>

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
      {isPlaying && currentAyah > 0 && (
        <p className="text-xs text-muted-foreground">
          الآية {currentAyah} من {totalAyahs}
        </p>
      )}
    </div>
  );
};

export default AudioPlayer;
