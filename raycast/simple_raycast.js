const WIDTH = 800;
const HEIGHT = 450;
const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 400;
const MENU_HEIGHT = 50;

const GRID_WIDTH = 40;
const GRID_HEIGHT = 40;
const CELL_WIDTH = PANEL_WIDTH / GRID_WIDTH;
const CELL_HEIGHT = PANEL_HEIGHT / GRID_HEIGHT;

let grid;
let pos;
let dir;
let fov;
let dirAngle;
let stripes;

function generateGrid() {
    grid = new Array();
    for (let i = 0; i < GRID_WIDTH * GRID_HEIGHT; i++)
        grid[i] = new Array();
    for (let x = 0; x < GRID_WIDTH; x++) {
        grid[x][0] = 1;
        grid[x][GRID_HEIGHT-1] = 1;
    }
    for (let y = 0; y < GRID_HEIGHT; y++) {
        grid[0][y] = 2;
        grid[GRID_WIDTH-1][y] = 2;
    }
    grid[3][6] = 1;
}

function setup() {
    let canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent("sketch");
    generateGrid();
    dirAngle = 0;
    pos = createVector(PANEL_WIDTH / 2, PANEL_HEIGHT / 2);
    dir = p5.Vector.fromAngle(dirAngle);
    fov = 90;
    stripes = [];
    angleMode(DEGREES);
    window.addEventListener("keydown", function(e) { if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) e.preventDefault(); }, false);
}

function draw() {
    inputs();
    cast();
    renderScene();
}
function renderScene() {
    background(0);
    renderTopView();
    fill(255);
    translate(PANEL_WIDTH, 0);
    render3D();
}

function cast() {
    stripes = [];    
    stripesType = [];
    const deltaAngle = fov / PANEL_WIDTH;
    let mapPos = createVector();
    let tilePos = createVector();
    let offset = createVector();
    let step = createVector();
    let sideDist = createVector();
    let deltaDistX;
    let deltaDistY;
    let rayDir;
    let side; // 0=horizontal, 1=vertical 
    let rayCount = 0;
    for (let angle = dirAngle - fov / 2; angle < dirAngle + fov / 2; angle += deltaAngle) {
        mapPos.x = pos.x / CELL_WIDTH;
        mapPos.y = pos.y / CELL_HEIGHT;
        tilePos.x = floor(mapPos.x);
        tilePos.y = floor(mapPos.y);
        offset.x = mapPos.x % 1;
        offset.y = mapPos.y % 1;
        rayDir = p5.Vector.fromAngle(radians(angle));
        deltaDistX = sqrt(1 + (rayDir.y * rayDir.y) / (rayDir.x * rayDir.x));
        deltaDistY = sqrt(1 + (rayDir.x * rayDir.x) / (rayDir.y * rayDir.y));
        if (rayDir.x > 0) {
            step.x = 1;
            sideDist.x = (1 - offset.x) * deltaDistX;
        } else {
            step.x = -1;
            sideDist.x = offset.x * deltaDistX;
        }
        if (rayDir.y > 0) {
            step.y = 1;
            sideDist.y = (1 - offset.y) * deltaDistY;
        } else {
            step.y = -1;
            sideDist.y = offset.y * deltaDistY;
        }
        let wall = false;
        let rayStep = 0;
        while (!wall) {
            if (sideDist.x < sideDist.y) {
                sideDist.x += deltaDistX;
                tilePos.x += step.x;
                side = 0;
            } else {
                sideDist.y += deltaDistY;
                tilePos.y += step.y;
                side = 1;
            }
            if (grid[tilePos.x][tilePos.y] > 0) wall = true;
            if (rayStep >= 1000) {
                console.log("error raycasting, too many ray steps...");
                break;
            }
            rayStep++;
        }
        let dist, hit = createVector();
        if (side == 0) {
            dist = (tilePos.x - mapPos.x + (1 - step.x) / 2) / rayDir.x;
            hit.x = mapPos.x < tilePos.x ? tilePos.x : tilePos.x + 1;
            hit.y = mapPos.y + dist * rayDir.y;
        } else {
            dist = (tilePos.y - mapPos.y + (1 - step.y) / 2) / rayDir.y;
            hit.x = mapPos.x + dist * rayDir.x;
            hit.y = mapPos.y > tilePos.y ? tilePos.y + 1 : tilePos.y;
        }           
        stripes[rayCount] = {
            height: PANEL_HEIGHT / dist,
            type: grid[tilePos.x][tilePos.y],
            side: side,
            hit: hit
        }
        rayCount++;
    }
}

