import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import './Settings.css';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, profile } = useStore();

  const testTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Hello, I am your English teacher!');
      utterance.lang = 'en-US';
      utterance.rate = settings.ttsSpeed;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="page settings-page">
      <div className="header-bar safe-top">
        <button className="header-back" onClick={() => navigate(-1)}>← 返回</button>
        <div className="header-title">⚙️ 设置</div>
        <div style={{ width: 60 }} />
      </div>

      <div className="page-content">
        <div className="section-title">🔊 声音设置</div>
        <motion.div
          className="card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="setting-row">
            <span>🔔 提示音</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) => updateSettings({ sound: e.target.checked })}
              />
              <span className="slider" />
            </label>
          </div>
          <div className="setting-row">
            <span>📖 显示音标</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.showPhonetic}
                onChange={(e) => updateSettings({ showPhonetic: e.target.checked })}
              />
              <span className="slider" />
            </label>
          </div>
          <div className="setting-row">
            <span>💡 显示提示</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.showHint}
                onChange={(e) => updateSettings({ showHint: e.target.checked })}
              />
              <span className="slider" />
            </label>
          </div>
          <div className="setting-row">
            <span>🎵 TTS 语速</span>
            <div className="speed-control">
              <span>慢</span>
              <input
                type="range"
                min="0.5"
                max="1.2"
                step="0.1"
                value={settings.ttsSpeed}
                onChange={(e) => updateSettings({ ttsSpeed: parseFloat(e.target.value) })}
                className="speed-slider"
              />
              <span>快</span>
            </div>
          </div>
        </motion.div>

        <div className="section-title" style={{ marginTop: 'var(--space-lg)' }}>🎤 测试发音</div>
        <motion.div
          className="card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p style={{ fontSize: 14, color: '#888', marginBottom: 12 }}>
            点击按钮测试 TTS 发音是否正常
          </p>
          <button
            className="btn btn-secondary btn-full"
            onClick={testTTS}
          >
            🔊 测试发音
          </button>
        </motion.div>

        <div className="section-title" style={{ marginTop: 'var(--space-lg)' }}>ℹ️ 关于</div>
        <motion.div
          className="card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="setting-row">
            <span>👤 昵称</span>
            <span style={{ color: '#888' }}>{profile.name}</span>
          </div>
          <div className="setting-row">
            <span>📱 版本</span>
            <span style={{ color: '#888' }}>1.0.0</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
