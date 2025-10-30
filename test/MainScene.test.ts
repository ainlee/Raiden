import MainScene from '../src/scenes/MainScene';
import { PhysicsSystem } from '../src/systems/PhysicsSystem';

describe('主場景狀態機測試', () => {
  let scene: MainScene;
  let mockPhysics: jest.Mocked<PhysicsSystem>;

  beforeEach(() => {
    // 初始化模擬物理系統
    mockPhysics = {
      addIsometricCollider: jest.fn(),
      update: jest.fn()
    } as unknown as jest.Mocked<PhysicsSystem>;

    scene = new MainScene();
    scene.physics = mockPhysics;
  });

  test('場景初始化應載入物理系統', () => {
    scene.create();
    expect(mockPhysics.addIsometricCollider).toHaveBeenCalled();
  });

  test('暫停狀態應停止物理更新', () => {
    scene.create();
    scene.pause();
    scene.update();
    expect(mockPhysics.update).not.toHaveBeenCalled();
  });

  test('恢復狀態應重啟物理更新', () => {
    scene.create();
    scene.pause();
    scene.resume();
    scene.update();
    expect(mockPhysics.update).toHaveBeenCalled();
  });

  test('場景重啟應重置玩家位置', () => {
    scene.create();
    const initialX = scene.player.x;
    scene.player.x = 500; // 模擬移動後位置
    scene.restart();
    expect(scene.player.x).toBe(initialX);
  });
});