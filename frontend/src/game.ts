import * as THREE from "three";
import {
  WindowFullscreen,
  WindowUnfullscreen,
} from "../wailsjs/runtime/runtime";
import { loadModel } from "./modelLoader";
import { Player } from "./player";
import { Lights } from "./lights";

export class Game {
  // Config
  debug = true;
  isFullScreen = false;

  // Get the canvas element from HTML
  debugText = document.getElementById("debug-text") as HTMLCanvasElement;

  // Scene
  scene = new THREE.Scene();

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas") as HTMLCanvasElement,
  });

  player = new Player();

  // Lights
  lights = new Lights(this.scene);

  // Load texture
  textureList = [
    "EmergencyExit",
    "Concrete",
    "Gravel",
    "Grass1",
    "Grass2",
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

    this.scene.add(this.player.cameraHolder);
    this.player.setLightToCameraPosition(this.lights.pointLight);

    // Create renderer and bind it to the canvas
    this.renderer.setSize(window.innerWidth, window.innerHeight);

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
      this.player.camera.aspect = window.innerWidth / window.innerHeight;
      this.player.camera.updateProjectionMatrix();
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
  }

  writeDebugData() {
    const camera = this.player.camera;
    const cameraHolder = this.player.cameraHolder;

    this.debugText.innerHTML = `
  <p>FPS: ${this.fps.toFixed(1)}</p>
  <p>${cameraHolder.position.x.toFixed(2)},
  ${cameraHolder.position.y.toFixed(2)},
  ${cameraHolder.position.z.toFixed(2)}</p>
  <br />
  <p>rotation x: ${camera.rotation.x.toFixed(2)}</p>
  <p>rotation y: ${cameraHolder.rotation.y.toFixed(2)}</p>
  <p>rotation z: ${camera.rotation.z.toFixed(2)}</p>
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

    const now = new Date().getTime();
    this.fps = 1000.0 / (now - this.previousFrame);
    this.previousFrame = now;

    this.player.processPlayerMovements(
      this.scene,
      this.player.cameraHolder,
      this.fps
    );
    this.player.setLightToCameraPosition(this.lights.pointLight);

    if (this.debug) this.writeDebugData();

    this.renderer.render(this.scene, this.player.camera);
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
            this.player.cameraHolder.position.x = x;
            this.player.cameraHolder.position.z = z;
            break;
          }
        }
      });
    });
  }
}
