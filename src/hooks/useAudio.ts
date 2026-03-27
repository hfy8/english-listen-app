import { useCallback } from 'react';
import { useStore } from '../store';

export function useAudio() {
  const { settings } = useStore();

  const speak = useCallback(
    (word: string) => {
      if (!('speechSynthesis' in window)) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = settings.ttsSpeed;
      utterance.pitch = 1.1;

      // Try to get a good English voice
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.lang === 'en-US' || v.lang === 'en-GB')
      );
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
    // Use a pleasant success tone via Web Audio API if needed
    // For now we rely on visual feedback
  }, [settings.sound]);

  return { speak, stop, playSuccess };
}

export default useAudio;
