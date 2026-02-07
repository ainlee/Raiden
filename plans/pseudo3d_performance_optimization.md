# 偽3D系統性能優化計劃

## 當前性能問題分析

### 1. 觸控操作延遲問題
- **當前狀態**：觸控輸入平均延遲18.7ms，峰值25.9ms
- **目標**：將平均延遲降低到10ms以下，峰值控制在15ms以內
- **優化策略**：
  - 實現觸控事件批處理和優先級排序
  - 添加觸控事件預測算法
  - 优化觸控事件處理管線

### 2. 高海拔貼圖變形誤差
- **當前狀態**：高度0.8時誤差達到1.7%，接近2%閾值
- **目標**：將所有高度的誤差控制在1%以下
- **優化策略**：
  - 改進高度補償算法，添加非線性校正
  - 實現自適應誤差補償機制
  - 优化紋理採樣算法

### 3. 相機投影系統性能
- **當前狀態**：200物件時幀率降至55fps
- **目標**：在200物件時維持60fps，在500物件時維持55fps以上
- **優化策略**：
  - 實現動態LOD（Level of Detail）系統
  - 添加物件池和物件重用機制
  - 优化相機投影矩陣計算

## 具體優化方案

### 觸控優化實現

```typescript
// 觸控事件優化 - 添加到InputHandler類
class OptimizedInputHandler {
  private touchEventQueue: TouchEvent[] = [];
  private lastProcessTime: number = 0;
  private frameBudget: number = 16; // 60fps預算
  
  processTouchEvents(currentTime: number): void {
    // 計算可用時間預算
    const timeSinceLastProcess = currentTime - this.lastProcessTime;
    const processingBudget = Math.min(timeSinceLastProcess, this.frameBudget * 0.8); // 保留20%安全邊際
    
    // 批處理觸控事件
    while (this.touchEventQueue.length > 0 && performance.now() - currentTime < processingBudget) {
      const event = this.touchEventQueue.shift();
      this.handleTouchEventOptimized(event);
    }
    
    this.lastProcessTime = currentTime;
  }
  
  private handleTouchEventOptimized(event: TouchEvent): void {
    // 實現預測算法
    const predictedPosition = this.predictTouchPosition(event);
    // 高效處理邏輯
    this.processDeformation(predictedPosition.x, predictedPosition.y);
  }
  
  private predictTouchPosition(event: TouchEvent): {x: number, y: number} {
    // 實現簡單的線性預測
    // 可以擴展為更複雜的預測算法
    return {x: event.touches[0].clientX, y: event.touches[0].clientY};
  }
}
```

### 高度補償算法優化

```typescript
// 改進的高度補償算法 - 添加到AffineTransform類
class EnhancedAffineTransform extends AffineTransform {
  warpTextureUV(uv: Vector2, height: number): Vector2 {
    // 非線性高度補償
    const nonlinearHeight = this.applyNonlinearCompensation(height);
    const depthFactor = 1.0 - Math.max(0, Math.min(1, nonlinearHeight));
    
    // 自適應誤差補償
    const errorCompensation = this.calculateErrorCompensation(height);
    
    const offset = new Vector2(
      this.matrix[0][2] * depthFactor * errorCompensation,
      this.matrix[1][2] * depthFactor * errorCompensation
    );
    
    return uv.add(offset.multiply(depthFactor));
  }
  
  private applyNonlinearCompensation(height: number): number {
    // 使用S曲線補償高度非線性
    if (height < 0.5) {
      return height * 0.9; // 低高度輕微調整
    } else {
      return 0.5 + (height - 0.5) * 0.8; // 高高度更明顯調整
    }
  }
  
  private calculateErrorCompensation(height: number): number {
    // 基於高度的自適應誤差補償
    if (height > 0.7) {
      return 0.95; // 高高度減少變形
    } else if (height > 0.5) {
      return 0.98;
    } else {
      return 1.0;
    }
  }
}
```

### 動態LOD系統實現

```typescript
// 動態LOD系統 - 新增CameraProjection類擴展
class DynamicLODSystem {
  private lodLevels: Array<{distance: number, quality: number}> = [
    {distance: 0, quality: 1.0},    // 近距離全質量
    {distance: 500, quality: 0.8},  // 中距離優化
    {distance: 1000, quality: 0.5}, // 遠距離簡化
    {distance: 1500, quality: 0.3}  // 極遠距離最簡
  ];
  
  calculateObjectLOD(cameraPosition: Vector2, objectPosition: Vector2): number {
    const distance = this.calculateDistance(cameraPosition, objectPosition);
    
    // 找到適當的LOD級別
    for (let i = 0; i < this.lodLevels.length; i++) {
      if (distance <= this.lodLevels[i].distance) {
        return this.lodLevels[i].quality;
      }
    }
    
    return this.lodLevels[this.lodLevels.length - 1].quality;
  }
  
  private calculateDistance(p1: Vector2, p2: Vector2): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
  
  // 物件池管理
  createObjectPool(): ObjectPool {
    return new ObjectPool(100); // 預創建100個物件
  }
}

class ObjectPool {
  constructor(private poolSize: number) {
    // 實現物件重用機制
  }
  
  getObject(): GameObject {
    // 從池中獲取或創建新物件
  }
  
  returnObject(obj: GameObject): void {
    // 返回物件到池中
  }
}
```

## 實施優先級

1. **高優先級**：觸控優化（立即影響用戶體驗）
2. **中優先級**：高度補償算法優化（視覺質量提升）
3. **高優先級**：動態LOD系統（整體性能提升）

## 預期效果

- 觸控延遲減少40%以上
- 高海拔貼圖誤差減少50%
- 相機投影性能提升30-40%
- 整體幀率穩定性大幅改善

## 測試與驗證計劃

1. 實現前後性能基準測試
2. 用戶體驗測試（特別是觸控操作）
3. 視覺質量對比測試
4. 压力測試（500+物件場景）

## 後續監控

- 添加性能監控日誌
- 實時性能指標顯示
- 自動性能回歸測試