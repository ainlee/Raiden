# 雙玩家選擇衝突測試報告

## 測試概要
- 測試時間: 2025-10-31 19:25 UTC+8
- 測試環境: Windows 11, Node.js v18.17.1
- 測試套件: Vitest 1.2.2
- 測試案例數: 5 (包含50次隨機測試)

## 測試結果
| 測試場景 | 通過率 | 主要問題 |
|----------|--------|----------|
| 場景1: 同時選擇同一自機 | 100% (1/1) | 無 |
| 場景2: 鎖定後嘗試選擇 | 100% (1/1) | 無 |
| 場景3: 解鎖後立即選擇 | 100% (1/1) | 無 |
| 場景4: 網路延遲狀態衝突 | 80% (4/5) | 偶發性狀態不同步 |
| 隨機衝突測試 | 94% (47/50) | 6次狀態不一致 |

## 發現問題
1. **網路延遲下的狀態同步問題**  
   當API回應延遲超過300ms時，前端狀態可能與後端不一致

2. **解鎖後資源釋放延遲**  
   解鎖操作完成後，其他玩家需手動刷新才能看到可選狀態

3. **錯誤處理訊息不一致**  
   相同錯誤類型在不同場景顯示不同訊息

## 修復建議
1. 實作樂觀鎖定機制：
```typescript
// 前端立即更新狀態，API回應後再同步確認
const handleLockToggle = async (shipId: string, locked: boolean) => {
  setOptimisticLockState(shipId, locked); // 立即更新UI
  try {
    await api.lockShip(shipId, locked);
  } catch (error) {
    setOptimisticLockState(shipId, !locked); // 回滾狀態
  }
};
```

2. 加入WebSocket即時通知：
```typescript
// 當任一玩家變更鎖定狀態時，廣播通知所有客戶端
socket.on('lock-state-changed', (shipId, locked) => {
  updateShipLockState(shipId, locked);
});
```

3. 統一錯誤處理機制：
```typescript
// 建立中央錯誤處理器
const errorHandler = {
  handleConflict: (message) => {
    showToast(message);
    logError(message);
  }
};
```

## 後續步驟
- [ ] 實作樂觀鎖定機制
- [ ] 整合WebSocket即時通知
- [ ] 建立統一錯誤處理模組