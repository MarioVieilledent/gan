import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CHUNK_SIZE, getElevation } from "./terrain";

const modelList = ["tree", "rock"];

export class Models {
  loader = new GLTFLoader();

  models: Record<string, THREE.Object3D> = {};

  constructor(scene: THREE.Scene) {
    modelList.forEach((model) => {
      this.loadModel(model);
    });

    Promise.all(modelList.map((model) => this.loadModel(model)))
      .then(() => {
        this.randomizeProps(scene);
      })
      .catch((error) => {
        console.error("One or more fetch requests failed:", error);
      });
  }

  loadModel(name: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        `/${name}.glb`,
        (gltf) => {
          this.models[name] = gltf.scene;
          resolve(gltf.scene);
        },
        undefined,
        (err) => {
          reject(err);
        }
      );
    });
  }

  addModel(
    scene: THREE.Scene,
    name: string,
    x: number,
    y: number,
    z: number,
    rotation: number
  ): void {
    const model = this.models[name].clone();
    if (model) {
      model.position.set(x, y, z);
      model.rotateY(rotation);
      scene.add(model);
    } else {
      console.warn(
        `Trying to add a 3d model "${name}" that does not exist or is not loaded yet`
      );
    }
  }

  // DEBUG map generation FIXME
  randomizeProps(scene: THREE.Scene) {
    const mapSize = 21 * CHUNK_SIZE;

    const nbTrees = 500;
    const nbRocks = 500;

    const randPos = () => Math.random() * mapSize - mapSize / 2;

    for (let i = 0; i < nbTrees; i++) {
      const x = randPos();
      const z = randPos();
      const rotation = Math.random() * Math.PI * 2;
      this.addModel(scene, "tree", x, getElevation(x, z), z, rotation);
    }

    for (let i = 0; i < nbRocks; i++) {
      const x = randPos();
      const z = randPos();
      const rotation = Math.random() * Math.PI * 2;
      this.addModel(scene, "rock", x, getElevation(x, z), z, rotation);
    }
  }
}
