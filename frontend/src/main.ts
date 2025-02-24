import { Game } from "./game";
import { createTerrainChunk } from "./terrain";

const game = new Game(false);

fetch("/map_test.txt").then((data) => {
  data.text().then((textMap) => {
    game.animate();
    game.parseAndBuildMap(textMap);

    createTerrainChunk(game.scene, game.materials.Grass1, 0, 0, 0);
  });
});
