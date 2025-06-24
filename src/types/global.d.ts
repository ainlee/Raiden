/** 立方體座標與尺寸定義 */
export interface Cube {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

/** 擴充Phaser類型定義 */
declare namespace Phaser {
  namespace Events {
    interface EventEmitter {
      on(event: string, fn: Function, context?: any): this;
      emit(event: string, ...args: any[]): boolean;
    }
  }
}