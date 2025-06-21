// 圖表生成功能暫停開發（需安裝 ts-morph）
// 此功能不影響遊戲主程式運作
import { writeFileSync } from 'fs';

// 初始化 TypeScript 專案
const project = new Project({
  tsConfigFilePath: 'tsconfig.json'
});

/**
 * 生成 Mermaid 格式的類別圖
 * @param sourceFiles 要分析的原始碼檔案
 * @returns Mermaid 格式的類別圖字串
 */
function generateClassDiagram(sourceFiles: string[]): string {
  let output = 'classDiagram\n';
  
  const classMap = new Map<string, string>();
  const inheritanceMap = new Map<string, string[]>();

  // 分析每個原始碼檔案
  sourceFiles.forEach(filePath => {
    const sourceFile = project.getSourceFile(filePath);
    if (!sourceFile) return;

    // 取得類別與介面宣告
    const classes = sourceFile.getClasses();
    const interfaces = sourceFile.getInterfaces();

    // 處理類別
    classes.forEach(cls => {
      const className = cls.getName() || 'AnonymousClass';
      classMap.set(className, cls.getText());

      // 處理繼承關係
      const extendsNode = cls.getExtends();
      if (extendsNode) {
        const parent = extendsNode.getText();
        if (!inheritanceMap.has(className)) {
          inheritanceMap.set(className, []);
        }
        inheritanceMap.get(className)?.push(parent);
      }
    });

    // 處理介面
    interfaces.forEach(intf => {
      const interfaceName = intf.getName() || 'AnonymousInterface';
      classMap.set(interfaceName, intf.getText());
    });
  });

  // 生成類別定義
  Array.from(classMap.keys()).forEach(className => {
    output += `  class ${className}\n`;
  });

  // 生成繼承關係
  Array.from(inheritanceMap.entries()).forEach(([child, parents]) => {
    parents.forEach(parent => {
      output += `  ${parent} <|-- ${child}\n`;
    });
  });

  return output;
}

// 主執行邏輯
function main() {
  try {
    // 取得所有原始碼檔案，排除測試檔案
    const sourceFiles = project.getSourceFiles()
      .map(sf => sf.getFilePath())
      .filter(path => !path.includes('/test/') && !path.includes('node_modules'));

    // 生成圖表
    const classDiagram = generateClassDiagram(sourceFiles);
    
    // 寫入檔案
    writeFileSync('docs/class-diagram.md', `## 類別圖\n\`\`\`mermaid\n${classDiagram}\n\`\`\``);
    console.log('類別圖已生成至 docs/class-diagram.md');

  } catch (error) {
    console.error('圖表生成失敗:', error);
    process.exit(1);
  }
}

main();