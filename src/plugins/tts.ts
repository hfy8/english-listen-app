/**
 * Capacitor TTS Plugin bridge
 * Uses native Android TextToSpeech when available, falls back to Web Speech API.
 */

import { registerPlugin } from '@capacitor/core';

interface TtsPlugin {
  speak(options: { text: string; rate?: number; pitch?: number }): Promise<{ value: boolean }>;
  stop(): Promise<{ value: boolean }>;
  isSpeaking(): Promise<{ value: boolean }>;
}

const TtsNative = registerPlugin<TtsPlugin>('Tts');

export async function nativeSpeak(
  text: string,
  rate: number = 1.0,
  pitch: number = 1.1
): Promise<void> {
  if (!TtsNative) {
    return fallbackSpeak(text, rate, pitch);
  }

  try {
    await TtsNative.speak({ text, rate, pitch });
  } catch (err) {
    console.warn('[Tts] Native TTS failed, using fallback:', err);
    await fallbackSpeak(text, rate, pitch);
  }
}

export function nativeStop(): void {
  if (TtsNative) {
    TtsNative.stop().catch(() => {
      fallbackStop();
    });
  } else {
    fallbackStop();
  }
}

async function fallbackSpeak(text: string, rate: number, pitch: number): Promise<void> {
  if (!('speechSynthesis' in window)) {
    throw new Error('No TTS available');
  }

  return new Promise((resolve, reject) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = Math.max(0.5, Math.min(1.5, rate));
    utterance.pitch = pitch;

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

function fallbackStop(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
