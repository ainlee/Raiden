# Raiden STG 專案

## 專案描述
本專案為縱向捲軸射擊遊戲，基於Phaser3遊戲引擎開發，實作自適應效能監控系統與動態資源管理功能。支援Web、Electron與行動裝置平台。

## 功能特色
- 智慧型效能調節系統
- WebSocket即時連線對戰
- 跨平台渲染架構
- 動態難度平衡機制

## 安裝步驟
```powershell
# 安裝專案依賴
npm install

# 開發模式 (監聽檔案變更)
npm run dev

# 生產環境建置
npm run build
```

## 執行方式
```powershell
# 啟動開發伺服器 (預設網址 http://localhost:5501)
npm run start

# 執行單元測試
npm test

# 產出測試覆蓋率報告
npm run coverage
```

## 文件架構
```
├── src/            # 原始碼目錄
│   ├── scenes/     # 遊戲場景管理
│   └── systems/    # 核心系統模組
├── test/           # 單元測試
├── docs/           # 技術文件
│   ├── spec.md     # 系統規格書
│   ├── report.md   # 專案進度報告
│   └── technical_debt.md # 技術債務追蹤
└── assets/         # 遊戲資源檔案
```

## 授權條款
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)