const WIDTH = 800;
const HEIGHT = 400;
const PANEL_WIDTH = 400;

let cam;
let walls;

function setup() {
    let canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent("sketch");
    walls = [];
    walls.push(new Wall(0, 0, PANEL_WIDTH-1, 0));
    walls.push(new Wall(PANEL_WIDTH-1, 0, PANEL_WIDTH-1, HEIGHT-1));
    walls.push(new Wall(PANEL_WIDTH-1, HEIGHT-1, 0, HEIGHT-1));
    walls.push(new Wall(0, HEIGHT-1, 0, 0));
    walls.push(new Wall(200, 50, 250, 200));
    cam = new Cam(100, 100, 45);
}

function draw() {
    background(0);

    cam.update();
    cam.cast(walls);

    if (cam.pos.x < 0) cam.setPos(0, cam.pos.y);
    if (cam.pos.x > WIDTH-1) cam.setPos(WIDTH-1, cam.pos.y);
    if (cam.pos.y < 0) cam.setPos(cam.pos.x, 0);
    if (cam.pos.y > HEIGHT-1) cam.setPos(cam.pos.x, HEIGHT-1);

    for (wall of walls) {
        wall.render();
    }
    cam.render();
}