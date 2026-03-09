/**
 * 將 Aseprite JSON 格式轉換為 Phaser Atlas 格式
 *
 * 關鍵差異：
 * - meta.slices: Aseprite 是陣列 []，Phaser Atlas 需要物件 {}
 * - 其他結構基本相同
 */

import * as fs from 'fs';
import * as path from 'path';

interface AsepriteFrame {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
  duration: number;
}

interface AsepriteMeta {
  app: string;
  version: string;
  image: string;
  format: string;
  size: { w: number; h: number };
  scale: string;
  frameTags: any[];
  layers: any[];
  slices: any[];
}

interface AsepriteJson {
  frames: Record<string, AsepriteFrame>;
  meta: AsepriteMeta;
}

interface PhaserAtlasFrame {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
  duration: number;
}

interface PhaserAtlasMeta {
  app: string;
  version: string;
  image: string;
  format: string;
  size: { w: number; h: number };
  scale: string;
  frameTags: any[];
  layers: any[];
  slices: { [key: string]: any };
}

interface PhaserAtlasJson {
  frames: Record<string, PhaserAtlasFrame>;
  meta: PhaserAtlasMeta;
}

/**
 * 轉換 Aseprite JSON 到 Phaser Atlas JSON
 */
function convertAsepriteToPhaserAtlas(asepriteJson: AsepriteJson): PhaserAtlasJson {
  const phaserAtlas: PhaserAtlasJson = {
    frames: {},
    meta: {
      ...asepriteJson.meta,
      slices: {} // 關鍵差異：將陣列轉為空物件
    }
  };

  // 複製 frames
  for (const [key, frame] of Object.entries(asepriteJson.frames)) {
    phaserAtlas.frames[key] = {
      ...frame,
      frame: { ...frame.frame },
      spriteSourceSize: { ...frame.spriteSourceSize },
      sourceSize: { ...frame.sourceSize }
    };
  }

  return phaserAtlas;
}

/**
 * 轉換單一 JSON 檔案
 */
function convertFile(inputPath: string, outputPath: string): void {
  console.log(`轉換: ${inputPath} -> ${outputPath}`);

  const jsonContent = fs.readFileSync(inputPath, 'utf-8');
  const asepriteJson: AsepriteJson = JSON.parse(jsonContent);

  const phaserAtlas = convertAsepriteToPhaserAtlas(asepriteJson);

  fs.writeFileSync(outputPath, JSON.stringify(phaserAtlas, null, 2), 'utf-8');
  console.log(`✓ 完成: ${outputPath}`);
}

/**
 * 遞迴掃描並轉換所有 JSON 檔案
 */
function convertAllInDirectory(dirPath: string, outputDir: string): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      // 遞迴處理子目錄
      convertAllInDirectory(fullPath, path.join(outputDir, file));
    } else if (file.endsWith('.json')) {
      // 轉換 JSON 檔案
      const relativePath = path.relative(dirPath, fullPath);
      const outputPath = path.join(outputDir, relativePath);
      convertFile(fullPath, outputPath);
    }
  }
}

/**
 * 主程式
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('用法: npx tsx scripts/convert-aseprite-to-phaser-atlas.ts <輸入目錄> [輸出目錄]');
    console.log('範例: npx tsx scripts/convert-aseprite-to-phaser-atlas.ts public/assets/players');
    process.exit(1);
  }

  const inputDir = args[0];
  const outputDir = args[1] || inputDir + '-phaser';

  if (!fs.existsSync(inputDir)) {
    console.error(`錯誤: 目錄不存在 - ${inputDir}`);
    process.exit(1);
  }

  console.log(`開始轉換 Aseprite JSON 到 Phaser Atlas 格式...`);
  console.log(`輸入目錄: ${inputDir}`);
  console.log(`輸出目錄: ${outputDir}`);
  console.log('');

  convertAllInDirectory(inputDir, outputDir);

  console.log('');
  console.log('✓ 所有檔案轉換完成！');
}

main();
