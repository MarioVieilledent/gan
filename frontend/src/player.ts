import * as THREE from "three";
import { getElevation } from "./terrain";

export class Player {
  speed = 3.0; // block/s // Good speed is 3

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

  // Camera height compared to feet position
  cameraHeight = 1.5;

  // Mouse camera control
  yaw = 0;
  pitch = 0;
  sensitivity = 0.002;

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  cameraHolder = new THREE.Group();

  constructor() {
    this.cameraHolder.add(this.camera);
    this.cameraHolder.position.y = 1.5;

    this.precomputeCosAndSin(this.cameraHolder);

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

    // Listen to mouse movement
    window.addEventListener("mousemove", (event) => {
      event.preventDefault();
      if (document.pointerLockElement === document.body) {
        this.yaw -= event.movementX * this.sensitivity;
        this.pitch -= event.movementY * this.sensitivity;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch)); // Clamp pitch to avoid flipping

        this.cameraHolder.rotation.y = this.yaw; // Yaw applied to parent group
        this.camera.rotation.x = this.pitch; // Pitch applied only to camera

        this.precomputeCosAndSin(this.cameraHolder);
      }
    });
  }

  setLightToCameraPosition(light: THREE.PointLight) {
    light.position.set(
      this.cameraHolder.position.x,
      this.cameraHolder.position.y,
      this.cameraHolder.position.z
    );
  }

  processPlayerMovements(
    scene: THREE.Scene,
    cameraHolder: THREE.Group,
    fps: number,
    renderDistance: number,
    backgroundImage: THREE.Mesh | null
  ) {
    const mightCollideObjs = scene.children.filter(
      (object) =>
        object.position.distanceTo(cameraHolder.position) < 2 &&
        object.type === "Mesh" &&
        object.name !== "backgroundImage" &&
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

    // If player has moved
    if (true) {
      // Set player's height
      this.cameraHolder.position.setY(
        getElevation(cameraHolder.position.x, cameraHolder.position.z) +
          this.cameraHeight
      );

      // Show only close objects
      scene.children.forEach((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Group) {
          const distance = object.position.distanceTo(
            this.cameraHolder.position
          );
          object.visible = distance < renderDistance;
        }
      });

      // Set background texture sphere in the center
      backgroundImage?.position.set(
        cameraHolder.position.x,
        cameraHolder.position.y,
        cameraHolder.position.z
      );
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
