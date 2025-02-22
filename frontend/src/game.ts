import * as THREE from "three";
import {
  WindowFullscreen,
  WindowUnfullscreen,
} from "../wailsjs/runtime/runtime";

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

  // Lights
  pointLight = new THREE.PointLight(0xffbb66, 1.3);

  // Load texture
  textureList = [
    "PavingStones",
    "Rust",
    "Metal",
    "CorrugatedSteel",
    "Concrete",
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

  constructor() {
    console.log("test");

    if (!this.debug) {
      this.debugText.style.display = "none";
    }

    this.cameraHolder.add(this.camera);
    this.scene.add(this.cameraHolder);

    this.cameraHolder.position.x = 2.0;
    this.cameraHolder.position.y = 1.5;
    this.cameraHolder.position.z = 3.0;

    this.precomputeCosAndSin();

    // Create renderer and bind it to the canvas
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.setLightToCameraPosition(this.pointLight);
    this.scene.add(this.pointLight);

    this.textureList.forEach((t) => {
      this.textures[t] = this.textureLoader.load(`/${t}.jpg`);
      this.materials[t] = new THREE.MeshLambertMaterial({
        map: this.textures[t],
      });
    });

    for (let x = -4; x <= 4; x++) {
      for (let y = -4; y <= 4; y++) {
        this.addRoom(x, 0, y);
      }
    }

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
  <p>${this.camera.rotation.x.toFixed(2)}</p>
  <p>${this.cameraHolder.rotation.y.toFixed(2)}</p>
  <p>${this.camera.rotation.z.toFixed(2)}</p>
  `;
  }

  // Animation loop
  animate() {
    requestAnimationFrame(() => this.animate());

    const now = new Date().getTime();
    this.fps = 1000.0 / (now - this.previousFrame);
    this.previousFrame = now;

    this.processPlayerMovements();

    if (this.debug) this.writeDebugData();

    this.renderer.render(this.scene, this.camera);
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

  processPlayerMovements() {
    if (this.isPressingW) {
      this.cameraHolder.position.z -= (this.speed / this.fps) * this.cosAngle;
      this.cameraHolder.position.x -= (this.speed / this.fps) * this.sinAngle;
    }
    if (this.isPressingA) {
      this.cameraHolder.position.z += (this.speed / this.fps) * this.sinAngle;
      this.cameraHolder.position.x -= (this.speed / this.fps) * this.cosAngle;
    }
    if (this.isPressingS) {
      this.cameraHolder.position.z += (this.speed / this.fps) * this.cosAngle;
      this.cameraHolder.position.x += (this.speed / this.fps) * this.sinAngle;
    }
    if (this.isPressingD) {
      this.cameraHolder.position.z -= (this.speed / this.fps) * this.sinAngle;
      this.cameraHolder.position.x += (this.speed / this.fps) * this.cosAngle;
    }
    this.setLightToCameraPosition(this.pointLight);
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

  addRoom(x: number, y: number, z: number) {
    x *= 5;
    y *= 5;
    z *= 5;
    // Ground
    this.addCube(this.materials.PavingStones, x + 0, y + 0, z + 2);
    this.addCube(this.materials.PavingStones, x + 1, y + 0, z + 1);
    this.addCube(this.materials.PavingStones, x + 1, y + 0, z + 2);
    this.addCube(this.materials.PavingStones, x + 1, y + 0, z + 3);
    this.addCube(this.materials.PavingStones, x + 2, y + 0, z + 0);
    this.addCube(this.materials.PavingStones, x + 2, y + 0, z + 1);
    this.addCube(this.materials.PavingStones, x + 2, y + 0, z + 2);
    this.addCube(this.materials.PavingStones, x + 2, y + 0, z + 3);
    this.addCube(this.materials.PavingStones, x + 2, y + 0, z + 4);
    this.addCube(this.materials.PavingStones, x + 3, y + 0, z + 1);
    this.addCube(this.materials.PavingStones, x + 3, y + 0, z + 2);
    this.addCube(this.materials.PavingStones, x + 3, y + 0, z + 3);
    this.addCube(this.materials.PavingStones, x + 4, y + 0, z + 2);

    // Walls
    this.addCube(this.materials.CorrugatedSteel, x + 1, y + 1, z + 0);
    this.addCube(this.materials.CorrugatedSteel, x + 0, y + 1, z + 1);
    this.addCube(this.materials.CorrugatedSteel, x + 3, y + 1, z + 0);
    this.addCube(this.materials.CorrugatedSteel, x + 4, y + 1, z + 1);
    this.addCube(this.materials.CorrugatedSteel, x + 0, y + 1, z + 3);
    this.addCube(this.materials.CorrugatedSteel, x + 1, y + 1, z + 4);
    this.addCube(this.materials.CorrugatedSteel, x + 3, y + 1, z + 4);
    this.addCube(this.materials.CorrugatedSteel, x + 4, y + 1, z + 3);
    this.addCube(this.materials.CorrugatedSteel, x + 1, y + 2, z + 0);
    this.addCube(this.materials.CorrugatedSteel, x + 0, y + 2, z + 1);
    this.addCube(this.materials.CorrugatedSteel, x + 3, y + 2, z + 0);
    this.addCube(this.materials.CorrugatedSteel, x + 4, y + 2, z + 1);
    this.addCube(this.materials.CorrugatedSteel, x + 0, y + 2, z + 3);
    this.addCube(this.materials.CorrugatedSteel, x + 1, y + 2, z + 4);
    this.addCube(this.materials.CorrugatedSteel, x + 3, y + 2, z + 4);
    this.addCube(this.materials.CorrugatedSteel, x + 4, y + 2, z + 3);

    // Roof
    this.addCube(this.materials.Rust, x + 0, y + 3, z + 2);
    this.addCube(this.materials.Rust, x + 1, y + 3, z + 1);
    this.addCube(this.materials.Rust, x + 1, y + 3, z + 2);
    this.addCube(this.materials.Rust, x + 1, y + 3, z + 3);
    this.addCube(this.materials.Rust, x + 2, y + 3, z + 0);
    this.addCube(this.materials.Rust, x + 2, y + 3, z + 1);
    this.addCube(this.materials.Rust, x + 2, y + 3, z + 2);
    this.addCube(this.materials.Rust, x + 2, y + 3, z + 3);
    this.addCube(this.materials.Rust, x + 2, y + 3, z + 4);
    this.addCube(this.materials.Rust, x + 3, y + 3, z + 1);
    this.addCube(this.materials.Rust, x + 3, y + 3, z + 2);
    this.addCube(this.materials.Rust, x + 3, y + 3, z + 3);
    this.addCube(this.materials.Rust, x + 4, y + 3, z + 2);

    // Pipes
    const cylinderMesh = new THREE.Mesh(
      this.cylinderGeometry,
      this.materials.CorrugatedSteel
    );
    cylinderMesh.position.set(x + 2, y + 1, z + 2);
    cylinderMesh.rotateX(Math.PI / 2);
    this.scene.add(cylinderMesh);
  }
}

export default Game;
