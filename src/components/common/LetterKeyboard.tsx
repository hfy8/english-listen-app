import React from 'react';
import './LetterKeyboard.css';

interface Props {
  onKeyPress: (letter: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
  disabled?: boolean;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

export const LetterKeyboard: React.FC<Props> = ({
  onKeyPress,
  onDelete,
  onConfirm,
  disabled,
}) => {
  return (
    <div className="keyboard-wrapper">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => {
            const isDelete = key === '⌫';
            const isConfirm = key === '✓';

            let className = 'letter-key';
            if (disabled) className += ' disabled';
            if (isDelete) className += ' delete';
            if (isConfirm) className += ' confirm';

            return (
              <button
                key={key}
                className={className}
                onClick={() => {
                  if (isDelete) onDelete();
                  else if (isConfirm) onConfirm();
                  else onKeyPress(key.toLowerCase());
                }}
                disabled={disabled}
              >
                {isDelete ? '←' : isConfirm ? '✓' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default LetterKeyboard;
