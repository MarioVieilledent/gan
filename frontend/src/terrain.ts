import * as THREE from "three";

export function createTerrainChunk(
  scene: THREE.Scene,
  material: THREE.MeshLambertMaterial,
  x: number,
  y: number,
  z: number
) {
  const plane = new THREE.PlaneGeometry(16, 16, 16, 16);
  const mesh = new THREE.Mesh(plane, material);

  plane.rotateX(-Math.PI / 2);

  const pos = plane.attributes.position;
  for (let i = 0; i < pos.count; i += 3) {
    pos.setY(i, Math.random() * 0.5);
  }

  pos.needsUpdate = true;
  plane.computeVertexNormals();

  mesh.position.set(x, y, z);

  scene.add(mesh);
}
