import * as THREE from "three";

import {
  WindowFullscreen,
  WindowUnfullscreen,
} from "../wailsjs/runtime/runtime";

// Config
const debug = true;
let isFullScreen = false;

// Mouse camera control
let yaw = 0;
let pitch = 0;
let sensitivity = 0.002;

// Get the canvas element from HTML
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const debugText = document.getElementById("debug-text") as HTMLCanvasElement;

if (!debug) debugText.style.display = "none";

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const cameraHolder = new THREE.Group();
cameraHolder.add(camera);
scene.add(cameraHolder);

cameraHolder.position.x = 2.0;
cameraHolder.position.y = 1.5;
cameraHolder.position.z = 3.0;

// Player
let speed = 2.0; // block/s
let cosAngle = 1.0;
let sinAngle = 0.0;
let isPressingW = false;
let isPressingA = false;
let isPressingS = false;
let isPressingD = false;
precomputeCosAndSin();

// Create renderer and bind it to the canvas
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Lights
const pointLight = new THREE.PointLight(0xffbb66, 1.3);
setLightToCameraPosition(pointLight);
scene.add(pointLight);

// Load texture
const textureList = [
  "PavingStones",
  "Rust",
  "Metal",
  "CorrugatedSteel",
  "Concrete",
];
let textures: Record<string, THREE.Texture> = {};
let materials: Record<string, THREE.MeshLambertMaterial> = {};
const textureLoader = new THREE.TextureLoader();

// Geometries
const cubeGeometry = new THREE.BoxGeometry();
const cylinderGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);

textureList.forEach((t) => {
  textures[t] = textureLoader.load(`/${t}.jpg`);
  materials[t] = new THREE.MeshLambertMaterial({ map: textures[t] });
});

for (let x = -4; x <= 4; x++) {
  for (let y = -4; y <= 4; y++) {
    addRoom(x, 0, y);
  }
}

// FPS
let fps: number = 60.0;
let previousFrame = new Date().getTime();

function writeDebugData() {
  debugText.innerHTML = `
  <p>FPS: ${fps.toFixed(1)}</p>
  <p>${cameraHolder.position.x.toFixed(2)},
  ${cameraHolder.position.y.toFixed(2)},
  ${cameraHolder.position.z.toFixed(2)}</p>
  <br />
  <p>${camera.rotation.x.toFixed(2)}</p>
  <p>${cameraHolder.rotation.y.toFixed(2)}</p>
  <p>${camera.rotation.z.toFixed(2)}</p>
  `;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const now = new Date().getTime();
  fps = 1000.0 / (now - previousFrame);
  previousFrame = now;

  processPlayerMovements();

  if (debug) writeDebugData();

  renderer.render(scene, camera);
}

precomputeCosAndSin();
animate();

// Handle window resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

window.addEventListener("keydown", (e) => {
  if (e.code === "KeyW") isPressingW = true;
  if (e.code === "KeyA") isPressingA = true;
  if (e.code === "KeyS") isPressingS = true;
  if (e.code === "KeyD") isPressingD = true;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "KeyW") isPressingW = false;
  if (e.code === "KeyA") isPressingA = false;
  if (e.code === "KeyS") isPressingS = false;
  if (e.code === "KeyD") isPressingD = false;
  if (e.code === "F11") {
    isFullScreen ? WindowUnfullscreen() : WindowFullscreen();
    isFullScreen = !isFullScreen;
  }
});

// Pointer Lock API to capture the mouse
document.body.addEventListener("click", () => {
  document.body.requestPointerLock();
});

// Listen to mouse movement
window.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement === document.body) {
    yaw -= event.movementX * sensitivity;
    pitch -= event.movementY * sensitivity;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)); // Clamp pitch to avoid flipping

    cameraHolder.rotation.y = yaw; // Yaw applied to parent group
    camera.rotation.x = pitch; // Pitch applied only to camera

    precomputeCosAndSin();
  }
});
function addCube(
  material: THREE.MeshLambertMaterial,
  x: number,
  y: number,
  z: number
): void {
  const cube = new THREE.Mesh(cubeGeometry, material);
  scene.add(cube);
  cube.position.set(x, y, z);
}

