package com.english.listen;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.english.listen.tts.TtsPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // 手动注册 TTS 原生插件（speechSynthesis 在 Android WebView 不可用）
        this.registerPlugin(TtsPlugin.class);
    }
}
