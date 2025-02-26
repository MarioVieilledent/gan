import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { getElevation } from "./terrain";

export class Player {
  speed = 3.0; // block/s // Good speed is 3

  isPressingLeftMouse = false;
  isPressingRightMouse = false;
  keyStates: Record<string, boolean> = {};

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
  controls = new PointerLockControls(this.camera, document.body);

  // camera = new THREE.Group();

  // Render distances
  terrainRenderDistance = 512;
  modelRenderDistance = 256;

  constructor() {
    // Initial camera height
    this.camera.position.setY(this.cameraHeight);

    this.controls.addEventListener("lock", () => {
      // In FPS mode, hide menu | FIXME
    });

    this.controls.addEventListener("unlock", () => {
      // Out of FPS mode, show menu | FIXME
    });

    window.addEventListener("wheel", (e) => {
      if (e.deltaY > 0) {
        // FIXME Zoom out from player pos
      } else if (e.deltaY < 0) {
        // FIXME Zoom in from player pos
      }
    });

    window.addEventListener("mousedown", (e) => {
      if (e.button === 0) this.isPressingLeftMouse = true;
      if (e.button === 2) this.isPressingRightMouse = true;
    });

    window.addEventListener("mouseup", (e) => {
      if (e.button === 0) this.isPressingLeftMouse = false;
      if (e.button === 2) this.isPressingRightMouse = false;
    });

    window.addEventListener(
      "keydown",
      (event) => (this.keyStates[event.code] = true)
    );

    window.addEventListener(
      "keyup",
      (event) => (this.keyStates[event.code] = false)
    );
  }

  setLightToCameraPosition(light: THREE.PointLight) {
    light.position.set(
      this.camera.position.x,
      this.camera.position.y,
      this.camera.position.z
    );
  }

  processPlayerMovements(
    scene: THREE.Scene,
    camera: THREE.Camera,
    fps: number,
    backgroundImage: THREE.Mesh | null
  ) {
    if (this.keyStates.KeyW) this.controls.moveForward(this.speed / fps);
    if (this.keyStates.KeyA) this.controls.moveRight(-this.speed / fps);
    if (this.keyStates.KeyS) this.controls.moveForward(-this.speed / fps);
    if (this.keyStates.KeyD) this.controls.moveRight(this.speed / fps);

    // If player has moved
    if (
      this.keyStates.KeyW ||
      this.keyStates.KeyA ||
      this.keyStates.KeyS ||
      this.keyStates.KeyD
    ) {
      // Force player's height
      this.camera.position.setY(
        getElevation(camera.position.x, camera.position.z) + this.cameraHeight
      );

      // Show only close objects
      scene.children.forEach((object) => {
        if (object.name.startsWith("model")) {
          const distance = object.position.distanceTo(this.camera.position);
          object.visible = distance < this.modelRenderDistance;
        }

        if (object.name.startsWith("terrain")) {
          const distance = object.position.distanceTo(this.camera.position);
          object.visible = distance < this.terrainRenderDistance;
        }
      });

      // Set background texture sphere in the center
      backgroundImage?.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z
      );
    }
  }
}
