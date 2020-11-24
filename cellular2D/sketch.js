const WIDTH = 1200;
const HEIGHT = 550;
const GW = 100; // grid width
const GH = 100; // grid height
const CS = 5; // cell size (rect)
const CELLS = GW * GH;

let grid;

var density = 0.5;
var currentDensity = 0;
var growthProba = 0.002;
var randomStrikeProba = 0.00002;
var consecutiveUnchanged = 0;
var stable = false;
var stableThreshold = 10;

var updatePerSecond = 60;
var msAcc = 0;

var colors;
const nstates = 3;
const states = {
  BLANK: 0,
  TREE: 1,
  FIRE: 2
};

// ui stuff
let initDensitySlider;
let strikeProbaSlider;
let growthProbaSlider;
let resetSliderButton;
let speedSlider;


// TODO: 
// - nb of iterations to get stable
// - current density

function setup() {
  createCanvas(WIDTH, HEIGHT);
  frameRate(60);
  colors = [color(255), color(0, 255, 0), color(255, 0, 0)];
  initGrid();

  textSize(16);
  textFont("Consolas");

  let d0 = createDiv("Speed: ");
  speedSlider = createSlider(0, 60, updatePerSecond, 1);
  speedSlider.parent(d0);
  let d1 = createDiv("Initial density: ");
  initDensitySlider = createSlider(0, 1, density, 0.01)
  initDensitySlider.parent(d1);
  let d2 = createDiv("Random fire probability: ");
  strikeProbaSlider = createSlider(0, 0.0001, randomStrikeProba, 0.00001)
  strikeProbaSlider.parent(d2);
  let d3 = createDiv("Random tree growth probability: ");
  growthProbaSlider = createSlider(0, 0.01, growthProba, 0.0001);
  growthProbaSlider.parent(d3);
  resetSliderButton = createButton("Reset values");
  resetSliderButton.mousePressed(resetSliders);
  let resetDensity = createButton("Reset tree density");
  resetDensity.mousePressed(reset);
}

function draw() {
  background(255);

  drawGrid();
  drawInfo();

  updateSliders();
  
  if (updatePerSecond > 0 && msAcc >= (1000 / updatePerSecond)) {
    let gridChanged = updateGrid();
    if (!gridChanged) consecutiveUnchanged += 1;
    else consecutiveUnchanged = 0;
    stable = consecutiveUnchanged >= stableThreshold;
    msAcc = 0;
  }
  msAcc += deltaTime;
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

function drawGrid() {
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

function updateGrid() {
  currentDensity = 0;
  let hasChanged = false;
  for (var i = 0; i < GW; i++) {
    for (var j = 0; j < GH; j++) {
      switch (grid[i][j]) {
        case states.BLANK:
          if (random() < growthProba) {
            grid[i][j] = states.TREE;
            hasChanged = true;
            currentDensity += 1;
          }
          break;
        case states.TREE:
          let neighborStates = getNeighborhoodCount(i, j);
          if (neighborStates[states.FIRE] >= 1 || random() < randomStrikeProba) {
            grid[i][j] = states.FIRE;
            hasChanged = true;
          }
          else 
            currentDensity += 1;
          break;
        case states.FIRE:
          grid[i][j] = states.BLANK;
          hasChanged = true;
          break;
      }
    }
  }
  currentDensity = round(currentDensity / CELLS, 2);
  return hasChanged;
}

function reset() {
  initGrid();
  consecutiveUnchanged = 0;
  stable = false;
}

function resetSliders() {
  updatePerSecond = 60;
  density = 0.5;
  growthProba = 0.002;
  randomStrikeProba = 0.00002;
  initDensitySlider.value(density);
  growthProbaSlider.value(growthProba);
  strikeProbaSlider.value(randomStrikeProba);
  speedSlider.value(updatePerSecond);
}

function updateSliders() {
  density = initDensitySlider.value();
  randomStrikeProba = strikeProbaSlider.value();
  growthProba = growthProbaSlider.value();
  updatePerSecond = speedSlider.value();
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

function keyPressed() {
  if (key == "R" || key == "r")
    reset();
}

function drawInfo() {
  fill(0);
  let xOffset = GW * CS + 10;
  text("Left-click to place fire", xOffset, 20);
  text("R to reset", xOffset, 40);

  text("STATS", xOffset, 100);
  text("Initial target density: " + str(density), xOffset, 120);
  text("Current density: " + str(currentDensity), xOffset, 140);
  text("Random fire probability: " + str(randomStrikeProba), xOffset, 180);
  text("Random tree growth probability: " + str(growthProba), xOffset, 200);
  text("Stable: " + str(stable), xOffset, 240);
}