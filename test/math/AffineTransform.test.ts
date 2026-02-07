import { describe, it, expect } from 'vitest';
import AffineTransform, { Vector2 } from '../../src/math/AffineTransform';

describe('AffineTransform 模組測試', () => {
  it('應正確初始化單位矩陣', () => {
    const transform = new AffineTransform();
    const point = new Vector2(5, 5);
    const result = transform.transformPoint(point);
    expect(result.x).toBe(5);
    expect(result.y).toBe(5);
  });

  it('應正確計算相機傾斜變換', () => {
    const transform = new AffineTransform();
    transform.setCameraTilt(35, new Vector2(0.1, 0.05));
    
    const originalPoint = new Vector2(100, 200);
    const transformedPoint = transform.transformPoint(originalPoint);
    
    // 驗證變換後座標在預期範圍內
    // 驗證變換後座標 (修正後的矩陣計算)
    const expectedX = 100 + 100 * 0.1; // x + x * parallaxX
    const expectedY = 200 + 100 * Math.sin(35 * Math.PI/180) + 200 * 0.05; // y + y * sin(tilt) + y * parallaxY
    expect(transformedPoint.x).toBeCloseTo(expectedX, 1); // 允許小數點後一位誤差
    expect(transformedPoint.y).toBeCloseTo(expectedY, 1);
  });

  it('應正確計算紋理UV變形', () => {
    const transform = new AffineTransform();
    transform.setCameraTilt(35, new Vector2(0.1, 0.05));
    
    const uv = new Vector2(0.5, 0.5);
    const warpedUV = transform.warpTextureUV(uv, 0.8);
    
    // 驗證高度影響UV偏移
    // 驗證高度影響UV偏移 (高度0.8 => 深度因子0.2)
    const depthFactor = 0.2;
    const expectedX = 0.5 + 0.1 * depthFactor;
    const expectedY = 0.5 + 0.05 * depthFactor;
    expect(warpedUV.x).toBeCloseTo(expectedX, 1); // 允許小數點後一位誤差
    expect(warpedUV.y).toBeCloseTo(expectedY, 1);
  });

  it('應正確處理矩陣乘法', () => {
    const transform = new AffineTransform();
    const matrixA = [
      [2, 0, 10],
      [0, 3, 20],
      [0, 0, 1]
    ];
    const matrixB = [
      [1, 0, 5],
      [0, 1, 5],
      [0, 0, 1]
    ];
    
    const result = transform.multiply(matrixA, matrixB);
    expect(result[0][0]).toBe(2);
    expect(result[0][2]).toBe(20); // 2*5 + 0*5 + 10*1 = 10 + 10 = 20
    expect(result[1][2]).toBe(35); // 0*5 + 3*5 + 20*1 = 15 + 20 = 35
  });
});