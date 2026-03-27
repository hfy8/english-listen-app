import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store';

export function useAudio() {
  const { settings } = useStore();
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Load English voices - must handle async loading across browsers
  useEffect(() => {
    const loadVoices = () => {
      if (!('speechSynthesis' in window)) return;
      const allVoices = window.speechSynthesis.getVoices();
      voicesRef.current = allVoices.filter((v) => v.lang.startsWith('en'));
    };

    // Try immediately
    loadVoices();

    // Some browsers (Chrome desktop/Android) load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        loadVoices();
      };
    }

    // Fallback: poll for up to 3s
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
      if (!('speechSynthesis' in window)) {
        console.warn('[useAudio] speechSynthesis not available');
        return;
      }

      // Cancel any pending speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = settings.ttsSpeed;
      utterance.pitch = 1.1;

      // Try to use a cached English voice; fall back to any available voice
      const cachedVoice = voicesRef.current.find(
        (v) => v.lang === 'en-US' || v.lang === 'en-GB'
      ) || voicesRef.current[0];

      if (cachedVoice) {
        utterance.voice = cachedVoice;
      }

      utterance.onerror = (e) => {
        console.warn('[useAudio] TTS error:', e.error);
      };

      window.speechSynthesis.speak(utterance);
    },
    [settings.ttsSpeed]
  );

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
}

export default useAudio;
