let t_min = -1.5;
let t_max = 1.5;
let t = t_min;
let nb_samples = 50;
let offset_x = 0.0, offset_y = 0.0; 
let s = 3;
let espilon = 0.0005, speed_epsilon = 0.005;

let hist_length = 10;
let values = new Array(nb_samples);
for (let i = 0; i < nb_samples; i++) {
  values[i] = new Array(); 
}

function f(x, y) {
  return createVector(-(x*x) + x*t + y, x*x - (y*y) - (t*t) - x*y + y*t - x + y);
}

function scl(x, y) {
  return createVector(map(x, -1, 1, 0, width), map(y, -1, 1, 0, height));
}

function removeOffscreenPoints(i) {
  for (let j = (values[i].length - 1); j >= 0; j--) {
    if (values[i][j].x < 0 || values[i][j].x >= width || values[i][j].y < 0 || values[i][j].y >= height)
      values[i].splice(j, 1);
  }
}

function keyPressed() {
  if (key == 'r'){
    console.log(values);
  }
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
  textSize(10);
  text("t = "+Math.round(t*1000)/1000, 20, height - 20);
  let x = t, y = t, inScreen = false, count = 0;
  for (let i = 0; i < nb_samples; i++) {
    let res = f(x, y);
    let scaled_res = scl(x, y);
    x = res.x; y = res.y;
    if (values[i].length >= hist_length) values[i].splice(0, 1);
    values[i].push(scaled_res);
    if (scaled_res.x >= 0 && scaled_res.x <= width && scaled_res.y >= 0 && scaled_res.y <= height){
      inScreen = true;
      count++;
      removeOffscreenPoints(i);
    }
    fill(lerpColor(c1, c2, i / nb_samples));
    circle(scaled_res.x, scaled_res.y, 2);
  }

  for (let i = 0; i < nb_samples; i++) {
    let c = lerpColor(c1, c2, i / nb_samples);
    fill(c)
    for (let j in values[i]) {
      c.setAlpha(map(j, 0, values[i].length-1, 0, 255));
      circle(values[i][j].x, values[i][j].y, 1);
    }
  }

  if (inScreen && count >= 15) {
    t += espilon;
  }
  else {
    t += speed_epsilon;
  } 
  if (t >= t_max) t = t_min;
}