function processPlayerMovements() {
  if (isPressingW) {
    cameraHolder.position.z -= (speed / fps) * cosAngle;
    cameraHolder.position.x -= (speed / fps) * sinAngle;
  }
  if (isPressingA) {
    cameraHolder.position.z += (speed / fps) * sinAngle;
    cameraHolder.position.x -= (speed / fps) * cosAngle;
  }
  if (isPressingS) {
    cameraHolder.position.z += (speed / fps) * cosAngle;
    cameraHolder.position.x += (speed / fps) * sinAngle;
  }
  if (isPressingD) {
    cameraHolder.position.z -= (speed / fps) * sinAngle;
    cameraHolder.position.x += (speed / fps) * cosAngle;
  }
  setLightToCameraPosition(pointLight);
}

function setLightToCameraPosition(light: THREE.PointLight) {
  light.position.set(
    cameraHolder.position.x,
    cameraHolder.position.y,
    cameraHolder.position.z
  );
}

function precomputeCosAndSin() {
  cosAngle = Math.cos(cameraHolder.rotation.y);
  sinAngle = Math.sin(cameraHolder.rotation.y);
}

function addRoom(x: number, y: number, z: number) {
  x *= 5;
  y *= 5;
  z *= 5;
  // Ground
  addCube(materials.PavingStones, x + 0, y + 0, z + 2);
  addCube(materials.PavingStones, x + 1, y + 0, z + 1);
  addCube(materials.PavingStones, x + 1, y + 0, z + 2);
  addCube(materials.PavingStones, x + 1, y + 0, z + 3);
  addCube(materials.PavingStones, x + 2, y + 0, z + 0);
  addCube(materials.PavingStones, x + 2, y + 0, z + 1);
  addCube(materials.PavingStones, x + 2, y + 0, z + 2);
  addCube(materials.PavingStones, x + 2, y + 0, z + 3);
  addCube(materials.PavingStones, x + 2, y + 0, z + 4);
  addCube(materials.PavingStones, x + 3, y + 0, z + 1);
  addCube(materials.PavingStones, x + 3, y + 0, z + 2);
  addCube(materials.PavingStones, x + 3, y + 0, z + 3);
  addCube(materials.PavingStones, x + 4, y + 0, z + 2);

  // Walls
  addCube(materials.Metal, x + 1, y + 1, z + 0);
  addCube(materials.Metal, x + 0, y + 1, z + 1);
  addCube(materials.Metal, x + 3, y + 1, z + 0);
  addCube(materials.Metal, x + 4, y + 1, z + 1);
  addCube(materials.Metal, x + 0, y + 1, z + 3);
  addCube(materials.Metal, x + 1, y + 1, z + 4);
  addCube(materials.Metal, x + 3, y + 1, z + 4);
  addCube(materials.Metal, x + 4, y + 1, z + 3);
  addCube(materials.Metal, x + 1, y + 2, z + 0);
  addCube(materials.Metal, x + 0, y + 2, z + 1);
  addCube(materials.Metal, x + 3, y + 2, z + 0);
  addCube(materials.Metal, x + 4, y + 2, z + 1);
  addCube(materials.Metal, x + 0, y + 2, z + 3);
  addCube(materials.Metal, x + 1, y + 2, z + 4);
  addCube(materials.Metal, x + 3, y + 2, z + 4);
  addCube(materials.Metal, x + 4, y + 2, z + 3);

  // Roof
  addCube(materials.Rust, x + 0, y + 3, z + 2);
  addCube(materials.Rust, x + 1, y + 3, z + 1);
  addCube(materials.Rust, x + 1, y + 3, z + 2);
  addCube(materials.Rust, x + 1, y + 3, z + 3);
  addCube(materials.Rust, x + 2, y + 3, z + 0);
  addCube(materials.Rust, x + 2, y + 3, z + 1);
  addCube(materials.Rust, x + 2, y + 3, z + 2);
  addCube(materials.Rust, x + 2, y + 3, z + 3);
  addCube(materials.Rust, x + 2, y + 3, z + 4);
  addCube(materials.Rust, x + 3, y + 3, z + 1);
  addCube(materials.Rust, x + 3, y + 3, z + 2);
  addCube(materials.Rust, x + 3, y + 3, z + 3);
  addCube(materials.Rust, x + 4, y + 3, z + 2);

  // Pipes
  const cylinderMesh = new THREE.Mesh(
    cylinderGeometry,
    materials.CorrugatedSteel
  );
  cylinderMesh.position.set(x + 2, y + 1, z + 2);
  cylinderMesh.rotateX(Math.PI / 2);
  scene.add(cylinderMesh);
}
