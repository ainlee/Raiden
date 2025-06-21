import Phaser from 'phaser';

/** 單個透視層配置參數 */
interface LayerConfig {
  /** 材質資源鍵名 */
  textureKey: string;
  /** 捲動速度 (0.1~2.0) */
  scrollSpeed: number;
  /** 基礎縮放比例 */
  baseScale: number;
  /** 透明度範圍 [近端, 遠端] */
  alphaRange: [number, number];
  /** 渲染深度(數值越大越靠後) */
  depth: number;
}

/** 單個透視層管理類別 */
class ParallaxLayer {
  private scene: Phaser.Scene;
  private tileSprites: Phaser.GameObjects.TileSprite[] = [];
  public layerMetrics = {
    transformCount: 0,
    maxDepth: 0
  };

  constructor(
    scene: Phaser.Scene,
    private config: LayerConfig,
    private horizonY: number
  ) {
    this.scene = scene;
    this.createTileSprites();
  }

  /** 建立平鋪精靈 */
  private createTileSprites() {
    const { width, height } = this.scene.scale;
    const count = Math.ceil(width / (this.config.baseScale * 500)) + 1;
    
    for (let i = 0; i < count; i++) {
      const x = i * (this.config.baseScale * 500) - (this.config.baseScale * 250);
      const tileSprite = this.scene.add.tileSprite(
        x,
        this.horizonY,
        this.config.baseScale * 500,
        this.config.baseScale * 500,
        this.config.textureKey
      )
        .setOrigin(0.5, 0)
        .setDepth(this.config.depth)
        .setAlpha(this.config.alphaRange[0]);
      
      this.tileSprites.push(tileSprite);
    }
  }

  /** 更新層級狀態 */
  update(delta: number) {
    const camera = this.scene.cameras.main;
    const screenHeight = this.scene.scale.height;
    
    this.tileSprites.forEach(sprite => {
      // 計算縱深比例
      const spriteY = sprite.y + sprite.displayHeight;
      const depthFactor = (spriteY - this.horizonY) / (screenHeight - this.horizonY);
      
      // 套用透視變換
      const scale = this.config.baseScale * (1 + depthFactor * 0.8);
      const alpha = Phaser.Math.Clamp(
        Phaser.Math.Linear(this.config.alphaRange[0], this.config.alphaRange[1], depthFactor),
        0, 1
      );
      
      sprite
        .setScale(scale)
        .setAlpha(alpha)
        .setTilePosition(
          sprite.tilePositionX + (this.config.scrollSpeed * delta),
          sprite.tilePositionY
        );
        
      // 重置超出畫面的精靈位置
      if (sprite.x < camera.scrollX - sprite.displayWidth) {
        sprite.x += this.tileSprites.length * sprite.displayWidth;
      } else if (sprite.x > camera.scrollX + camera.width + sprite.displayWidth) {
        sprite.x -= this.tileSprites.length * sprite.displayWidth;
      }

      // 更新指標
      this.layerMetrics.transformCount++;
      this.layerMetrics.maxDepth = Math.max(this.layerMetrics.maxDepth, depthFactor);
    });
  }

  /** 視窗大小變更處理 */
  resize() {
    this.tileSprites.forEach(sprite => sprite.destroy());
    this.tileSprites = [];
    this.createTileSprites();
  }
}

/** 透視效果管理系統 */
export class PerspectiveManager {
  private layers: ParallaxLayer[] = [];
  private horizonY: number;
  private scene: Phaser.Scene; // 新增場景屬性
  
  /** 效能指標 */
  public metrics = {
    layerCount: 0,
    opsPerFrame: 0,
    maxDepth: 0
  };

  constructor(scene: Phaser.Scene, horizonRatio: number = 1/6) {
    this.scene = scene; // 初始化場景屬性
    this.horizonY = scene.scale.height * horizonRatio;
  }

  /** 新增透視層 */
  createLayer(config: LayerConfig) {
    const layer = new ParallaxLayer(this.scene, config, this.horizonY);
    this.layers.push(layer);
    this.metrics.layerCount = this.layers.length;
    return layer;
  }

  /** 更新所有層級 */
  update(delta: number) {
    this.metrics.opsPerFrame = 0;
    this.metrics.maxDepth = 0;
    
    this.layers.forEach(layer => {
      layer.update(delta);
      this.metrics.opsPerFrame += layer.layerMetrics.transformCount;
      this.metrics.maxDepth = Math.max(this.metrics.maxDepth, layer.layerMetrics.maxDepth);
      layer.layerMetrics.transformCount = 0; // 重設計數器
    });
  }

  /** 視窗大小變更處理 */
  resize() {
    this.horizonY = this.scene.scale.height * (1/6);
    this.layers.forEach(layer => layer.resize());
  }
}