import { PerformanceMonitor, PerformanceMetrics } from '../src/systems/PerformanceMonitor';
import { AdaptiveSampler } from '../src/systems/AdaptiveSampler';

// 模擬 Phaser.Scene 物件
// 模擬完整的 Phaser.Textures.TextureManager 結構
const mockTextures = {
  list: Object.fromEntries(
    Array.from({length: 10}, (_, i) => [`texture-${i}`, {} as Phaser.Textures.Texture])
  )
} as Phaser.Textures.TextureManager;

const mockScene = {
  game: {
    loop: {
      actualFps: 60
    }
  },
  textures: mockTextures,
  time: {
    now: 0
  }
} as unknown as Phaser.Scene;

// 模擬瀏覽器記憶體 API
Object.defineProperty(window, 'performance', {
  value: {
    memory: {
      usedJSHeapSize: 100000000 // 100,000,000 bytes = 0.1 GB
    }
  },
  configurable: true
});

describe('PerformanceMonitor 單元測試', () => {
  let monitor: PerformanceMonitor;
  
  beforeEach(() => {
    monitor = new PerformanceMonitor();
    jest.spyOn(Date, 'now').mockImplementation(() => 1000);
    
    // 重置模擬的 performance.memory
    // 重置記憶體模擬
    Object.defineProperty(window.performance, 'memory', {
      value: {
        usedJSHeapSize: 100000000, // 100MB = 0.1GB
        jsHeapSizeLimit: 1000000000 // 1GB
      },
      configurable: true,
      writable: true
    });
  });

  it('應正確初始化性能指標', () => {
    expect(monitor.getMetrics()).toEqual({
      fps: 60,
      memoryUsage: 0,
      activeTextures: 0
    });
  });

  it('應在採樣間隔外更新指標', () => {
    monitor['lastUpdate'] = 500;
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 100000000, // 100MB
        jsHeapSizeLimit: 1000000000 // 1GB
      },
      configurable: true
    });

    monitor.update(mockScene);

    expect(monitor.getMetrics()).toMatchObject({
      fps: 60,
      memoryUsage: 0.1,
      activeTextures: 10
    });
  });

  it('應處理無記憶體監控的情況', () => {
    monitor['lastUpdate'] = 500;
    delete (performance as any).memory;

    monitor.update(mockScene);

    expect(monitor.getMetrics().memoryUsage).toBe(0);
  });

  it('應驗證多裝置輸入的邊界條件', () => {
    // 模擬高負載情境
    // 模擬高負載情境
    mockScene.textures.list = Object.fromEntries(
      Array.from({length: 1000}, (_, i) => [`texture-${i}`, {} as Phaser.Textures.Texture])
    );
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 900 * 1024 * 1024, // 轉換為位元組
        jsHeapSizeLimit: 1000 * 1024 * 1024
      },
      configurable: true
    });

    monitor.update(mockScene);
    const metrics = monitor.getMetrics();

    expect(metrics.activeTextures).toBe(1000);
    expect(metrics.memoryUsage).toBeCloseTo(0.9);
  });
});