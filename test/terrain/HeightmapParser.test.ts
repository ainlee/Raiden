import { describe, it, expect } from 'vitest';
import { createCanvas } from 'canvas';
import { HeightmapParser } from '../../src/terrain/HeightmapParser';

// 模擬Phaser紋理對象 (Node.js環境兼容)
class MockTexture {
  private canvas: any;
  
  constructor(canvas: any) {
    this.canvas = canvas;
  }

  getSourceImage() {
    return this.canvas;
  }
}

describe('HeightmapParser 模組測試', () => {
  it('應正確解析高度圖數據', () => {
    // 建立測試用1x1像素白色圖片
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1, 1);

    const texture = new MockTexture(canvas);
    const parser = new HeightmapParser();
    
    parser.loadFromTexture(texture as any);
    
    expect(parser.getWidth()).toBe(1);
    expect(parser.getHeight()).toBe(1);
    expect(parser.getHeightAt(0, 0)).toBeCloseTo(1.0); // 白色對應高度1.0
  });

  it('應正確處理不同顏色值', async () => {
    // 建立測試用2x2像素圖片
    const canvas = createCanvas(2, 2);
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext('2d')!;
    
    // 設定四個像素顏色
    ctx.fillStyle = '#000000'; // 黑色 (0,0,0)
    ctx.fillRect(0, 0, 1, 1);
    
    ctx.fillStyle = '#808080'; // 灰色 (128,128,128)
    ctx.fillRect(1, 0, 1, 1);
    
    ctx.fillStyle = '#ff0000'; // 紅色 (255,0,0)
    ctx.fillRect(0, 1, 1, 1);
    
    ctx.fillStyle = '#00ff00'; // 綠色 (0,255,0)
    ctx.fillRect(1, 1, 1, 1);
    
    const texture = new MockTexture(canvas.toDataURL());
    const parser = new HeightmapParser();
    
    await new Promise(resolve => {
      texture.getSourceImage().onload = resolve;
    });

    parser.loadFromTexture(texture as any);
    
    // 驗證四個像素高度值
    expect(parser.getHeightAt(0, 0)).toBeCloseTo(0.0);     // (0+0+0)/765 ≈ 0.0
    expect(parser.getHeightAt(0.5, 0)).toBeCloseTo(0.502); // (128+128+128)/765 ≈ 0.502
    expect(parser.getHeightAt(0, 0.5)).toBeCloseTo(0.333); // (255+0+0)/765 ≈ 0.333
    expect(parser.getHeightAt(0.5, 0.5)).toBeCloseTo(0.333); // (0+255+0)/765 ≈ 0.333
  });

  it('應處理超出範圍的座標', async () => {
    const canvas = createCanvas(2, 2);
    canvas.width = 2;
    canvas.height = 2;
    const texture = new MockTexture(canvas.toDataURL());
    const parser = new HeightmapParser();
    
    await new Promise(resolve => {
      texture.getSourceImage().onload = resolve;
    });

    parser.loadFromTexture(texture as any);
    
    // 測試超出範圍的座標
    expect(parser.getHeightAt(-0.1, 0.5)).toBe(0);
    expect(parser.getHeightAt(1.1, 0.5)).toBe(0);
    expect(parser.getHeightAt(0.5, -0.1)).toBe(0);
    expect(parser.getHeightAt(0.5, 1.1)).toBe(0);
  });
});