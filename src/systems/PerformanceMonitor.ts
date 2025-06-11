import { AdaptiveSampler } from './AdaptiveSampler';

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number; 
  activeTextures: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 60,
    memoryUsage: 0,
    activeTextures: 0
  };
  private sampler = new AdaptiveSampler();
  private lastUpdate = 0;

  update(scene: Phaser.Scene) {
    const now = Date.now();
    if (now - this.lastUpdate < this.sampler.samplingInterval) return;

    this.metrics.fps = Math.min(scene.game.loop.actualFps, 60);
    // 類型安全存取 memory 屬性
    const perfMemory = (performance as any).memory;
    if (perfMemory &&
        typeof perfMemory.usedJSHeapSize === 'number' &&
        typeof perfMemory.jsHeapSizeLimit === 'number') {
      this.metrics.memoryUsage = perfMemory.jsHeapSizeLimit > 0
        ? Number((perfMemory.usedJSHeapSize / perfMemory.jsHeapSizeLimit).toFixed(2))
        : 0;
    } else {
      this.metrics.memoryUsage = 0;
    }
      
    // 安全類型檢查
    // 安全取得紋理列表
    // 正確取得紋理列表大小
    // 正確取得 Phaser 紋理列表數量
    const textureManager = scene.textures as Phaser.Textures.TextureManager;
    this.metrics.activeTextures = Object.keys(textureManager.list).length;
    
    this.sampler.adjustSamplingInterval(this.metrics);
    this.lastUpdate = now;
  }

  getMetrics() {
    return {...this.metrics};
  }
}