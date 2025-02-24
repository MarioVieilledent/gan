import * as THREE from "three";

const textureList = [
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

const backgroundList = ["clouds"];

export class Textures {
  textures: Record<string, THREE.Texture> = {};
  backgrounds: Record<string, THREE.Texture> = {};
  materials: Record<string, THREE.MeshLambertMaterial> = {};
  textureLoader = new THREE.TextureLoader();
  cubeTextureloader = new THREE.CubeTextureLoader();

  constructor() {
    // Load textures
    textureList.forEach((t) => {
      this.textures[t] = this.textureLoader.load(`/${t}.jpg`);
      this.materials[t] = new THREE.MeshLambertMaterial({
        map: this.textures[t],
      });
    });

    // Load backgrounds
    backgroundList.forEach((bg) => {
      this.backgrounds[bg] = this.textureLoader.load(`/${bg}.jpg`);
    });
  }

  loadBackground(bgName: string): THREE.Mesh {
    // Create a large sphere to surround the camera
    const geometry = new THREE.SphereGeometry(512, 32, 16);
    const material = new THREE.MeshBasicMaterial({
      map: this.backgrounds[bgName],
      side: THREE.BackSide, // Ensures the texture is on the inside of the sphere
    });
    return new THREE.Mesh(geometry, material);
  }
}
