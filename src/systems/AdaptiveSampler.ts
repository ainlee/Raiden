export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  activeTextures: number;
}

export class AdaptiveSampler {
  private baseInterval = 1000;
  private currentInterval = this.baseInterval;
  private lastMetrics?: PerformanceMetrics;
  private changeRate = 0;

  calculateChangeRate(newMetrics: PerformanceMetrics): number {
    if (!this.lastMetrics) return 0;
    
    const fpsDelta = Math.abs(newMetrics.fps - this.lastMetrics.fps);
    const memDelta = Math.abs(newMetrics.memoryUsage - this.lastMetrics.memoryUsage);
    return (fpsDelta * 0.7) + (memDelta * 0.3);
  }

  adjustSamplingInterval(newMetrics: PerformanceMetrics) {
    if (newMetrics.fps < 15) {
      this.currentInterval = 100;
      return;
    }

    const rate = this.calculateChangeRate(newMetrics);
    
    this.currentInterval = rate > 5
      ? Math.max(100, this.baseInterval / rate)
      : rate > 2
      ? this.baseInterval * 0.75
      : Math.min(5000, this.baseInterval * 1.1);

    this.lastMetrics = {...newMetrics};
  }

  get samplingInterval() {
    return this.currentInterval;
  }
}