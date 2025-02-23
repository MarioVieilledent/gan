import * as THREE from "three";

export class Player {
  speed = 2.0; // block/s
  cosAngle = 1.0;
  sinAngle = 0.0;
  isPressingW = false;
  isPressingA = false;
  isPressingS = false;
  isPressingD = false;
  collideTop = false;
  collideBottom = false;
  collideLeft = false;
  collideRight = false;
  eatBoxSize = 0.2; // block

  constructor() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyW") this.isPressingW = true;
      if (e.code === "KeyA") this.isPressingA = true;
      if (e.code === "KeyS") this.isPressingS = true;
      if (e.code === "KeyD") this.isPressingD = true;
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "KeyW") this.isPressingW = false;
      if (e.code === "KeyA") this.isPressingA = false;
      if (e.code === "KeyS") this.isPressingS = false;
      if (e.code === "KeyD") this.isPressingD = false;
    });
  }

  processPlayerMovements(
    scene: THREE.Scene,
    cameraHolder: THREE.Group,
    fps: number
  ) {
    const mightCollideObjs = scene.children.filter(
      (object) =>
        object.position.distanceTo(cameraHolder.position) < 2 &&
        object.type === "Mesh" &&
        object.position.y > 0.25 &&
        object.position.y < 1.75
    );

    const camTop = new THREE.Vector3(
      cameraHolder.position.x,
      cameraHolder.position.y,
      cameraHolder.position.z - this.eatBoxSize
    );

    const camRight = new THREE.Vector3(
      cameraHolder.position.x + this.eatBoxSize,
      cameraHolder.position.y,
      cameraHolder.position.z
    );

    const camBottom = new THREE.Vector3(
      cameraHolder.position.x,
      cameraHolder.position.y,
      cameraHolder.position.z + this.eatBoxSize
    );

    const camLeft = new THREE.Vector3(
      cameraHolder.position.x - this.eatBoxSize,
      cameraHolder.position.y,
      cameraHolder.position.z
    );

    mightCollideObjs.forEach((box) =>
      this.collide(box, camTop, camRight, camBottom, camLeft)
    );

    if (this.isPressingW) {
      if (
        (this.cosAngle > 0 && !this.collideTop) ||
        (this.cosAngle < 0 && !this.collideBottom)
      ) {
        cameraHolder.position.z -= (this.speed / fps) * this.cosAngle;
      }
      if (
        (this.sinAngle > 0 && !this.collideLeft) ||
        (this.sinAngle < 0 && !this.collideRight)
      ) {
        cameraHolder.position.x -= (this.speed / fps) * this.sinAngle;
      }
    }
    if (this.isPressingA) {
      if (
        (this.sinAngle > 0 && !this.collideBottom) ||
        (this.sinAngle < 0 && !this.collideTop)
      ) {
        cameraHolder.position.z += (this.speed / fps) * this.sinAngle;
      }
      if (
        (this.cosAngle > 0 && !this.collideLeft) ||
        (this.cosAngle < 0 && !this.collideRight)
      ) {
        cameraHolder.position.x -= (this.speed / fps) * this.cosAngle;
      }
    }
    if (this.isPressingS) {
      if (
        (this.cosAngle > 0 && !this.collideBottom) ||
        (this.cosAngle < 0 && !this.collideTop)
      ) {
        cameraHolder.position.z += (this.speed / fps) * this.cosAngle;
      }
      if (
        (this.sinAngle > 0 && !this.collideRight) ||
        (this.sinAngle < 0 && !this.collideLeft)
      ) {
        cameraHolder.position.x += (this.speed / fps) * this.sinAngle;
      }
    }
    if (this.isPressingD) {
      if (
        (this.sinAngle > 0 && !this.collideTop) ||
        (this.sinAngle < 0 && !this.collideBottom)
      ) {
        cameraHolder.position.z -= (this.speed / fps) * this.sinAngle;
      }
      if (
        (this.cosAngle > 0 && !this.collideRight) ||
        (this.cosAngle < 0 && !this.collideLeft)
      ) {
        cameraHolder.position.x += (this.speed / fps) * this.cosAngle;
      }
    }

    // Reset collisions
    this.collideTop = false;
    this.collideRight = false;
    this.collideBottom = false;
    this.collideLeft = false;
  }

  collide(
    box: THREE.Object3D,
    camTop: THREE.Vector3,
    camRight: THREE.Vector3,
    camBottom: THREE.Vector3,
    camLeft: THREE.Vector3
  ) {
    const boundingBox = new THREE.Box3().setFromObject(box);
    if (boundingBox.containsPoint(camTop)) {
      this.collideTop = true;
    }
    if (boundingBox.containsPoint(camRight)) {
      this.collideRight = true;
    }
    if (boundingBox.containsPoint(camBottom)) {
      this.collideBottom = true;
    }
    if (boundingBox.containsPoint(camLeft)) {
      this.collideLeft = true;
    }
  }

  precomputeCosAndSin(cameraHolder: THREE.Group) {
    this.cosAngle = Math.cos(cameraHolder.rotation.y);
    this.sinAngle = Math.sin(cameraHolder.rotation.y);
  }
}
