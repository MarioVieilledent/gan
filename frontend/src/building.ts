import * as THREE from "three";

type Position = { x: number; y: number; z: number };

export type BuildingObject = {
  type: string;
  position: Position;
  facing?: "north" | "south" | "west" | "east";
};

export const exampleMap: BuildingObject[] = [
  { type: "floor", position: { x: -5, y: 0, z: -5 } },
  { type: "floor", position: { x: -5, y: 0, z: -4 } },
  { type: "floor", position: { x: -4, y: 0, z: -5 } },
  { type: "floor", position: { x: -4, y: 0, z: -4 } },
  { type: "wall", position: { x: -5, y: 0, z: -5 }, facing: "south" },
  { type: "wall", position: { x: -4, y: 0, z: -5 }, facing: "south" },
  { type: "wall", position: { x: -5, y: 0, z: -5 }, facing: "east" },
  { type: "wall", position: { x: -5, y: 0, z: -4 }, facing: "east" },
  { type: "wall", position: { x: -4, y: 0, z: -5 }, facing: "west" },
  { type: "wall", position: { x: -4, y: 0, z: -4 }, facing: "west" },
  { type: "wall", position: { x: -5, y: 0, z: -4 }, facing: "north" },
  { type: "wall", position: { x: -4, y: 0, z: -4 }, facing: "north" },
];

const defaultCube = new THREE.BoxGeometry();
const defaultMaterial = new THREE.MeshLambertMaterial({ color: 0x8db9be });

export function loadObjects(scene: THREE.Scene, objectGroup: BuildingObject[]) {
  objectGroup.forEach((object) => {
    switch (object.type) {
      case "floor": {
        const floor = new THREE.Mesh(defaultCube, defaultMaterial);
        positionObject(floor, object.position);

        floor.scale.setY(0.2);
        floor.position.y -= 0.5;

        scene.add(floor);
        break;
      }
      case "wall": {
        const wall = new THREE.Mesh(defaultCube, defaultMaterial);
        positionObject(wall, object.position);

        switch (object.facing) {
          case "north": {
            wall.scale.setZ(0.1);
            wall.position.z += 0.45;
            break;
          }
          case "south": {
            wall.scale.setZ(0.1);
            wall.position.z -= 0.45;
            break;
          }
          case "west": {
            wall.scale.setX(0.1);
            wall.position.x += 0.45;
            break;
          }
          case "east": {
            wall.scale.setX(0.1);
            wall.position.x -= 0.45;
            break;
          }
        }

        scene.add(wall);
        break;
      }
    }
  });
}

function positionObject(mesh: THREE.Mesh, objPos: Position) {
  mesh.position.set(objPos.x, objPos.y, objPos.z);
}
