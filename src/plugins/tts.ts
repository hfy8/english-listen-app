/**
 * Capacitor TTS Plugin bridge
 * Works with Capacitor 8 native Android TextToSpeech plugin, falls back to Web Speech API.
 */

import { registerPlugin } from '@capacitor/core';

interface TtsPlugin {
  speak(options: { text: string; rate?: number; pitch?: number }): Promise<{ value: boolean }>;
  stop(): Promise<{ value: boolean }>;
  isSpeaking(): Promise<{ value: boolean }>;
}

// Try to get the native plugin via Capacitor.Plugins first (Capacitor 8 auto-discovery)
function getNativePlugin(): TtsPlugin | null {
  try {
    // Capacitor 8: plugins are auto-discovered and added to Capacitor.Plugins
    const cap = (window as any).Capacitor;
    console.log('[Tts] Capacitor object:', Object.keys(cap || {}));
    console.log('[Tts] Capacitor.Plugins:', Object.keys(cap?.Plugins || {}));
    if (cap?.Plugins?.Tts) {
      console.log('[Tts] Found Tts in Capacitor.Plugins.Tts');
      return cap.Plugins.Tts as TtsPlugin;
    }
  } catch (e) {
    console.warn('[Tts] Capacitor.Plugins.Tts not found:', e);
  }

  // Fallback: try registerPlugin (older Capacitor style)
  try {
    return registerPlugin<TtsPlugin>('Tts');
  } catch (e) {
    console.warn('[Tts] registerPlugin failed:', e);
    return null;
  }
}

let _nativePlugin: TtsPlugin | null | 'pending' = 'pending';

function getPlugin(): TtsPlugin | null {
  if (_nativePlugin !== 'pending') return _nativePlugin as TtsPlugin | null;
  _nativePlugin = getNativePlugin();
  return _nativePlugin;
}

export async function nativeSpeak(
  text: string,
  rate: number = 1.0,
  pitch: number = 1.1
): Promise<void> {
  console.log('[Tts] nativeSpeak called, text:', text, 'rate:', rate);

  const plugin = getPlugin();
  console.log('[Tts] Plugin resolved:', !!plugin);

  if (plugin) {
    try {
      await plugin.speak({ text, rate, pitch });
      console.log('[Tts] Native TTS success');
      return;
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || String(err);
      console.warn('[Tts] Native TTS error:', { code, msg });

      if (code === 'NOT_READY' || msg.includes('not ready')) {
        await new Promise((r) => setTimeout(r, 500));
        try {
          await plugin.speak({ text, rate, pitch });
          console.log('[Tts] Native TTS retry success');
          return;
        } catch (retryErr) {
          console.warn('[Tts] Native retry failed:', retryErr);
        }
      }
    }
  } else {
    console.warn('[Tts] No native plugin available');
  }

  // Fallback to Web Speech API
  await fallbackSpeak(text, rate, pitch);
}

export function nativeStop(): void {
  const plugin = getPlugin();
  if (plugin) {
    plugin.stop().catch(() => fallbackStop());
  } else {
    fallbackStop();
  }
}

async function fallbackSpeak(text: string, rate: number, pitch: number): Promise<void> {
  console.log('[Tts] Using Web Speech API fallback');
  if (!('speechSynthesis' in window)) {
    console.error('[Tts] Web Speech API not available');
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
      console.log('[Tts] Using voice:', enVoice.name);
    }

    utterance.onend = () => { console.log('[Tts] Fallback TTS ended'); resolve(); };
    utterance.onerror = (e) => { console.error('[Tts] Fallback TTS error:', e.error); reject(new Error(e.error)); };

    window.speechSynthesis.speak(utterance);
  });
}

function fallbackStop(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
