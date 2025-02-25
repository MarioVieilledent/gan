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
  isPressingLeftMouse = false;
  isPressingRightMouse = false;

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

  // Render distances
  terrainRenderDistance = 512;
  modelRenderDistance = 256;

  constructor() {
    this.cameraHolder.add(this.camera);
    this.cameraHolder.position.y = 1.5;

    this.precomputeCosAndSin(this.cameraHolder);

    window.addEventListener("wheel", (e) => {
      if (e.deltaY > 0) {
        // FIXME Zoom out from player pos
      } else if (e.deltaY < 0) {
        // FIXME Zoom in from player pos
      }
    });

    window.addEventListener("mousedown", (e) => {
      console.log(e.button);
      if (e.button === 0) this.isPressingLeftMouse = true;
      if (e.button === 0) this.isPressingRightMouse = true;
    });

    window.addEventListener("mouseup", (e) => {
      if (e.button === 0) this.isPressingLeftMouse = false;
      if (e.button === 0) this.isPressingRightMouse = false;
    });

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
    backgroundImage: THREE.Mesh | null
  ) {
    if (this.isPressingW) {
      cameraHolder.position.z -= (this.speed / fps) * this.cosAngle;
      cameraHolder.position.x -= (this.speed / fps) * this.sinAngle;
    }

    if (this.isPressingA) {
      cameraHolder.position.z += (this.speed / fps) * this.sinAngle;
      cameraHolder.position.x -= (this.speed / fps) * this.cosAngle;
    }

    if (this.isPressingS) {
      cameraHolder.position.z += (this.speed / fps) * this.cosAngle;
      cameraHolder.position.x += (this.speed / fps) * this.sinAngle;
    }

    if (this.isPressingD) {
      cameraHolder.position.z -= (this.speed / fps) * this.sinAngle;
      cameraHolder.position.x += (this.speed / fps) * this.cosAngle;
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
        if (object.name.startsWith("model")) {
          const distance = object.position.distanceTo(
            this.cameraHolder.position
          );
          object.visible = distance < this.modelRenderDistance;
        }

        if (object.name.startsWith("terrain")) {
          const distance = object.position.distanceTo(
            this.cameraHolder.position
          );
          object.visible = distance < this.terrainRenderDistance;
        }
      });

      // Set background texture sphere in the center
      backgroundImage?.position.set(
        cameraHolder.position.x,
        cameraHolder.position.y,
        cameraHolder.position.z
      );
    }
  }

  precomputeCosAndSin(cameraHolder: THREE.Group) {
    this.cosAngle = Math.cos(cameraHolder.rotation.y);
    this.sinAngle = Math.sin(cameraHolder.rotation.y);
  }
}
