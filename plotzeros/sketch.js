var xmin = -5.0;
var xmax = 5.0;
var ymin = -5.0;
var ymax = 5.0;
var value = 0.0;
var epsilon = 0.1;
var iterations = 8000;

var xminMax = 100, xminMin = -100;
var xmaxMax = 100, xmaxMin = -100;
var yminMax = 100, yminMin = -100;
var ymaxMax = 100, ymaxMin = -100;

var epsilonMin = 0, epsilonMax = 1, epsilonStep = 0.01;
var valueMin = -10, valueMax = 10, valueStep = 0.01;
var iterationsMax = 10000;

var paramState = getParamState();

var eq = "sin(y + x - y * tan(x))";
var eqCode;

var showAxis = false;

function f(x, y) {
  let scope = {
    x:x,
    y:y
  };
  return eqCode.eval(scope);
}

function keyPressed() {
  if (key == 'r' || key == 'R') refresh();
}

function getParamState() {
  let state = [];
  state[0] = xmin;
  state[1] = xmax;
  state[2] = ymin;
  state[3] = ymax;
  state[4] = value;
  state[5] = epsilon;
  state[6] = iterations;
  state[7] = showAxis;
  return state;
}

function checkParamState() {
  let newState = getParamState();
  for (let i in newState) {
    if (newState[i] != paramState[i]) {
      paramState = newState;
      return true;
    }
  }
  return false;
}

function compileEquation() {
  eq = eqInput.value();
  eqCode = math.compile(eq);
  refresh();
}

function refresh() {
  background(0);
  if (showAxis) {
    stroke(255, 255, 255, 50);
    fill(255, 255, 255, 50);
    strokeWeight(1);
    if (xmin < 0 && xmax > 0) line(map(0, xmin, xmax, 0, width-1), 0, map(0, xmin, xmax, 0, width-1), height);
    if (ymin < 0 && ymax > 0) line(0, map(0, ymin, ymax, 0, height-1), width, map(0, ymin, ymax, 0, height-1));
  }
}

function setup() {
  width = windowWidth / 2;
  height = windowHeight / 2;
  let canvas = createCanvas(width, height);
  canvas.parent("sketch");
  c1 = color(80,0,0);
  c2 = color(220,20,60);
  gui = createGui('Settings');
  gui.addGlobals("value", "xmin", "xmax", "ymin", "ymax", "epsilon", "iterations", "showAxis");
  eqCode = math.compile(eq);
  let div = createDiv();
  let label = createP("<h3>Equation:</h3>");
  eqInput = createInput(eq);
  eqSend = createButton("Send");
  eqSend.mousePressed(compileEquation);
  let info1 = createP("<em>Please only use x and y as variables! Also only basic math functions are available.</em>");
  let info2 = createP("<h3>Usage: </h3>Use the settings gui to change parameters. <ul><li>Value is the right-side of the equation.</li><li>Epsilon is the distance to value from which points are drawn (hence the shading).</li><li>If |f(x,y)-value|<=epsilon then a point is drawn, the brighter it is, the closer it is from value.</li><li>Press R to redraw.</li></ul>");
  let info3 = createP("<h3>Some interesting equations:</h3><ul><li>Default: sin(y + x - y * tan(x))</li><li>Heart: x*x+(y-cbrt(x*x))*(y-cbrt(x*x))  <small><i>(value=1)</i></small></li></ul> ");
  
  div.child(label);
  div.child(eqInput);
  div.child(eqSend);
  div.child(info1);
  div.child(info2);
  div.child(info3);
  refresh();
}

function draw() {
  if (checkParamState()) refresh();
  let x, y;
  for (let i = 0; i < iterations; i++) {
    x = random(0, width);
    y = random(0, height);
    let nx = map(x, 0, width - 1, xmin, xmax);
    let ny = map(y, 0, height - 1, ymin, ymax);
    let res = f(nx, ny);
    stroke(lerpColor(c2, c1, norm(abs(res - value), 0, epsilon)));
    if (abs(res - value) <= epsilon) point(x, height-1-y);
  }
}