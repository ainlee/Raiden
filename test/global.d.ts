/// <reference types="@types/jest" />
/// <reference types="phaser" />

declare global {
  namespace Phaser.Types.Physics.Arcade {
    interface GameObjectWithBody {
      body: Phaser.Physics.Arcade.Body;
    }
  }

  // 擴展核心類型
  interface GameObjectFactory {
    sprite(
      x: number,
      y: number,
      texture: string,
      frame?: string | integer
    ): Phaser.Physics.Arcade.Sprite & Phaser.Types.Physics.Arcade.GameObjectWithBody;
  }
}

// 合併Phaser命名空間
declare module "phaser" {
  namespace Physics.Arcade {
    interface GameObjectWithBody extends Phaser.Types.Physics.Arcade.GameObjectWithBody {}
  }
}