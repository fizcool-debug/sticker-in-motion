import { Matrix4, Quaternion, Vector3, MathUtils } from 'three';

// Smooth a rigid pose, not matrix entries: interpolating matrix entries can
// introduce shear and make a raised plane wobble even more.
export class PoseStabilizer {
  private position = new Vector3();
  private rotation = new Quaternion();
  private scale = new Vector3();
  private targetPosition = new Vector3();
  private targetRotation = new Quaternion();
  private targetScale = new Vector3();
  private initialized = false;
  private lastTime = 0;
  readonly matrix = new Matrix4();

  reset() { this.initialized = false; }

  update(target: Matrix4, time: number) {
    target.decompose(this.targetPosition, this.targetRotation, this.targetScale);
    if (!this.initialized) {
      this.position.copy(this.targetPosition);
      this.rotation.copy(this.targetRotation);
      this.scale.copy(this.targetScale);
      this.initialized = true;
    } else {
      const dt = MathUtils.clamp((time - this.lastTime) / 1000, 0, .1);
      const stickerWidth = Math.max(Math.abs(this.targetScale.x), .0001);
      const movement = this.position.distanceTo(this.targetPosition) / stickerWidth;
      const turn = this.rotation.angleTo(this.targetRotation);
      const response = MathUtils.clamp(Math.max(movement / .08, turn / .2), 0, 1);
      const positionAlpha = 1 - Math.exp(-dt / MathUtils.lerp(.10, .035, response));
      const rotationAlpha = 1 - Math.exp(-dt / MathUtils.lerp(.14, .045, response));
      const scaleAlpha = 1 - Math.exp(-dt / .12);
      this.position.lerp(this.targetPosition, positionAlpha);
      this.rotation.slerp(this.targetRotation, rotationAlpha);
      this.scale.lerp(this.targetScale, scaleAlpha);
    }
    this.lastTime = time;
    return this.matrix.compose(this.position, this.rotation, this.scale);
  }
}
