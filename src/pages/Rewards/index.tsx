import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import './Rewards.css';

const BADGES = [
  { id: 'first_lesson', name: '初次学习', emoji: '🏅', desc: '完成第一次练习', color: '#FFE66D' },
  { id: 'learner_100', name: '学习达人', emoji: '🎖️', desc: '累计100积分', color: '#4ECDC4', require: 100 },
  { id: 'streak_3', name: '连续3天', emoji: '🥉', desc: '连续学习3天', color: '#FF6B6B', requireStreak: 3 },
  { id: 'streak_7', name: '连续7天', emoji: '🥈', desc: '连续学习7天', color: '#FF6B6B', requireStreak: 7 },
  { id: 'streak_30', name: '连续30天', emoji: '🥇', desc: '连续学习30天', color: '#FF6B6B', requireStreak: 30 },
  { id: 'word_master', name: '词库小达人', emoji: '🌟', desc: '学完一个级别', color: '#FFE66D' },
  { id: 'perfect_3', name: '满分小能手', emoji: '💯', desc: '测试满分3次', color: '#00B894', requirePerfect: 3 },
  { id: 'persistence', name: '坚持不懈', emoji: '💪', desc: '累计1000积分', color: '#A29BFE', require: 1000 },
  { id: 'doctor', name: '英语小博士', emoji: '🎓', desc: '学完所有级别', color: '#FF7675' },
  { id: 'super_king', name: '超级学习王', emoji: '👑', desc: '累计5000积分', color: '#FF7675', require: 5000 },
];

const STICKER_TYPES = ['⭐', '🌟', '🔥', '💎', '🌈', '🎀', '🏆', '🎁', '❤️', '🦄'];

const Rewards: React.FC = () => {
  const navigate = useNavigate();
  const { rewards, progress } = useStore();

  const earnedBadges = rewards.badges;
  const earnedStickers = rewards.stickers;
  const totalStickers = Object.values(earnedStickers).reduce((a, b) => a + b, 0);

  // Next badge
  const nextBadge = BADGES.find((b) => !earnedBadges.includes(b.id));
  const nextBadgeProgress = nextBadge
    ? nextBadge.require
      ? Math.min(100, Math.round((rewards.points / nextBadge.require) * 100))
      : nextBadge.requireStreak
        ? Math.min(100, Math.round((progress.streakDays / nextBadge.requireStreak) * 100))
        : 0
    : 100;

  return (
    <div className="page rewards-page">
      <div className="header-bar safe-top">
        <button className="header-back" onClick={() => navigate(-1)}>← 返回</button>
        <div className="header-title">我的奖励</div>
        <div style={{ width: 60 }} />
      </div>

      <div className="page-content">
        {/* Points card */}
        <motion.div
          className="rewards-points-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="rewards-points-star">⭐</div>
          <div className="rewards-points-num">{rewards.points.toLocaleString()}</div>
          <div className="rewards-points-label">积分余额</div>
          {nextBadge && (
            <div className="rewards-next-badge">
              <div className="next-badge-info">
                <span>距离「{nextBadge.emoji} {nextBadge.name}」还差 {nextBadge.require || nextBadge.requireStreak}{nextBadge.require ? '分' : '天'}</span>
              </div>
              <div className="progress-bar" style={{ marginTop: '8px', height: 10 }}>
                <motion.div
                  className="progress-fill"
                  style={{ width: `${nextBadgeProgress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${nextBadgeProgress}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Badges */}
        <div className="section-title">🏆 徽章墙</div>
        <div className="badge-grid">
          {BADGES.map((badge, idx) => {
            const unlocked = earnedBadges.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                className="badge-item"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className={`badge-icon ${unlocked ? 'unlocked' : 'locked'}`}>
                  {badge.emoji}
                </div>
                <div className="badge-name">{badge.name}</div>
                {unlocked && <div className="badge-desc">{badge.desc}</div>}
              </motion.div>
            );
          })}
        </div>
        <div className="badge-count-text">
          🏅 已获得：{earnedBadges.length}/{BADGES.length}
        </div>

        {/* Stickers */}
        <div className="section-title" style={{ marginTop: 'var(--space-xl)' }}>🎨 贴纸册</div>
        <div className="sticker-grid">
          {STICKER_TYPES.map((sticker) => {
            const count = earnedStickers[sticker] || 0;
            const unlocked = count > 0;
            return (
              <motion.div
                key={sticker}
                className={`sticker-item ${!unlocked ? 'locked' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: STICKER_TYPES.indexOf(sticker) * 0.03 }}
              >
                <div className="sticker-emoji">{unlocked ? sticker : '🔒'}</div>
                <div className="sticker-count">{unlocked ? `×${count}` : '--'}</div>
              </motion.div>
            );
          })}
        </div>
        <div className="badge-count-text">
          🎨 已收集：{totalStickers}/{STICKER_TYPES.length * 5}+
        </div>
      </div>
    </div>
  );
};

export default Rewards;
