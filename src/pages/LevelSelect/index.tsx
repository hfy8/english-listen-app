import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LEVELS, getThemesByLevel, getWordsByLevelAndTheme, VOCABULARY } from '../../data/vocabulary';
import type { LevelId, ThemeId } from '../../data/vocabulary';
import { useStore } from '../../store';
import './LevelSelect.css';

const LevelSelect: React.FC = () => {
  const navigate = useNavigate();
  const { progress } = useStore();
  const [selectedLevel, setSelectedLevel] = React.useState<LevelId | null>(null);

  const themes = selectedLevel ? getThemesByLevel(selectedLevel) : [];

  const handleLevelSelect = (level: LevelId) => {
    setSelectedLevel(level);
  };

  const handleThemeSelect = (theme: ThemeId) => {
    const words = getWordsByLevelAndTheme(selectedLevel!, theme);
    navigate('/practice', { state: { words, level: selectedLevel, theme } });
  };

  const levelCompletion = (levelId: LevelId) => {
    const levelWords = VOCABULARY.filter((w) => w.level === levelId);
    const completed = levelWords.filter((w) => progress.completedWords.includes(w.id)).length;
    return { completed, total: levelWords.length };
  };

  return (
    <div className="page level-page">
      <div className="header-bar safe-top">
        <button className="header-back" onClick={() => selectedLevel ? setSelectedLevel(null) : navigate(-1)}>
          ← {selectedLevel ? '返回' : ''}
        </button>
        <div className="header-title">
          {selectedLevel ? LEVELS.find(l => l.id === selectedLevel)?.name : '选择级别'}
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div className="page-content">
        {!selectedLevel ? (
          <>
            <div className="page-title">选择级别</div>
            <div className="level-grid">
              {LEVELS.map((level, idx) => {
                const { completed, total } = levelCompletion(level.id);
                const pct = total > 0 ? (completed / total) * 100 : 0;
                return (
                  <motion.button
                    key={level.id}
                    className="level-card"
                    style={{ borderColor: level.color }}
                    onClick={() => handleLevelSelect(level.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="level-card-header" style={{ background: level.color }}>
                      <span className="level-card-name">{level.name}</span>
                      {pct === 100 && <span className="level-complete-badge">✅</span>}
                    </div>
                    <div className="level-card-body">
                      <div className="level-progress-bar">
                        <div className="level-progress-fill" style={{ width: `${pct}%`, background: level.color }} />
                      </div>
                      <div className="level-progress-text">{completed}/{total} 词</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="page-title">选择主题</div>
            <div className="theme-grid">
              {themes.map((theme, idx) => {
                const themeWords = getWordsByLevelAndTheme(selectedLevel, theme.id);
                const completed = themeWords.filter((w) => progress.completedWords.includes(w.id)).length;
                const pct = completed / themeWords.length;
                return (
                  <motion.button
                    key={theme.id}
                    className="theme-card"
                    style={{ borderColor: theme.color }}
                    onClick={() => handleThemeSelect(theme.id)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="theme-emoji">{theme.emoji}</div>
                    <div className="theme-name">{theme.name}</div>
                    <div className="theme-count">{completed}/{themeWords.length}</div>
                    {pct === 1 && <div className="theme-done">✨ 全部掌握</div>}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LevelSelect;
