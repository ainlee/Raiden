# 專案規格書 v0.2.1
<!-- 2025-06-21 更新：v0.2.1 新增WebSocket實作細節 -->

## 架構圖表
```mermaid
classDiagram
  class PerformanceMonitor {
    -metrics: PerformanceMetrics
    -sampler: AdaptiveSampler
    -lastUpdate: number
    +update(scene: Phaser.Scene): void
    +getMetrics(): PerformanceMetrics
  }

  class AdaptiveSampler {
    -samplingInterval: number
    +adjustSamplingInterval(metrics: PerformanceMetrics): void
  }

  PerformanceMonitor --> AdaptiveSampler
```
- 預設網址：http://localhost:5501
- 執行指令：`npm run dev`

## 技術選型
- 遊戲引擎：Phaser.js 3.70
- 渲染模式：Canvas + WebGL 雙模式自動切換
- 物理引擎：Arcade Physics (內建)
- 跨平台支援：Web/Electron/Cordova
- 架構變更 (2025-06-21 v1.1)：
  - 改用Phaser官方範本
  - 整合等角投影插件
  - 新增3D投影系統
  - 關鍵依賴版本：
    - Phaser 3.70.0
    - phaser3-plugin-isometric 1.0.0
    - gl-matrix 3.4.3
- 網路傳輸：WebSocket 雙向即時通訊
  ```mermaid
  sequenceDiagram
    Client->>Server: 建立WS連線 (wss://game.example.com/ws)
    Server-->>Client: 發送初始遊戲狀態
    loop 幀同步
        Client->>Server: 傳送操作指令
        Server-->>Client: 廣播遊戲狀態
    end
  ```
- 連線保活機制：
  - 心跳間隔：30秒
  - 逾時重試次數：3次
- 資源目錄規範：
  - sprites: 角色/物件動畫圖集
  - parallax:
    - background: 遠景卷軸
    - midground: 中景動態元素
    - foreground: 近景裝飾物件

## 技術架構
```mermaid
graph TD
    A[遊戲客戶端] -->|WebSocket| B(Game Server)
    A --> C[Phaser3 引擎]
    C --> D[場景管理系統]
    C --> E[實體組件系統]
    B --> F[Node.js後端]
    F --> G[Redis 狀態管理]
    D --> H[效能監控系統]
    E --> H
```

## 核心功能
1. 玩家戰機控制系統
2. 敵方AI行為樹
3. 動態難度調整系統
4. 連擊獎勵機制

## 開發規範
1. 使用 **Airbnb TypeScript 風格指南**
2. 函式命名採駝峰式(camelCase)
3. 所有公開方法需包含 JSDoc 註解
4. 單元測試覆蓋率需達 80% 以上

## 測試關卡規格
### 畫面表現要求
- 三層背景卷軸（前/中/後）需具備不同移動速度
  - 前層：160px/s
  - 中層：80px/s
  - 後層：40px/s
- 偽3D效果採用透視縮放演算法
  ```typescript
  // 透視縮放公式
  const scale = 1 - (layerDepth * 0.2);
  ```
- 自機動畫幀率需達60fps
- 敵機生成密度梯度測試：10/30/60秒階段

### 輸入檢測項目
1. 方向鍵響應延遲 < 100ms
2. 射擊按鈕連發間隔200ms ±10%
3. 特殊武器充能指示誤差 < 5%

### 測試案例表
| 測試項目       | 預期結果               | 通過條件              |
|----------------|------------------------|-----------------------|
| 碰撞判定       | 自機與敵機接觸後觸發爆炸 | 傷害計算誤差 < 2%   |
| 邊界限制       | 自機無法移出視窗外     | 位置約束生效          |
| 背景卷軸同步   | 三層移動速率比例 4:2:1  | 幀率波動 < 5%        |

## 版本控制
- 格式規範：遵循[語意化版本 2.0.0](https://semver.org/lang/zh-TW/)
- 變更紀錄格式：
  ```markdown
  ### [版本號] - YYYY-MM-DD
  #### 新增
  - 項目描述
  #### 變更
  - 項目描述
  #### 修復
  - 項目描述
  ```

## 3.2 角色動畫規範
- **骨骼動畫參數**
  - 最大骨骼數：48
  - 幀間插值：貝茲曲線緩動
- **幀率限制**
  ```mermaid
  flowchart LR
      A[動畫類型] -->|過場動畫| B[30 FPS]
      A -->|戰鬥動畫| C[60 FPS]
  ```
- **資源命名規則**
  - 主角動畫：`char_main_{動作名稱}_v{版本號}`
  - 版本號格式：`0.1.2 → MAJOR.MINOR.PATCH`
  - 影格命名：`Raiden-1P (圖層 {序號}).aseprite`
  
## 版本變更履歷
| 版本   | 更新內容               | 負責人 | 日期       |
|--------|----------------------|--------|------------|
| v0.2.0 | 新增類別圖與狀態機圖   | Roo    | 2025-06-12 |
| v1.1.0 | 架構重構與等角系統整合 | Roo    | 2025-06-21 |
| v0.3.0 | 新增測試關卡規格       | Roo    | 2025-06-21 |

## 測試案例要求
```typescript
// 範例測試案例
describe('PlayerController', () => {
  test('應正確處理方向輸入', () => {
    const player = new Player();
    player.handleInput('right');
    expect(player.velocity.x).toBe(5);
  });
});