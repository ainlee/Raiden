import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { PlayerShipSelection } from '../src/components/PlayerSelection/PlayerShipSelection';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// 模擬API伺服器
const server = setupServer(
  rest.post('/api/lock', (req, res, ctx) => {
    const { shipId } = req.body as { shipId: string };
    return res(ctx.delay(100), ctx.json({ success: true, locked: true }));
  }),
  rest.post('/api/unlock', (req, res, ctx) => {
    const { shipId } = req.body as { shipId: string };
    return res(ctx.delay(100), ctx.json({ success: true, locked: false }));
  })
);

describe('雙玩家選擇衝突測試', () => {
  beforeEach(() => {
    server.listen();
    vi.useFakeTimers();
  });

  afterEach(() => {
    server.close();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const renderSelectionComponent = () => {
    return render(<PlayerShipSelection playerCount={2} />);
  };

  it('場景1: 兩名玩家同時選擇同一自機', async () => {
    const { container } = renderSelectionComponent();
    const shipButtons = await screen.findAllByRole('button', { name: /選擇自機/ });
    
    // 模擬同時點擊
    fireEvent.click(shipButtons[0]);
    fireEvent.click(shipButtons[0]);

    await vi.advanceTimersByTimeAsync(500);
    
    // 驗證錯誤處理
    const errorMessages = await screen.findAllByText(/自機已被選擇/);
    expect(errorMessages).toHaveLength(1);
  });

  it('場景2: 玩家A鎖定後玩家B嘗試選擇', async () => {
    const { container } = renderSelectionComponent();
    const shipButtons = await screen.findAllByRole('button', { name: /選擇自機/ });
    
    // 玩家A鎖定自機
    const lockButtons = await screen.findAllByRole('button', { name: /鎖定/ });
    fireEvent.click(lockButtons[0]);
    await vi.advanceTimersByTimeAsync(200);
    
    // 玩家B嘗試選擇
    fireEvent.click(shipButtons[0]);
    await vi.advanceTimersByTimeAsync(200);
    
    const errorMessage = await screen.findByText(/自機已被鎖定/);
    expect(errorMessage).toBeInTheDocument();
  });

  it('場景3: 玩家A解鎖後玩家B立即選擇', async () => {
    const { container } = renderSelectionComponent();
    const shipButtons = await screen.findAllByRole('button', { name: /選擇自機/ });
    
    // 玩家A鎖定並解鎖
    const lockButtons = await screen.findAllByRole('button', { name: /鎖定/ });
    fireEvent.click(lockButtons[0]);
    await vi.advanceTimersByTimeAsync(200);
    fireEvent.click(lockButtons[0]); // 解鎖
    await vi.advanceTimersByTimeAsync(200);
    
    // 玩家B立即選擇
    fireEvent.click(shipButtons[0]);
    await vi.advanceTimersByTimeAsync(200);
    
    const successMessage = await screen.findByText(/選擇成功/);
    expect(successMessage).toBeInTheDocument();
  });

  it('場景4: 網路延遲下的狀態衝突處理', async () => {
    const { container } = renderSelectionComponent();
    const shipButtons = await screen.findAllByRole('button', { name: /選擇自機/ });
    
    // 模擬網路延遲
    server.use(
      rest.post('/api/lock', (req, res, ctx) => {
        return res(ctx.delay(500), ctx.json({ success: true, locked: true }));
      })
    );
    
    // 玩家A鎖定
    const lockButtons = await screen.findAllByRole('button', { name: /鎖定/ });
    fireEvent.click(lockButtons[0]);
    
    // 在鎖定請求完成前玩家B嘗試選擇
    await vi.advanceTimersByTimeAsync(300);
    fireEvent.click(shipButtons[0]);
    
    await vi.advanceTimersByTimeAsync(600);
    
    const errorMessage = await screen.findByText(/狀態衝突/);
    expect(errorMessage).toBeInTheDocument();
  });

  it('隨機衝突測試50次', async () => {
    for (let i = 0; i < 50; i++) {
      const { container } = renderSelectionComponent();
      const shipButtons = await screen.findAllByRole('button', { name: /選擇自機/ });
      
      // 隨機選擇延遲時間 (100-500ms)
      const delay1 = Math.floor(Math.random() * 400) + 100;
      const delay2 = Math.floor(Math.random() * 400) + 100;
      
      // 隨機選擇自機
      const shipIndex = Math.floor(Math.random() * shipButtons.length);
      
      // 模擬兩個玩家操作
      setTimeout(() => fireEvent.click(shipButtons[shipIndex]), delay1);
      setTimeout(() => fireEvent.click(shipButtons[shipIndex]), delay2);
      
      await vi.advanceTimersByTimeAsync(Math.max(delay1, delay2) + 500);
      
      // 驗證最終狀態
      const errorMessages = await screen.findAllByText(/自機已被選擇|自機已被鎖定|狀態衝突/);
      expect(errorMessages.length).toBeLessThanOrEqual(1);
      
      server.resetHandlers();
      vi.clearAllMocks();
    }
  });
});