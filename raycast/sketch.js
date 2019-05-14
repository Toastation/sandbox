let cam;
let wall;

function setup() {
    width = windowWidth / 2;
    height = windowHeight / 2;
    let canvas = createCanvas(width, height);
    canvas.parent("sketch");
    wall = new Wall(200, 50, 250, 200);
    cam = new Cam(100, 100, 45);
}

function draw() {
    background(0);
    wall.render();
}