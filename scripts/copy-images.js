const fs = require('fs');
const path = require('path');

// 複製圖片檔案到轉換後的目錄
function copyImages() {
  const sourceDir = 'public/assets/players';
  const targetDir = 'public/assets/players-phaser';
  
  const directories = [
    'Raiden-1P',
    'Raiden-2P',
    'Raiden-MADshark-1P',
    'Raiden-MKII-1P',
    'Raiden-MKII-2P'
  ];
  
  directories.forEach(dir => {
    const sourcePath = path.join(sourceDir, dir);
    const targetPath = path.join(targetDir, dir);
    
    // 檢查來源檔案是否存在
    const sourceImage = path.join(sourcePath, `${dir}.png`);
    const targetImage = path.join(targetPath, `${dir}.png`);
    
    if (fs.existsSync(sourceImage)) {
      fs.copyFileSync(sourceImage, targetImage);
      console.log(`✓ 複製: ${sourceImage} -> ${targetImage}`);
    } else {
      console.log(`✗ 找不到檔案: ${sourceImage}`);
    }
  });
}

copyImages();
console.log('圖片複製完成！');
