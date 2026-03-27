import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store';

export function useAudio() {
  const { settings } = useStore();
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Load voices and keep them cached
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      voicesRef.current = voices.filter(
        (v) => v.lang.startsWith('en') && (v.lang === 'en-US' || v.lang === 'en-GB' || v.lang === 'en')
      );
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback(
    (word: string) => {
      if (!('speechSynthesis' in window)) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = settings.ttsSpeed;
      utterance.pitch = 1.1;

      // Use cached voices (loaded async)
      const enVoice = voicesRef.current.find(
        (v) => v.lang === 'en-US' || v.lang === 'en-GB'
      ) || voicesRef.current[0];
      if (enVoice) utterance.voice = enVoice;

      window.speechSynthesis.speak(utterance);
    },
    [settings.ttsSpeed]
  );

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const playSuccess = useCallback(() => {
    if (!settings.sound) return;
  }, [settings.sound]);

  return { speak, stop, playSuccess };
}

export default useAudio;
