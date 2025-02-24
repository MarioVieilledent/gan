import { Game } from "./game";
import { CHUNK_SIZE, createTerrainChunk } from "./terrain";

const game = new Game(true);

fetch("/map_test.txt").then((data) => {
  data.text().then((textMap) => {
    game.animate();
    game.parseAndBuildMap(textMap);

    for (let x = -10; x <= 10; x++) {
      for (let z = -10; z <= 10; z++) {
        createTerrainChunk(
          game.scene,
          game.textures.materials.Grass1,
          x * CHUNK_SIZE,
          0,
          z * CHUNK_SIZE
        );
      }
    }
  });
});
