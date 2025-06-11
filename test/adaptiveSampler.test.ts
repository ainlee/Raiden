import { AdaptiveSampler } from '../src/systems/AdaptiveSampler';
import { PerformanceMetrics } from '../src/systems/PerformanceMonitor';

describe('AdaptiveSampler', () => {
  it('應在低幀率時進入緊急採樣模式', () => {
    const sampler = new AdaptiveSampler();
    const metrics = {
      fps: 10,
      memoryUsage: 0.9,
      activeTextures: 50
    };

    sampler.adjustSamplingInterval(metrics);
    expect(sampler.samplingInterval).toBe(100);
  });

  it('應根據負載變化率調整採樣間隔', () => {
    const sampler = new AdaptiveSampler();
    const initialMetrics = { fps: 60, memoryUsage: 0.3, activeTextures: 10 };
    const highLoadMetrics = { fps: 30, memoryUsage: 0.8, activeTextures: 40 };

    sampler.adjustSamplingInterval(initialMetrics);
    expect(sampler.samplingInterval).toBe(1100);

    sampler.adjustSamplingInterval(highLoadMetrics);
    expect(sampler.samplingInterval).toBeLessThan(1000);
  });
});