// 全域類型定義
declare module 'phaser' {
  import * as Phaser from 'phaser';
  export = Phaser;
}

interface Window {
  Phaser: typeof Phaser;
}

// 擴充Phaser命名空間
declare namespace Phaser {
  interface GameConfig {
    /** 自定義物理系統設定 */
    physics?: {
      /** 預設物理系統 */
      default: 'arcade' | 'matter';
      /** 物理系統設定 */
      arcade?: {
        /** 重力設定 */
        gravity?: { x: number; y: number };
        /** 除錯模式 */
        debug?: boolean;
      };
    };
    /** 等角投影插件設定 */
    isoPlugin?: {
      /** 是否啟用 */
      enable: boolean;
    };
  }
}