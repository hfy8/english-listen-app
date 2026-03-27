import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store';

const TTS_INIT_TIMEOUT = 6000;

export function useAudio() {
  const { settings } = useStore();
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const readyRef = useRef(false);
  const speakQueueRef = useRef<(() => void)[]>([]);

  // Initialize TTS engine once
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      console.warn('[useAudio] speechSynthesis not available');
      return;
    }

    const tts = window.speechSynthesis;

    const loadVoices = () => {
      try {
        const allVoices = tts.getVoices();
        voicesRef.current = allVoices.filter((v) => v.lang.startsWith('en'));
      } catch (e) {
        console.warn('[useAudio] getVoices failed:', e);
      }
    };

    // Load immediately (some engines are sync)
    try {
      loadVoices();
    } catch (e) {
      console.warn('[useAudio] initial loadVoices failed:', e);
    }

    // Chrome requires waiting for voiceschanged event
    if (typeof tts.onvoiceschanged !== 'undefined') {
      tts.onvoiceschanged = () => {
        try {
          loadVoices();
          if (!readyRef.current && voicesRef.current.length > 0) {
            readyRef.current = true;
            speakQueueRef.current.forEach((fn) => fn());
            speakQueueRef.current = [];
          }
        } catch (e) {
          console.warn('[useAudio] voiceschanged handler failed:', e);
        }
      };
    }

    // Poll until voices are loaded or timeout
    let elapsed = 0;
    const poll = setInterval(() => {
      try {
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
      } catch (e) {
        console.warn('[useAudio] poll failed:', e);
      }
    }, 200);

    return () => {
      try {
        clearInterval(poll);
        tts.cancel();
      } catch (e) {
        console.warn('[useAudio] cleanup failed:', e);
      }
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
        let preferredVoice = null;
        try {
          const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
          preferredVoice =
            voices.find((v) => v.lang === 'en-US') ||
            voices.find((v) => v.lang === 'en-GB') ||
            voices.find((v) => v.lang.startsWith('en'));
        } catch (e) {
          console.warn('[useAudio] voice selection failed:', e);
        }

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        let didError = false;

        utterance.onerror = (_e) => {
          if (didError) return;
          didError = true;
          console.warn('[useAudio] TTS error, retrying...');
          // Android WebView: retry once after a short delay
          setTimeout(() => {
            try {
              window.speechSynthesis.cancel();
              const retry = new SpeechSynthesisUtterance(word);
              retry.lang = 'en-US';
              retry.rate = Math.max(0.5, Math.min(1.5, settings.ttsSpeed));
              retry.pitch = 1.1;
              if (preferredVoice) retry.voice = preferredVoice;
              window.speechSynthesis.speak(retry);
            } catch (e) {
              console.warn('[useAudio] retry failed:', e);
            }
          }, 150);
        };

        window.speechSynthesis.speak(utterance);
        console.log('[useAudio] Speaking:', word);
      } catch (err) {
        console.warn('[useAudio] speak() threw:', err);
      }
    },
    [settings.ttsSpeed]
  );

  const stop = useCallback(() => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn('[useAudio] stop failed:', e);
    }
  }, []);

  return { speak, stop };
}

export default useAudio;
