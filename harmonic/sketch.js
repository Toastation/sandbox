let sketch1D = new p5((sketch) => {
  const WIDTH = 800;
  const HEIGHT = 400;

  let plot;
  let nbData = 50;
  let points = [];
  let fixed = [];
  let colors = [];
  let sizes = [];
  let t = 0;
  let dtAcc = 0;
  let ups = 40;
  let y0 = 15;

  let slider;

  sketch.setup = function() {
    let canvas = sketch.createCanvas(WIDTH, HEIGHT);
    canvas.parent("harmo1d");
    sketch.frameRate(60);

    resetData();

    plot = new GPlot(sketch);
    plot.setPos(0, 0);
    plot.setDim(350, 300);
    plot.setPoints(points);
    plot.updateLimits();

    colors = Array(nbData).fill(sketch.color(255, 0, 255, 255));
    colors.forEach((e, i) => {
      if (fixed[i]) colors[i] = sketch.color(100, 0, 255, 255);
    });
    sizes = Array(nbData).fill(6);
    sketch.textSize(16);
    slider = sketch.createSlider(0, 30, y0, 1);
    let d1 = sketch.createDiv("Y0: ")
    d1.parent("slider1d");
    slider.parent(d1);
  };

  sketch.draw = function() {
    sketch.background(255);

    drawPlot(plot);

    y0 = slider.value();

    // update points
    if (ups == 0) return;
    if (dtAcc > (1000 / ups)) {
      diffusionUpdate();
      dtAcc = 0;
      t += 1;
    }
    if (t >= 100) 
      resetData();
    dtAcc += sketch.deltaTime;
  };

  function diffusionUpdate() { 
    let newValues = Array.from(points);
    for (var i = 0; i < nbData; i++) {
      if (fixed[i]) {
        newValues[i].y = points[i].y;
        continue;
      }
      if (i == 0)
        newValues[i].y = points[i+1].y / 2;
      else if (i == nbData-1)
        newValues[i].y = points[i-1].y / 2;
      else 
        newValues[i].y = (points[i-1].y + points[i+1].y) / 2;
    }
    points = newValues;
    plot.setPoints(points);
  }

  function resetData() {
    points = new Array(nbData).fill().map((e, i) => {
      return new GPoint(i, y0);
    });
    fixed[0] = true;
    points[0].y = 0;
    fixed[nbData-1] = true;
    points[nbData-1].y = 30;
    // fixed[Math.trunc(nbData/2)] = true;
    // points[Math.trunc(nbData/2)].y = 30;
    t = 0;
  }

  function drawPlot(p) {
    p.beginDraw();
    p.drawXAxis();
    p.drawYAxis();
    p.setPointColors(colors);
    p.setPointSizes(sizes);
    p.getMainLayer().drawPoints();
    p.endDraw();
  }
});