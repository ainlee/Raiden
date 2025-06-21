import 'phaser';

export default class MainScene extends Phaser.Scene {
  physics!: Phaser.Physics.Arcade.ArcadePhysics;
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('player', 'assets/sprites/player.png');
  }

  create() {
    // 啟用物理系統
    this.physics = this.physics;
    this.physics.world.setBounds(0, 0, 800, 600);

    // 初始化等角投影系統
    this.cursors = this.input.keyboard.createCursorKeys();

    // 建立玩家戰機
    this.player = this.add.sprite(400, 300, 'player');
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
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
}