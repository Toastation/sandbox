const WIDTH = 1200;
const HEIGHT = 700;
const GW = 100; // grid width
const GH = 100; // grid height
const CS = 5; // cell size (rect)
const CELLS = GW * GH;

let grid, gridBuffer;

var density = 0.5;
var currentDensity = 0;
var growthProba = 0.002;
var randomStrikeProba = 0.00002;
var consecutiveUnchanged = 0;
var stable = false;
var stableThreshold = 10;

var updatePerSecond = 30;
var msAcc = 0;

let densityHistory;

var paletteGreen = ['#6a9246', '#658e46', '#608a45', '#5b8545', '#568144', '#517d44', '#4c7943', '#477543', '#427142', '#3d6d42', '#376941', '#326541', '#2c6140', '#265d3f', '#20593f', '#19553e'];
var paletteRed = ['#ff4413', '#fe5412', '#fb5f11', '#f56611', '#ec6b10', '#e16d11', '#d36c12', '#c46812', '#b16213', '#9d5b14', '#875114', '#704514', '#573713', '#3d2910', '#24190a', '#000000'];

// ui stuff
let initDensitySlider;
let strikeProbaSlider;
let growthProbaSlider;
let resetSliderButton;
let speedSlider;
let vonNeumannCheckbox;

function setup() {
  let canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent("cellular");
  frameRate(60);
  initGrid();

  textSize(16);
  textFont("Consolas");

  densityHistory = [];

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
  vonNeumannCheckbox = createCheckbox("Von Neumann neighborhood ", false);
  resetSliderButton = createButton("Reset values");
  resetSliderButton.mousePressed(resetSliders);
  let resetDensity = createButton("Reset tree density");
  resetDensity.mousePressed(reset);
  let forceFireButton = createButton("Force random fire");
  forceFireButton.mousePressed(forceFire);
  d0.parent("cellular");
  d1.parent("cellular");
  d2.parent("cellular");
  d3.parent("cellular");
  vonNeumannCheckbox.parent("cellular");
  resetDensity.parent("cellular");
  forceFireButton.parent("cellular");
  resetSliderButton.parent("cellular");
  createP("");
  createA("https://www.fourmilab.ch/cellab/webca/?ruleprog=forest", "Inspired by this");
  createP("");
  createA("https://toastation.github.io/vis/cellular3D/index.html", "3D cellular automata (crystal growth)");
}

function draw() {
  background(255);

  drawGrid();
  drawInfo();
  drawPlot();

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
  gridBuffer = new Array(GW);
  for (var i = 0; i < GW; i++) {
    grid[i] = new Int32Array(GH);
    gridBuffer[i] = new Int32Array(GH);
    for (var j = 0; j < GH; j++) {
      grid[i][j] = random() < density ? 1 : 60; // 60 => 0b111100 i.e maximum age, no tree
      gridBuffer[i][j] = grid[i][j];
    }
  }
}

function drawGrid() {
  noStroke();
  for (var i = 0; i < GW; i++) {
    for (var j = 0; j < GH; j++) {
      if (grid[i][j] & 1) {
        if (grid[i][j] & 2)
          fill(paletteRed[0]);
        else
          fill(paletteGreen[(grid[i][j] >> 2)]);
      }
      else
        fill(paletteRed[grid[i][j] >> 2]);
      rect(i*CS, j*CS, CS, CS);
    }
  }
}

function drawPlot() {
  var offsetY = CS*GH+30;
  var length = HEIGHT-10 - offsetY;
  push();
  textSize(16);
  textAlign(CENTER);
  strokeWeight(1);
  text("d", 6, CS*GH+20);
  textSize(12);
  text("1", 12, CS*GH+37);
  text("0", 12, HEIGHT-15);
  textAlign(LEFT);
  text("time", CS*GW+5, HEIGHT-6);
  stroke(0, 0, 0, 255);
  line(5, offsetY, 5, HEIGHT-10);
  line(5, HEIGHT-10, CS*GW, HEIGHT-10);
  noStroke();
  fill(255, 0, 255, 255);
  for (var t = 0; t < densityHistory.length; t++)
    circle(5+t*CS, offsetY + (1 - densityHistory[t]) * length, 2);
  pop();
}

function updateGrid() {
  currentDensity = 0;
  let oldVal = -1;
  let hasChanged = false;
  updateBuffer();
  for (var i = 0; i < GW; i++) {
    for (var j = 0; j < GH; j++) {
      oldVal = grid[i][j];
      grid[i][j] = cellLogic(i, j);
      if (oldVal != grid[i][j])
        hasChanged = true;
      if (grid[i][j] & 1)
        currentDensity += 1;
    }
  }
  currentDensity = round(currentDensity / CELLS, 2);
  if (densityHistory.length >= GW)
    densityHistory.shift();
  densityHistory.push(currentDensity);
  return hasChanged;
}

function cellLogic(i, j) {
  let val = gridBuffer[i][j];
  let isTree = val & 1;
  let isBurning = val & 2;
  let age = (val >> 2);
  let count = getNeighborhoodCount(i, j, vonNeumannCheckbox.checked());
  
  if (isTree && isBurning)
    return 4;
  
  if (isTree) {
    if (count[1] > 0 || random() <= randomStrikeProba)
      return 3;
    return (val & 3) | (min(15, age + 1) << 2);
  }
  
  if (random() <= growthProba)
    return 1;
    
  return (age > 0) ? (min(15, age + 1) << 2) : 0;
}

function reset() {
  initGrid();
  consecutiveUnchanged = 0;
  stable = false;
}

function resetSliders() {
  updatePerSecond = 30;
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

function forceFire() {
  let rx, ry;
  do {
    rx = floor(random(0, GW));
    ry = floor(random(0, GH));
  } while (grid[rx][ry] & 1 != 0);
  grid[rx][ry] = 3;
  consecutiveUnchanged = 0;
}

// count[0] => #number of tree in the neighborhood 
// count[1] => #number of burning tree in the neighborhood 
// if vonNeumann is false, then moore neighborhood is used 
function getNeighborhoodCount(i, j, vonNeumann=false) {
  let count = new Array(2).fill(0);
  let dx = [-1, 1, 0, 0, -1, 1, 1, -1]; let dy = [0, 0, 1, -1, -1, -1, 1, 1];
  let n = vonNeumann ? 4 : 8;
  for (var k = 0; k < n; k++)
    if (isInGrid(i+dx[k], j+dy[k])) {
      if (gridBuffer[i+dx[k]][j+dy[k]] & 1)
        count[0] += 1;
      if (gridBuffer[i+dx[k]][j+dy[k]] & 2)
        count[1] += 1;
    }
  return count;
}

function isInGrid(i, j) {
  return i >= 0 && i < GW && j >= 0 && j < GH;
}

function updateBuffer() {
  for (var i = 0; i < GW; i++)
    for (var j = 0; j < GH; j++)
      gridBuffer[i][j] = grid[i][j];
}

function mouseClicked() {
  let cx = floor(mouseX / CS);
  let cy = floor(mouseY / CS);
  if (isInGrid(cx, cy)) {
    grid[cx][cy] = 3;
    consecutiveUnchanged = 0;
  }
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