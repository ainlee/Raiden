import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createPseudo3DTestEnv } from '../test-utils/pseudo3d-setup';
import { InputHandler } from '../../src/systems/InputHandler';
import { TerrainDeformer } from '../../src/terrain/TerrainDeformer';
import { CameraProjection } from '../../src/systems/CameraProjection';

/**
 * 偽3D整合測試套件
 * 包含操作模式互動、貼圖精度與相機效能測試
 */
describe('偽3D系統整合測試', () => {
  let testEnv: ReturnType<typeof createPseudo3DTestEnv>;
  let inputHandler: InputHandler;
  let terrainDeformer: TerrainDeformer;
  let cameraProjection: CameraProjection;

  beforeEach(() => {
    testEnv = createPseudo3DTestEnv();
    inputHandler = testEnv.systems.inputHandler;
    terrainDeformer = testEnv.systems.terrainDeformer;
    cameraProjection = testEnv.systems.cameraProjection;
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  // 測試案例 1：操作模式與地形變形互動
  describe('操作模式互動測試', () => {
    it('鍵盤操作應正確觸發地形變形', async () => {
      // 模擬鍵盤輸入
      inputHandler.simulateKeyPress('ArrowUp');
      const deformation = terrainDeformer.getCurrentDeformation();
      expect(deformation.intensity).toBeGreaterThan(0);
    });

    it('搖桿操作應產生平滑地形變形', async () => {
      // 模擬搖桿輸入
      inputHandler.simulateGamepadAxis(0, 0.7);
      const deformation = terrainDeformer.getCurrentDeformation();
      expect(deformation.smoothness).toBeCloseTo(0.85, 1);
    });

    it('觸控操作應精確對應變形位置', async () => {
      // 模擬觸控輸入
      inputHandler.simulateTouch(100, 200);
      const deformation = terrainDeformer.getCurrentDeformation();
      expect(deformation.position.x).toBeCloseTo(100);
      expect(deformation.position.y).toBeCloseTo(200);
    });
  });

  // 測試案例 2：貼圖變形精度驗證
  describe('貼圖變形精度測試', () => {
    const heightLevels = [0.2, 0.5, 0.8];
    
    heightLevels.forEach(height => {
      it(`在高度 ${height} 時貼圖變形誤差應小於 2%`, () => {
        testEnv.setPlayerAltitude(height);
        const distortion = terrainDeformer.calculateTextureDistortion();
        expect(distortion.errorRate).toBeLessThan(0.02);
      });
    });
  });

  // 測試案例 3：相機投影效能測試
  describe('相機投影壓力測試', () => {
    const testCases = [10, 50, 100]; // 物件數量級別

    testCases.forEach(count => {
      it(`在 ${count} 個物件下維持 60fps`, () => {
        testEnv.spawnObjects(count);
        const report = cameraProjection.performanceReport();
        expect(report.averageFPS).toBeGreaterThan(60);
        expect(report.maxFrameTime).toBeLessThan(16); // 16ms per frame
      });
    });
  });
});