import { loadObjects } from "./building";
import { Game } from "./game";
import { CHUNK_SIZE, createTerrainChunk } from "./terrain";
import "./style.css";

const game = new Game(true);

fetch("/exampleHouse.json").then((data) => {
  data.json().then((objs) => {
    game.animate();
    loadObjects(game.scene, game.textures.materials, objs);

    for (let x = -10; x <= 10; x++) {
      for (let z = -10; z <= 10; z++) {
        createTerrainChunk(
          game.scene,
          game.textures.materials.grass2,
          x * CHUNK_SIZE,
          0,
          z * CHUNK_SIZE
        );
      }
    }
  });
});
