import * as fs from 'fs/promises';
import * as path from 'path';
import * as chokidar from 'chokidar';
import PreviewGenerator from './PreviewGenerator';

/**
 * 自機素材配置介面
 */
export interface PlayerAssetConfig {
  hitbox: [number, number][];
  abilities: string[];
}

/**
 * 自機素材資訊介面
 */
export interface PlayerAsset {
  id: string;
  name: string;
  basePath: string;
  previewPath: string;
  config: PlayerAssetConfig;
}

/**
 * 素材掃描器類別
 */
export default class AssetScanner {
  private assetsDir: string;
  private previewsDir: string;
  private assets: Map<string, PlayerAsset> = new Map();
  private watcher?: chokidar.FSWatcher;
  private previewGenerator: PreviewGenerator;

  /**
   * 建立素材掃描器實例
   * @param assetsDir 素材目錄路徑
   * @param previewsDir 預覽圖快取目錄路徑
   */
  constructor(assetsDir: string, previewsDir: string) {
    this.assetsDir = assetsDir;
    this.previewsDir = previewsDir;
    this.previewGenerator = new PreviewGenerator(previewsDir);
  }

  /**
   * 初始化掃描器
   */
  async initialize() {
    await this.ensurePreviewsDir();
    await this.scanAssets();
    this.setupWatcher();
  }

  /**
   * 取得所有已掃描的自機素材
   */
  getAllAssets(): PlayerAsset[] {
    return Array.from(this.assets.values());
  }

  /**
   * 確保預覽目錄存在
   */
  private async ensurePreviewsDir() {
    try {
      await fs.mkdir(this.previewsDir, { recursive: true });
    } catch (err) {
      console.error(`無法建立預覽目錄: ${this.previewsDir}`, err);
    }
  }

  /**
   * 掃描所有素材
   */
  private async scanAssets() {
    try {
      const assetDirs = await fs.readdir(this.assetsDir, { withFileTypes: true });
      
      for (const dir of assetDirs) {
        if (dir.isDirectory()) {
          await this.processAssetDir(dir.name);
        }
      }
    } catch (err) {
      console.error('掃描素材目錄失敗:', err);
    }
  }

  /**
   * 處理單個素材目錄
   * @param dirName 目錄名稱
   */
  private async processAssetDir(dirName: string) {
    const assetPath = path.join(this.assetsDir, dirName);
    const baseImagePath = path.join(assetPath, 'base.png');
    const configPath = path.join(assetPath, 'config.json');

    try {
      // 驗證必要檔案是否存在
      await Promise.all([
        fs.access(baseImagePath),
        fs.access(configPath)
      ]);

      // 讀取並解析設定檔
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData) as PlayerAssetConfig;

      // 產生預覽圖路徑
      const previewPath = await this.previewGenerator.getPreview({
        id: dirName,
        name: dirName,
        basePath: assetPath,
        previewPath: '',
        config
      });

      // 建立素材資訊
      const asset: PlayerAsset = {
        id: dirName,
        name: dirName,
        basePath: assetPath,
        previewPath,
        config
      };

      this.assets.set(dirName, asset);
      this.previewGenerator.watchAsset(asset);
    } catch (err) {
      console.error(`處理素材目錄失敗: ${dirName}`, err);
    }
  }

  /**
   * 設定檔案監聽器
   */
  private setupWatcher() {
    this.watcher = chokidar.watch(this.assetsDir, {
      ignored: /(^|[\/\\])\../, // 忽略隱藏檔案
      persistent: true,
      ignoreInitial: true
    });

    this.watcher
      .on('addDir', dirPath => {
        const dirName = path.basename(dirPath);
        this.processAssetDir(dirName);
      })
      .on('unlinkDir', dirPath => {
        const dirName = path.basename(dirPath);
        this.assets.delete(dirName);
      });
  }
}