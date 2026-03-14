import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Loader2 } from "lucide-react";
import { createAudioController, AudioController } from "@/lib/audioPlayer";

interface AudioPlayerProps {
  surahNumber: number;
}

const AudioPlayer = ({ surahNumber }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const controllerRef = useRef<AudioController | null>(null);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    // Reset on surah change
    setIsPlaying(false);
    setAudioReady(false);
    controllerRef.current?.stop();
    controllerRef.current = null;

    setIsLoading(true);
    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`)
      .then((res) => res.json())
      .then((json) => {
        if (json.code === 200) {
          urlsRef.current = json.data.ayahs.map((a: any) => a.audio);
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
      return;
    }

    setIsPlaying(true);
    const controller = await createAudioController(
      urlsRef.current,
      () => {
        setIsPlaying(false);
        controllerRef.current = null;
      }
    );
    controllerRef.current = controller;
    await controller.play();
  };

  const stopAudio = () => {
    controllerRef.current?.stop();
    controllerRef.current = null;
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-2">
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
    </div>
  );
};

export default AudioPlayer;
