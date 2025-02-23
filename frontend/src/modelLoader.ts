import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Model Loading
const loader = new GLTFLoader();

export function loadModel(
    scene: THREE.Scene,
    models: THREE.Group[],
  name: string,
  x: number,
  y: number,
  z: number
): void {
  loader.load(`/${name}.glb`, (gltf) => {
    const model = gltf.scene;
    model.position.set(x, y, z);
    models.push(model);
    scene.add(model);
  });
}
