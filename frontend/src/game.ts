import * as THREE from "three";
import {
  WindowFullscreen,
  WindowUnfullscreen,
} from "../wailsjs/runtime/runtime";
import { Player } from "./player";
import { Lights } from "./lights";
import { Textures } from "./textures";
import { getElevation } from "./terrain";
import { Models } from "./models";

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
  backgroundImage: THREE.Mesh | null = null;

  // Player
  player = new Player();

  // Lights
  lights = new Lights(this.scene);

  // Textures
  textures = new Textures();

  // 3D Models
  models = new Models(this.scene);

  // FPS
  fps: number = 60.0;
  previousFrame = new Date().getTime();

  constructor(debug: boolean) {
    this.debug = debug;
    if (debug) {
      this.debugText.style.display = "block";
    }

    // Set camera
    this.scene.add(this.player.camera);

    // Set lights position
    this.player.setLightToCameraPosition(this.lights.pointLight);

    // Load and set background image
    this.backgroundImage = this.textures.loadBackground("clouds");
    this.backgroundImage.name = "backgroundImage";
    this.scene.add(this.backgroundImage);

    // Create renderer and bind it to the canvas
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Handle window resize
    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.player.camera.aspect = window.innerWidth / window.innerHeight;
      this.player.camera.updateProjectionMatrix();
    });

    // Handle fullscreen
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

    this.debugText.innerHTML = `
  <p>FPS: ${this.fps.toFixed(1)}</p>
  <p>${camera.position.x.toFixed(2)},
  ${camera.position.y.toFixed(2)},
  ${camera.position.z.toFixed(2)}</p>
  <br />
  <p>rotation x: ${camera.rotation.x.toFixed(2)}</p>
  <p>rotation y: ${camera.rotation.y.toFixed(2)}</p>
  <p>rotation z: ${camera.rotation.z.toFixed(2)}</p>
  <br />
  <p>elevation: ${getElevation(
    Math.round(camera.position.x),
    Math.round(camera.position.z)
  ).toFixed(2)}</p>
  `;
  }

  // Animation loop
  animate() {
    requestAnimationFrame(() => this.animate());

    const now = new Date().getTime();
    this.fps = 1000.0 / (now - this.previousFrame);
    this.previousFrame = now;

    this.player.processPlayerMovements(
      this.scene,
      this.player.camera,
      this.fps,
      this.backgroundImage
    );
    this.player.setLightToCameraPosition(this.lights.pointLight);

    if (this.debug) this.writeDebugData();

    this.renderer.render(this.scene, this.player.camera);
  }
}
