/**
 * 高度圖解析器
 * 用於解析PNG格式的高度圖資源
 * @version 1.0.0
 */

import type * as Phaser from 'phaser';

export class HeightmapParser {
  private heightData: Float32Array;
  private width: number;
  private height: number;

  constructor() {
    this.heightData = new Float32Array();
    this.width = 0;
    this.height = 0;
  }

  /**
   * 從紋理載入高度圖數據
   * @param texture Phaser紋理對象
   */
  loadFromTexture(texture: Phaser.Textures.Texture): void {
    const image = texture.getSourceImage() as HTMLImageElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('無法取得Canvas 2D上下文');
    }

    this.width = image.width;
    this.height = image.height;
    canvas.width = this.width;
    canvas.height = this.height;
    context.drawImage(image, 0, 0);

    const imageData = context.getImageData(0, 0, this.width, this.height);
    this.heightData = new Float32Array(this.width * this.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const pixelIndex = i / 4;
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      
      // 轉換RGB值為高度值 (0-1)
      this.heightData[pixelIndex] = (r + g + b) / (3 * 255);
    }
  }

  /**
   * 取得指定座標的高度值
   * @param x 水平座標 (0-1)
   * @param y 垂直座標 (0-1)
   * @returns 標準化高度值 (0-1)
   */
  getHeightAt(x: number, y: number): number {
    const pixelX = Math.floor(x * (this.width - 1));
    const pixelY = Math.floor(y * (this.height - 1));
    const index = pixelY * this.width + pixelX;
    
    if (index < 0 || index >= this.heightData.length) {
      return 0;
    }
    return this.heightData[index];
  }

  /**
   * 取得高度圖寬度 (像素)
   */
  getWidth(): number {
    return this.width;
  }

  /**
   * 取得高度圖高度 (像素)
   */
  getHeight(): number {
    return this.height;
  }
}