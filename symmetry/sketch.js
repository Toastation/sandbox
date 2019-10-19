let nbLines = 5;
// let radius = 5;
let originX = undefined;
let originY = undefined;

function setup() {
    width = windowWidth / 1.25;
    height = windowHeight / 1.25;
    let canvas = createCanvas(width, height);
    canvas.parent("sketch");
}

function draw() {
    // background(255);
    noStroke();
    stroke(255, 0, 0);
    color(255, 0, 0);
    fill(255, 0, 0);
    if (mouseIsPressed) {
        push();
        let deltaAngle = TAU / nbLines;
        let angleMouse = atan2(mouseY - originY, mouseX - originX);
        let anglePMouse = atan2(pmouseY - originY, pmouseX - originX);
        let mouseDist = dist(originX, originY, mouseX, mouseY);
        let pmouseDist = dist(originX, originY, pmouseX, pmouseY);
        let mouseDif = HALF_PI - angleMouse;
        let pmouseDif = HALF_PI - anglePMouse;
        for (let i = 0; i < nbLines; i++) {
            let axisAngle = i * deltaAngle + HALF_PI;
            let mx = mouseDist * cos(axisAngle + mouseDif);
            let my = mouseDist * sin(axisAngle +  mouseDif);
            let pmx = pmouseDist * cos(axisAngle + pmouseDif);
            let pmy = pmouseDist * sin(axisAngle + pmouseDif);
            line(originX + pmx, originY + pmy, originX + mx, originY + my);
            // circle(originX + mx, originY + my, radius);
            mx = mouseDist * cos(axisAngle - mouseDif);
            my = mouseDist * sin(axisAngle - mouseDif);
            pmx = pmouseDist * cos(axisAngle - pmouseDif);
            pmy = pmouseDist * sin(axisAngle - pmouseDif);
            line(originX + pmx, originY + pmy, originX + mx, originY + my);
            // circle(originX + mx, originY + my, radius);
        }
        pop();
    }
}

function mousePressed() {
    originX = mouseX;
    originY = mouseY;
}

function mouseReleased() {
    originX = undefined;
    originY = undefined;
    originalAngle = undefined;
}