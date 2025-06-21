import Phaser from 'phaser';
import { DynamicWindowAdjuster } from '@systems/DynamicWindowAdjuster';
import { PerformanceMonitor } from '@systems/PerformanceMonitor';
import { PerspectiveManager } from '@systems/PerspectiveManager';

/**
 * 主遊戲場景 - 控制玩家角色與輸入處理
 */
export default class MainScene extends Phaser.Scene {
  declare data: Phaser.Data.DataManager & {
    values: {
      score?: number;
    };
  };
  
  private movementSpeed = 300; // 統一移動速度參數
  private player!: Phaser.Physics.Arcade.Sprite;
  private gamepad?: Phaser.Input.Gamepad.Gamepad;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private touchControls!: Record<string, Phaser.GameObjects.Zone>;
  private dynamicWindow!: DynamicWindowAdjuster;
  private performanceMonitor!: PerformanceMonitor;
  private perspectiveManager!: PerspectiveManager;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // 預載入玩家戰機素材
    this.load.on('loaderror', () => {
      console.error('資源載入錯誤：無法載入玩家圖像檔案');
      this.scene.start('ErrorScene');
    });

    // 載入玩家戰機動畫圖集
    this.load.atlas(
      'player',
      'assets/sprites/Raiden-1P.png',
      'assets/sprites/Raiden-1P.json'
    );

    // 載入敵機測試素材
    this.load.image('enemy', 'assets/sprites/enemy-test.png');

    // 定義玩家動畫幀
    this.anims.create({
      key: 'player-idle',
      frames: this.anims.generateFrameNames('player', {
        prefix: 'Raiden-1P (圖層 ',
        start: 0,
        end: 3,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: -1
    });

    this.load.css('cubic-font', 'fonts/Cubic-11-1.430/fonts/web/Cubic_11.css');
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  async create() {
    // 初始化效能監控系統
    const { width, height } = this.scale;
    this.dynamicWindow = new DynamicWindowAdjuster();
    this.performanceMonitor = new PerformanceMonitor();

    // 新增測試用中景層
    this.perspectiveManager.createLayer({
      textureKey: 'midground_test_01',
      scrollSpeed: 0.7,
      baseScale: 1.2,
      alphaRange: [0.8, 0.5],
      depth: -3
    });
    
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
    
    // 初始化物理群組
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();
    
    // 測試關卡專用初始化
    this.initTestStage();
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
      left: this.createTouchZone(zoneSize/2, height - zoneSize*1.5, zoneSize, () => -this.movementSpeed, 0),
      right: this.createTouchZone(zoneSize*2, height - zoneSize*1.5, zoneSize, () => this.movementSpeed, 0),
      up: this.createTouchZone(width - zoneSize*1.5, height - zoneSize*2, zoneSize, () => -this.movementSpeed, 1),
      down: this.createTouchZone(width - zoneSize*1.5, height - zoneSize*1.0, zoneSize, () => this.movementSpeed, 1)
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

  /**
   * 處理遊戲手把輸入
   * @param speed 移動速度（預設300）
   */
  private handleGamepadInput(speed: number = 300): void {
    const gamepad = this.gamepad as Phaser.Input.Gamepad.Gamepad;
    const player = this.player as Phaser.Physics.Arcade.Sprite;

    if (!gamepad || !player) {
      console.warn('遊戲手把或玩家物件未初始化');
      console.debug('[DEBUG] 遊戲手把類型:', typeof gamepad);
      console.debug('[DEBUG] 玩家物件類型:', player?.constructor.name);
      return;
    }
    
    try {
      const axes = this.gamepad.axes.slice(0, 2);
      const [axisX, axisY] = axes.map(axis => axis?.getValue() || 0);
      
      // 處理水平軸輸入（X軸）
      if (Math.abs(axisX) > 0.1) {
        this.player.setVelocityX(axisX * speed);
      } else {
        this.player?.setVelocityX(0);
      }

      // 處理垂直軸輸入（Y軸）
      if (Math.abs(axisY) > 0.1) {
        this.player.setVelocityY(axisY * speed);
      } else {
        this.player?.setVelocityY(0);
      }
    } catch (error) {
      console.error('遊戲手把輸入處理異常:', error);
      this.gamepad = undefined; // 重設遊戲手把連線
    }
  }

  update(time: number, delta: number): void {
    if (!this.player) return;

    // 更新透視系統
    this.perspectiveManager.update(delta);

    // 鍵盤控制
    if (this.cursors) {
      const speed = 300;
      this.handleKeyboardMovement(speed);
    }

    // 遊戲手把控制
    if (this.gamepad) {
      this.handleGamepadInput();
    }

    // 處理視窗縮放
    this.dynamicWindow.handleResize();
    this.perspectiveManager.resize();
    
      // 敵機生成定時器
      this.time.addEvent({
        delay: 2000,
        callback: this.createEnemy,
        callbackScope: this,
        loop: true
      });
  
      // 子彈與敵機碰撞檢測
      if (!this.gamepad || !this.player) {
        return;
      }
      this.physics.add.overlap(
        (this.bullets as Phaser.Physics.Arcade.Group),
        (this.enemies as Phaser.Physics.Arcade.Group),
        (
          obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
          obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody
        ) => {
          if (obj1.body && obj2.body) {
            this.handleBulletHit(obj1, obj2);
          }
        }
      ),
        undefined,
        this
      );
    }
  
    /**
     * 生成測試用敵機
     * @param x 生成X座標（預設隨機）
     * @param speed 移動速度（預設100）
     */
    private createEnemy(x: number = Phaser.Math.Between(50, 430), speed: number = 100): void {
      const enemy = this.physics.add.sprite(x, -50, 'enemy')
        .setVelocityY(speed)
        .setCollideWorldBounds(true);
  
      this.enemies.add(enemy);
    }
  
    /**
     * 處理子彈擊中敵機事件
     * @param bullet 子彈精靈
     * @param enemy 敵機精靈
     */
    /**
     * 處理子彈擊中敵機事件
     * @param bullet 子彈物件
     * @param enemy 敵機物件
     */
    private handleBulletHit(
      bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody,
      enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody
    ): void {
      bullet.destroy();
      enemy.destroy();
      
      // 更新得分（測試用）
      const currentScore = (this.data.get('score') as number) || 0;
      this.data.set('score', currentScore + 100);
      console.log(`目前得分：${this.data.values.score}`);
    }
  }

  /**
   * 初始化測試關卡專用功能
   */
  private initTestStage(): void {
    
    try {
      // 取得前兩個軸的數值並正規化
      // 使用 Phaser 3.60+ 的軸數值取得方式
      const axesValues = this.gamepad.axes.map(axis => {
        return Phaser.Math.Clamp(Phaser.Input.Gamepad.Axis(axis), -1, 1);
      }).slice(0, 2);
      const [axisX, axisY] = axesValues;
      
      // 處理水平軸輸入（X軸）
      if (Math.abs(axisX) > 0.1) {
        this.player.setVelocityX(axisX * speed);
      } else {
        this.player?.setVelocityX(0);
      }

      // 處理垂直軸輸入（Y軸）
      if (Math.abs(axisY) > 0.1) {
        this.player.setVelocityY(axisY * speed);
      } else {
        this.player?.setVelocityY(0);
      }
    } catch (error) {
      console.error('遊戲手把輸入處理異常:', error);
      this.gamepad = undefined; // 重設遊戲手把連線
    }
  }
}