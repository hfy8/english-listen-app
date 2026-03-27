import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store';

const TTS_INIT_TIMEOUT = 6000; // ms to wait for TTS engine to init

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
        // Flush queued speak calls once voices are ready
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
        // Give up waiting — still allow speak attempts (system TTS may work without explicit voices)
        readyRef.current = true;
      }
    }, 200);

    return () => {
      clearInterval(poll);
      tts.cancel();
    };
  }, []);

  const speak = useCallback(
    (word: string) => {
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

        // Select best available English voice
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
          // Android WebView: retry once after a short delay
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

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
}

export default useAudio;
