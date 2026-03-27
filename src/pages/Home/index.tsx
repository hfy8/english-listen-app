import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { VOCABULARY, LEVELS } from '../../data/vocabulary';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile, progress, rewards, updateStreak } = useStore();

  useEffect(() => {
    updateStreak();
  }, []);

  const totalWords = VOCABULARY.length;
  const completedCount = progress.completedWords.length;
  const wrongCount = progress.wrongWords.length;
  const badgesCount = rewards.badges.length;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  return (
    <div className="page home-page">
      <div className="home-header safe-top">
        <div className="home-greeting">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="home-welcome">
              <span className="wave-emoji">👋</span>
              {greeting()}，{profile.name}！
            </div>
            <div className="home-subtitle">今天要挑战哪个主题？</div>
          </motion.div>
        </div>

        {/* Points Card */}
        <motion.div
          className="points-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="points-left">
            <div className="points-star">🌟</div>
            <div>
              <div className="points-value">{rewards.points.toLocaleString()}</div>
              <div className="points-label">已有积分</div>
            </div>
          </div>
          <div className="points-right">
            <div className="streak-badge">
              🔥 {progress.streakDays} 天
            </div>
          </div>
        </motion.div>

        {/* Main CTA */}
        <motion.button
          className="btn btn-primary start-btn"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/levels')}
        >
          🎮 开始学习
        </motion.button>

        {/* Quick Cards */}
        <div className="quick-cards">
          <motion.button
            className="quick-card"
            onClick={() => navigate('/wrong')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="quick-card-emoji">📝</div>
            <div className="quick-card-title">错题本</div>
            <div className="quick-card-count">{wrongCount} 个词</div>
          </motion.button>

          <motion.button
            className="quick-card"
            onClick={() => navigate('/rewards')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="quick-card-emoji">🎁</div>
            <div className="quick-card-title">奖励</div>
            <div className="quick-card-count">{badgesCount} 个徽章</div>
          </motion.button>
        </div>

        {/* Progress */}
        <motion.div
          className="progress-card card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="progress-header">
            <span>🎯 学习进度</span>
            <span className="progress-text">{completedCount}/{totalWords} 词</span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${totalWords > 0 ? (completedCount / totalWords) * 100 : 0}%` }}
              transition={{ duration: 0.6, delay: 0.5 }}
            />
          </div>
          <div className="level-progress">
            {LEVELS.map((level) => {
              const levelWords = VOCABULARY.filter((w) => w.level === level.id);
              const levelCompleted = levelWords.filter((w) => progress.completedWords.includes(w.id)).length;
              return (
                <div key={level.id} className="level-item">
                  <div className="level-dot" style={{ background: level.color }} />
                  <span className="level-name">{level.name}</span>
                  <span className="level-count">{levelCompleted}/{levelWords.length}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
