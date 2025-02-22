import Game from "./game";

const game = new Game(true);


fetch("/map_test.txt").then((data) => {
  data.text().then((textMap) => {
    game.animate();
    game.parseAndBuildMap(textMap);
  });
});
