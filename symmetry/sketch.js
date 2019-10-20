var nbLines = 5, nbLinesMax = 50, nbLinesMin = 1;
let originX = undefined;
let originY = undefined;

function setup() {
    width = windowWidth / 1.25;
    height = windowHeight / 1.25;
    colors = [color(255, 0, 0), color(0, 255, 0), color(0, 0, 255), color(255, 0, 255), color(255, 255, 0)];
    let canvas = createCanvas(width, height);
    canvas.parent("sketch");
    document.addEventListener('contextmenu', function(e) { if (e.button == 2) e.preventDefault(); });
    let div = createDiv();
    label = createP("Number of lines : "+nbLines);
    slider = createSlider(1, 50, 5);
    slider.input(function () {nbLines = slider.value(); label.html("Number of lines : "+nbLines);});
    div.child(label);
    div.child(slider);
}

function draw() {
    noStroke();
    stroke(255, 0, 0);
    if (mouseIsPressed && originX != undefined && originY != undefined) {
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
            mx = mouseDist * cos(axisAngle - mouseDif);
            my = mouseDist * sin(axisAngle - mouseDif);
            pmx = pmouseDist * cos(axisAngle - pmouseDif);
            pmy = pmouseDist * sin(axisAngle - pmouseDif);
            line(originX + pmx, originY + pmy, originX + mx, originY + my);
        }
    }
    stroke(255, 255, 255);
    strokeWeight(1);
    noFill();
    rect(0, 0, width-1, height-1);
}

function mousePressed() {
    if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height && mouseButton == LEFT) {
        originX = mouseX;
        originY = mouseY;
    } 
}

function mouseReleased() {
    originX = undefined;
    originY = undefined;
    originalAngle = undefined;
}