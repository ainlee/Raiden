## Why
提升Boss戰的策略性與玩家體驗，透過階段轉換機制增加戰鬥變化性與挑戰性。

## What Changes
- 新增Boss血量階段轉換機制
- 實作基於血量閾值的行為模式切換
- 新增階段轉換特效與提示UI
- **BREAKING** 修改現有Boss行為腳本結構

## Impact
- 受影響規格: `specs/gameplay/spec.md`
- 受影響程式碼:
  - `src/scenes/MainScene.ts`
  - `src/systems/PhysicsSystem.ts`
  - Boss相關行為腳本