import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Word, LevelId, ThemeId } from '../../data/vocabulary';
import { getWrongTheme, getLevelInfo } from '../../data/vocabulary';
import { useStore } from '../../store';
import { useAudio } from '../../hooks/useAudio';
import LetterKeyboard from '../../components/common/LetterKeyboard';
import FeedbackModal from '../../components/common/FeedbackModal';
import './Practice.css';

// Keys for sessionStorage (同步写入，跨 WebView 重启持久化)
const PRACTICE_PARAMS_KEY = '__pw_params__';

interface PracticeParams {
  words: Word[];
  level: LevelId;
  theme: ThemeId;
}

function readSessionStorage(): PracticeParams | null {
  try {
    const raw = sessionStorage.getItem(PRACTICE_PARAMS_KEY);
    return raw ? (JSON.parse(raw) as PracticeParams) : null;
  } catch {
    return null;
  }
}

const Practice: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { speak } = useAudio();

  const {
    startSession,
    session,
    nextWord,
    addPoints,
    addCompletedWord,
    addWrongWord,
    removeWrongWord,
    addSticker,
    showToast,
    settings,
    clearPendingPracticeParams,
  } = useStore();

  // ── 所有 hooks 必须无条件调用，放在最前面 ─────────────────────────────────
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [stickersEarned, setStickersEarned] = useState<string[]>([]);
  const inputRef = useRef<string[]>([]);
  const inputKey = useRef(0);
  const initFlagRef = useRef(false);

  // 初始化 useEffect（initFlagRef 保证只运行一次）
  useEffect(() => {
    if (initFlagRef.current) return;
    initFlagRef.current = true;

    const locState = location.state as PracticeParams | null;
    const storedParams = readSessionStorage();

    console.log('[Practice] Init:', {
      locationStateWords: locState?.words?.length,
      storedParamsWords: storedParams?.words?.length,
      sessionWords: session?.words?.length,
    });

    if (locState?.words?.length) {
      console.log('[Practice] Source: location.state, words:', locState.words.length);
      sessionStorage.setItem(PRACTICE_PARAMS_KEY, JSON.stringify(locState));
      startSession(locState.words);
    } else if (storedParams?.words?.length) {
      console.log('[Practice] Source: sessionStorage, words:', storedParams.words.length);
      startSession(storedParams.words);
    } else if (!session?.words?.length) {
      // 只有真正没有任何 words 时才 redirect（避免 startSession 后 2 秒才读到的闭包 session=null 问题）
      console.log('[Practice] No words found, redirecting...');
      navigate('/levels');
    }
  }, []);

  // 派生的中间变量（在 hooks 之后、early return 之前）
  const params: PracticeParams | null =
    (location.state as PracticeParams | null) || readSessionStorage();
  const currentWord: Word | null =
    session?.words?.length ? session.words[session.currentIndex] : null;
  const levelInfo = params ? getLevelInfo(params.level) : null;
  const themeInfo = currentWord ? getWrongTheme(currentWord.theme) : null;

  // Auto-play useEffect
  useEffect(() => {
    if (currentWord && !answered) {
      const timer = setTimeout(() => speak(currentWord.word), 300);
      return () => clearTimeout(timer);
    }
  }, [session?.currentIndex, answered, currentWord?.word, speak]);

  // ── 所有 useCallback 必须在 early return 之前定义（确保 hooks 数量固定） ──
  const handleKeyPress = useCallback(
    (letter: string) => {
      if (answered || !currentWord) return;
      if (inputRef.current.length >= currentWord.word.length) return;
      inputRef.current = [...inputRef.current, letter.toUpperCase()];
      inputKey.current += 1;
    },
    [answered, currentWord]
  );

  const handleDelete = useCallback(() => {
    if (answered) return;
    inputRef.current = inputRef.current.slice(0, -1);
    inputKey.current += 1;
  }, [answered]);

  const handleConfirm = useCallback(() => {
    if (answered || !currentWord || inputRef.current.length === 0) return;

    const answer = inputRef.current.join('').toLowerCase();
    const correct = answer === currentWord.word.toLowerCase();

    setIsCorrect(correct);
    setAnswered(true);
    setShowFeedback(true);

    if (correct) {
      addPoints(10);
      addCompletedWord(currentWord.id);
      removeWrongWord(currentWord.word);
      if (Math.random() < 0.2) {
        const stickers = ['⭐', '🌟', '🔥', '💎', '🌈', '🎀'];
        const sticker = stickers[Math.floor(Math.random() * stickers.length)];
        addSticker(sticker);
        setStickersEarned((prev) => [...prev, sticker]);
        showToast(`🎨 获得贴纸 ${sticker}！`, 'success');
      }
    } else {
      addWrongWord({
        word: currentWord.word,
        chinese: currentWord.chinese,
        phonetic: currentWord.phonetic,
        wrongAnswer: answer,
        level: currentWord.level,
        theme: currentWord.theme,
        count: 0,
        lastWrongDate: new Date().toISOString(),
      });
    }
  }, [
    answered,
    currentWord,
    addPoints,
    addCompletedWord,
    removeWrongWord,
    addWrongWord,
    addSticker,
    showToast,
  ]);

  const handleNext = useCallback(() => {
    setShowFeedback(false);
    setAnswered(false);
    inputRef.current = [];
    inputKey.current += 1;
    setStickersEarned([]);
    nextWord();
  }, [nextWord]);

  const handleSkip = useCallback(() => {
    if (!answered) handleNext();
  }, [answered, handleNext]);

  // ── Early return（所有 hooks 已无条件调用，顺序固定） ──────────────────────
  if (!session?.words?.length) {
    return (
      <div className="page practice-page">
        <div className="loading-state">
          <div className="loading-emoji">⭐</div>
          <div>加载中...</div>
        </div>
      </div>
    );
  }

  // ── 正常渲染 ──────────────────────────────────────────────────────────────

  const total = session.words.length;
  const current = session.currentIndex + 1;
  const progressPct = total > 0 ? (current / total) * 100 : 0;

  const handleBack = () => {
    sessionStorage.removeItem(PRACTICE_PARAMS_KEY);
    clearPendingPracticeParams();
    navigate('/levels');
  };

  const handleFinish = () => {
    sessionStorage.removeItem(PRACTICE_PARAMS_KEY);
    clearPendingPracticeParams();
    navigate('/');
  };

  return (
    <div className="page practice-page">
      {/* Header */}
      <div className="header-bar safe-top practice-header">
        <button className="header-back" onClick={handleBack}>← 返回</button>
        <div className="header-title">
          {levelInfo?.name} · {themeInfo?.emoji} {themeInfo?.name}
        </div>
        <button className="header-action" onClick={handleSkip}>跳过</button>
      </div>

      {/* Progress */}
      <div className="practice-progress">
        <div className="practice-progress-bar">
          <motion.div
            className="practice-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="practice-progress-text">{current}/{total}</div>
      </div>

      {/* Main content */}
      <div className="practice-content">
        <motion.div
          className="play-button"
          onClick={() => currentWord && speak(currentWord.word)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="play-icon">🔊</div>
          <div className="play-text">点击播放</div>
        </motion.div>

        <div className="chinese-hint animate-slide-up">
          {currentWord?.chinese}
        </div>

        {settings.showPhonetic && (
          <div className="phonetic-hint">{currentWord?.phonetic}</div>
        )}

        {/* Answer slots */}
        <div className="answer-slot" key={inputKey.current}>
          {currentWord?.word.split('').map((_, idx) => (
            <div
              key={idx}
              className={`slot-char ${inputRef.current[idx] ? 'filled' : ''}`}
            >
              {inputRef.current[idx] || ''}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {showFeedback && !isCorrect && currentWord && (
            <motion.div
              className="wrong-indicator animate-slide-up"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span className="wrong-icon">❌</span>
              <span>正确：</span>
              <span className="correct-answer">{currentWord.word.toUpperCase()}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyboard */}
      <div className="practice-keyboard">
        <LetterKeyboard
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          onConfirm={handleConfirm}
          disabled={answered || showFeedback}
        />
      </div>

      <div className="skip-hint">点击右上角「跳过」可跳过不认识的词</div>

      {/* Feedback Modal */}
      {currentWord && (
        <FeedbackModal
          show={showFeedback}
          correct={isCorrect}
          word={currentWord}
          userAnswer={inputRef.current.join('')}
          onNext={handleNext}
          points={10}
        />
      )}

      {/* Confetti */}
      <AnimatePresence>
        {showFeedback && isCorrect && stickersEarned.length === 0 && (
          <div className="stars-bg">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="star-particle"
                style={{ left: `${20 + i * 8}%`, top: `${30 + (i % 3) * 10}%` }}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: -80, rotate: i * 45 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
              >
                ⭐
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Session finished */}
      <AnimatePresence>
        {session.isFinished && !showFeedback && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="modal-box"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className="modal-icon">🏆</div>
              <div className="modal-title">太棒了！</div>
              <div className="modal-message">已完成本次练习！</div>
              <div className="stats-row" style={{ marginTop: 'var(--space-md)' }}>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: 'var(--success)' }}>
                    {session.answers.filter((a) => a.correct).length}
                  </div>
                  <div className="stat-label">答对</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: 'var(--error)' }}>
                    {session.answers.filter((a) => !a.correct).length}
                  </div>
                  <div className="stat-label">答错</div>
                </div>
              </div>
              <button className="btn btn-primary btn-full" style={{ marginTop: 'var(--space-lg)' }} onClick={handleFinish}>
                返回首页
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Practice;
