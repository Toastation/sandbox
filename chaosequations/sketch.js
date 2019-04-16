let t_min = -3;
let t_max = 3;
let epsilon;

function f(x, y) {
  return [-(x*x) + x*t + y, x*x - (y*y) - (t*t) - x*y + y*t - x + y];
}

function setup() {
  width = windowWidth / 2;
  height = windowHeight / 2;
  let canvas = createCanvas(width, height);
  canvas.parent("sketch");
  c1 = color(255, 65, 65)
  c2 = color(65, 65, 255);
}

function draw() {
  

}