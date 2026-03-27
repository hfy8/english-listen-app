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
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(name = "Tts")
public class TtsPlugin extends Plugin {

    private TextToSpeech tts;
    private boolean ttsReady = false;
    private static final String TAG = "TtsPlugin";
    private static final int INIT_TIMEOUT_SEC = 5;

    @Override
    public void load() {
        super.load();
        initTts();
    }

    private void initTts() {
        final CountDownLatch latch = new CountDownLatch(1);

        tts = new TextToSpeech(getContext(), status -> {
            if (status == TextToSpeech.SUCCESS) {
                int result = tts.setLanguage(Locale.US);
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    Log.w(TAG, "English language not available on this device");
                } else {
                    ttsReady = true;
                    Log.d(TAG, "TTS ready");
                }
            } else {
                Log.e(TAG, "TTS init failed: " + status);
            }
            latch.countDown();
        });

        // Wait for init (with timeout)
        try {
            if (!latch.await(INIT_TIMEOUT_SEC, TimeUnit.SECONDS)) {
                Log.w(TAG, "TTS init timed out");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    @PluginMethod
    public void speak(PluginCall call) {
        // Wait for TTS to be ready (up to 3s)
        if (!ttsReady) {
            // Try to init synchronously as last resort
            if (tts == null) {
                call.reject("TTS not available", "UNAVAILABLE");
                return;
            }
            call.reject("TTS not ready, please try again", "NOT_READY");
            return;
        }

        String text = call.getString("text", "");
        if (text == null || text.isEmpty()) {
            call.reject("text is required", "INVALID_ARGUMENT");
            return;
        }

        double rate = call.getDouble("rate", 1.0);
        double pitch = call.getDouble("pitch", 1.0);

        tts.setSpeechRate((float) rate);
        tts.setPitch((float) pitch);

        String utteranceId = UUID.randomUUID().toString();

        HashMap<String, String> params = new HashMap<>();
        params.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId);

        int result = tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId);

        if (result == TextToSpeech.SUCCESS) {
            JSObject ret = new JSObject();
            ret.put("value", true);
            call.resolve(ret);
        } else {
            call.reject("TTS speak failed", "SPEAK_ERROR");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (tts != null) {
            tts.stop();
        }
        JSObject ret = new JSObject();
        ret.put("value", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void isSpeaking(PluginCall call) {
        boolean speaking = tts != null && tts.isSpeaking();
        JSObject ret = new JSObject();
        ret.put("value", speaking);
        call.resolve(ret);
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
