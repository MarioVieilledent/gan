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
textures.pavingStones = textureLoader.load("/PavingStones136_1K-JPG_Color.jpg");
textures.rust = textureLoader.load("/Rust006_1K-JPG_Color.jpg");
textures.metal = textureLoader.load("/Metal055C_1K-JPG_Color.jpg");
textures.corrugatedSteel = textureLoader.load(
  "/CorrugatedSteel007B_1K-JPG_Color.jpg"
);
textures.concrete = textureLoader.load("/Concrete042C_1K-JPG_Color.jpg");

// Create cube geometry and material
const geometry = new THREE.BoxGeometry();

addCube(textures.metal, 0, 0, 0);
addCube(textures.metal, 1, 0, 0);
addCube(textures.metal, 2, 1, 0);
addCube(textures.metal, 3, 0, 0);
addCube(textures.metal, 4, 0, 0);

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
