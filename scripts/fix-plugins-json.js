/**
 * After `cap sync android`, ensure TtsPlugin is registered in capacitor.plugins.json
 * This is a workaround for the fact that TtsPlugin is a custom native plugin
 * not installed via npm (so cap sync doesn't auto-discover it).
 */
import { resolve } from 'path';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';

const assetsDir = resolve('./android/app/src/main/assets');
const pluginsJsonPath = resolve(assetsDir, 'capacitor.plugins.json');

// TtsPlugin fully qualified class path
const TTS_PLUGIN = {
  classpath: 'com.english.listen.tts.TtsPlugin',
  name: 'Tts',
  id: 'com.english.listen.tts.TtsPlugin',
};

try {
  if (existsSync(pluginsJsonPath)) {
    const existing = JSON.parse(readFileSync(pluginsJsonPath, 'utf-8'));

    // Check if already registered
    const alreadyRegistered = existing.some(
      (p) => p.classpath === TTS_PLUGIN.classpath
    );

    if (!alreadyRegistered) {
      // Remove any existing Tts entry and add fresh one
      const filtered = existing.filter(
        (p) => p.name !== 'Tts' && p.id !== 'com.english.listen.tts.TtsPlugin'
      );
      filtered.push(TTS_PLUGIN);
      writeFileSync(pluginsJsonPath, JSON.stringify(filtered, null, '\t'), 'utf-8');
      console.log('[fix-plugins-json] TtsPlugin registered in capacitor.plugins.json');
    } else {
      console.log('[fix-plugins-json] TtsPlugin already registered');
    }
  } else {
    // File doesn't exist, create directory and file
    mkdirSync(assetsDir, { recursive: true });
    writeFileSync(pluginsJsonPath, JSON.stringify([TTS_PLUGIN], null, '\t'), 'utf-8');
    console.log('[fix-plugins-json] Created capacitor.plugins.json with TtsPlugin');
  }
} catch (e) {
  console.error('[fix-plugins-json] Error:', e.message);
  process.exit(1);
}
