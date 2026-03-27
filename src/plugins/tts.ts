/**
 * TTS bridge - currently uses Web Speech API.
 * Can be swapped for a native Capacitor TTS plugin when available.
 */

export async function nativeSpeak(
  text: string,
  rate: number = 1.0,
  pitch: number = 1.1
): Promise<void> {
  if (!('speechSynthesis' in window)) {
    throw new Error('Web Speech API not available');
  }

  return new Promise((resolve, reject) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = Math.max(0.5, Math.min(1.5, rate));
    utterance.pitch = pitch;

    // Try to use a cached voice
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

export function nativeStop(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
