import * as THREE from "three";

type Position = { x: number; y: number; z: number };

export type BuildingObject = {
  type: string;
  position: Position;
  facing?: "north" | "south" | "west" | "east";
  material: string;
};

const defaultCube = new THREE.BoxGeometry();

export function loadObjects(
  scene: THREE.Scene,
  materials: Record<string, THREE.MeshLambertMaterial>,
  objectGroup: BuildingObject[]
) {
  objectGroup.forEach((object) => {
    switch (object.type) {
      case "floor": {
        const floor = new THREE.Mesh(defaultCube, materials[object.material]);
        positionObject(floor, object.position);

        floor.scale.setY(0.2);
        floor.position.y -= 0.6;

        scene.add(floor);
        break;
      }

      case "wall": {
        const wall = new THREE.Mesh(defaultCube, materials[object.material]);
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