function renderTopView() {
    push();
    // draw grid
    strokeWeight(1);
    stroke(255, 255, 255, 40);
    for (let x = 0; x < GRID_WIDTH; x++) line(x * CELL_WIDTH, PANEL_HEIGHT, x * CELL_WIDTH, 0);
    for (let y = 0; y < GRID_HEIGHT; y++) line(0, y * CELL_HEIGHT, PANEL_WIDTH, y * CELL_HEIGHT);
    // draw walls
    noStroke();
    const tilePos = createVector(floor(pos.x / CELL_WIDTH), floor(pos.y / CELL_HEIGHT));
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            fill(getWallColor(grid[x][y]));
            if (grid[x][y] > 0) rect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
            if (x == tilePos.x && y == tilePos.y) {
                fill(255, 255, 255, 40);
                rect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
            }
        }
    }    
    // draw cam
    fill(255);
    ellipse(pos.x, pos.y, 5, 5);
    // draw rays
    strokeWeight(2);
    for (let i = 0; i < stripes.length; i++) {
        stroke(255, 0, 255);
        point(stripes[i].hit.x * CELL_WIDTH, stripes[i].hit.y * CELL_HEIGHT);
        stroke(255, 0, 255, 10);
        line(pos.x, pos.y, stripes[i].hit.x * CELL_WIDTH, stripes[i].hit.y * CELL_HEIGHT);
    }
    stroke(255, 0, 0);
    // draw dir
    line(pos.x, pos.y, pos.x + dir.x * 10, pos.y + dir.y * 10);
    pop();
}

function render3D() {
    push();
    noStroke();
    rectMode(CENTER);
    let wallColor;
    for (let x = 0; x < stripes.length; x++) {
        wallColor = getWallColor(stripes[x].type);                
        if (stripes[x].side == 0) darkenColor(wallColor);
        fill(wallColor);
        rect(x, PANEL_HEIGHT / 2, 1, stripes[x].height);
    }
    pop();
}

function rotateCam(delta) {
    dirAngle += delta;
    dir = p5.Vector.fromAngle(radians(dirAngle));
}

function move(speed) {
    let disp = dir.copy();
    pos.add(disp.setMag(speed));
}

function inputs() {
    if (keyIsDown(LEFT_ARROW)) {
        rotateCam(-3);
    } else if (keyIsDown(RIGHT_ARROW)) {
        rotateCam(3);
    }
    if (keyIsDown(UP_ARROW)) {
        move(4);
    } else if (keyIsDown(DOWN_ARROW)) {
        move(-4);
    }
    if (pos.x < 0)                   pos.x = 0;
    else if (pos.x > PANEL_WIDTH-1)  pos.x = PANEL_WIDTH-1;
    if (pos.y < 0)                   pos.y = 0;
    else if (pos.y > PANEL_HEIGHT-1) pos.y = PANEL_HEIGHT-1;
}

function darkenColor(c) {
    c.setRed(red(c) / 2);
    c.setGreen(green(c) / 2);
    c.setBlue(blue(c) / 2);
}

function getWallColor(type) {
    if (type == 1)      return color(255, 0, 0);
    else if (type == 2) return color(0, 255, 0);
    else                return color(0);
}