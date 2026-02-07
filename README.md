# Raiden STG 專案

## 專案描述
本專案為基於 Phaser 3.60.0 的縱向捲軸射擊遊戲，採用現代化 TypeScript 開發環境，具備完整的測試覆蓋率和技術規範。專案支援 Web、Electron 與行動裝置平台，提供流暢的 60FPS 遊戲體驗與雙人合作模式。

## 🎯 核心功能特色
- **智慧型效能調節系統** - 自適應監控與動態資源管理
- **WebSocket 即時連線對戰** - 低延遲雙人合作模式
- **跨平台渲染架構** - 統一的 Web/Electron/行動裝置支援
- **動態難度平衡機制** - 基於玩家技能的自適應調整
- **偽 3D 地形系統** - 高度精確的貼圖變形與投影效果
- **自機擴展系統** - 模塊化自機添加與資源管理

## 🛠️ 技術棧
### 核心技術
- **遊戲引擎**: Phaser 3.60.0
- **程式語言**: TypeScript 5.2.2
- **建置工具**: Vite 5.0.11
- **測試框架**: Vitest 1.2.2 + @testing-library/react
- **開發工具**: React 19.2.2, @vitejs/plugin-react

### 開發工具
- **測試覆蓋率**: @vitest/coverage-istanbul
- **模擬服務**: MSW 2.11.6
- **圖像處理**: Sharp 0.34.4
- **檔案監控**: Chokidar 4.0.3
- **類型定義**: @types/node, @types/chokidar

## 📦 安裝步驟
```powershell
# 克隆專案
git clone <repository-url>
cd raiden

# 安裝專案依賴
npm install

# 開發模式 (監聽檔案變更，使用 Vite 熱重載)
npm run dev

# 生產環境建置 (輸出至 dist 目錄)
npm run build
```

## 🚀 執行方式
```powershell
# 啟動開發伺服器 (預設網址 http://localhost:5173)
npm run dev

# 預覽建置結果 (預設網址 http://localhost:4173)
npm run preview

# 執行單元測試 (含 Phaser 場景測試)
npm test

# 產出測試覆蓋率報告 (輸出至 coverage 目錄)
npm run test:coverage

# 執行 OpenSpec 驗證
npx openspec validate --strict
```

## 🎮 自機添加指南
### 基本流程
1. 準備自機資源包（需包含 JSON 設定檔與圖像資源）
2. 將資源包放入 `public/assets/players/` 目錄
3. 在遊戲初始化時調用註冊 API：

```typescript
import { addPlayerShip } from './systems/PlayerManager';

// 範例：註冊 MADshark 自機
addPlayerShip({
  id: 'madshark-1p',
  name: 'MADshark Mark I',
  texture: 'players/Raiden-MADshark-1P/Raiden-MADshark-1P.png',
  config: 'players/Raiden-MADshark-1P/Raiden-MADshark-1P.json'
});
```

### 資源兼容性
- 支援 v1.2+ 格式資源包
- 舊版資源會自動轉換，轉換日誌存於 `logs/asset-convert.log`
- 衝突資源需手動解決，工具指令：`npm run resolve-conflict`

## 📁 專案架構
```
├── src/                    # 原始碼目錄
│   ├── components/         # React 元件
│   ├── scenes/            # 遊戲場景管理
│   ├── systems/           # 核心系統模組
│   ├── terrain/           # 地形處理系統
│   ├── math/              # 數學運算工具
│   ├── types/             # TypeScript 類型定義
│   └── utils/             # 工具函式
├── test/                  # 單元測試
│   ├── integration/       # 整合測試
│   ├── math/              # 數學測試
│   ├── systems/           # 系統測試
│   └── reports/           # 測試報告
├── openspec/              # OpenSpec 規範文件
│   ├── project.md         # 專案技術規格
│   ├── changes/           # 變更提案
│   └── specs/             # 系統規格書
├── public/                # 靜態資源
├── assets/                # 遊戲資源檔案
└── examples/              # 使用範例
```

