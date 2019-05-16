const WIDTH = 800;
const HEIGHT = 450;
const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 400;
const MENU_HEIGHT = 50;

let cam;
let walls;

function setup() {
    let canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent("sketch");
    walls = [];
    walls.push(new Wall(0, 0, PANEL_WIDTH-1, 0));
    walls.push(new Wall(PANEL_WIDTH-1, 0, PANEL_WIDTH-1, PANEL_HEIGHT-1));
    walls.push(new Wall(PANEL_WIDTH-1, PANEL_HEIGHT-1, 0, PANEL_HEIGHT-1));
    walls.push(new Wall(0, PANEL_HEIGHT-1, 0, 0));
    walls.push(new Wall(200, 50, 250, 200));
    cam = new Cam(100, 100, 45);
}

function draw() {
    background(0);

    noStroke();
    textSize(10);
    text("Rays = "+cam.nbRays, 10, 10);
    text("FOV = "+cam.fov, 10, 25);
    translate(0, MENU_HEIGHT);

    cam.update();
    cam.cast(walls);

    if (cam.pos.x < 0) cam.setPos(0, cam.pos.y);
    if (cam.pos.x > WIDTH-1) cam.setPos(WIDTH-1, cam.pos.y);
    if (cam.pos.y < 0) cam.setPos(cam.pos.x, 0);
    if (cam.pos.y > PANEL_HEIGHT-1) cam.setPos(cam.pos.x, PANEL_HEIGHT-1);

    for (wall of walls) {
        wall.render();
    }

    cam.renderTopView();
    cam.renderScene(PANEL_WIDTH, PANEL_WIDTH, PANEL_HEIGHT);
}