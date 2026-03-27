/**
 * Capacitor TTS Plugin - wraps native Android TextToSpeech
 * Falls back to Web Speech API if native plugin unavailable.
 */

import { registerPlugin } from '@capacitor/core';
import type { Plugin } from '@capacitor/core';

interface TtsPluginInterface extends Plugin {
  speak(options: { text: string; rate?: number; pitch?: number }): Promise<void>;
  stop(): Promise<void>;
  isSpeaking(): Promise<{ value: boolean }>;
}

const TtsNative: TtsPluginInterface | undefined = registerPlugin('Tts');

/**
 * Speak text using native Android TTS engine.
 * Falls back to Web Speech API if native plugin is not available.
 */
export function nativeSpeak(
  text: string,
  rate: number = 1.0,
  pitch: number = 1.1
): Promise<void> {
  if (TtsNative) {
    return TtsNative.speak({ text, rate, pitch }).catch((err) => {
      console.warn('[Tts] Native TTS failed, falling back to Web Speech API:', err);
      return webSpeechSpeak(text, rate, pitch);
    });
  }
  return webSpeechSpeak(text, rate, pitch);
}

export function nativeStop(): void {
  if (TtsNative) {
    TtsNative.stop().catch(() => {
      webSpeechStop();
    });
  } else {
    webSpeechStop();
  }
}

/**
 * Web Speech API fallback
 */
function webSpeechSpeak(text: string, rate: number, pitch: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Web Speech API not available'));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const enVoice =
      voices.find((v) => v.lang === 'en-US') ||
      voices.find((v) => v.lang.startsWith('en'));
    if (enVoice) {
      utterance.voice = enVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(new Error(e.error));

    window.speechSynthesis.speak(utterance);
  });
}

function webSpeechStop(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
