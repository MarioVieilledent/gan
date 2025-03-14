import * as THREE from "three";

export const CHUNK_SIZE = 64;

export function createTerrainChunk(
  scene: THREE.Scene,
  material: THREE.MeshLambertMaterial,
  x: number,
  y: number,
  z: number
) {
  const plane = new THREE.PlaneGeometry(
    CHUNK_SIZE,
    CHUNK_SIZE,
    CHUNK_SIZE,
    CHUNK_SIZE
  );
  const planeMesh = new THREE.Mesh(plane, material);
  planeMesh.name = `terrain`;

  plane.rotateX(-Math.PI / 2);

  const pos = plane.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, getElevation(pos.getX(i) + x, pos.getZ(i) + z));
  }

  pos.needsUpdate = true;
  plane.computeVertexNormals();

  planeMesh.position.set(x, y, z);

  scene.add(planeMesh);
}

export function getElevation(x: number, z: number): number {
  const scale = 0.05; // Controls the frequency of the hills/valleys
  const height = 10; // Controls the maximum elevation range

  return Math.sin(x * scale) * Math.cos(z * scale) * height;
}
