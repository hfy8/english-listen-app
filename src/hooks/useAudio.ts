import { useCallback, useEffect, useRef } from 'react';
import { nativeSpeak, nativeStop } from '../plugins/tts';
import { useStore } from '../store';

export function useAudio() {
  const { settings } = useStore();
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Pre-load Web Speech API voices (used as fallback)
  useEffect(() => {
    const loadVoices = () => {
      if (!('speechSynthesis' in window)) return;
      const allVoices = window.speechSynthesis.getVoices();
      voicesRef.current = allVoices.filter((v) => v.lang.startsWith('en'));
    };

    loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Poll for voices for up to 3s
    let attempts = 0;
    const interval = setInterval(() => {
      loadVoices();
      attempts++;
      if (voicesRef.current.length > 0 || attempts >= 6) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const speak = useCallback(
    (word: string) => {
      // Prefer native Android TTS; falls back to Web Speech API automatically
      nativeSpeak(word, settings.ttsSpeed, 1.1).catch((err) => {
        console.warn('[useAudio] speak() failed:', err);
      });
    },
    [settings.ttsSpeed]
  );

  const stop = useCallback(() => {
    nativeStop();
  }, []);

  return { speak, stop };
}

export default useAudio;
