import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { VOCABULARY } from '../../data/vocabulary';
import type { Word } from '../../data/vocabulary';
import { useStore } from '../../store';
import { useAudio } from '../../hooks/useAudio';
import FeedbackModal from '../../components/common/FeedbackModal';
import './Test.css';

type TestType = 'choice' | 'spell';

interface TestQuestion {
  word: Word;
  type: TestType;
  options?: string[]; // for choice type
}

const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 30;

const generateTest = (): TestQuestion[] => {
  const shuffled = [...VOCABULARY].sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS);
  return shuffled.map((word) => {
    const type: TestType = Math.random() > 0.5 ? 'choice' : 'spell';
    let options: string[] | undefined;
    if (type === 'choice') {
      // Pick 3 wrong words
      const others = VOCABULARY.filter((w) => w.id !== word.id).slice(0, 3);
      options = [word.word, ...others.map((w) => w.word)].sort(() => Math.random() - 0.5);
    }
    return { word, type, options };
  });
};

const Test: React.FC = () => {
  const navigate = useNavigate();
  const { speak } = useAudio();
  const { addPoints, recordTestResult, addWrongWord, addCompletedWord, removeWrongWord, addBadge, showToast } = useStore();

  const [questions] = useState<TestQuestion[]>(() => generateTest());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [spellInput, setSpellInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<number | null>(null);

  const currentQ = questions[currentIdx];
  const inputRef = useRef<string[]>([]);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(TIME_PER_QUESTION);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          // Time's up - treat as wrong
          handleAnswer(false, '');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (!isFinished && !showFeedback) {
      startTimer();
      if (currentQ?.type === 'spell') {
        speak(currentQ.word.word);
      }
    }
    return clearTimer;
  }, [currentIdx, isFinished]);

  const handleAnswer = useCallback((correct: boolean, userAnswer: string) => {
    clearTimer();
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      addPoints(10);
      addCompletedWord(currentQ.word.id);
      removeWrongWord(currentQ.word.word);
    } else {
      addWrongWord({
        word: currentQ.word.word,
        chinese: currentQ.word.chinese,
        phonetic: currentQ.word.phonetic,
        wrongAnswer: userAnswer,
        level: currentQ.word.level,
        theme: currentQ.word.theme,
        count: 0,
        lastWrongDate: new Date().toISOString(),
      });
    }
  }, [currentQ, addPoints, addCompletedWord, addWrongWord, removeWrongWord]);

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    const correct = option === currentQ.word.word;
    handleAnswer(correct, option);
  };

  const handleSpellConfirm = () => {
    const answer = inputRef.current.join('').toLowerCase();
    handleAnswer(answer === currentQ.word.word.toLowerCase(), answer);
  };

  const handleSpellKey = (letter: string) => {
    if (inputRef.current.length >= currentQ.word.word.length) return;
    inputRef.current = [...inputRef.current, letter.toUpperCase()];
    setSpellInput(inputRef.current.join(''));
  };

  const handleSpellDelete = () => {
    inputRef.current = inputRef.current.slice(0, -1);
    setSpellInput(inputRef.current.join(''));
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    setSpellInput('');
    inputRef.current = [];
    setAnswers((prev) => [...prev, { correct: isCorrect }]);

    const nextIdx = currentIdx + 1;
    if (nextIdx >= questions.length) {
      setIsFinished(true);
    } else {
      setCurrentIdx(nextIdx);
    }
  };

  const handleFinish = () => {
    const allAnswers = [...answers, { correct: isCorrect }];
    const correctCount = allAnswers.filter((a) => a.correct).length;
    const isPerfect = correctCount === TOTAL_QUESTIONS;

    if (isPerfect) {
      addPoints(50);
      addBadge('perfect_3');
      showToast('🎉 满分！+50 积分！', 'success');
    }

    recordTestResult(isPerfect);
    navigate('/');
  };

  if (isFinished) {
    const correctCount = answers.filter((a) => a.correct).length + (isCorrect ? 1 : 0);
    const isPerfect = correctCount === TOTAL_QUESTIONS;
    return (
      <div className="page test-page">
        <div className="test-result animate-scale-in">
          <div className="result-icon">{isPerfect ? '🏆' : '📝'}</div>
          <div className="result-title">{isPerfect ? '满分！太厉害了！' : '测试完成！'}</div>
          <div className="result-score">
            <span className="score-num">{correctCount}</span>
            <span className="score-total">/{TOTAL_QUESTIONS}</span>
          </div>
          <div className="result-label">正确</div>
          <div className="stats-row" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="stat-item">
              <div className="stat-value" style={{ color: 'var(--success)' }}>{correctCount}</div>
              <div className="stat-label">答对</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: 'var(--error)' }}>{TOTAL_QUESTIONS - correctCount}</div>
              <div className="stat-label">答错</div>
            </div>
          </div>
          <button className="btn btn-primary btn-full" style={{ marginTop: 'var(--space-xl)' }} onClick={handleFinish}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page test-page">
      {/* Header */}
      <div className="header-bar safe-top">
        <button className="header-back" onClick={() => navigate('/')}>← 返回</button>
        <div className="header-title">单元测试</div>
        <div style={{ width: 60 }} />
      </div>

      {/* Progress + Timer */}
      <div className="test-status-bar">
        <div className="test-timer">
          ⏱️ {timeLeft}s
        </div>
        <div className="test-progress-text">✓ {answers.filter((a) => a.correct).length + (isCorrect ? 1 : 0)}/{currentIdx + 1}</div>
      </div>

      <div className="page-content test-content">
        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            className="test-question-card card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            {currentQ.type === 'choice' ? (
              <>
                <div className="test-chinese">{currentQ.word.chinese}</div>
                {currentQ.word.phonetic && (
                  <div className="test-phonetic">{currentQ.word.phonetic}</div>
                )}
                <button className="test-speak-btn" onClick={() => speak(currentQ.word.word)}>
                  🔊 听发音
                </button>
              </>
            ) : (
              <>
                <div className="test-chinese">{currentQ.word.chinese}</div>
                <div className="test-phonetic">{currentQ.word.phonetic}</div>
                <button className="test-speak-btn" onClick={() => speak(currentQ.word.word)}>
                  🔊 点击播放
                </button>
                {/* Spell input */}
                <div className="test-spell-answer">
                  {currentQ.word.word.split('').map((_, idx) => (
                    <div key={idx} className={`slot-char ${inputRef.current[idx] ? 'filled' : ''}`}>
                      {inputRef.current[idx] || ''}
                    </div>
                  ))}
                </div>
                {/* Mini keyboard */}
                <div className="test-keyboard">
                  {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row) => (
                    <div key={row} className="test-key-row">
                      {row.split('').map((key) => (
                        <button
                          key={key}
                          className="test-key"
                          onClick={() => handleSpellKey(key)}
                          disabled={!!showFeedback || inputRef.current.length >= currentQ.word.word.length}
                        >
                          {key}
                        </button>
                      ))}
                      {row === 'ZXCVBNM' && (
                        <button className="test-key test-key-del" onClick={handleSpellDelete} disabled={!!showFeedback}>←</button>
                      )}
                    </div>
                  ))}
                  {spellInput.length === currentQ.word.word.length && !showFeedback && (
                    <button className="btn btn-small test-confirm-btn" onClick={handleSpellConfirm}>
                      ✓ 确认
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Choice options */}
        {currentQ.type === 'choice' && currentQ.options && (
          <div className="test-options">
            {currentQ.options.map((opt) => {
              let cls = 'test-option';
              if (selectedOption) {
                if (opt === currentQ.word.word) cls += ' correct';
                else if (opt === selectedOption) cls += ' wrong';
              }
              return (
                <motion.button
                  key={opt}
                  className={cls}
                  onClick={() => handleOptionSelect(opt)}
                  disabled={!!selectedOption}
                  whileTap={{ scale: 0.97 }}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Feedback */}
      <FeedbackModal
        show={showFeedback}
        correct={isCorrect}
        word={currentQ.word}
        userAnswer={selectedOption || spellInput}
        onNext={handleNext}
        points={10}
      />
    </div>
  );
};

export default Test;
