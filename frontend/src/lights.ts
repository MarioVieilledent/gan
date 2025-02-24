import * as THREE from "three";

export class Lights {
  ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  directionalLight = new THREE.DirectionalLight(0xff6644, 1.9);
  pointLight = new THREE.PointLight(0xffbb66, 0.0);

  constructor(scene: THREE.Scene) {
    scene.add(this.pointLight);

    scene.add(this.ambientLight);

    this.directionalLight.position.set(1, 0.5, 2); // Positioning the light 45° up in the sky
    this.directionalLight.target.position.set(0, 0, 0); // The light will point toward the center (or another target)
    scene.add(this.directionalLight);
    scene.add(this.directionalLight.target);
  }
}
