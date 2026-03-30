import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { nativeSpeak, nativeStop } from '../plugins/tts';

export function useAudio() {
  const { settings } = useStore();
  const readyRef = useRef(false);

  // 初始化：等待原生 TTS 插件就绪
  useEffect(() => {
    // 原生 TTS 插件在 Capacitor.Plugins.Tts 注册后即可使用
    // 如果注册失败，后续 nativeSpeak 会走 fallback
    readyRef.current = true;
    console.log('[useAudio] ready, ttsSpeed:', settings.ttsSpeed);
  }, []);

  const speak = useCallback(
    (word: string) => {
      if (!readyRef.current) {
        console.warn('[useAudio] not ready, skip:', word);
        return;
      }
      nativeSpeak(word, settings.ttsSpeed, 1.1).catch((e) =>
        console.warn('[useAudio] speak error:', e)
      );
    },
    [settings.ttsSpeed]
  );

  const stop = useCallback(() => {
    nativeStop();
  }, []);

  return { speak, stop };
}

export default useAudio;
