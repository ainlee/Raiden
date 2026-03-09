import * as Phaser from 'phaser';
import { IsometricCollider } from '../systems/PhysicsSystem';
import AffineTransform from '../math/AffineTransform';
import { eventBus } from '../utils/EventBus';

export default class MainScene extends Phaser.Scene {
  declare physics: Phaser.Physics.Arcade.ArcadePhysics;
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private affineTransform!: AffineTransform;

  constructor() {
    super({
      key: 'MainScene',
      physics: {
        default: 'arcade',
        arcade: {
          debug: true
        }
      }
    });
  }

  preload() {
    console.log('Starting asset loading...');

    // 載入自機資源 - 使用 image 載入方式
    const loadPlayerAssets = (playerType: '1P' | '2P', model = '') => {
      const prefix = model ? `Raiden-${model}-${playerType}` : `Raiden-${playerType}`;

      // 使用 image 載入
      const imagePath = `/assets/players-phaser/${playerType}/${prefix}.png`;

      console.log(`[MainScene] Loading player assets for ${playerType}:`, {imagePath});
      console.log(`[MainScene] Full image URL: ${this.load.baseURL}${imagePath}`);

      // 使用 image 載入
      this.load.image(`raiden${playerType}`, imagePath);

      // 添加錯誤處理
      this.load.on('loaderror', (file: any) => {
        console.error('[ASSET LOAD ERROR]', file);
        console.error('[ASSET LOAD ERROR DETAILS]', {
          key: file.key,
          url: file.url,
          responseURL: file.xhr?.responseURL,
          status: file.xhr?.status
        });
      });
    };

    // 初始化預設機體 (1P/2P)
    loadPlayerAssets('1P');
    loadPlayerAssets('2P');
  }

  create() {
    // 初始化仿射變換系統
    this.affineTransform = new AffineTransform();
    this.affineTransform.setCameraTilt(35, new Phaser.Math.Vector2(0.1, 0.05));

    // 註冊開發者事件監聽
    eventBus.on('TOGGLE_INVINCIBILITY', () => this.toggleInvincibility());

    // 啟用物理系統
    console.log('Initializing physics system...');
    this.physics.world.setBounds(0, 0, 800, 600);

    // 初始化等角投影系統
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    // 建立玩家戰機
    this.player = this.add.sprite(400, 300, 'raiden1P');

    // 添加玩家物理實體
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(24, 24, true); // 調整碰撞體中心點

    // 註冊玩家碰撞器 - 簡化版本
    const playerCollider = new IsometricCollider(
      this,
      this.player.x,
      this.player.y,
      24,
      24
    );

    // 監聽碰撞事件
    playerCollider.onCollide.on('collide', (other: IsometricCollider) => {
      console.log('Player collided with object at:', other.cube);
    });

    console.log('MainScene created successfully!');
  }

  update() {
    // 處理玩家輸入
    const speed = 200;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    body.setVelocity(0);

    if (this.cursors.left?.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right?.isDown) {
      body.setVelocityX(speed);
    }

    if (this.cursors.up?.isDown) {
      body.setVelocityY(-speed);
    } else if (this.cursors.down?.isDown) {
      body.setVelocityY(speed);
    }
  }

  // 開發者功能：切換無敵模式
  toggleInvincibility() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.checkCollision.none = !body.checkCollision.none;
    console.log(`無敵模式 ${body.checkCollision.none ? '關閉' : '開啟'}`);
  }
}
