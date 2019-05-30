const WIDTH = 800;
const HEIGHT = 450;
const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 400;
const MENU_HEIGHT = 50;
const NB_WALLS = 5;

let cam;
let walls;

function initWalls() {
    walls = [];
    walls.push(new Wall(0, 0, PANEL_WIDTH-1, 0));
    walls.push(new Wall(PANEL_WIDTH-1, 0, PANEL_WIDTH-1, PANEL_HEIGHT-1));
    walls.push(new Wall(PANEL_WIDTH-1, PANEL_HEIGHT-1, 0, PANEL_HEIGHT-1));
    walls.push(new Wall(0, PANEL_HEIGHT-1, 0, 0));
}

function generateWalls() {
    walls.splice(4, walls.length - 4);
    for (let i = 0; i < NB_WALLS; i++) {
        walls.push(new Wall(random(PANEL_WIDTH), random(PANEL_HEIGHT), random(PANEL_WIDTH), random(PANEL_HEIGHT)));
    }
}

function setup() {
    let canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent("sketch");
    randomSeed(0x123456);
    initWalls();
    generateWalls();
    cam = new Cam(100, 100, 45);
    let rayLabel = createP("<h5>Number of rays: </h5>");
    sliderRays = createSlider(10, PANEL_WIDTH, PANEL_WIDTH, 1);
    sliderRays.input(() => {const nbRays = sliderRays.value(); cam.setNbRays(nbRays); });
    let fovLabel = createP("<h5>FOV: </h5>", "sliders");
    sliderFOV = createSlider(0, 360, cam.fov, 1);
    sliderFOV.input(() => {const fov = sliderFOV.value(); cam.setFov(fov); });
    fovLabel.parent("sliders");
    sliderFOV.parent("sliders");
    rayLabel.parent("sliders");
    sliderRays.parent("sliders");
    window.addEventListener("keydown", function(e) { if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) e.preventDefault(); }, false);
}

function draw() {
    background(0);

    noStroke();
    fill(255);
    textSize(10);
    text("Rays = "+cam.nbRays, 10, 10);
    text("FOV = "+cam.fov, 10, 25);
    text("Fisheye = "+cam.fishEye, 10, 40);
    translate(0, MENU_HEIGHT);

    push();
    if (focused) {
        cam.update();
        cam.cast(walls);
    }

    if (cam.pos.x < 0) cam.setPos(0, cam.pos.y);
    if (cam.pos.x > PANEL_WIDTH-1) cam.setPos(PANEL_WIDTH-1, cam.pos.y);
    if (cam.pos.y < 0) cam.setPos(cam.pos.x, 0);
    if (cam.pos.y > PANEL_HEIGHT-1) cam.setPos(cam.pos.x, PANEL_HEIGHT-1);

    for (wall of walls) {
        wall.render();
    }

    cam.renderTopView();
    translate(PANEL_WIDTH, 0);
    if (focused) cam.renderScene(PANEL_WIDTH, PANEL_HEIGHT);
    pop();
    if (!focused) {
        noStroke();
        fill(255, 255, 255, 25);
        rect(0, 0, WIDTH, HEIGHT);
    }
}

function keyPressed() {
    switch (key) {
        case "R": case "r":
            generateWalls();
            break;
        case "F": case "f":
            cam.toggleFishEye();
    }
}