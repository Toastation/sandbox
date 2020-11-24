const WIDTH = 800;
const HEIGHT = 600;
const CELL_SIZE = 10;
var GRID_WIDTH = 20;
var GRID_HEIGHT = 20;
var GRID_DEPTH = 20;

var cam;
var grid, gridBis, neighborsGrid;
var birth = 12;
var survival = 10;
var dtAcc = 0;
var speed = 1, speedMin = 0.5, speedMax = 4, speedStep = 0.1;
var boxSize = 20, boxSizeMax = 50, boxSizeMin = 14;
var lastBoxSize = boxSize;

function setup() {
  createCanvas(WIDTH, HEIGHT, WEBGL);
  frameRate(24);
  cam = new Dw.EasyCam(this._renderer, {distance : 300});
  cam.zoom(0.1);
  createGrid();
  gui = createGui('Settings');
  gui.addGlobals("speed", "boxSize");
  createP("");
  createA("https://toastation.github.io/vis/cellular2D/index.html", "2D cellular automata (forest fire)");
}

function createGrid() {
  grid = new Array(GRID_WIDTH);
  gridBis = new Array(GRID_WIDTH);
  neighborsGrid = new Array(GRID_WIDTH);
  for (var i = 0; i < GRID_WIDTH; i++) {
    grid[i] = new Array(GRID_HEIGHT);
    gridBis[i] = new Array(GRID_HEIGHT);
    neighborsGrid[i] = new Array(GRID_HEIGHT);
    for (var j = 0; j < GRID_HEIGHT; j++) {
      grid[i][j] = new Array(GRID_DEPTH);
      gridBis[i][j] = new Array(GRID_DEPTH);
      neighborsGrid[i][j] = new Array(GRID_DEPTH);
      for (var k = 0; k < GRID_DEPTH; k++) {
        grid[i][j][k] = 0;
        gridBis[i][j][k] = grid[i][j][k];
        neighborsGrid[i][j][k] = 0;
      }
    }
  }
  grid[round(GRID_WIDTH/2)][round(GRID_HEIGHT/2)][round(GRID_DEPTH/2)] = 1;
}

function draw() {
  background(50);
  drawGrid();
}

function drawGrid() {
  translate(-(GRID_WIDTH/2)*CELL_SIZE, -(GRID_HEIGHT/2)*CELL_SIZE, -GRID_DEPTH*CELL_SIZE-30);
  stroke(255);
  fill(0, 0, 0, 0);
  push();
  translate((GRID_WIDTH/2)*CELL_SIZE-CELL_SIZE/2, (GRID_HEIGHT/2)*CELL_SIZE-CELL_SIZE/2, (GRID_DEPTH/2)*CELL_SIZE-CELL_SIZE/2);
  box(GRID_WIDTH*CELL_SIZE, GRID_WIDTH*CELL_SIZE, GRID_WIDTH*CELL_SIZE);
  pop();
  fill(255);
  stroke(0);
  for (var i = 0; i < GRID_WIDTH; i++) {
    for (var j = 0; j < GRID_HEIGHT; j++) {
      for (var k = 0; k < GRID_DEPTH; k++) {
        if (grid[i][j][k] == 0) continue;
        push();
        translate(i*CELL_SIZE, j*CELL_SIZE, k*CELL_SIZE);
        fill(map(i, 0, GRID_WIDTH, 100, 255), 0, 0);
        box(CELL_SIZE, CELL_SIZE, CELL_SIZE);
        pop();
      }
    }
  }
  if (frameCount % round(24 / speed) == 0) {
    updateCristal();
  }
  if (lastBoxSize != boxSize) {
    GRID_WIDTH = GRID_HEIGHT = GRID_DEPTH = boxSize;
    lastBoxSize = boxSize;
    createGrid();
  }
}

function updateCristal() {
  // copy array
  for (var i = 0; i < GRID_WIDTH; i++)
    for (var j = 0; j < GRID_HEIGHT; j++)
      for (var k = 0; k < GRID_DEPTH; k++)
        gridBis[i][j][k] = grid[i][j][k];

  var neighbors, state;
  for (var i = 0; i < GRID_WIDTH; i++) {
    for (var j = 0; j < GRID_HEIGHT; j++) {
      for (var k = 0; k < GRID_DEPTH; k++) {
        neighbors = getNeighborNeumann(i, j, k);
        neighborsGrid[i][j][k] = neighbors;
        state = gridBis[i][j][k];
        if (state == 0 && (neighbors ==1 || neighbors == 3)  )
          grid[i][j][k] = 1; 
        else if (state == 1 && neighbors <= 6)
          grid[i][j][k] = 1;
        // else 
        //   grid[i][j][k] = 0;
      }
    }
  }
}


// UTILS 

function getNeighborCount(x, y, z) { 
  var count = 0;
  for (var dx=-1; dx < 2; dx++) {
    for (var dy=-1; dy < 2; dy++) {
      for (var dz=-1; dz < 2; dz++) {
        if (!(dx == 0 && dy == 0 && dz == 0) && gridBis[(x+dx+GRID_WIDTH)%GRID_WIDTH][(y+dy+GRID_HEIGHT)%GRID_HEIGHT][(z+dz+GRID_DEPTH)%GRID_DEPTH])
          count++;
      }
    }
  }
  return count;

}

function getNeighborNeumann(x, y, z) {
  var count = 0;
  if (gridBis[(x-1+GRID_WIDTH)%GRID_WIDTH][y][z] > 0) count++;   // l
  if (gridBis[(x+1+GRID_WIDTH)%GRID_WIDTH][y][z] > 0) count++;   // r
  if (gridBis[x][(y+1+GRID_HEIGHT)%GRID_HEIGHT][z] > 0) count++; // t
  if (gridBis[x][(y-1+GRID_HEIGHT)%GRID_HEIGHT][z] > 0) count++; // bottom
  if (gridBis[x][y][(z+1+GRID_DEPTH)%GRID_DEPTH] > 0) count++;   // f
  if (gridBis[x][y][(z-1+GRID_DEPTH)%GRID_DEPTH] > 0) count++;   // back
  return count;
}


