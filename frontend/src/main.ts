import * as THREE from "three";

// Config
const debug = false;

// Get the canvas element from HTML
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const debugText = document.getElementById("debug-text") as HTMLCanvasElement;

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 1.5;
camera.position.z = 5;

// Player
let speed = 0.01;
let rotationSpeed = 0.01;
let cosAngle = 1.0;
let sinAngle = 0.0;
let yAngle = 0.0; // Corrected angle on axis y
// let angle = 0.0;
let isPressingW = false;
let isPressingA = false;
let isPressingS = false;
let isPressingD = false;
let isPressingQ = false;
let isPressingE = false;

// Create renderer and bind it to the canvas
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Load texture
let textures: Record<string, THREE.Texture> = {};
const textureLoader = new THREE.TextureLoader();
textures.pavingStones = textureLoader.load("/PavingStones.jpg");
textures.rust = textureLoader.load("/Rust.jpg");
textures.metal = textureLoader.load("/Metal.jpg");
textures.corrugatedSteel = textureLoader.load("/CorrugatedSteel.jpg");
textures.concrete = textureLoader.load("/Concrete.jpg");

// Create cube geometry and material
const geometry = new THREE.BoxGeometry();

for (let x = -3; x <= 3; x++) {
  for (let y = -3; y <= 3; y++) {
    addRoom(x, 0, y);
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  processPlayerMovements();
  if (debug) writeDebugData();
  renderer.render(scene, camera);
}

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
});

function addCube(
  texture: THREE.Texture,
  x: number,
  y: number,
  z: number
): void {
  const material = new THREE.MeshBasicMaterial({ map: texture });

  // Create cube mesh
  const cube = new THREE.Mesh(geometry, material);
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
}

function processYAngle() {
  yAngle = camera.rotation.y;

  if (camera.rotation.x !== 0.0) {
    yAngle = Math.PI - camera.rotation.y;
  }
  cosAngle = Math.cos(yAngle);
  sinAngle = Math.sin(yAngle);
}

function writeDebugData() {
  debugText.innerHTML = `<p>${camera.position.x.toFixed(2)},
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

function addRoom(x: number, y: number, z: number) {
  x *= 5;
  y *= 5;
  z *= 5;
  // Ground
  addCube(textures.pavingStones, x + 0, y + 0, z + 2);
  addCube(textures.pavingStones, x + 1, y + 0, z + 1);
  addCube(textures.pavingStones, x + 1, y + 0, z + 2);
  addCube(textures.pavingStones, x + 1, y + 0, z + 3);
  addCube(textures.pavingStones, x + 2, y + 0, z + 0);
  addCube(textures.pavingStones, x + 2, y + 0, z + 1);
  addCube(textures.pavingStones, x + 2, y + 0, z + 2);
  addCube(textures.pavingStones, x + 2, y + 0, z + 3);
  addCube(textures.pavingStones, x + 2, y + 0, z + 4);
  addCube(textures.pavingStones, x + 3, y + 0, z + 1);
  addCube(textures.pavingStones, x + 3, y + 0, z + 2);
  addCube(textures.pavingStones, x + 3, y + 0, z + 3);
  addCube(textures.pavingStones, x + 4, y + 0, z + 2);

  // Walls
  addCube(textures.metal, x + 1, y + 1, z + 0);
  addCube(textures.metal, x + 0, y + 1, z + 1);
  addCube(textures.metal, x + 3, y + 1, z + 0);
  addCube(textures.metal, x + 4, y + 1, z + 1);
  addCube(textures.metal, x + 0, y + 1, z + 3);
  addCube(textures.metal, x + 1, y + 1, z + 4);
  addCube(textures.metal, x + 3, y + 1, z + 4);
  addCube(textures.metal, x + 4, y + 1, z + 3);
  addCube(textures.metal, x + 1, y + 2, z + 0);
  addCube(textures.metal, x + 0, y + 2, z + 1);
  addCube(textures.metal, x + 3, y + 2, z + 0);
  addCube(textures.metal, x + 4, y + 2, z + 1);
  addCube(textures.metal, x + 0, y + 2, z + 3);
  addCube(textures.metal, x + 1, y + 2, z + 4);
  addCube(textures.metal, x + 3, y + 2, z + 4);
  addCube(textures.metal, x + 4, y + 2, z + 3);

  // Roof
  addCube(textures.rust, x + 0, y + 3, z + 2);
  addCube(textures.rust, x + 1, y + 3, z + 1);
  addCube(textures.rust, x + 1, y + 3, z + 2);
  addCube(textures.rust, x + 1, y + 3, z + 3);
  addCube(textures.rust, x + 2, y + 3, z + 0);
  addCube(textures.rust, x + 2, y + 3, z + 1);
  addCube(textures.rust, x + 2, y + 3, z + 2);
  addCube(textures.rust, x + 2, y + 3, z + 3);
  addCube(textures.rust, x + 2, y + 3, z + 4);
  addCube(textures.rust, x + 3, y + 3, z + 1);
  addCube(textures.rust, x + 3, y + 3, z + 2);
  addCube(textures.rust, x + 3, y + 3, z + 3);
  addCube(textures.rust, x + 4, y + 3, z + 2);
}
