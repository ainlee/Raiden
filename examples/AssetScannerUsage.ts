import AssetScanner from '../src/systems/AssetScanner';

/**
 * AssetScanner 使用範例
 */
async function main() {
  // 初始化掃描器
  const scanner = new AssetScanner(
    'public/assets/players',
    '.previews'
  );

  try {
    await scanner.initialize();
    console.log('素材掃描完成');

    // 取得所有素材
    const allAssets = scanner.getAllAssets();
    console.log(`找到 ${allAssets.length} 個素材:`);
    allAssets.forEach(asset => {
      console.log(`- ${asset.name} (${asset.id})`);
      console.log(`  命中框: ${asset.config.hitbox.length} 個點`);
      console.log(`  能力: ${asset.config.abilities.join(', ')}`);
    });

    // 取得特定素材
    const targetAsset = scanner.getAssetById('Raiden-MKII');
    if (targetAsset) {
      console.log('\n找到目標素材:');
      console.log(targetAsset);
    }
  } catch (err) {
    console.error('素材掃描失敗:', err);
  } finally {
    scanner.close();
  }
}

// 執行範例
main();