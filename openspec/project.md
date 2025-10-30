# 專案規格文件

## 專案目標
開發一款基於Phaser框架的STG射擊遊戲，提供流暢的彈幕體驗與雙人合作模式

## 技術堆疊
- **遊戲引擎**: Phaser 3.60.0
- **程式語言**: TypeScript 4.9.5
- **建置工具**: Vite 4.4.0
- **測試框架**: Jest 29.7.0 + Phaser測試擴充套件

## 專案規範

### 代碼風格
- 遵循Airbnb JavaScript風格指南(TypeScript擴充版)
- 使用駝峰式命名法(camelCase)
- 縮排：2個空格
- 字串優先使用單引號(')
- 函數必須包含JSDoc風格註解

### 架構模式
- ECS架構(Entity-Component-System)
- 場景管理採用狀態模式(State Pattern)
- 物件池模式(Object Pooling)用於彈幕管理

### 測試策略
- 單元測試覆蓋率需達80%以上
- 核心遊戲邏輯需達到100%分支覆蓋率
- 使用Phaser官方mock套件進行場景測試

### Git工作流程
- 功能分支命名：feature/功能名稱
- 使用Conventional Commits規範
- PR需通過CI測試與Code Review

## 重要限制條件
- 需支援60FPS流暢運行於Chrome最新版
- 雙人模式需保證網路延遲低於100ms
- 資源檔案總大小需控制在50MB以內

## 外部依賴服務
- 遊戲配樂來自第三方授權資源庫
- 成就系統整合Steamworks SDK
- 使用Sentry進行錯誤追蹤
