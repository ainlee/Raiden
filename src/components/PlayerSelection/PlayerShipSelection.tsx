import React, { useState, useEffect } from 'react';
import AssetScanner, { type PlayerAsset } from '../../systems/AssetScanner';
import ShipThumbnail from './ShipThumbnail';
import styles from './PlayerShipSelection.module.css';

/**
 * 自機選擇主界面元件
 * @param {Object} props - 元件屬性
 * @param {number} props.playerCount - 玩家數量 (1-4)
 */
const PlayerShipSelection: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  const [ships, setShips] = useState<PlayerAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initScanner = async () => {
      const scanner = new AssetScanner('public/assets/players', '.previews');
      await scanner.initialize();
      setShips(Array.from(scanner.getAllAssets()));
      setLoading(false);
    };

    initScanner();
  }, []);

  const handleShipSelect = (shipId: string) => {
    console.log(`Selected ship: ${shipId}`);
    // TODO: 實作選擇邏輯
  };

  const handleLockToggle = async (shipId: string, locked: boolean) => {
    console.log(`${locked ? '解鎖' : '鎖定'}自機: ${shipId}`);
    // TODO: 呼叫 LockStateSyncer API
  };

  if (loading) {
    return <div className={styles.loading}>載入自機資料中...</div>;
  }

  return (
    <div className={`${styles.gridContainer} players-${playerCount}`}>
      {ships.map((ship) => (
        <ShipThumbnail
          key={ship.id}
          ship={ship}
          onSelect={handleShipSelect}
          onLockToggle={handleLockToggle}
        />
      ))}
    </div>
  );
};

export default PlayerShipSelection;