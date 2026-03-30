import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export function useAudio() {
  const { settings } = useStore();
  const readyRef = useRef(false);

  useEffect(() => {
    readyRef.current = true;
    console.log('[useAudio] TextToSpeech ready, rate:', settings.ttsSpeed);
  }, []);

  const speak = useCallback(
    (word: string) => {
      if (!readyRef.current) {
        console.warn('[useAudio] not ready, skip:', word);
        return;
      }
      TextToSpeech.speak({
        text: word,
        lang: 'en-US',
        rate: settings.ttsSpeed,
      }).catch((e: Error) => {
        console.warn('[useAudio] speak error:', e?.message || String(e));
      });
    },
    [settings.ttsSpeed]
  );

  const stop = useCallback(() => {
    TextToSpeech.stop().catch(() => {});
  }, []);

  return { speak, stop };
}

export default useAudio;
