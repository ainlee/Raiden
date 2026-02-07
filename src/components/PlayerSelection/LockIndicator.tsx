import React from 'react';
import styles from './PlayerShipSelection.module.css';

/**
 * 鎖定狀態指示器元件
 * @param {Object} props - 元件屬性
 * @param {boolean} props.locked - 當前鎖定狀態
 * @param {Function} props.onClick - 點擊事件處理函數
 */
const LockIndicator: React.FC<{
  locked: boolean;
  onClick: (e: React.MouseEvent) => void;
}> = ({ locked, onClick }) => {
  return (
    <button
      className={`${styles.lockButton} ${locked ? styles.locked : ''}`}
      onClick={onClick}
      aria-label={locked ? '解鎖自機' : '鎖定自機'}
    >
      {locked ? '🔓' : '🔒'}
    </button>
  );
};

export default LockIndicator;