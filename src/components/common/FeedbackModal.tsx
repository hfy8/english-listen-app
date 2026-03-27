import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Word } from '../../data/vocabulary';

interface Props {
  correct: boolean;
  word: Word;
  userAnswer: string;
  onNext: () => void;
  show: boolean;
  points?: number;
}

export const FeedbackModal: React.FC<Props> = ({
  correct,
  word,
  userAnswer,
  onNext,
  show,
  points = 10,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onNext, correct ? 1800 : 2500);
      return () => clearTimeout(timer);
    }
  }, [show, correct, onNext]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onNext}
        >
          <motion.div
            className="modal-box"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="modal-icon"
              initial={{ scale: 0 }}
              animate={correct ? { scale: [0, 1.3, 1] } : { scale: [0, 1], rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
            >
              {correct ? '🎉' : '💪'}
            </motion.div>

            <div className="modal-title" style={{ color: correct ? 'var(--success)' : 'var(--error)' }}>
              {correct ? '太棒了！' : '没关系，继续加油！'}
            </div>

            {!correct && (
              <div className="modal-word animate-slide-up">{word.word}</div>
            )}
            {!correct && (
              <div className="modal-phonetic">{word.phonetic}</div>
            )}
            {!correct && (
              <div className="modal-chinese">{word.chinese}</div>
            )}

            {correct && (
              <motion.div
                className="modal-word animate-bounce-in"
                style={{ color: 'var(--success)' }}
              >
                {word.word}
              </motion.div>
            )}
            {correct && (
              <div className="modal-phonetic">{word.phonetic}</div>
            )}
            {correct && (
              <div className="modal-chinese">{word.chinese}</div>
            )}

            {!correct && (
              <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                你拼了：{userAnswer}
              </div>
            )}

            <AnimatePresence>
              {correct && (
                <motion.div
                  className="point-badge"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    display: 'inline-block',
                    background: 'var(--accent)',
                    color: 'var(--text-primary)',
                    padding: '8px 24px',
                    borderRadius: '20px',
                    fontSize: '20px',
                    fontWeight: 700,
                    marginTop: 'var(--space-sm)',
                  }}
                >
                  +{points} 分
                </motion.div>
              )}
            </AnimatePresence>

            {!correct && (
              <button className="btn btn-primary btn-full" style={{ marginTop: 'var(--space-md)' }} onClick={onNext}>
                继续下一题
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
