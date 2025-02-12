import * as THREE from "three";

import {
  WindowFullscreen,
  WindowUnfullscreen,
} from "../wailsjs/runtime/runtime";

// Config
const debug = true;
let isFullScreen = false;

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
camera.position.x = 2.0;
camera.position.y = 1.5;
camera.position.z = 3.0;

// Player
let speed = 0.01;
let rotationSpeed = 0.01;
let cosAngle = 1.0;
let sinAngle = 0.0;
let yAngle = 0.0;
let isPressingW = false;
let isPressingA = false;
let isPressingS = false;
let isPressingD = false;
let isPressingQ = false;
let isPressingE = false;

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

const cubeGeometry = new THREE.BoxGeometry();

textureList.forEach((t) => {
  textures[t] = textureLoader.load(`/${t}.jpg`);
  materials[t] = new THREE.MeshLambertMaterial({ map: textures[t] });
});

for (let x = -3; x <= 3; x++) {
  for (let y = -3; y <= 3; y++) {
    addRoom(x, 0, y);
  }
}

function writeDebugData() {
  debugText.innerHTML = `
  <p>FPS: ${fps}</p>
  <p>${camera.position.x.toFixed(2)},
  ${camera.position.y.toFixed(2)},
  ${camera.position.z.toFixed(2)}</p>
  <p>${camera.rotation.x.toFixed(2)}</p>
  <p>${camera.rotation.y.toFixed(2)}</p>
  <p>${camera.rotation.z.toFixed(2)}</p>
  <br />
  <p>${yAngle.toFixed(2)}</p>
  <p>need inversion: ${camera.rotation.x !== 0.0}</p>
  `;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  processPlayerMovements();
  if (debug) writeDebugData();
  renderer.render(scene, camera);
  frameRendered++;
}

let fps: string | number = "unknown";
let frameRendered = 0;
setInterval(() => {
  fps = frameRendered;
  frameRendered = 0;
}, 1000);

animate();

// Handle window resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "w") isPressingW = true;
  if (e.key === "a") isPressingA = true;
  if (e.key === "s") isPressingS = true;
  if (e.key === "d") isPressingD = true;
  if (e.key === "q") isPressingQ = true;
  if (e.key === "e") isPressingE = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "w") isPressingW = false;
  if (e.key === "a") isPressingA = false;
  if (e.key === "s") isPressingS = false;
  if (e.key === "d") isPressingD = false;
  if (e.key === "q") isPressingQ = false;
  if (e.key === "e") isPressingE = false;
  if (e.key === "F11") {
    isFullScreen ? WindowUnfullscreen() : WindowFullscreen();
    isFullScreen = !isFullScreen;
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
  cube.translateX(x);
  cube.translateY(y);
  cube.translateZ(z);
}

function processPlayerMovements() {
  if (isPressingW) {
    camera.position.z -= speed * cosAngle;
    camera.position.x -= speed * sinAngle;
  }
  if (isPressingA) {
    camera.position.z += speed * sinAngle;
    camera.position.x -= speed * cosAngle;
  }
  if (isPressingS) {
    camera.position.z += speed * cosAngle;
    camera.position.x += speed * sinAngle;
  }
  if (isPressingD) {
    camera.position.z -= speed * sinAngle;
    camera.position.x += speed * cosAngle;
  }
  if (isPressingQ) {
    camera.rotateY(rotationSpeed);
    processYAngle();
  }
  if (isPressingE) {
    camera.rotateY(-rotationSpeed);
    processYAngle();
  }
  setLightToCameraPosition(pointLight);
}

function setLightToCameraPosition(light: THREE.PointLight) {
  light.position.set(camera.position.x, camera.position.y, camera.position.z);
}

function processYAngle() {
  yAngle = camera.rotation.y;

  if (camera.rotation.x !== 0.0) {
    yAngle = Math.PI - camera.rotation.y;
  }
  cosAngle = Math.cos(yAngle);
  sinAngle = Math.sin(yAngle);
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
}
