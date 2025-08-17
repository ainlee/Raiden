/** 立方體座標與尺寸定義 */
export interface Cube {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

/**
 * 等角投影碰撞器
 * @class IsometricCollider
 * @memberof Phaser.Physics.Arcade
 */

/** 擴充Phaser類型定義 */
declare global {
  namespace Phaser.Physics.Arcade {
    interface ArcadePhysics {
      /**
       * 新增等角碰撞器
       * @param {IsometricCollider} collider - 等角碰撞器實例
       * @param {boolean} [isPlayer=false] - 是否為玩家碰撞器
       */
      addIsometricCollider(collider: IsometricCollider, isPlayer?: boolean): void;
    }
  }
  namespace Plugins {
    interface PluginManager {
      get(key: 'PhysicsSystem'): PhysicsSystem;
    }
  }
  namespace Events {
    class EventEmitter {
      on(event: string, fn: Function, context?: any): this;
      emit(event: string, ...args: any[]): boolean;
    }
  }
}