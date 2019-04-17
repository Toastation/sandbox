let t_min = -3;
let t_max = 3;
let t = t_min;
let nb_samples = 50;
let offset_x = 0.0, offset_y = 0.0; 
let s = 2;
let espilon = 0.0005, speed_epsilon = 0.01;

let values = new Array(nb_samples);

function f(x, y) {
  return [-(x*x) + x*t + y, x*x - (y*y) - (t*t) - x*y + y*t - x + y];
}

function scl(x, y) {
  let s1 = s * width / 2;
  let s2 = s * height / 2;
  return [(x - offset_x) * s1 + width / 2, (y - offset_y) * s2 + height / 2];
}

function center() {
  let min_x = Infinity;
  let max_x = -Infinity;
  let min_y = Infinity;
  let max_y = -Infinity;
  for (let p of values) {
    min_x = min(min_x, p[0]);
    max_x = max(max_x, p[0]);
    min_y = min(min_y, p[1]);
    max_y = max(max_y, p[1]);
  }
  min_x = min(min_x, -4.0);
  max_x = max(max_x, 4.0);
  min_y = min(min_y, -4.0);
  max_y = max(max_y, 4.0);
  s = 1.0 / max(max(max_x - min_x, max_y - min_y), 0.1);
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
  background(0);
  strokeWeight(0);
  fill(255);
  text("t="+t, 20, 20);
  let ftt = f(t, t);
  text("f(t,t)=["+ftt[0]+", "+ftt[1]+"]", 20, 35);
  let x = t, y = t, inScreen = false;
  for (let i = 0; i < nb_samples; i++) {
    let res = f(x, y);
    let scaled_res = scl(x, y);
    x = res[0];
    y = res[1];
    values[i] = res;
    if (scaled_res[0] >= 0 && scaled_res[0] <= width && scaled_res[1] >= 0 && scaled_res[1] <= height) inScreen = true;
    fill(lerpColor(c1, c2, i / nb_samples));
    circle(scaled_res[0], scaled_res[1], 2);
  }
  // center();
  if (inScreen) t += espilon;
  else t += speed_epsilon;
  if (t >= t_max) t = t_min;
}