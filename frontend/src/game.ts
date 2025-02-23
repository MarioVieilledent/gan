import * as THREE from "three";
import {
  WindowFullscreen,
  WindowUnfullscreen,
} from "../wailsjs/runtime/runtime";
import { loadModel } from "./modelLoader";
import { Player } from "./player";

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

  player = new Player();

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

    this.player.precomputeCosAndSin(this.cameraHolder);

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

    loadModel(this.scene, this.models, "second_tree", -5, 0, 3);
    loadModel(this.scene, this.models, "first_rock", -2, 0, 4);

    // Handle window resize
    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });

    window.addEventListener("keyup", (e) => {
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

        this.player.precomputeCosAndSin(this.cameraHolder);
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
  <p>cosAngle: ${this.player.cosAngle.toFixed(2)}</p>
  <p>sinAngle: ${this.player.sinAngle.toFixed(2)}</p>
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

    this.player.processPlayerMovements(this.scene, this.cameraHolder, this.fps);
    this.setLightToCameraPosition(this.pointLight);

    if (this.debug) this.writeDebugData();

    this.renderer.render(this.scene, this.camera);
  }

  setLightToCameraPosition(light: THREE.PointLight) {
    light.position.set(
      this.cameraHolder.position.x,
      this.cameraHolder.position.y,
      this.cameraHolder.position.z
    );
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
