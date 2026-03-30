import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export function useAudio() {
  const { settings } = useStore();
  const readyRef = useRef(false);

  useEffect(() => {
    readyRef.current = true;
    console.log('[useAudio] ready, ttsSpeed:', settings.ttsSpeed);
  }, []);

  // 本地音频播放（优先）
  const playLocalAudio = (word: string) => {
    const audio = new Audio(`/audio/words/${word}.mp3`);
    audio.play().catch(() => {
      console.warn('[useAudio] local audio failed, fallback to TTS:', word);
      CapacitorTtsFallback(word);
    });
  };

  // Capacitor TTS（Fallback）
  const CapacitorTtsFallback = async (word: string) => {
    try {
      await TextToSpeech.speak({
        text: word,
        lang: 'en-US',
        rate: settings.ttsSpeed,
      });
    } catch (e) {
      console.warn('[useAudio] TTS fallback failed:', e);
    }
  };

  const speak = useCallback(
    (word: string) => {
      if (!readyRef.current) {
        console.warn('[useAudio] not ready, skip:', word);
        return;
      }

      // 先尝试本地音频
      const localPath = `/audio/words/${word}.mp3`;
      fetch(localPath)
        .then((res) => {
          if (res.ok) {
            console.log('[useAudio] Playing local audio:', word);
            playLocalAudio(word);
          } else {
            throw new Error('not found');
          }
        })
        .catch(() => {
          console.log('[useAudio] No local audio, fallback to TTS:', word);
          CapacitorTtsFallback(word);
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