## 📊 專案狀態與健康度
### 測試覆蓋率
- **整體覆蓋率**: 94% (基於最新測試報告)
- **核心遊戲邏輯**: 100% 分支覆蓋率
- **偽 3D 系統**: 100% 操作模式互通過率
- **選擇衝突處理**: 94% 隨機測試通過率

### 效能表現
- **目標幀率**: 60 FPS (Chrome 最新版)
- **網路延遲**: < 100ms (雙人模式)
- **資源大小**: < 50MB (總體積)
- **相機投影**: 100 物件時維持 62fps

### 技術債務狀態
- ✅ 等角系統三維碰撞檢測 (已完成)
- ✅ 等角投影單元測試 (已完成)
- ⚠️ 字型加載 fallback 機制 (進行中)
- ⚠️ 效能監控整合等角投影 (待優化)
- ⚠️ 場景轉換參數重置 (待實作)

## 🔧 開發指南
### 代碼規範
- 遵循 Airbnb JavaScript 風格指南 (TypeScript 擴充版)
- 使用駝峰式命名法 (camelCase)
- 縮排：2 個空格
- 字串優先使用單引號 (')
- 函數必須包含 JSDoc 風格註解

### 架構模式
- **ECS 架構**: Entity-Component-System
- **場景管理**: 狀態模式 (State Pattern)
- **物件管理**: 物件池模式 (Object Pooling)
- **狀態同步**: 樂觀鎖定機制

### Git 工作流程
- 功能分支命名：`feature/功能名稱`
- 使用 Conventional Commits 規範
- PR 需通過 CI 測試與 Code Review

## 📋 測試報告主要發現
### 偽 3D 系統測試結果
- **操作模式互動**: 100% 通過率
- **貼圖變形精度**: 誤差 < 1.8%
- **相機投影效能**: 100 物件時 62fps

### 雙玩家選擇衝突測試
- **整體通過率**: 94% (47/50)
- **主要問題**: 網路延遲下的狀態同步
- **修復建議**: 實作樂觀鎖定 + WebSocket 即時通知

## 🚨 改進建議
### 短期優先級 (P0)
1. **觸控操作延遲優化** - 目前峰值延遲 25.9ms
2. **高海拔貼圖變形誤差調整** - 0.8 高度時誤差 1.7%
3. **動態 LOD 機制** - 200+ 物件時幀率維持

### 中期優先級 (P1)
1. **PhysicsSystem BasePlugin 介面實作**
2. **字型加載 fallback 機制**
3. **統一錯誤處理模組**

### 長期規劃 (P2)
1. **Steamworks SDK 整合**
2. **Sentry 錯誤追蹤系統**
3. **成就系統開發**

## 🤝 貢獻指南
### 貢獻流程
1. Fork 專案並創建功能分支
2. 遵循代碼規範進行開發
3. 確保測試覆蓋率 > 80%
4. 提交 Pull Request 並附上詳細說明

### 開發環境設定
```bash
# 安裝開發依賴
npm install

# 啟動開發伺服器
npm run dev

# 執行測試
npm test

# 產生測試報告
npm run test:coverage
```

### 文檔維護
- 遵循 OpenSpec 文檔規範
- 更新時註記版本號與日期
- 重要變更需附上技術規格說明

## 📈 版本歷史
- **v1.4.0** (2025-10-31)
  - 新增自機添加系統與開發指南
  - 強化資源兼容性處理
  - 更新文件架構圖表

- **v1.2.3-pseudo3d** (2025-11-01)
  - 完成偽 3D 系統整合測試
  - 修正模塊加載問題與資源路徑
  - 優化 PhysicsSystem 語法錯誤

## 📄 授權條款
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🔗 相關連結
- [專案規格文件](openspec/project.md)
- [技術債務清單](technical_debt.md)
- [測試報告](test/reports/)
- [OpenSpec 規範](openspec/AGENTS.md)

---

*最後更新：2025-11-01 | 版本：v1.4.0*