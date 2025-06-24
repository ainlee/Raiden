# 專案規格書 v1.2.2
<!-- 2025-06-23 完整補齊物理系統與WebSocket章節 -->

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

## 物理系統類別圖補充
```mermaid
classDiagram
    class PhysicsSystem {
        -gravity: number
        -colliders: Collider[]
        +enableDebug: boolean
        +init(config: PhysicsConfig): void
        +addCollider(object: GameObject): Collider
        +update(delta: number): void
    }

    class Collider {
        -bounds: Rectangle
        -isTrigger: boolean
        +onCollide: Phaser.Signal
        +checkCollision(other: Collider): boolean
    }

    class GameObject {
        +position: Vector2
        +velocity: Vector2
        +collider: Collider
        +update(delta: number): void
    }

    PhysicsSystem "1" *-- "*" Collider : 管理
    GameObject "1" o-- "1" Collider : 擁有
```

## WebSocket通訊時序圖加強
```mermaid
sequenceDiagram
    participant Client
    participant NetworkManager
    participant GameServer
    participant Redis

    Client->>NetworkManager: 建立WS連線 (wss://game/ws)
    NetworkManager->>GameServer: 驗證Session Token
    GameServer-->>Redis: 查詢玩家資料
    Redis-->>GameServer: 回傳玩家狀態
    GameServer-->>NetworkManager: 傳送初始遊戲狀態
    NetworkManager->>Client: 同步遊戲資料
    loop 幀同步
        Client->>NetworkManager: 傳送操作指令(opcode, timestamp)
        NetworkManager->>GameServer: 轉發指令批次處理
        GameServer->>GameServer: 運算遊戲邏輯
        GameServer->>Redis: 持久化遊戲狀態
        GameServer-->>NetworkManager: 廣播狀態快照
        NetworkManager-->>Client: 更新遊戲實體
    end
```

## 碰撞檢測活動圖
```mermaid
flowchart TD
    Start[遊戲循環開始] --> CheckCollision
    CheckCollision -->|遍歷所有碰撞器| BroadPhase[寬階段檢測]
    BroadPhase -->|AABB相交檢測| NarrowPhase[窄階段檢測]
    NarrowPhase -->|分離軸定理精確檢測| TriggerCheck{是否為觸發器?}
    TriggerCheck -->|是| FireEvent[觸發OnTrigger事件]
    TriggerCheck -->|否| Resolve[解析碰撞反應]
    Resolve --> ApplyForce[施加作用力]
    ApplyForce --> End[進入下幀循環]
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
| v1.2.2 | 補齊物理系統與WebSocket章節 | Roo    | 2025-06-23 |
| v1.2.1 | 文件異常狀態修復           | Roo    | 2025-06-23 |
| v1.2.0 | 物理系統與網路層基礎架構   | Roo    | 2025-06-23 |
| v1.1.0 | 架構重構與等角系統整合     | Roo    | 2025-06-21 |