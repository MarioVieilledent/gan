import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { getElevation } from "./terrain";

export class Player {
  speed = 3.0; // block/s // Good speed is 3

  // cosAngle = 1.0;
  // sinAngle = 0.0;

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
  controls = new PointerLockControls(this.camera, document.body);

  // camera = new THREE.Group();

  // Render distances
  terrainRenderDistance = 512;
  modelRenderDistance = 256;

  constructor() {
    // add event listener to show/hide a UI (e.g. the game's menu)

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
    if (this.isPressingW) {
      this.controls.moveForward(this.speed / fps);
    }

    if (this.isPressingA) {
      this.controls.moveRight(-this.speed / fps);
    }

    if (this.isPressingS) {
      this.controls.moveForward(-this.speed / fps);
    }

    if (this.isPressingD) {
      this.controls.moveRight(this.speed / fps);
    }

    // If player has moved
    if (true) {
      // Set player's height
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
