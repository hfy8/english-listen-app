import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { VOCABULARY, LEVELS } from '../../data/vocabulary';
import './Profile.css';

const AVATARS = ['🧒', '👧', '👦', '🧒🏻', '🧒🏼', '🧒🏽', '🧒🏾', '🧒🏿'];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, progress, rewards, settings, updateProfile, updateSettings } = useStore();
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);

  const completedCount = progress.completedWords.length;
  const accuracy = progress.totalAnswered > 0
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
    : 0;

  const handleSaveName = () => {
    updateProfile({ name: tempName || '小朋友' });
    setEditingName(false);
  };

  const handleAvatarChange = (avatar: string) => {
    updateProfile({ avatar });
  };

  const levelProgress = LEVELS.map((level) => {
    const levelWords = VOCABULARY.filter((w) => w.level === level.id);
    const completed = levelWords.filter((w) => progress.completedWords.includes(w.id)).length;
    return { ...level, completed, total: levelWords.length };
  });

  return (
    <div className="page profile-page">
      <div className="header-bar safe-top">
        <button className="header-back" onClick={() => navigate(-1)}>← 返回</button>
        <div className="header-title">我的</div>
        <div style={{ width: 60 }} />
      </div>

      <div className="page-content">
        {/* Profile card */}
        <motion.div
          className="profile-card card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="profile-avatar" onClick={() => {
            const currentIdx = AVATARS.indexOf(profile.avatar);
            const nextIdx = (currentIdx + 1) % AVATARS.length;
            handleAvatarChange(AVATARS[nextIdx]);
          }}>
            {profile.avatar}
          </div>

          {editingName ? (
            <div className="name-edit">
              <input
                className="name-input"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={10}
                autoFocus
              />
              <button className="btn btn-small" onClick={handleSaveName}>保存</button>
            </div>
          ) : (
            <div className="profile-name" onClick={() => { setTempName(profile.name); setEditingName(true); }}>
              {profile.name} ✏️
            </div>
          )}

          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-num">{completedCount}</div>
              <div className="profile-stat-label">已学词</div>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <div className="profile-stat-num">{rewards.totalTests}</div>
              <div className="profile-stat-label">测试次数</div>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <div className="profile-stat-num">{accuracy}%</div>
              <div className="profile-stat-label">正确率</div>
            </div>
          </div>
        </motion.div>

        {/* Level progress */}
        <div className="section-title" style={{ marginTop: 'var(--space-lg)' }}>📈 学习进度</div>
        <motion.div
          className="card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {levelProgress.map((level) => (
            <div key={level.id} className="level-progress-row">
              <div className="level-row-left">
                <div className="level-dot" style={{ background: level.color }} />
                <span className="level-row-name">{level.name}</span>
              </div>
              <div className="level-row-right">
                <div className="level-row-bar">
                  <div
                    className="level-row-fill"
                    style={{
                      width: `${level.total > 0 ? (level.completed / level.total) * 100 : 0}%`,
                      background: level.color,
                    }}
                  />
                </div>
                <span className="level-row-count">{level.completed}/{level.total}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Settings */}
        <div className="section-title" style={{ marginTop: 'var(--space-lg)' }}>⚙️ 设置</div>
        <motion.div
          className="card settings-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
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

        {/* Test shortcut */}
        <button
          className="btn btn-secondary btn-full"
          style={{ marginTop: 'var(--space-lg)' }}
          onClick={() => navigate('/test')}
        >
          📝 去测试
        </button>
      </div>
    </div>
  );
};

export default Profile;
