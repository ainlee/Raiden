import type { Cube } from '../types/global';

/**
 * 等角投影碰撞檢測器
 */
export class IsometricCollider {
  private cube: Cube;
  public onCollide: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();

  constructor(cube: Cube) {
    this.cube = cube;
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
    return !(
      a.x > b.x + b.width ||
      a.x + a.width < b.x ||
      a.y > b.y + b.height ||
      a.y + a.height < b.y ||
      a.z > b.z + b.depth ||
      a.z + a.depth < b.z
    );
  }
}

/**
 * 擴展物理系統支持等角投影
 */
export class PhysicsSystem {
  private colliders: IsometricCollider[] = [];
  private playerCollider?: IsometricCollider;

  /**
   * 註冊等角碰撞器
   * @param isPlayer 是否為玩家碰撞器
   */
  addIsometricCollider(collider: IsometricCollider, isPlayer = false): void {
    this.colliders.push(collider);
    if (isPlayer) {
      this.playerCollider = collider;
    }
  }

  /**
   * 更新碰撞檢測
   */
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
    for (let i = 0; i < this.colliders.length; i++) {
      for (let j = i + 1; j < this.colliders.length; j++) {
        if (this.colliders[i].checkIntersection(this.colliders[j])) {
          this.colliders[i].onCollide.emit('collide', this.colliders[j]);
          this.colliders[j].onCollide.emit('collide', this.colliders[i]);
        }
      }
    }
  }
}