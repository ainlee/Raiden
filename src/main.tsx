import Phaser from 'phaser';
import MainMenuScene from './scenes/MainMenuScene';
import MainScene from './scenes/MainScene';
import TestLevel from './scenes/TestLevel';
import React from 'react';
import ReactDOM from 'react-dom/client';
import DevPanel from './components/DevPanel/DevPanel';

// Phaser 遊戲配置
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  scene: [MainMenuScene, MainScene, TestLevel],
  physics: {
    default: 'arcade',
    arcade: {
      debug: import.meta.env.DEV,
      gravity: { y: 0 }
    }
  }
};

// 初始化遊戲
const game = new Phaser.Game(config);

// 渲染開發者面板
if (import.meta.env.DEV) {
  const devPanelRoot = document.getElementById('dev-panel-root');
  if (devPanelRoot) {
    ReactDOM.createRoot(devPanelRoot).render(
      <React.StrictMode>
        <DevPanel isDevMode={import.meta.env.DEV} />
      </React.StrictMode>
    );
  }
}
