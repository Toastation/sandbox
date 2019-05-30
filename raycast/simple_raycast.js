const WIDTH = 800;
const HEIGHT = 450;
const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 400;
const MENU_HEIGHT = 50;

const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
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
        mapPos.x = pos.x / GRID_WIDTH;
        mapPos.y = pos.y / GRID_HEIGHT;
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
        let dist;
        if (side == 0) dist = (tilePos.x - floor(mapPos.x) + (1 - step.x) / 2) / rayDir.x;
        else           dist = (tilePos.y - floor(mapPos.y) + (1 - step.y) / 2) / rayDir.y;
        stripes[rayCount] = {
            height: PANEL_HEIGHT / dist,
            type: grid[tilePos.x][tilePos.y],
            side: side
        }
        rayCount++;
    }
}

function renderTopView() {
    push();
    noStroke();
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (grid[x][y] == 1)      fill(255, 0, 0);
            else if (grid[x][y] == 2) fill(0, 255, 0);
            if (grid[x][y] > 0) rect(x * GRID_WIDTH, y * GRID_HEIGHT, GRID_WIDTH, GRID_HEIGHT);
        }
    }    
    fill(255);
    ellipse(pos.x, pos.y, 5, 5);
    strokeWeight(2);
    stroke(255, 0, 0);
    translate(pos.x, pos.y);
    line(0, 0, dir.x * 10, dir.y * 10);
    pop();
}

function render3D() {
    push();
    noStroke();
    rectMode(CENTER);
    let wallColor;
    for (let x = 0; x < stripes.length; x++) {
        if (stripes[x].type == 1)      wallColor = color(255, 0, 0);
        else if (stripes[x].type == 2) wallColor = color(0, 255, 0);
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
        rotateCam(-1);
    } else if (keyIsDown(RIGHT_ARROW)) {
        rotateCam(1);
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