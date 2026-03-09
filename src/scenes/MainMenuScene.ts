import * as Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Container;
  private player1Button!: Phaser.GameObjects.Container;
  private player2Button!: Phaser.GameObjects.Container;
  private cursor!: Phaser.GameObjects.Graphics;
  private selectedIndex: number = 0;
  private menuItems: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({
      key: 'MainMenuScene'
    });
  }

  create() {
    // 背景顏色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 建立標題
    this.titleText = this.add.text(400, 150, 'RAIDEN', {
      fontFamily: 'Arial Black',
      fontSize: '64px',
      color: '#ffcc00',
      stroke: '#ff6600',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5);

    // 建立副標題
    const subtitleText = this.add.text(400, 220, 'STRIKERS 1999', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);

    // 建立選單項目
    this.createMenuItems();

    // 建立游標
    this.cursor = this.add.graphics();
    this.updateCursor();

    // 註冊輸入事件
    this.setupInput();
  }

  private createMenuItems() {
    const startY = 350;
    const spacing = 70;

    // 開始遊戲按鈕
    this.startButton = this.createMenuItem(
      'START GAME',
      startY,
      () => {
        console.log('Starting game...');
        this.scene.start('MainScene');
      }
    );

    // 玩家 1 選擇
    this.player1Button = this.createMenuItem(
      'PLAYER 1',
      startY + spacing,
      () => {
        console.log('Selected Player 1');
        this.scene.start('MainScene');
      }
    );

    // 玩家 2 選擇
    this.player2Button = this.createMenuItem(
      'PLAYER 2',
      startY + spacing * 2,
      () => {
        console.log('Selected Player 2');
        this.scene.start('MainScene');
      }
    );

    this.menuItems = [this.startButton, this.player1Button, this.player2Button];
  }

  private createMenuItem(
    text: string,
    y: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(400, y);

    // 按鈕背景
    const bg = this.add.rectangle(0, 0, 300, 50, 0x4a4a6a)
      .setStrokeStyle(2, 0xffcc00)
      .setInteractive({ useHandCursor: true });

    // 按鈕文字
    const textObj = this.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // 添加到容器
    container.add([bg, textObj]);

    // 設定互動
    bg.on('pointerover', () => {
      bg.setFillStyle(0x6a6a8a);
      bg.setStrokeStyle(3, 0xffcc00);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x4a4a6a);
      bg.setStrokeStyle(2, 0xffcc00);
    });

    bg.on('pointerdown', onClick);

    return container;
  }

  private setupInput() {
    // 鍵盤輸入
    this.input.keyboard?.on('keydown-UP', () => {
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
        this.updateCursor();
      }
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      if (this.selectedIndex < this.menuItems.length - 1) {
        this.selectedIndex++;
        this.updateCursor();
      }
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.menuItems[this.selectedIndex].getAt(0).emit('pointerdown');
    });

    // 滑鼠/觸控輸入
    this.input.on('pointermove', (pointer) => {
      // 檢查滑鼠是否在選單項目上
      for (let i = 0; i < this.menuItems.length; i++) {
        const item = this.menuItems[i];
        const bounds = item.getBounds();

        if (bounds.contains(pointer.x, pointer.y)) {
          this.selectedIndex = i;
          this.updateCursor();
          break;
        }
      }
    });

    this.input.on('pointerdown', (pointer) => {
      for (let i = 0; i < this.menuItems.length; i++) {
        const item = this.menuItems[i];
        const bounds = item.getBounds();

        if (bounds.contains(pointer.x, pointer.y)) {
          this.selectedIndex = i;
          this.updateCursor();
          item.getAt(0).emit('pointerdown');
          break;
        }
      }
    });
  }

  private updateCursor() {
    this.cursor.clear();

    const item = this.menuItems[this.selectedIndex];
    const bounds = item.getBounds();

    // 繪制游標
    this.cursor.lineStyle(2, 0xffcc00, 1);
    this.cursor.strokeRect(bounds.x - 10, bounds.y - 5, bounds.width + 20, bounds.height + 10);

    // 添加發光效果
    this.cursor.fillStyle(0xffcc00, 0.1);
    this.cursor.fillRect(bounds.x - 10, bounds.y - 5, bounds.width + 20, bounds.height + 10);
  }

  update() {
    // 可以在這裡添加動畫效果
  }
}
