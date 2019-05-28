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
// let plane;
let fov;
let dirAngle;

function generateGrid() {
    grid = new Array();
    for (let i = 0; i < GRID_WIDTH * GRID_HEIGHT; i++)
        grid[i] = new Array();
    for (let x = 0; x < GRID_WIDTH; x++) {
        grid[x][0] = 1;
        grid[x][GRID_HEIGHT-1] = 1;
    }
    for (let y = 0; y < GRID_HEIGHT; y++) {
        grid[0][y] = 1;
        grid[GRID_WIDTH-1][y] = 1;
    }
}

function setup() {
    let canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent("sketch");
    generateGrid();
    dirAngle = 0;
    pos = createVector(PANEL_WIDTH / 2, PANEL_HEIGHT / 2);
    dir = p5.Vector.fromAngle(dirAngle);
    // plane = createVector(0, 0.66);
    fov = 90;
    angleMode(DEGREES);
}

function draw() {
    background(0);
    renderTopView();
    push();
    translate(PANEL_WIDTH, 0);
    cast();
    pop();
}

function renderTopView() {
    noStroke();
    fill(255);
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (grid[x][y] == 1) rect(x * GRID_WIDTH, y * GRID_HEIGHT, GRID_WIDTH, GRID_HEIGHT);
        }
    }    
    ellipse(pos.x, pos.y, 5, 5);
    strokeWeight(2);
    stroke(255, 0, 0);
    translate(pos.x, pos.y);
    line(0, 0, dir.x * 10, dir.y * 10);
}

function cast() {
    noStroke();
    fill(255, 0, 0);
    const deltaAngle = fov / PANEL_WIDTH;
    let tilePos = createVector();
    let mapPos = createVector();
    let offset = createVector();
    let tileStep = createVector();
    let step = createVector();
    let intersection = createVector();   
    let rayDir; 
    for (let angle = dirAngle - fov / 2; angle < dirAngle + fov / 2; angle += deltaAngle) {
        mapPos.x = pos.x / GRID_WIDTH;
        mapPos.y = pos.y / GRID_HEIGHT;
        tilePos.x = ceil(mapPos.x);
        tilePos.y = ceil(mapPos.y);
        offset.x = mapPos.x % 1;
        offset.y = mapPos.y % 1;
        rayDir = p5.Vector.fromAngle(radians(angle));
        if (rayDir.x > 0) {
            tileStep.x = 1;
            step.y = 1 / tan(angle);
            intersection.x = mapPos + offset.y / tan(angle);
        } else {
            tileStep.x = -1;
            step.y = -1 / tan(angle);
            intersection.x = mapPos - offset.y / tan(angle);
        }
        if (rayDir.y > 0) {
            tileStep.y = 1;
            step.x = tan(angle); 
            intersection.y = mapPos + offset.y / tan(angle);
        } else {
            tileStep.y = -1;
            step.x = -tan(angle);
            intersection.y = mapPos - offset.y / tan(angle);
        }
    }
    // const deltaAngle = fov / PANEL_WIDTH;
    // for (let angle = dirAngle - fov / 2; angle < dirAngle + fov / 2; dirAngle += deltaAngle) {
    //     console.log(angle);   
    // }
    // let rayDir = createVector();
    // let mapPos = createVector();
    // let sideDist = createVector();
    // let deltaDist = createVector();
    // let step = createVector();
    // let perpWallDist;
    // let height;
    // let hit = false;
    // let side;
    // for (let x = 0; x < PANEL_WIDTH; x++) {
        // let camX = (2 * x / PANEL_WIDTH) - 1;
        // rayDir.x = dir.x + plane.x * camX;
        // rayDir.y = dir.y + plane.y * camX;
        // mapPos.x = ceil(pos.x / GRID_WIDTH);
        // mapPos.y = ceil(pos.y / GRID_HEIGHT);
        // deltaDist.x = abs(1 / rayDir.x);
        // deltaDist.y = abs(1 / rayDir.y);

        // if (rayDir < 0) {
        //     step.x = -1;
        //     sideDist.x = (pos.x - mapPos.x) * deltaDist.x;
        // } else {
        //     step.x = 1;
        //     sideDist.x = (mapPos.x + 1 - pos.x) * deltaDist.x;
        // }
        // if (rayDir.y < 0) {
        //     step.y = -1;
        //     sideDist = (pos.y - mapPos.y) * deltaDist.y;
        // } else {
        //     step.y = 1;
        //     sideDist = (mapPos.y + 1 - pos.y) * deltaDist.y;
        // }

        // console.log("mapPos : "+mapPos);
        // console.log("rayDir : "+rayDir);
        // console.log("deltaDist : "+deltaDist);
        // console.log("step : "+step);
        // console.log("--------------");

        // let i = 0;
        // while (!hit) {
        //     if (sideDist.x < sideDist.y) {
        //         sideDist.x += deltaDist.x;
        //         mapPos.x += step.x;
        //         side = 0;
        //     } else {
        //         sideDist.y += deltaDist.y;
        //         mapPos.y += step.y;
        //         side = 1;
        //     }

        //     hit = grid[ceil(mapPos.x)][ceil(mapPos.y)] > 0;
        //     if (i==1000) break;
        //     i++
        // }
        // if (side == 0) perpWallDist = (mapPos.x - pos.x + (1 - step.x) / 2) / rayDir.x;
        // else perpWallDist = (mapPos.y - pos.y + (1 - step.y) / 2) / rayDir.y;
        // height = PANEL_HEIGHT * perpWallDist;
        // rectMode(CENTER);
        // rect(x, PANEL_HEIGHT / 2, 1, height);
    // }
}