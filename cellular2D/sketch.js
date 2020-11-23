const WIDTH = 800;
const HEIGHT = 600;
const GW = 100; // grid width
const GH = 100; // grid height
const CS = 5; // cell size (rect)

let grid;

var density = 0.55;

const nstates = 3;
const states = {
  BLANK: 0,
  TREE: 1,
  FIRE: 2
};

var colors;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  frameRate(60);
  colors = [color(255), color(0, 255, 0), color(255, 0, 0)];
  initGrid();

  textSize(16);
  textFont("Consolas");
}

function draw() {
  background(255);
  noStroke();
  for (var i = 0; i < GW; i++) {
    for (var j = 0; j < GH; j++) {
      if (grid[i][j] != states.BLANK) {
        fill(colors[grid[i][j]]);
        rect(i*CS, j*CS, CS, CS);
      }
    }
  }

  drawInfo();

  if (frameCount % 60)
    updateGrid();
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
  for (var i = 0; i < GW; i++) {
    for (var j = 0; j < GH; j++) {
      if (grid[i][j] == states.BLANK)
        continue;
      else if (grid[i][j] == states.FIRE)
        grid[i][j] = states.BLANK;
      else if (grid[i][j] == states.TREE) {
        let count = getNeighborhoodCount(i, j);
        if (count[states.FIRE] >= 1)
          grid[i][j] = states.FIRE;
      }
    }
  }
}

// state histogram for the neighborhood of the cell (i, j)
function getNeighborhoodCount(i, j) {
  let count = new Array(nstates).fill(0);
  let dx = [-1, 1, 0, 0]; let dy = [0, 0, 1, -1];
  for (var k = 0; k < 4; k++)
    if (isInGrid(i+dx[k], j+dy[k]))
      count[grid[i+dx[k]][j+dy[k]]] += 1;
  return count;
}

function isInGrid(i, j) {
  return i >= 0 && i < GW && j >= 0 && j < GH;
}

function mouseClicked() {
  let cx = floor(mouseX / CS);
  let cy = floor(mouseY / CS);
  if (isInGrid(cx, cy))
    grid[cx][cy] = states.FIRE;
}

function drawInfo() {
  fill(0);
  let xOffset = GW * CS + 10;
  text("Left-click to place fire", xOffset, 20);

  text("Stats", xOffset, 80);
  text("Forest density: " + str(density), xOffset, 100);

}