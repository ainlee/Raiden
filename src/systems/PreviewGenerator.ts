import * as sharp from 'sharp';
import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs/promises';
import { EventEmitter } from 'events';
import { PlayerAsset } from './AssetScanner';

/**
 * 預覽圖生成器
 */
export default class PreviewGenerator extends EventEmitter {
  private queue: Map<string, Promise<void>> = new Map();
  private previewsDir: string;
  private watchers: Map<string, fs.FileHandle> = new Map();

  /**
   * 建立預覽生成器實例
   * @param previewsDir 預覽圖輸出目錄
   */
  constructor(previewsDir: string) {
    super();
    this.previewsDir = previewsDir;
  }

  /**
   * 取得或生成預覽圖
   * @param asset 自機素材資訊
   * @returns 預覽圖路徑
   */
  async getPreview(asset: PlayerAsset): Promise<string> {
    const previewPath = this.getPreviewPath(asset);
    const previewExists = await this.checkPreviewExists(previewPath);

    if (!previewExists) {
      await this.generatePreview(asset.basePath, previewPath);
    }

    return previewPath;
  }

  /**
   * 監控素材變更並自動更新預覽圖
   * @param asset 自機素材資訊
   */
  watchAsset(asset: PlayerAsset) {
    const baseImagePath = path.join(asset.basePath, 'base.png');
    const previewPath = this.getPreviewPath(asset);

    const watcher = chokidar.watch(baseImagePath, {
      ignoreInitial: true,
      awaitWriteFinish: true
    }).on('all', async (eventType: string) => {
      if (eventType === 'change') {
        await this.regeneratePreview(baseImagePath, previewPath);
        this.emit('previewUpdated', previewPath);
      }
    });

    this.watchers.set(asset.id, watcher as unknown as fs.FileHandle);
  }

  /**
   * 停止監控素材
   * @param assetId 自機素材ID
   */
  unwatchAsset(assetId: string) {
    const watcher = this.watchers.get(assetId);
    if (watcher) {
      watcher.close();
      this.watchers.delete(assetId);
    }
  }

  /**
   * 取得預覽圖路徑
   * @param asset 自機素材資訊
   * @returns 預覽圖完整路徑
   */
  private getPreviewPath(asset: PlayerAsset): string {
    return path.join(this.previewsDir, `${asset.id}.png`);
  }

  /**
   * 檢查預覽圖是否存在
   * @param previewPath 預覽圖路徑
   */
  private async checkPreviewExists(previewPath: string): Promise<boolean> {
    try {
      await fs.access(previewPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 生成預覽圖
   * @param sourcePath 原始圖檔路徑
   * @param outputPath 輸出預覽圖路徑
   */
  private async generatePreview(sourcePath: string, outputPath: string): Promise<void> {
    const taskKey = outputPath;

    if (this.queue.has(taskKey)) {
      return this.queue.get(taskKey)!;
    }

    const generationPromise = (async () => {
      try {
        await sharp.default(path.join(sourcePath, 'base.png'))
          .resize(128, 128, {
            fit: 'cover',
            position: 'center'
          })
          .toFile(outputPath);
      } catch (err) {
        console.error(`預覽圖生成失敗: ${outputPath}`, err);
        throw err;
      } finally {
        this.queue.delete(taskKey);
      }
    })();

    this.queue.set(taskKey, generationPromise);
    return generationPromise;
  }

  /**
   * 重新生成預覽圖
   * @param sourcePath 原始圖檔路徑
   * @param outputPath 輸出預覽圖路徑
   */
  private async regeneratePreview(sourcePath: string, outputPath: string): Promise<void> {
    try {
      await fs.unlink(outputPath);
    } catch (err) {
      console.warn(`刪除舊預覽圖失敗: ${outputPath}`, err);
    }
    return this.generatePreview(sourcePath, outputPath);
  }
}