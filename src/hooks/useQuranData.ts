import { useState, useEffect } from "react";

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
}

export interface SurahData {
  number: number;
  name: string;
  ayahs: Ayah[];
}

export function useQuranSurah(surahNumber: number) {
  const [data, setData] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.code === 200) {
          setData({
            number: json.data.number,
            name: json.data.name,
            ayahs: json.data.ayahs.map((a: any) => ({
              number: a.number,
              numberInSurah: a.numberInSurah,
              text: a.text,
            })),
          });
        } else {
          setError("فشل تحميل السورة");
        }
      })
      .catch(() => setError("فشل الاتصال بالخادم"))
      .finally(() => setLoading(false));
  }, [surahNumber]);

  return { data, loading, error };
}

export function useQuranAudio(surahNumber: number) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Using Mishary Alafasy recitation
    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`)
      .then((res) => res.json())
      .then((json) => {
        if (json.code === 200 && json.data.ayahs?.length > 0) {
          // Get the first ayah's audio to find the base URL pattern
          setAudioUrl(json.data.ayahs[0].audio);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [surahNumber]);

  return { audioUrl, loading };
}
