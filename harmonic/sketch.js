const WIDTH = 600;
const HEIGHT = 300;

let gui;
let nbData = 50;
let dataY = [];
let dataX = [];
let fixed = [];
let t = 0;
let dtAcc = 0;

var ups = 50, upsMin = 0, upsMax = 60, upsStep = 10;

function setup() {
  let canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent("harmo1d");
  canvas.center("horizontal");
  frameRate(60);

  // gui = createGui("Settings");
  // gui.addGlobals("ups");

  dataX = Float32Array.from({length: nbData}, (_, i) => map(i, 0, nbData-1, 10, WIDTH-20));
  dataY = new Int32Array(nbData);
  resetData();
  colors = d3.range(30).map(i => d3.interpolateWarm(norm(i, 0, 5)));
  textSize(16);
  console.log(colors);
}

function draw() {
  background(255);
  fill(255);
  strokeWeight(0);


  maxDataY = dataY.reduce(function(a, b) {
    return Math.max(a, b);
  });

  // draw points
  for (var i = 0; i < nbData; i += 1) {
    fill(colors[Math.floor(map(dataY[i], HEIGHT, 0, 30, 0))]);    
    circle(dataX[i], HEIGHT-map(dataY[i], 0, maxDataY, 15, HEIGHT-50), fixed[i] ? 6 : 3);
  }
  circle(20, 40, 6);
  fill(0);
  text("t = "+str(t)+"/100", 20, 20);
  text("fixed point", 30, 44);
  drawArrow(createVector(3, HEIGHT-5), createVector(3, -HEIGHT+10), "black");
  drawArrow(createVector(3, HEIGHT-5), createVector(WIDTH-10, 0), "black");
  // update points
  if (ups == 0) return;
  if (dtAcc > (1000 / ups)) {
    diffusionUpdate();
    dtAcc = 0;
    t += 1;
  }
  if (t >= 100) 
    resetData();
  dtAcc += deltaTime;
}

function diffusionUpdate() {
  let newValues = new Float32Array(nbData);
  for (var i = 0; i < nbData; i++) {
    if (fixed[i]) {
      newValues[i] = dataY[i];
      continue;
    }
    if (i == 0)
      newValues[i] = dataY[i+1] / 2;
    else if (i == nbData-1)
      newValues[i] = dataY[i-1] / 2;
    else 
      newValues[i] = (dataY[i-1] + dataY[i+1]) / 2
  }
  dataY = newValues;
}

function resetData() {
  for (var i = 0; i < nbData; i += 1) {
    dataY[i] = 0;
    fixed[i] = false;
  }
  fixed[0] = true;
  fixed[nbData-1] = true;
  fixed[Math.trunc(nbData/2)] = true;
  dataY[Math.trunc(nbData/2)] = 30;
  t = 0;
}

function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(2);
  fill(myColor);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 7;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}