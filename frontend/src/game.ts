import * as THREE from "three";
import {
  WindowFullscreen,
  WindowUnfullscreen,
} from "../wailsjs/runtime/runtime";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

class Game {
  // Config
  debug = true;
  isFullScreen = false;

  // Mouse camera control
  yaw = 0;
  pitch = 0;
  sensitivity = 0.002;

  // Get the canvas element from HTML
  debugText = document.getElementById("debug-text") as HTMLCanvasElement;

  // Scene
  scene = new THREE.Scene();

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas") as HTMLCanvasElement,
  });

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  cameraHolder = new THREE.Group();

  // Player
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

  // Lights
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  pointLight = new THREE.PointLight(0xffbb66, 0.0);

  // Load texture
  textureList = [
    "EmergencyExit",
    "Concrete",
    "Gravel",
    "Ground",
    "Metal",
    "PavingStones",
    "Plaster",
    "Rust",
    "Steel",
  ];
  textures: Record<string, THREE.Texture> = {};
  materials: Record<string, THREE.MeshLambertMaterial> = {};
  textureLoader = new THREE.TextureLoader();

  // Geometries
  cubeGeometry = new THREE.BoxGeometry();
  cylinderGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);

  // FPS
  fps: number = 60.0;
  previousFrame = new Date().getTime();

  // Model Loading
  loader = new GLTFLoader();

  // Model list
  models: THREE.Group[] = [];

  constructor(debug: boolean) {
    this.debug = debug;
    if (debug) {
      this.debugText.style.display = "block";
    }

    this.cameraHolder.add(this.camera);
    this.scene.add(this.cameraHolder);
    this.cameraHolder.position.y = 1.5;

    this.precomputeCosAndSin();

    // Create renderer and bind it to the canvas
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.setLightToCameraPosition(this.pointLight);
    this.scene.add(this.pointLight);
    this.scene.add(this.ambientLight);
    this.directionalLight.position.set(-3, 10, -10);
    this.scene.add(this.directionalLight);

    this.textureList.forEach((t) => {
      this.textures[t] = this.textureLoader.load(`/${t}.jpg`);
      this.materials[t] = new THREE.MeshLambertMaterial({
        map: this.textures[t],
      });
    });

    this.loader.load("/second_tree.glb", (gltf) => {
      const model = gltf.scene;
      model.position.set(-5, 0, 3);
      this.models.push(model);
      this.scene.add(model);
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
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
      if (e.code === "F11") {
        this.isFullScreen ? WindowUnfullscreen() : WindowFullscreen();
        this.isFullScreen = !this.isFullScreen;
      }
    });

    // Pointer Lock API to capture the mouse
    document.body.addEventListener("click", () => {
      document.body.requestPointerLock();
    });

    // Listen to mouse movement
    window.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement === document.body) {
        this.yaw -= event.movementX * this.sensitivity;
        this.pitch -= event.movementY * this.sensitivity;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch)); // Clamp pitch to avoid flipping

        this.cameraHolder.rotation.y = this.yaw; // Yaw applied to parent group
        this.camera.rotation.x = this.pitch; // Pitch applied only to camera

        this.precomputeCosAndSin();
      }
    });
  }

  writeDebugData() {
    this.debugText.innerHTML = `
  <p>FPS: ${this.fps.toFixed(1)}</p>
  <p>${this.cameraHolder.position.x.toFixed(2)},
  ${this.cameraHolder.position.y.toFixed(2)},
  ${this.cameraHolder.position.z.toFixed(2)}</p>
  <br />
  <p>rotation x: ${this.camera.rotation.x.toFixed(2)}</p>
  <p>rotation y: ${this.cameraHolder.rotation.y.toFixed(2)}</p>
  <p>rotation z: ${this.camera.rotation.z.toFixed(2)}</p>
  <br />
  <p>cosAngle: ${this.cosAngle.toFixed(2)}</p>
  <p>sinAngle: ${this.sinAngle.toFixed(2)}</p>
  `;
  }

  // Animation loop
  animate() {
    requestAnimationFrame(() => this.animate());

    this.models.forEach((model) => {
      model.rotation.y += 0.001;
    });

    this.directionalLight.rotation.x += 0.01;

    const now = new Date().getTime();
    this.fps = 1000.0 / (now - this.previousFrame);
    this.previousFrame = now;

    this.processPlayerMovements();

    if (this.debug) this.writeDebugData();

    this.renderer.render(this.scene, this.camera);
  }

  processPlayerMovements() {
    const mightCollideObjs = this.scene.children.filter(
      (object) =>
        object.position.distanceTo(this.cameraHolder.position) < 2 &&
        object.type === "Mesh" &&
        object.position.y > 0.25 &&
        object.position.y < 1.75
    );

    const camTop = new THREE.Vector3(
      this.cameraHolder.position.x,
      this.cameraHolder.position.y,
      this.cameraHolder.position.z - this.eatBoxSize
    );

    const camRight = new THREE.Vector3(
      this.cameraHolder.position.x + this.eatBoxSize,
      this.cameraHolder.position.y,
      this.cameraHolder.position.z
    );

    const camBottom = new THREE.Vector3(
      this.cameraHolder.position.x,
      this.cameraHolder.position.y,
      this.cameraHolder.position.z + this.eatBoxSize
    );

    const camLeft = new THREE.Vector3(
      this.cameraHolder.position.x - this.eatBoxSize,
      this.cameraHolder.position.y,
      this.cameraHolder.position.z
    );

    mightCollideObjs.forEach((box) =>
      this.collide(box, camTop, camRight, camBottom, camLeft)
    );

    if (this.isPressingW) {
      if (
        (this.cosAngle > 0 && !this.collideTop) ||
        (this.cosAngle < 0 && !this.collideBottom)
      ) {
        this.cameraHolder.position.z -= (this.speed / this.fps) * this.cosAngle;
      }
      if (
        (this.sinAngle > 0 && !this.collideLeft) ||
        (this.sinAngle < 0 && !this.collideRight)
      ) {
        this.cameraHolder.position.x -= (this.speed / this.fps) * this.sinAngle;
      }
    }
    if (this.isPressingA) {
      if (
        (this.sinAngle > 0 && !this.collideBottom) ||
        (this.sinAngle < 0 && !this.collideTop)
      ) {
        this.cameraHolder.position.z += (this.speed / this.fps) * this.sinAngle;
      }
      if (
        (this.cosAngle > 0 && !this.collideLeft) ||
        (this.cosAngle < 0 && !this.collideRight)
      ) {
        this.cameraHolder.position.x -= (this.speed / this.fps) * this.cosAngle;
      }
    }
    if (this.isPressingS) {
      if (
        (this.cosAngle > 0 && !this.collideBottom) ||
        (this.cosAngle < 0 && !this.collideTop)
      ) {
        this.cameraHolder.position.z += (this.speed / this.fps) * this.cosAngle;
      }
      if (
        (this.sinAngle > 0 && !this.collideRight) ||
        (this.sinAngle < 0 && !this.collideLeft)
      ) {
        this.cameraHolder.position.x += (this.speed / this.fps) * this.sinAngle;
      }
    }
    if (this.isPressingD) {
      if (
        (this.sinAngle > 0 && !this.collideTop) ||
        (this.sinAngle < 0 && !this.collideBottom)
      ) {
        this.cameraHolder.position.z -= (this.speed / this.fps) * this.sinAngle;
      }
      if (
        (this.cosAngle > 0 && !this.collideRight) ||
        (this.cosAngle < 0 && !this.collideLeft)
      ) {
        this.cameraHolder.position.x += (this.speed / this.fps) * this.cosAngle;
      }
    }
    this.setLightToCameraPosition(this.pointLight);

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

  setLightToCameraPosition(light: THREE.PointLight) {
    light.position.set(
      this.cameraHolder.position.x,
      this.cameraHolder.position.y,
      this.cameraHolder.position.z
    );
  }

  precomputeCosAndSin() {
    this.cosAngle = Math.cos(this.cameraHolder.rotation.y);
    this.sinAngle = Math.sin(this.cameraHolder.rotation.y);
  }

  addCube(
    material: THREE.MeshLambertMaterial,
    x: number,
    y: number,
    z: number
  ): void {
    const cube = new THREE.Mesh(this.cubeGeometry, material);
    this.scene.add(cube);
    cube.position.set(x, y, z);
  }

  addDoor(
    material: THREE.MeshLambertMaterial,
    x: number,
    y: number,
    z: number,
    rotated: boolean
  ): void {
    const door = new THREE.Mesh(this.cubeGeometry, material);
    door.scale.y = 1.8;
    door.scale.z = 0.2;
    if (rotated) door.rotateY(Math.PI / 2);
    door.position.set(x, y + 0.4, z);
    this.scene.add(door);

    const roofDoor = new THREE.Mesh(this.cubeGeometry, this.materials.Rust);
    roofDoor.position.set(x, 2.4, z);
    roofDoor.scale.y = 0.2;
    this.scene.add(roofDoor);
  }

  addEmergencyExit(x: number, y: number, z: number, rotated: boolean): void {
    const sign = new THREE.Mesh(
      this.cubeGeometry,
      this.materials.EmergencyExit
    );
    sign.scale.x = 0.5;
    sign.scale.y = 0.25;
    sign.scale.z = 0.1;
    if (rotated) sign.rotateY(Math.PI / 2);
    sign.position.set(x, y + 1.4, z);
    this.scene.add(sign);

    const signLight1 = new THREE.PointLight(0x00ff00, 0.05);
    const signLight2 = new THREE.PointLight(0x00ff00, 0.05);
    if (rotated) {
      signLight1.position.set(x - 0.5, y + 1.1, z);
      signLight2.position.set(x + 0.5, y + 1.1, z);
    } else {
      signLight1.position.set(x, y + 1.1, z - 0.5);
      signLight2.position.set(x, y + 1.1, z + 0.5);
    }
    this.scene.add(signLight1);
    this.scene.add(signLight2);
  }

  parseAndBuildMap(map: string) {
    map.split("\n").forEach((line, z) => {
      line.split("").forEach((char, x) => {
        // In any case, add floor and roof;
        this.addCube(this.materials.Concrete, x, 0, z);
        this.addCube(this.materials.Plaster, x, 3, z);

        switch (char) {
          case "w": {
            this.addCube(this.materials.Rust, x, 1, z);
            this.addCube(this.materials.Rust, x, 2, z);
            break;
          }
          case "d": {
            // Horizontal door
            this.addDoor(this.materials.Steel, x, 1, z, false);
            break;
          }
          case "D": {
            // Vertical door
            this.addDoor(this.materials.Steel, x, 1, z, true);
            break;
          }
          case "e": {
            // Horizontal emergency exit
            this.addEmergencyExit(x, 1, z, true);
            break;
          }
          case "E": {
            // Vertical emergency exit
            this.addEmergencyExit(x, 1, z, false);
            break;
          }
          case "p": {
            // Player
            this.cameraHolder.position.x = x;
            this.cameraHolder.position.z = z;
            break;
          }
        }
      });
    });
  }
}

export default Game;
