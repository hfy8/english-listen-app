import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store';

export function useAudio() {
  const { settings } = useStore();
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const speakingRef = useRef(false);

  // Load voices - must wait for onvoiceschanged on first load
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      voicesRef.current = voices.filter(
        (v) => v.lang.startsWith('en')
      );
    };

    // getVoices() is synchronous after voices are loaded
    loadVoices();

    // Some browsers require waiting for voiceschanged event
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        loadVoices();
      };
    }

    // Fallback: try again after a short delay in case voices weren't ready
    const timer = setTimeout(() => {
      loadVoices();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const speak = useCallback(
    (word: string) => {
      if (!('speechSynthesis' in window)) {
        console.warn('[useAudio] speechSynthesis not available');
        return;
      }

      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = settings.ttsSpeed;
        utterance.pitch = 1.1;

        // Try to find a good English voice from cached list
        const enVoice = voicesRef.current.find(
          (v) => v.lang === 'en-US' || v.lang === 'en-GB'
        ) || voicesRef.current.find((v) => v.lang.startsWith('en'));

        if (enVoice) {
          utterance.voice = enVoice;
        }

        utterance.onerror = (e) => {
          console.warn('[useAudio] TTS error:', e.error);
        };

        window.speechSynthesis.speak(utterance);
        speakingRef.current = true;
      } catch (err) {
        console.warn('[useAudio] speak() failed:', err);
      }
    },
    [settings.ttsSpeed]
  );

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      speakingRef.current = false;
    }
  }, []);

  return { speak, stop };
}

export default useAudio;
