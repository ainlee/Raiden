import { IsometricCollider, PhysicsSystem } from '../src/systems/PhysicsSystem';
import type { Cube } from '../src/types/global';

describe('等角投影系統測試', () => {
  const testCubeA: Cube = { x: 0, y: 0, z: 0, width: 10, height: 10, depth: 10 };
  const testCubeB: Cube = { x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10 };

  test('立方體相交檢測', () => {
    const colliderA = new IsometricCollider(testCubeA);
    const colliderB = new IsometricCollider(testCubeB);
    expect(colliderA.checkIntersection(colliderB)).toBe(true);
  });

  test('碰撞事件觸發', () => {
    const physicsSystem = new PhysicsSystem();
    const collider = new IsometricCollider(testCubeA);
    const mockHandler = jest.fn();

    collider.onCollide.on('collide', mockHandler);
    physicsSystem.addIsometricCollider(collider);
    physicsSystem.addIsometricCollider(new IsometricCollider(testCubeB));
    physicsSystem.update();

    expect(mockHandler).toHaveBeenCalled();
  });

  test('玩家控制整合測試', () => {
    const physicsSystem = new PhysicsSystem();
    const playerCollider = new IsometricCollider(testCubeA);
    physicsSystem.addIsometricCollider(playerCollider, true);

    // 模擬玩家移動
    physicsSystem.update({ x: 1, y: 0 });
    expect(playerCollider.cube.x).toBeGreaterThan(testCubeA.x);
  });

  test('多碰撞器互動測試', () => {
    const physicsSystem = new PhysicsSystem();
    const colliderA = new IsometricCollider(testCubeA);
    const colliderB = new IsometricCollider(testCubeB);
    const colliderC = new IsometricCollider({
      x: 20, y: 20, z: 20,
      width: 5, height: 5, depth: 5
    });

    physicsSystem.addIsometricCollider(colliderA);
    physicsSystem.addIsometricCollider(colliderB);
    physicsSystem.addIsometricCollider(colliderC);

    let collisionCount = 0;
    colliderA.onCollide.on('collide', () => collisionCount++);

    physicsSystem.update();
    expect(collisionCount).toBe(1);
  });

  // 邊界案例測試
  test('高速移動穿透檢測', () => {
    const physicsSystem = new PhysicsSystem();
    const fastCollider = new IsometricCollider({
      x: 0, y: 0, z: 0,
      width: 5, height: 5, depth: 5
    });
    const targetCollider = new IsometricCollider({
      x: 100, y: 0, z: 0,
      width: 10, height: 10, depth: 10
    });

    physicsSystem.addIsometricCollider(fastCollider, true);
    physicsSystem.addIsometricCollider(targetCollider);

    let collisionDetected = false;
    fastCollider.onCollide.on('collide', () => collisionDetected = true);

    // 模擬高速移動 (速度超過碰撞體尺寸)
    physicsSystem.update({ x: 150, y: 0 });
    expect(collisionDetected).toBe(true);
  });

  test('邊緣碰撞檢測', () => {
    const physicsSystem = new PhysicsSystem();
    const edgeColliderA = new IsometricCollider({
      x: 0, y: 0, z: 0,
      width: 10, height: 10, depth: 10
    });
    const edgeColliderB = new IsometricCollider({
      x: 10, y: 10, z: 10, // 邊緣接觸
      width: 10, height: 10, depth: 10
    });

    physicsSystem.addIsometricCollider(edgeColliderA);
    physicsSystem.addIsometricCollider(edgeColliderB);

    let collisionCount = 0;
    edgeColliderA.onCollide.on('collide', () => collisionCount++);

    physicsSystem.update();
    expect(collisionCount).toBe(1);
  });

  test('三實體疊加碰撞', () => {
    const physicsSystem = new PhysicsSystem();
    const collider1 = new IsometricCollider(testCubeA);
    const collider2 = new IsometricCollider(testCubeB);
    const collider3 = new IsometricCollider({
      x: 2, y: 2, z: 2,
      width: 15, height: 15, depth: 15
    });

    physicsSystem.addIsometricCollider(collider1);
    physicsSystem.addIsometricCollider(collider2);
    physicsSystem.addIsometricCollider(collider3);

    let collisionEvents = 0;
    collider1.onCollide.on('collide', () => collisionEvents++);

    physicsSystem.update();
    expect(collisionEvents).toBe(2); // 應與兩個碰撞體相交
  });
});