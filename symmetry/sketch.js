let DRAWING_MODE = 0, ANIMATION_MODE = 1;
let NB_LINE_MAX = 50, NB_LINES_MIN = 1;
let nbLines = 5;
let mode = DRAWING_MODE;
let originX = undefined;
let originY = undefined;
let animX, animY, panimX, panimY;
let a = 0;

function setup() {
    width = windowWidth / 1.25;
    height = windowHeight / 1.25;
    colors = [color(255, 0, 0), color(0, 255, 0), color(0, 0, 255), color(255, 0, 255), color(255, 255, 0)];
    let canvas = createCanvas(width, height);
    canvas.parent("sketch");
    document.addEventListener('contextmenu', function(e) { if (e.button == 2) e.preventDefault(); });
    let div = createDiv();
    label = createP("Number of lines : "+nbLines);
    slider = createSlider(NB_LINES_MIN, NB_LINE_MAX, nbLines);
    slider.input(function () {nbLines = slider.value(); label.html("Number of lines : "+nbLines);});
    div.child(label);
    div.child(slider);
}

function draw() {
    if (mode == DRAWING_MODE && mouseIsPressed && originX != undefined && originY != undefined) {
        drawLineWithSymmetry(originX, originY, mouseX, mouseY, pmouseX, pmouseY);
    } else if (mode == ANIMATION_MODE) {
        animate();
    }
    stroke(255, 255, 255);
    strokeWeight(1);
    noFill();
    rect(0, 0, width-1, height-1);
}

function animate() {
    if (originX == undefined || originY == undefined) {
        panimX = animX = originX = width / 2;
        panimY = animY = originY = height / 2;
    }
    panimX = animX;
    panimY = animY;
    let deltaAngle = cos(millis() * 0.01) * randomGaussian(3, 1);
    // let deltaAngle = randomGaussian(40, 10);
    let disp = randomGaussian(10, 0.5);
    animX = animX + disp * cos(deltaAngle);
    animY = animY + disp * sin(deltaAngle);
    drawLineWithSymmetry(originX, originY, animX, animY, panimX, panimY);
    if (animX < 0 || animX >= width || animY < 0 || animY >= height) {
        originX = undefined;
        originY = undefined;
        background(0, 0, 0);
    }
}

function drawLineWithSymmetry(ox, oy, px, py, ppx, ppy) {
    strokeWeight(2);
    stroke(255, 0, 0);
    let deltaAngle = TAU / nbLines;
    let angleMouse = atan2(py - oy, px - ox);
    let anglePMouse = atan2(ppy - oy, ppx - ox);
    let mouseDist = dist(ox, oy, px, py);
    let pmouseDist = dist(ox, oy, ppx, ppy);
    let mouseDif = HALF_PI - angleMouse;
    let pmouseDif = HALF_PI - anglePMouse;
    for (let i = 0; i < nbLines; i++) {
        let axisAngle = i * deltaAngle + HALF_PI;
        let mx = mouseDist * cos(axisAngle + mouseDif);
        let my = mouseDist * sin(axisAngle +  mouseDif);
        let pmx = pmouseDist * cos(axisAngle + pmouseDif);
        let pmy = pmouseDist * sin(axisAngle + pmouseDif);
        line(ox + pmx, oy + pmy, ox + mx, oy + my);
        mx = mouseDist * cos(axisAngle - mouseDif);
        my = mouseDist * sin(axisAngle - mouseDif);
        pmx = pmouseDist * cos(axisAngle - pmouseDif);
        pmy = pmouseDist * sin(axisAngle - pmouseDif);
        line(ox + pmx, oy + pmy, ox + mx, oy + my);
    }
}

/********* INPUTS *********/

function mousePressed() {
    if (mode == DRAWING_MODE && mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height && mouseButton == LEFT) {
        originX = mouseX;
        originY = mouseY;
    } 
}

function mouseReleased() {
    if (mode == DRAWING_MODE) {
        originX = undefined;
        originY = undefined;
        originalAngle = undefined;
    }
}

function keyPressed() {
    if (key == 'r') {
        background(0, 0, 0);
    }
    if (key == 'm') {
        originX = undefined;
        originY = undefined;
        originalAngle = undefined;
        background(0, 0, 0);        
        if (mode == DRAWING_MODE) mode = ANIMATION_MODE;
        else mode = DRAWING_MODE;
    }
}