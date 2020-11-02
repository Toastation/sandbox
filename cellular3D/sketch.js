const WIDTH = 400;
const HEIGHT = 400;
const CELL_SIZE = 10;
const GRID_WIDTH = 50;
const GRID_HEIGHT = 50;
const GRID_DEPTH = 50;

var cam;
var grid, gridBis;
var birth = 12;
var survival = 10;
var dtAcc = 0;

function setup() {
  createCanvas(WIDTH, HEIGHT, WEBGL);
  frameRate(24);
  cam = new Dw.EasyCam(this._renderer, {distance : 300});
  cam.zoom(0.1);
  createGrid();
}

function createGrid() {
  grid = new Array(GRID_WIDTH);
  gridBis = new Array(GRID_WIDTH);
  for (var i = 0; i < GRID_WIDTH; i++) {
    grid[i] = new Array(GRID_HEIGHT);
    gridBis[i] = new Array(GRID_HEIGHT);
    for (var j = 0; j < GRID_HEIGHT; j++) {
      grid[i][j] = new Array(GRID_DEPTH);
      gridBis[i][j] = new Array(GRID_DEPTH);
      for (var k = 0; k < GRID_DEPTH; k++) {
        grid[i][j][k] = 0;
        gridBis[i][j][k] = grid[i][j][k];
      }
    }
  }
  grid[10][10][10] = 1;
}

function draw() {
  background(50);
  drawGrid();
}

function drawGrid() {
  translate(-100, 0, -400);
  for (var i = 0; i < GRID_WIDTH; i++) {
    for (var j = 0; j < GRID_HEIGHT; j++) {
      for (var k = 0; k < GRID_DEPTH; k++) {
        if (grid[i][j][k] == 0) continue;
        push();
        translate(i*CELL_SIZE, j*CELL_SIZE, k*CELL_SIZE);
        box(CELL_SIZE, CELL_SIZE, CELL_SIZE);
        pop();
      }
    }
  }
  if (frameCount % 48 == 0) {
    console.log("test");
    update();
  }
}

function update() {
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
  // if (grid[(x-1+GRID_WIDTH)%GRID_WIDTH][y][z] > 0) count++;   // l
  // if (grid[(x-1+GRID_WIDTH)%GRID_WIDTH][(y+1+GRID_HEIGHT)%GRID_HEIGHT][z] > 0) count++;    // tl
  // if (grid[(x-1+GRID_WIDTH)%GRID_WIDTH][(y-1+GRID_HEIGHT)%GRID_HEIGHT][z] > 0) count++;   // lb
  // if (grid[x][(y+1+GRID_HEIGHT)%GRID_HEIGHT][z] > 0) count++; // t
  // if (grid[x][(y-1+GRID_HEIGHT)%GRID_HEIGHT][z] > 0) count++; // b
  // if (grid[(x-1+GRID_WIDTH)%GRID_WIDTH][y][z] > 0) count++;   // l

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


