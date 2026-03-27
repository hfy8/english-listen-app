/**
 * Capacitor TTS Plugin bridge
 * Tries native Android TextToSpeech first, falls back to Web Speech API.
 */

import { registerPlugin } from '@capacitor/core';

interface TtsPlugin {
  speak(options: { text: string; rate?: number; pitch?: number }): Promise<{ value: boolean }>;
  stop(): Promise<{ value: boolean }>;
  isSpeaking(): Promise<{ value: boolean }>;
}

let TtsNative: TtsPlugin | null = null;
let ttsInitAttempted = false;

function getNativePlugin(): TtsPlugin | null {
  if (ttsInitAttempted) return TtsNative;
  ttsInitAttempted = true;
  try {
    TtsNative = registerPlugin<TtsPlugin>('Tts');
  } catch (e) {
    // Plugin not registered - will use Web Speech API only
    console.warn('[Tts] Native plugin not found:', e);
  }
  return TtsNative;
}

export async function nativeSpeak(
  text: string,
  rate: number = 1.0,
  pitch: number = 1.1
): Promise<void> {
  const plugin = getNativePlugin();

  if (plugin) {
    try {
      await plugin.speak({ text, rate, pitch });
      return; // Success via native
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || String(err);

      // NOT_READY means TTS engine not yet init — retry once after delay
      if (code === 'NOT_READY' || msg.includes('not ready')) {
        console.warn('[Tts] Native TTS not ready, retrying...');
        await new Promise((r) => setTimeout(r, 500));
        try {
          await plugin.speak({ text, rate, pitch });
          return;
        } catch (retryErr) {
          console.warn('[Tts] Native TTS retry failed, falling back:', retryErr);
        }
      } else {
        console.warn('[Tts] Native TTS error, falling back:', msg);
      }
    }
  }

  // Fallback to Web Speech API
  await fallbackSpeak(text, rate, pitch);
}

export function nativeStop(): void {
  const plugin = getNativePlugin();
  if (plugin) {
    plugin.stop().catch(() => fallbackStop());
  } else {
    fallbackStop();
  }
}

async function fallbackSpeak(text: string, rate: number, pitch: number): Promise<void> {
  if (!('speechSynthesis' in window)) {
    throw new Error('No TTS available on this device');
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
