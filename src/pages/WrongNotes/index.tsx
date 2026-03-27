import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import type { LevelId, ThemeId } from '../../data/vocabulary';
import { getWrongTheme, getLevelInfo } from '../../data/vocabulary';
import './WrongNotes.css';

const WrongNotes: React.FC = () => {
  const navigate = useNavigate();
  const { progress, removeWrongWord } = useStore();

  const wrongWords = progress.wrongWords;

  const handlePractice = (wrongWord: typeof wrongWords[0]) => {
    navigate('/practice', {
      state: {
        words: [{
          id: wrongWord.word,
          word: wrongWord.word,
          chinese: wrongWord.chinese,
          phonetic: wrongWord.phonetic,
          theme: wrongWord.theme as ThemeId,
          level: wrongWord.level as LevelId,
        }],
        level: wrongWord.level as LevelId,
        theme: wrongWord.theme as ThemeId,
      },
    });
  };

  const handleClear = () => {
    if (confirm('确定清空全部错题？')) {
      wrongWords.forEach((w) => removeWrongWord(w.word));
    }
  };

  return (
    <div className="page wrong-page">
      <div className="header-bar safe-top">
        <button className="header-back" onClick={() => navigate(-1)}>← 返回</button>
        <div className="header-title">错题本</div>
        {wrongWords.length > 0 && (
          <button className="header-action" onClick={handleClear}>清空</button>
        )}
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="wrong-stats card">
          <div className="wrong-stat">
            <div className="wrong-stat-icon">📊</div>
            <div>
              <div className="wrong-stat-num">{wrongWords.length}</div>
              <div className="wrong-stat-label">累计错题</div>
            </div>
          </div>
        </div>

        {wrongWords.length === 0 ? (
          <div className="empty-state animate-scale-in">
            <div className="empty-state-emoji">🎉</div>
            <div className="empty-state-title">暂无错题，太棒了！</div>
            <div className="empty-state-desc">你已掌握所有学过的单词～</div>
            <button className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }} onClick={() => navigate('/levels')}>
              去练习新单词
            </button>
          </div>
        ) : (
          <div className="wrong-list">
            <AnimatePresence>
              {wrongWords.map((ww, idx) => {
                const theme = getWrongTheme(ww.theme as ThemeId);
                const level = getLevelInfo(ww.level as LevelId);
                return (
                  <motion.div
                    key={ww.word}
                    className="wrong-card card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="wrong-card-header">
                      <div className="wrong-word-info">
                        <span className="wrong-emoji">{theme?.emoji}</span>
                        <span className="wrong-word">{ww.word}</span>
                        <span className="wrong-phonetic">{ww.phonetic}</span>
                      </div>
                      <span className="wrong-level-chip" style={{ background: level?.color }}>
                        {level?.name}
                      </span>
                    </div>
                    <div className="wrong-chinese">{ww.chinese}</div>
                    <div className="wrong-your-answer">
                      ❌ 你答了：<span className="wrong-answer-text">{ww.wrongAnswer}</span>
                    </div>
                    <div className="wrong-card-footer">
                      <span className="wrong-hint">连续答对 2 次自动移除</span>
                      <button className="btn btn-small" onClick={() => handlePractice(ww)}>
                        重新练习
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default WrongNotes;
