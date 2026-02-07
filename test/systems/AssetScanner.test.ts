import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AssetScanner, { PlayerAsset } from '../../src/systems/AssetScanner';
import fs from 'fs/promises';
import path from 'path';

// 模擬 fs 和 path 模組
vi.mock('fs/promises');
vi.mock('path');
vi.mock('chokidar');

describe('AssetScanner 單元測試', () => {
  const assetsDir = 'public/assets/players';
  const previewsDir = '.previews';
  let scanner: AssetScanner;

  beforeEach(() => {
    scanner = new AssetScanner(assetsDir, previewsDir);
    vi.clearAllMocks();
  });

  describe('初始化測試', () => {
    it('應正確建立預覽目錄', async () => {
      await scanner.initialize();
      expect(fs.mkdir).toHaveBeenCalledWith(previewsDir, { recursive: true });
    });

    it('應處理目錄掃描錯誤', async () => {
      vi.mocked(fs.readdir).mockRejectedValue(new Error('讀取失敗'));
      await expect(scanner.initialize()).resolves.not.toThrow();
    });
  });

  describe('素材處理測試', () => {
    const mockAssetDir = 'Raiden-MKII';
    
    beforeEach(() => {
      // 模擬目錄結構
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: mockAssetDir, isDirectory: () => true }
      ] as any[]);
      
      // 模擬路徑解析
      vi.mocked(path.join)
        .mockReturnValueOnce(`${assetsDir}/${mockAssetDir}`)
        .mockReturnValueOnce(`${assetsDir}/${mockAssetDir}/base.png`)
        .mockReturnValueOnce(`${assetsDir}/${mockAssetDir}/config.json`);
    });

    it('應正確驗證並載入有效素材', async () => {
      // 模擬檔案存在
      vi.mocked(fs.access).mockResolvedValue(undefined);
      // 模擬設定檔內容
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({
        hitbox: [[0,0], [10,10]],
        abilities: ["shield"]
      }));

      await scanner.initialize();
      const assets = scanner.getAllAssets();
      
      expect(assets.length).toBe(1);
      expect(assets[0].id).toBe(mockAssetDir);
      expect(assets[0].name).toBe('Mkii');
    });

    it('應忽略缺少設定檔的素材', async () => {
      vi.mocked(fs.access).mockImplementation((path) => {
        if (path.includes('config.json')) {
          return Promise.reject(new Error('檔案不存在'));
        }
        return Promise.resolve();
      });

      await scanner.initialize();
      expect(scanner.getAllAssets().length).toBe(0);
    });
  });

  describe('預覽圖生成測試', () => {
    it('應複製基礎圖像作為預覽', async () => {
      const mockAsset = {
        id: 'test-asset',
        basePath: '/path/to/base.png',
        previewPath: '/path/to/preview.png'
      } as PlayerAsset;

      await (scanner as any).generatePreview(mockAsset);
      expect(fs.copyFile).toHaveBeenCalledWith(
        mockAsset.basePath,
        mockAsset.previewPath
      );
    });
  });

  describe('檔案監聽測試', () => {
    it('應設定chokidar監聽器', async () => {
      await scanner.initialize();
      expect(vi.mocked(scanner as any).setupWatcher).toHaveBeenCalled();
    });
  });
});