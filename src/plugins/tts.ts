/**
 * Capacitor TTS Plugin bridge with debugging
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

// Debug: detect environment
const isAndroid = typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);
const isCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor;
const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;
console.log('[Tts] Environment:', { isAndroid, isCapacitor, hasSpeechSynthesis, userAgent: navigator.userAgent });

function getNativePlugin(): TtsPlugin | null {
  if (ttsInitAttempted) return TtsNative;
  ttsInitAttempted = true;
  try {
    TtsNative = registerPlugin<TtsPlugin>('Tts');
    console.log('[Tts] Native plugin registered:', !!TtsNative);
  } catch (e) {
    console.warn('[Tts] Native plugin registration failed:', e);
  }
  return TtsNative;
}

export async function nativeSpeak(
  text: string,
  rate: number = 1.0,
  pitch: number = 1.1
): Promise<void> {
  console.log('[Tts] nativeSpeak called with:', { text, rate, pitch, isAndroid, isCapacitor });

  const plugin = getNativePlugin();
  console.log('[Tts] Plugin resolved:', !!plugin, 'plugin:', plugin);

  if (plugin) {
    try {
      console.log('[Tts] Trying native TTS...');
      await plugin.speak({ text, rate, pitch });
      console.log('[Tts] Native TTS success');
      return;
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || String(err);
      console.warn('[Tts] Native TTS failed:', { code, msg });

      if (code === 'NOT_READY' || msg.includes('not ready')) {
        console.warn('[Tts] TTS not ready, retrying after 500ms...');
        await new Promise((r) => setTimeout(r, 500));
        try {
          await plugin.speak({ text, rate, pitch });
          console.log('[Tts] Native TTS retry success');
          return;
        } catch (retryErr) {
          console.warn('[Tts] Native TTS retry failed:', retryErr);
        }
      }
    }
  } else {
    console.warn('[Tts] No native plugin available, using Web Speech API');
  }

  // Fallback to Web Speech API
  await fallbackSpeak(text, rate, pitch);
}

export function nativeStop(): void {
  console.log('[Tts] nativeStop called');
  const plugin = getNativePlugin();
  if (plugin) {
    plugin.stop().catch(() => fallbackStop());
  } else {
    fallbackStop();
  }
}

async function fallbackSpeak(text: string, rate: number, pitch: number): Promise<void> {
  console.log('[Tts] fallbackSpeak called, hasSpeechSynthesis:', hasSpeechSynthesis);

  if (!hasSpeechSynthesis) {
    console.error('[Tts] Web Speech API not available!');
    throw new Error('No TTS available on this device');
  }

  return new Promise((resolve, reject) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = Math.max(0.5, Math.min(1.5, rate));
    utterance.pitch = pitch;

    // Try cached voices first
    let voices = window.speechSynthesis.getVoices();
    console.log('[Tts] Voices available:', voices.length, voices.map(v => v.lang));
    const enVoice =
      voices.find((v) => v.lang === 'en-US') ||
      voices.find((v) => v.lang.startsWith('en'));
    if (enVoice) {
      utterance.voice = enVoice;
      console.log('[Tts] Using voice:', enVoice.name, enVoice.lang);
    } else {
      console.warn('[Tts] No English voice found, using default');
    }

    utterance.onend = () => {
      console.log('[Tts] Fallback TTS ended successfully');
      resolve();
    };
    utterance.onerror = (e) => {
      console.error('[Tts] Fallback TTS error:', e.error);
      reject(new Error(e.error));
    };

    console.log('[Tts] Starting fallback speech synthesis for:', text);
    window.speechSynthesis.speak(utterance);
  });
}

function fallbackStop(): void {
  if (hasSpeechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
