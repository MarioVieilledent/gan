import Game from "./game";

const game = new Game();


fetch("/map_test.txt").then((data) => {
  console.log(data);
  data.text().then((textMap) => {
    game.animate();
    game.parseMap(textMap);
  });
});
