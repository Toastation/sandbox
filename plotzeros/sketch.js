var xmin = -5.0;
var xmax = 1.0;
var ymin = -5.0;
var ymax = 5.0;
var epsilon = 0.1;
var iterations = 8000;

var xminMax = 100, xminMin = -100;
var xmaxMax = 100, xmaxMin = -100;
var yminMax = 100, yminMin = -100;
var ymaxMax = 100, ymaxMin = -100;

var epsilonMin = 0;
var epsilonMax = 1;
var epsilonStep = 0.01;
var iterationsMax = 10000;

var paramState = getParamState();

var eq = "sin(y + x - y * tan(x))";
var eqCode;

function f(x, y) {
  let scope = {
    x:x,
    y:y
  };
  return eqCode.eval(scope);
}

function keyPressed() {
  if (key == 'r' || key == 'R') background(0);
}

function getParamState() {
  let state = [];
  state[0] = xmin;
  state[1] = xmax;
  state[2] = ymin;
  state[3] = ymax;
  state[4] = epsilon;
  state[5] = iterations;
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

function setup() {
  width = windowWidth / 2;
  height = windowHeight / 2;
  let canvas = createCanvas(width, height);
  canvas.parent("sketch");
  gui = createGui('Settings');
  gui.addGlobals("xmin", "xmax", "ymin", "ymax", "epsilon", "iterations");
  c1 = color(10, 0, 0);
  c2 = color(200, 0, 0);
  eqCode = math.compile(eq);
  let div = createDiv();
  let label = createP("<h3>Equation:</h3>");
  eqInput = createInput(eq);
  eqSend = createButton("Send");
  eqSend.mousePressed(() => {
    eq = eqInput.value();
    eqCode = math.compile(eq);
    background(0);
  });
  let info1 = createP("<i>Please only use x and y as variable! Also only basic math functions are available.</i>");
  let info2 = createP("<h3>Usage: </h3>Plot the zeros of a given equation.<br />Use the settings gui to change parameters. Epsilon is the distance to zero from which points are drawn (hence the shading).<br />Press R to redraw.");
  div.child(label);
  div.child(eqInput);
  div.child(eqSend);
  div.child(info1);
  div.child(info2);
}

function draw() {
  if (checkParamState()) background(0);
  let x, y;
  for (let i = 0; i < iterations; i++) {
    x = random(0, width);
    y = random(0, height);
    let nx = map(x, 0, width - 1, xmin, xmax);
    let ny = map(y, 0, height - 1, ymin, ymax);
    let res = f(nx, ny);
    stroke(lerpColor(c2, c1, norm(abs(res), 0, epsilon)));
    if (abs(res) <= epsilon) point(x, y);
  }
}