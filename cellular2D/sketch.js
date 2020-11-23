const WIDTH = 800;
const HEIGHT = 600;
const GW = 100; // grid width
const GH = 100; // grid height
const CS = 5; // cell size (rect)

let grid;

var density = 0.5;

var states = {
  BLANK: 0,
  TREE: 1,
  FIRE: 2
};

var colors;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  colors = [color(255), color(0, 255, 0), color(255, 0, 0)];
  initGrid();
}

function draw() {
  background(220);
  noStroke();
  for (var i = 0; i < GW; i++) {
    for (var j = 0; j < GH; j++) {
      if (grid[i][j] != states.BLANK) {
        fill(colors[grid[i][j]]);
        rect(i*CS, j*CS, CS, CS);
      }
    }
  }
}

function initGrid() {
  grid = new Array(GW);
  for (var i = 0; i < GW; i++) {
    grid[i] = new Array(GH);
    for (var j = 0; j < GH; j++) {
      grid[i][j] = random() < density ? states.TREE : states.BLANK;
    }
  }
}

function updateGrid() {

}