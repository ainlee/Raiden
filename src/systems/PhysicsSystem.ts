import type { Cube } from '../types/global';

/**
 * 等角投影碰撞檢測器
 */
// 確保正確定義碰撞器類別
export class IsometricCollider extends Phaser.Physics.Arcade.Sprite {
  public cube: Cube;
  public onCollide: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number = 10
  ) {
    super(scene, x, y, '');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // 調整碰撞體參數以匹配實際精靈尺寸
    this.cube = {
      x: x - width/2,  // 修正X軸中心點
      y: y - height/2, // 修正Y軸中心點
      z: 0,
      width: width,
      height: height,
      depth: depth
    };
    
    console.log(`[PhysicsSystem] IsometricCollider created at (${x},${y}) with adjusted size: ${width}x${height}x${depth}`);
  }

  /**
   * 檢查與其他碰撞器的相交
   * @param other 其他碰撞器
   * @returns 是否相交
   */
  checkIntersection(other: IsometricCollider): boolean {
    return this.checkCubeIntersection(this.cube, other.cube);
  }

  private checkCubeIntersection(a: Cube, b: Cube): boolean {
    // 寬階段檢測 (AABB)
    const broadPhase = !(
      a.x > b.x + b.width ||
      a.x + a.width < b.x ||
      a.y > b.y + b.height ||
      a.y + a.height < b.y ||
      a.z > b.z + b.depth ||
      a.z + a.depth < b.z
    );

    if (!broadPhase) return false;

    // 窄階段檢測 (SAT分離軸定理)
    return this.satCollisionCheck(a, b);
  }

  /**
   * 分離軸定理精確碰撞檢測
   */
  private satCollisionCheck(a: Cube, b: Cube): boolean {
    // 計算投影重疊
    const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
    const overlapZ = Math.min(a.z + a.depth, b.z + b.depth) - Math.max(a.z, b.z);

    // 三軸都有重疊才判定為碰撞
    return overlapX > 0 && overlapY > 0 && overlapZ > 0;
  }
}

/**
 * 擴展物理系統支持等角投影
 */
export class PhysicsSystem extends Phaser.Plugins.BasePlugin {
  private colliders: IsometricCollider[] = [];
  private playerCollider?: IsometricCollider;

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);
  }

  /**
   * 註冊等角碰撞器
   * @param collider 碰撞器實例
   * @param isPlayer 是否為玩家碰撞器
   */
  addIsometricCollider(collider: IsometricCollider, isPlayer = false): void {
    this.colliders.push(collider);
    if (isPlayer) {
      this.playerCollider = collider;
    }
  }
  
  /**
   * AABB寬階段碰撞檢測
   */
  private checkAABB(a: Cube, b: Cube): boolean {
    return !(
      a.x > b.x + b.width ||
      a.x + a.width < b.x ||
      a.y > b.y + b.height ||
      a.y + a.height < b.y ||
      a.z > b.z + b.depth ||
      a.z + a.depth < b.z
    );
  }

  /**
   * 更新碰撞檢測與玩家控制狀態
   * @param velocity 玩家當前速度
   */
  update(velocity?: { x: number; y: number }): void {
    // 更新玩家位置
    if (this.playerCollider && velocity) {
      this.playerCollider.cube.x += velocity.x * 0.1;
      this.playerCollider.cube.y += velocity.y * 0.1;
    }

    // 執行碰撞檢測
    // 寬階段篩選
    const potentialPairs: [IsometricCollider, IsometricCollider][] = [];
    for (let i = 0; i < this.colliders.length; i++) {
      for (let j = i + 1; j < this.colliders.length; j++) {
        const colliderA = this.colliders[i];
        const colliderB = this.colliders[j];
        
        // 快速AABB檢測
        if (this.checkAABB(colliderA.cube, colliderB.cube)) {
          potentialPairs.push([colliderA, colliderB]);
        }
      }
    }

    // 窄階段精確檢測
    potentialPairs.forEach(([colliderA, colliderB]) => {
      if (colliderA.checkIntersection(colliderB)) {
        colliderA.onCollide.emit('collide', colliderB);
        colliderB.onCollide.emit('collide', colliderA);
      }
    });
  }
}