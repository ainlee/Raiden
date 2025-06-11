import Phaser from 'phaser';
import { DynamicWindowAdjuster } from '@systems/DynamicWindowAdjuster';
import { PerformanceMonitor } from '@systems/PerformanceMonitor';

/**
 * 主遊戲場景 - 控制玩家角色與輸入處理
 */
export default class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private gamepad?: Phaser.Input.Gamepad.Gamepad;
  private touchControls!: Record<string, Phaser.GameObjects.Zone>;
  private dynamicWindow!: DynamicWindowAdjuster;
  private performanceMonitor!: PerformanceMonitor;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // 預載入玩家戰機素材
    // 載入玩家戰機動畫圖集
    this.load.atlas(
      'player',
      'assets/sprites/Raiden-1P.png',
      'assets/sprites/Raiden-1P.json'
    );
    this.load.css('cubic-font', 'fonts/Cubic-11-1.430/fonts/web/Cubic_11.css');
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  async create() {
    // 初始化效能監控系統
    const { width, height } = this.scale;
    this.dynamicWindow = new DynamicWindowAdjuster();
    this.performanceMonitor = new PerformanceMonitor();
    
    this.game.events.on(Phaser.Core.Events.POST_STEP, () => {
      this.performanceMonitor.update(this);
      const perfMemory = (performance as any).memory;
      this.dynamicWindow.adjustWindow(
        {
          fps: this.game.loop.actualFps || 60,
          memoryUsage: perfMemory ? perfMemory.usedJSHeapSize / perfMemory.jsHeapSizeLimit : 0,
          activeTextures: this.textures.getTextureKeys().length
        },
        { width, height }
      );
    });

    // 載入遊戲字型
    try {
      await this.loadFont();
      console.log('字型載入完成');
    } catch (error: unknown) {
      console.error('字型載入異常:', error);
    }

    // 初始化玩家角色
    this.initPlayer();
    
    // 初始化輸入控制
    this.initInputControls();
  }

  private initPlayer(): void {
    this.player = this.physics.add.sprite(240, 500, 'player', 'frame_0001')!;
    this.initPlayerAnimations();
    this.player.setCollideWorldBounds(true);
  }

  private async loadFont(): Promise<void> {
    return new Promise((resolve, reject) => {
      (window as any).WebFont.load({
        custom: {
          families: ['Cubic_11'],
          urls: ['fonts/Cubic-11-1.430/fonts/web/Cubic_11.css']
        },
        active: resolve,
        inactive: reject
      }).catch((error: unknown) => {
        console.error('字型載入失敗:', error);
      });
    });
  }

  /** 初始化玩家動畫 */
  private initPlayerAnimations(): void {
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNames('player', {
        prefix: 'Raiden-1P (圖層 ',
        start: 0,
        end: 1,
        suffix: '',
        zeroPad: 0
      }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [0, 1, 2]
      }),
      frameRate: 12,
      yoyo: true,
      repeat: -1
    });

    this.player.play('idle');
    console.log('Current animations:', this.anims['anims']);
  }

  private initInputControls(): void {
    // 鍵盤控制
    this.cursors = this.input.keyboard?.createCursorKeys() ?? undefined;
    
    // 遊戲手把控制
    this.input.gamepad?.addListener('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      this.gamepad = pad;
    });

    // 觸控控制
    this.initTouchControls();
  }

  private initTouchControls(): void {
    const { width, height } = this.scale;
    const zoneSize = 100;

    this.touchControls = {
      left: this.createTouchZone(zoneSize/2, height - zoneSize*1.5, zoneSize, () => -300, 0),
      right: this.createTouchZone(zoneSize*2, height - zoneSize*1.5, zoneSize, () => 300, 0),
      up: this.createTouchZone(width - zoneSize*1.5, height - zoneSize*2, zoneSize, () => -300, 1),
      down: this.createTouchZone(width - zoneSize*1.5, height - zoneSize*1.0, zoneSize, () => 300, 1)
    };
  }

  private createTouchZone(
    x: number,
    y: number,
    size: number,
    velocityCallback: () => number,
    axis: 0 | 1
  ): Phaser.GameObjects.Zone {
    return this.add.zone(x, y, size, size)
      .setInteractive()
      .on('pointerdown', () => {
        if (axis === 0) {
          this.player?.setVelocityX(velocityCallback());
        } else {
          this.player?.setVelocityY(velocityCallback());
        }
      })
      .on('pointerup', () => {
        if (axis === 0) {
          this.player?.setVelocityX(0);
        } else {
          this.player?.setVelocityY(0);
        }
      });
  }

  // 處理遊戲手把輸入
  private handleGamepadInput(): void {
    const speed = 300;
    const gamepad = this.gamepad;
    
    if (!gamepad) return;

    const [axisX, axisY] = gamepad.axes;
    const xValue = axisX?.getValue() ?? 0;
    const yValue = axisY?.getValue() ?? 0;

    if (Math.abs(xValue) > 0.1) {
      this.player?.setVelocityX(xValue * speed);
    } else {
      this.player?.setVelocityX(0);
    }

    if (Math.abs(yValue) > 0.1) {
      this.player?.setVelocityY(yValue * speed);
    } else {
      this.player?.setVelocityY(0);
    }
  }

  // 主更新迴圈
  // 處理鍵盤移動
  private handleKeyboardMovement(speed: number): void {
    if (!this.cursors) return;

    const { left, right, up, down } = this.cursors;
    
    if (left?.isDown) {
      this.player?.setVelocityX(-speed);
    } else if (right?.isDown) {
      this.player?.setVelocityX(speed);
    } else {
      this.player?.setVelocityX(0);
    }

    if (up?.isDown) {
      this.player?.setVelocityY(-speed);
    } else if (down?.isDown) {
      this.player?.setVelocityY(speed);
    } else {
      this.player?.setVelocityY(0);
    }
  }

  update(): void {
    if (!this.player) return;

    // 鍵盤控制
    if (this.cursors) {
      const speed = 300;
      this.handleKeyboardMovement(speed);
    }

    // 遊戲手把控制
    if (this.gamepad) {
      this.handleGamepadInput();
    }
  }

  // 處理鍵盤移動
    const speed = 300;
    const [axisX, axisY] = this.gamepad!.axes;

    // 處理水平軸輸入
    if (Math.abs(axisX.getValue()) > 0.1) {
      this.player.setVelocityX(axisX.getValue() * speed);
    } else {
      this.player.setVelocityX(0);
    }

    // 處理垂直軸輸入
    if (Math.abs(axisY.getValue()) > 0.1) {
      this.player.setVelocityY(axisY.getValue() * speed);
    } else {
      this.player.setVelocityY(0);
    }
  }
}