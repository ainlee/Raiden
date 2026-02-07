/**
 * 仿射變換矩陣運算模組
 * 提供相機傾斜投影與紋理變形計算功能
 * @version 1.0.0
 */

// 二維向量類別
export class Vector2 {
  constructor(public x: number, public y: number) {}

  // 向量加法
  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  // 向量乘法 (標量)
  multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  // 向量克隆
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
}

// 仿射變換矩陣類別
export class AffineTransform {
  private matrix: number[][];

  constructor() {
    // 初始化單位矩陣
    this.matrix = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  /**
   * 設定相機傾斜變換
   * @param tiltAngle 相機俯角 (度)
   * @param parallaxFactor 視差位移係數
   */
  setCameraTilt(tiltAngle: number, parallaxFactor: Phaser.Math.Vector2): void {
    const rad = (tiltAngle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    // 修正傾斜變換矩陣 (移除不必要的第三維度)
    const tiltMatrix = [
      [1, 0, 0],
      [sin, cos, 0],
      [0, 0, 1]
    ];

    // 視差位移矩陣
    const parallaxMatrix = [
      [1, 0, parallaxFactor.x],
      [0, 1, parallaxFactor.y],
      [0, 0, 1]
    ];

    // 矩陣乘法順序調整為先傾斜後位移
    this.matrix = this.multiply(tiltMatrix, parallaxMatrix);
  }

  /**
   * 矩陣乘法
   * @param a 矩陣A
   * @param b 矩陣B
   * @returns 乘積矩陣
   */
  private multiply(a: number[][], b: number[][]): number[][] {
    const result = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  }

  /**
   * 應用變換到點
   * @param point 原始座標點
   * @returns 變換後的座標點
   */
  transformPoint(point: Vector2): Vector2 {
    const x = this.matrix[0][0] * point.x + this.matrix[0][1] * point.y + this.matrix[0][2];
    const y = this.matrix[1][0] * point.x + this.matrix[1][1] * point.y + this.matrix[1][2];
    return new Vector2(x, y);
  }

  /**
   * 紋理UV變形計算
   * @param uv 原始UV座標
   * @param height 高度值 (0~1)
   * @returns 變形後的UV座標
   */
  warpTextureUV(uv: Vector2, height: number): Vector2 {
    const depthFactor = 1.0 - Math.max(0, Math.min(1, height));
    const offset = new Vector2(
      this.matrix[0][2] * depthFactor,
      this.matrix[1][2] * depthFactor
    );
    return uv.add(offset.multiply(depthFactor));
  }
}

// 預設導出仿射變換類別
export default AffineTransform;