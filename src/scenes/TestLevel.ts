import * as Phaser from 'phaser';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { eventBus } from '../utils/EventBus';

export default class TestLevel extends Phaser.Scene {
  declare physics: Phaser.Physics.Arcade.ArcadePhysics;
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enemies!: Phaser.Physics.Arcade.Group;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private enemySpawnTimer!: Phaser.Time.TimerEvent;
  private physicsSystem!: PhysicsSystem;

  constructor() {
    super({
      key: 'TestLevel',
      physics: {
        default: 'arcade',
        arcade: {
          debug: true
        }
      }
    });
  }

  preload() {
    // 載入玩家資源
    this.load.multiatlas({
      key: 'raiden1P',
      atlasURL: '/assets/players/Raiden-1P/Raiden-1P.json',
      path: '/assets/players/Raiden-1P/'
    });

    // 載入敵人資源
    this.load.image('enemy', '/assets/sprites/enemy-test.png');

    // 載入障礙物資源
    this.load.image('obstacle', '/assets/sprites/enemy-test.png');
  }

  create() {
    // 初始化物理系統
    this.physicsSystem = new PhysicsSystem(this);
    this.physicsSystem.initialize();

    // 創建玩家
    this.createPlayer();

    // 創建敵人群組
    this.enemies = this.physics.add.group();

    // 創建障礙物群組
    this.obstacles = this.physics.add.staticGroup();

    // 創建碰撞測試區域
    this.createObstacles();

    // 設置敵人生成定時器
    this.setupEnemySpawner();

    // 設置碰撞檢測
    this.setupCollisions();

    // 設置鍵盤輸入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 設置相機跟隨玩家
    this.cameras.main.startFollow(this.player);

    // 添加關卡邊界
    this.physics.world.setBounds(0, 0, 800, 600);
    this.player.setCollideWorldBounds(true);

    console.log('TestLevel created');
  }

  update(time: number, delta: number) {
    // 更新玩家移動
    this.updatePlayerMovement();

    // 更新物理系統
    this.physicsSystem.update(delta);
  }

  private createPlayer() {
    // 創建玩家精靈
    this.player = this.physics.add.sprite(100, 100, 'raiden1P', 'Raiden-1P.png');
    this.player.setCollideWorldBounds(true);
    this.player.setSize(32, 32);
    this.player.setOffset(16, 16);

    // 添加玩家動畫
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'raiden1P', frame: 'Raiden-1P.png' }],
      frameRate: 10,
      repeat: -1
    });

    this.player.play('idle');
  }

  private createObstacles() {
    // 創建靜態障礙物
    const obstacle1 = this.obstacles.create(300, 200, 'obstacle');
    obstacle1.setSize(64, 64);
    obstacle1.setOffset(0, 0);
    obstacle1.setVisible(true);

    const obstacle2 = this.obstacles.create(500, 400, 'obstacle');
    obstacle2.setSize(64, 64);
    obstacle2.setOffset(0, 0);
    obstacle2.setVisible(true);
  }

  private setupEnemySpawner() {
    // 設置敵人生成定時器
    this.enemySpawnTimer = this.time.addEvent({
      delay: 3000,
      callback: () => {
        if (this.enemies.getLength() < 5) {
          this.spawnEnemy();
        }
      },
      loop: true
    });
  }

  private spawnEnemy() {
    // 生成敵人
    const x = Phaser.Math.Between(600, 800);
    const y = Phaser.Math.Between(50, 550);

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setSize(32, 32);
    enemy.setOffset(0, 0);
    enemy.setVelocityX(Phaser.Math.Between(-50, -100));
    enemy.setCollideWorldBounds(true);

    // 設置敵人動畫
    this.tweens.add({
      targets: enemy,
      alpha: 0.5,
      duration: 500,
      ease: 'Power2',
      yoyo: true,
      repeat: -1
    });
  }

  private setupCollisions() {
    // 設置玩家與敵人碰撞
    this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
      console.log('Player collided with enemy!');
      enemy.destroy();
    });

    // 設置玩家與障礙物碰撞
    this.physics.add.collider(this.player, this.obstacles, () => {
      console.log('Player collided with obstacle!');
    });

    // 設置敵人與障礙物碰撞
    this.physics.add.collider(this.enemies, this.obstacles);
  }

  private updatePlayerMovement() {
    // 重置玩家速度
    this.player.setVelocity(0);

    // 處理鍵盤輸入
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

    // 更新玩家方向
    if (this.player.body.velocity.x < 0) {
      this.player.setFlipX(true);
    } else if (this.player.body.velocity.x > 0) {
      this.player.setFlipX(false);
    }
  }

  shutdown() {
    // 清理定時器
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.destroy();
    }

    // 清理物理系統
    if (this.physicsSystem) {
      this.physicsSystem.shutdown();
    }

    console.log('TestLevel shutdown');
  }
}