// Phaser3遊戲初始化設定
import Phaser from 'phaser';
import MainScene from './scenes/MainScene';

/**
 * Phaser遊戲配置物件
 * @type {Phaser.Types.Core.GameConfig} 遊戲配置類型
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 初始化遊戲
new Phaser.Game(config);