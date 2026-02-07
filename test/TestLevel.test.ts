import TestLevel from '../src/scenes/TestLevel';
import { PhysicsSystem } from '../src/systems/PhysicsSystem';

describe('測試關卡功能測試', () => {
  let scene: TestLevel;
  let mockPhysics: jest.Mocked<PhysicsSystem>;

  beforeEach(() => {
    // 初始化模擬物理系統
    mockPhysics = {
      initialize: jest.fn(),
      update: jest.fn(),
      shutdown: jest.fn()
    } as unknown as jest.Mocked<PhysicsSystem>;

    scene = new TestLevel();
    scene.physics = {
      add: {
        sprite: jest.fn().mockReturnValue({
          setCollideWorldBounds: jest.fn(),
          setSize: jest.fn(),
          setOffset: jest.fn(),
          body: { velocity: { x: 0, y: 0 } }
        }),
        group: jest.fn().mockReturnValue({
          create: jest.fn(),
          getLength: jest.fn().mockReturnValue(0)
        }),
        staticGroup: jest.fn().mockReturnValue({
          create: jest.fn()
        }),
        add: {
          collider: jest.fn()
        }
      },
      world: {
        setBounds: jest.fn()
      }
    } as unknown as Phaser.Physics.Arcade.ArcadePhysics;

    // 模擬場景方法
    scene.create = jest.fn();
    scene.update = jest.fn();
    scene.shutdown = jest.fn();

    // 模擬定時器
    scene.time = {
      addEvent: jest.fn().mockReturnValue({
        destroy: jest.fn()
      })
    } as unknown as Phaser.Time.Clock;

    // 模擬相機
    scene.cameras = {
      main: {
        startFollow: jest.fn()
      }
    } as unknown as Phaser.Cameras.Scene2D.CameraManager;

    // 模擬輸入
    scene.input = {
      keyboard: {
        createCursorKeys: jest.fn().mockReturnValue({
          left: { isDown: false },
          right: { isDown: false },
          up: { isDown: false },
          down: { isDown: false }
        })
      }
    } as unknown as Phaser.Input.InputPlugin;

    // 模擬動畫系統
    scene.anims = {
      create: jest.fn()
    } as unknown as Phaser.Animations.AnimationManager;

    // 模擬載入系統
    scene.load = {
      multiatlas: jest.fn(),
      image: jest.fn()
    } as unknown as Phaser.Loader.LoaderPlugin;

    // 模擬物理系統
    scene.physicsSystem = mockPhysics;
  });

  test('場景應正確初始化', () => {
    scene.create();
    expect(mockPhysics.initialize).toHaveBeenCalled();
  });

  test('玩家應正確創建', () => {
    const mockSprite = {
      setCollideWorldBounds: jest.fn(),
      setSize: jest.fn(),
      setOffset: jest.fn(),
      play: jest.fn(),
      body: { velocity: { x: 0, y: 0 } }
    };

    // 模擬 add.sprite 返回模擬精靈
    scene.physics.add.sprite = jest.fn().mockReturnValue(mockSprite);

    // 直接調用 createPlayer 方法
    (scene as any).createPlayer();

    expect(scene.physics.add.sprite).toHaveBeenCalledWith(100, 100, 'raiden1P', 'Raiden-1P.png');
    expect(mockSprite.setCollideWorldBounds).toHaveBeenCalledWith(true);
    expect(mockSprite.setSize).toHaveBeenCalledWith(32, 32);
    expect(mockSprite.setOffset).toHaveBeenCalledWith(16, 16);
  });

  test('敵人應定時生成', () => {
    const mockEnemy = {
      setSize: jest.fn(),
      setOffset: jest.fn(),
      setVelocityX: jest.fn(),
      setCollideWorldBounds: jest.fn()
    };

    // 模擬敵人群組
    const mockEnemies = {
      create: jest.fn().mockReturnValue(mockEnemy),
      getLength: jest.fn().mockReturnValue(0)
    };

    scene.enemies = mockEnemies as any;

    // 直接調用 spawnEnemy 方法
    (scene as any).spawnEnemy();

    expect(mockEnemies.create).toHaveBeenCalled();
    expect(mockEnemy.setSize).toHaveBeenCalledWith(32, 32);
    expect(mockEnemy.setOffset).toHaveBeenCalledWith(0, 0);
    expect(mockEnemy.setVelocityX).toHaveBeenCalled();
    expect(mockEnemy.setCollideWorldBounds).toHaveBeenCalledWith(true);
  });

  test('碰撞應正確設置', () => {
    const mockPlayer = {
      body: { velocity: { x: 0, y: 0 } }
    };

    const mockEnemies = {
      getLength: jest.fn().mockReturnValue(0)
    };

    const mockObstacles = {};

    scene.player = mockPlayer as any;
    scene.enemies = mockEnemies as any;
    scene.obstacles = mockObstacles as any;

    // 直接調用 setupCollisions 方法
    (scene as any).setupCollisions();

    expect(scene.physics.add.collider).toHaveBeenCalledTimes(3);
  });

  test('玩家移動應正確更新', () => {
    const mockPlayer = {
      setVelocity: jest.fn(),
      setVelocityX: jest.fn(),
      setVelocityY: jest.fn(),
      setFlipX: jest.fn(),
      body: { velocity: { x: 0, y: 0 } }
    };

    const mockCursors = {
      left: { isDown: true },
      right: { isDown: false },
      up: { isDown: false },
      down: { isDown: false }
    };

    scene.player = mockPlayer as any;
    scene.cursors = mockCursors as any;

    // 直接調用 updatePlayerMovement 方法
    (scene as any).updatePlayerMovement();

    expect(mockPlayer.setVelocityX).toHaveBeenCalledWith(-200);
    expect(mockPlayer.setFlipX).toHaveBeenCalledWith(true);
  });

  test('場景應正確關閉', () => {
    const mockTimer = {
      destroy: jest.fn()
    };

    scene.enemySpawnTimer = mockTimer as any;

    scene.shutdown();

    expect(mockTimer.destroy).toHaveBeenCalled();
    expect(mockPhysics.shutdown).toHaveBeenCalled();
  });
});