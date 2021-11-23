const SAMPLES = 200;
const H1 = 210;

let W, H;
let can;
let cubicPoints = [];
let pointsClickable = [];

let test;

function centerCan() {
  W = windowWidth * 0.9;
  H = windowHeight;
  let x = (windowWidth - W) / 2;
  let y = (windowHeight - H) / 2;
  can.position(x, y);
  resizeCanvas(W, H);
  initPoints();
}

function windowResized() {
  centerCan();
}

function initPoints() {
  let d = W / 5;
  cubicPoints = [createVector(d, 0),
                 createVector(1.5*d, -100),
                 createVector(3.5*d, 100),
                 createVector(4*d, 0) ];
}

function setup() {
  can = createCanvas(windowWidth, windowHeight);
  centerCan();
  initPoints();
  test = uxRect(cubicPoints[0].x-5, cubicPoints[0].y+H1-5, 10, 10);
}


function draw() {
  background(220);
  fill(0);
  stroke(0);
  strokeWeight(1);
  textAlign(LEFT);
  textSize(28);

  push();
  textSize(64);
  textAlign(CENTER);
  strokeWeight(0);
  text("Cubic Splines", W / 2, 60);
  pop();

  // CUBIC HERMITE
  drawHermite();
}

function drawHermite() {
  push();
  strokeWeight(0);
  text("Cubic Hermite", 20, H1-10);
  textSize(12);
  textStyle(ITALIC);
  text("(tangents not to scale)", 30, H1+5);
  textStyle(BOLD);
  let m0 = p5.Vector.sub(cubicPoints[1], cubicPoints[0]), m1 = p5.Vector.sub(cubicPoints[2], cubicPoints[3]);
  m0.normalize(); m1.normalize();
  m0.mult(1000); m1.mult(-1000);
  circle(cubicPoints[0].x, cubicPoints[0].y + H1, 10, 10);
  circle(cubicPoints[3].x, cubicPoints[3].y + H1, 10, 10);
  drawArrow(p5.Vector.add(cubicPoints[0], createVector(0, H1)), p5.Vector.mult(m0, 0.1), '#301934');
  drawArrow(p5.Vector.add(cubicPoints[3], createVector(0, H1)), p5.Vector.mult(m1, 0.1), '#301934');
  let coeffs;
  let last = cubicPoints[0];
  let cur;
  strokeWeight(1);
  push();
  for (let i = 1; i <= SAMPLES + 1; i++) {
    coeffs = hermiteCoeffs(i/(SAMPLES+1.0));
    cur = p5.Vector.add(p5.Vector.mult(cubicPoints[0], coeffs[0]), 
          p5.Vector.add(p5.Vector.mult(m0, coeffs[1]),
          p5.Vector.add(p5.Vector.mult(cubicPoints[3], coeffs[2]),
          p5.Vector.mult(m1, coeffs[3]))));
    line(last.x, last.y + H1, cur.x, cur.y+H1);
    last = cur;
  }
  pop();
}

// UTILS

// p0, m0, p1, m1
function hermiteCoeffs(t) {
  let t3 = t*t*t;
  let t2 = t*t;
  return [2*t3-3*t2+1, t3-2*t2+t, -2*t3+3*t2, t3-t2];
}


// from p5js.org
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