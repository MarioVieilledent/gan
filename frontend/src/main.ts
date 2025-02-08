
import "./style.css";
import * as THREE from "three";

// Get the canvas element from HTML
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create renderer and bind it to the canvas
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Load texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("/PavingStones136_1K-JPG_Color.jpg");

// Create cube geometry and material
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ map: texture });

// Create cube mesh
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.005;
  cube.rotation.y += 0.003;
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
