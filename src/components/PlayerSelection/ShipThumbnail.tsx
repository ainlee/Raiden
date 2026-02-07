import React, { useState } from 'react';
import type { PlayerAsset } from '../../systems/AssetScanner';
import LockIndicator from './LockIndicator';
import styles from './PlayerShipSelection.module.css';

/**
 * 自機預覽縮圖元件
 * @param {Object} props - 元件屬性
 * @param {PlayerAsset} props.ship - 自機素材資料
 * @param {Function} props.onSelect - 選擇事件處理函數
 * @param {Function} props.onLockToggle - 鎖定狀態切換處理函數
 */
const ShipThumbnail: React.FC<{
  ship: PlayerAsset;
  onSelect: (shipId: string) => void;
  onLockToggle: (shipId: string, locked: boolean) => void;
}> = ({ ship, onSelect, onLockToggle }) => {
  const [isLocked, setIsLocked] = useState(false);

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLockState = !isLocked;
    setIsLocked(newLockState);
    onLockToggle(ship.id, newLockState);
  };

  return (
    <div 
      className={`${styles.shipThumbnail} ${isLocked ? styles.locked : ''}`}
      onClick={() => onSelect(ship.id)}
    >
      <img 
        src={ship.previewPath} 
        alt={ship.name} 
        className={styles.shipImage}
      />
      <div className={styles.shipInfo}>
        <h3 className={styles.shipName}>{ship.name}</h3>
        <LockIndicator locked={isLocked} onClick={handleLockClick} />
      </div>
    </div>
  );
};

export default ShipThumbnail;