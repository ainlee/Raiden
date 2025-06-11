export interface WindowParameters {
  size: number;
  start: number;
  end: number;
}

export class DynamicWindowAdjuster {
  private baseWindowSize: number;
  private currentWindowSize: number;
  
  constructor(initialSize: number = 300000) {
    this.baseWindowSize = initialSize;
    this.currentWindowSize = initialSize;
  }

  /**
   * 調整動畫視窗參數，整合解析度與幀率計算
   * @param performanceMetrics 效能指標
   * @param resolution 目前螢幕解析度
   */
  adjustWindow(
    performanceMetrics: {
      fps: number;
      memoryUsage: number;
      activeTextures: number;
    },
    resolution: { width: number; height: number }
  ) {
    // 計算解析度影響因子 (基於 1080p 基準)
    const resolutionFactor = Math.sqrt(
      (resolution.width * resolution.height) / (1920 * 1080)
    );

    // 幀率影響因子
    const frameRateFactor = Math.min(60 / performanceMetrics.fps, 2);
    
    // 記憶體使用率因子
    const memoryFactor = performanceMetrics.memoryUsage < 0.7 ? 1 : 0.8;
    
    // 綜合計算視窗尺寸
    this.currentWindowSize = Math.max(
      60000,
      Math.min(
        this.baseWindowSize * frameRateFactor * memoryFactor * resolutionFactor,
        600000
      )
    );
  }

  /**
   * 取得目前動畫品質參數
   * @returns 包含視窗尺寸與畫質等級的參數
   */
  getCurrentWindow(): WindowParameters & { qualityLevel: number } {
    const baseParams = {
      size: this.currentWindowSize,
      start: Date.now() - this.currentWindowSize,
      end: Date.now()
    };
    
    // 根據視窗尺寸計算畫質等級 (1-5)
    const qualityLevel = Math.ceil(
      (this.currentWindowSize - 60000) / (600000 - 60000) * 4 + 1
    );
    
    return { ...baseParams, qualityLevel };
  }
}