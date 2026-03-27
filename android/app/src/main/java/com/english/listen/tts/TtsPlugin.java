package com.english.listen.tts;

import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.HashMap;
import java.util.Locale;
import java.util.UUID;

@CapacitorPlugin(name = "Tts")
public class TtsPlugin extends Plugin {

    private TextToSpeech tts;
    private boolean isInitialized = false;
    private static final String TAG = "TtsPlugin";

    @Override
    public void load() {
        super.load();
        initTts();
    }

    private void initTts() {
        tts = new TextToSpeech(getContext(), new TextToSpeech.OnInitListener() {
            @Override
            public void onInit(int status) {
                if (status == TextToSpeech.SUCCESS) {
                    int result = tts.setLanguage(Locale.US);
                    if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                        Log.e(TAG, "English language not supported on this device");
                    } else {
                        isInitialized = true;
                        Log.d(TAG, "TTS initialized successfully");
                    }
                } else {
                    Log.e(TAG, "TTS initialization failed with status: " + status);
                }
            }
        });
    }

    @PluginMethod
    public void speak(PluginCall call) {
        if (!isInitialized) {
            call.error("TTS not initialized");
            return;
        }

        String text = call.getString("text", "");
        if (text == null || text.isEmpty()) {
            call.error("text is required");
            return;
        }

        float rate = (float) call.getDouble("rate", 1.0);
        float pitch = (float) call.getDouble("pitch", 1.0);

        tts.setSpeechRate(rate);
        tts.setPitch(pitch);

        String utteranceId = UUID.randomUUID().toString();

        HashMap<String, String> params = new HashMap<>();
        params.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId);

        int result = tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId);

        if (result == TextToSpeech.SUCCESS) {
            call.success();
        } else {
            call.error("TTS speak failed");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (tts != null) {
            tts.stop();
        }
        call.success();
    }

    @PluginMethod
    public void isSpeaking(PluginCall call) {
        boolean speaking = tts != null && tts.isSpeaking();
        JSObject ret = new JSObject();
        ret.put("value", speaking);
        call.success(ret);
    }

    @Override
    protected void handleOnDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
            tts = null;
        }
        super.handleOnDestroy();
    }
}
