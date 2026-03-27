import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store';

// Try to import Capacitor TTS plugin
// Note: In Capacitor app, plugin is available via window.Capacitor.Plugins
declare global {
  interface Window {
    Capacitor?: {
      Plugins?: Record<string, any>;
    };
  }
}

let nativeTts: { speak: (opts: any) => Promise<void>; stop: () => Promise<void> } | null = null;

// Initialize native TTS when Capacitor is ready
if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.Tts) {
  nativeTts = (window as any).Capacitor.Plugins.Tts;
  console.log('[useAudio] Native TTS plugin found');
} else {
  console.log('[useAudio] Native TTS not available, using Web Speech API');
}

const TTS_INIT_TIMEOUT = 6000;

export function useAudio() {
  const { settings } = useStore();
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const readyRef = useRef(false);
  const speakQueueRef = useRef<(() => void)[]>([]);

  // Initialize TTS engine once
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const tts = window.speechSynthesis;

    const loadVoices = () => {
      const allVoices = tts.getVoices();
      voicesRef.current = allVoices.filter((v) => v.lang.startsWith('en'));
    };

    // Load immediately (some engines are sync)
    loadVoices();

    // Chrome requires waiting for voiceschanged event
    if (typeof tts.onvoiceschanged !== 'undefined') {
      tts.onvoiceschanged = () => {
        loadVoices();
        if (!readyRef.current && voicesRef.current.length > 0) {
          readyRef.current = true;
          speakQueueRef.current.forEach((fn) => fn());
          speakQueueRef.current = [];
        }
      };
    }

    // Poll until voices are loaded or timeout
    let elapsed = 0;
    const poll = setInterval(() => {
      loadVoices();
      elapsed += 200;
      if (voicesRef.current.length > 0) {
        readyRef.current = true;
        clearInterval(poll);
        speakQueueRef.current.forEach((fn) => fn());
        speakQueueRef.current = [];
      } else if (elapsed >= TTS_INIT_TIMEOUT) {
        clearInterval(poll);
        readyRef.current = true;
      }
    }, 200);

    return () => {
      clearInterval(poll);
      tts.cancel();
    };
  }, []);

  const speak = useCallback(
    async (word: string) => {
      // Try native TTS first (Capacitor plugin)
      if (nativeTts) {
        try {
          await nativeTts.stop();
          await nativeTts.speak({
            text: word,
            rate: Math.max(0.5, Math.min(1.5, settings.ttsSpeed)),
            pitch: 1.1,
            volume: 1.0,
          });
          console.log('[useAudio] Native TTS:', word);
          return;
        } catch (e) {
          console.warn('[useAudio] Native TTS failed, trying Web Speech:', e);
        }
      }

      // Fall back to Web Speech API
      if (!('speechSynthesis' in window)) {
        console.warn('[useAudio] speechSynthesis not available');
        return;
      }

      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = Math.max(0.5, Math.min(1.5, settings.ttsSpeed));
        utterance.pitch = 1.1;
        utterance.volume = 1.0;

        const voices = voicesRef.current;
        const preferredVoice =
          voices.find((v) => v.lang === 'en-US') ||
          voices.find((v) => v.lang === 'en-GB') ||
          voices.find((v) => v.lang.startsWith('en')) ||
          window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        let didError = false;

        utterance.onerror = (_e) => {
          if (didError) return;
          didError = true;
          setTimeout(() => {
            window.speechSynthesis.cancel();
            const retry = new SpeechSynthesisUtterance(word);
            retry.lang = 'en-US';
            retry.rate = Math.max(0.5, Math.min(1.5, settings.ttsSpeed));
            retry.pitch = 1.1;
            if (preferredVoice) retry.voice = preferredVoice;
            window.speechSynthesis.speak(retry);
          }, 150);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[useAudio] speak() threw:', err);
      }
    },
    [settings.ttsSpeed]
  );

  const stop = useCallback(async () => {
    // Stop native TTS first
    if (nativeTts) {
      try {
        await nativeTts.stop();
      } catch (e) {
        // ignore
      }
    }
    // Stop Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
}

export default useAudio;
