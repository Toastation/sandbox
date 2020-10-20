let sketch1DSlow = new p5((sketch) => {
    const WIDTH = 800;
    const HEIGHT = 400;
  
    let plot;
    let nbData = 50;
    let points = [], pointsBuffer = [];
    let fixed = [];
    let colors = [], colorsBuffer = [];
    let sizes = [];
    let t = 0, it = 0;
    let dtAcc = 0;
    let ups = 20;
  
    sketch.setup = function() {
      let canvas = sketch.createCanvas(WIDTH, HEIGHT);
      canvas.parent("harmo1dslow");
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
      colorsBuffer = Array.from(colors);
      sizes = Array(nbData).fill(6);
      sketch.textSize(16);
    };
  
    sketch.draw = function() {
      sketch.background(255);
  
      colorsBuffer[t] = sketch.color(0, 200, 200, 255);
      sizes[t] = 10;
      drawPlot(plot);
      sizes[t] = 6;
      colorsBuffer[t] = colors[t];
  
      // update points
      if (ups == 0) return;
      if (t >= 50) {
        t = 0;
        points = pointsBuffer.slice();
        if (it >= 10) {
          resetData();
          it = 0;
        }
        else
          it++;
      }
      if (dtAcc > (1000 / ups)) {
        diffusionUpdate();
        dtAcc = 0;
        t += 1;
      }
      dtAcc += sketch.deltaTime;
    };
  
    function diffusionUpdate() { 
      var newPoint = new GPoint(points[t].x, points[t].y);
      if (fixed[t]) {
        newPoint.y = points[t].y;
        return;
      }
      if (t == 0)
        newPoint.y = points[t+1].y / 2;
      else if (t== nbData-1)
        newPoint.y = points[t-1].y / 2;
      else 
        newPoint.y = (points[t-1].y + points[t+1].y) / 2;
      pointsBuffer[t] = newPoint;
      plot.setPoint(t, newPoint);
    }
  
    function resetData() {
      points = new Array(nbData).fill().map((e, i) => {
        return new GPoint(i, 0);
      });
      pointsBuffer = Array.from(points);
      fixed[0] = true;
      fixed[nbData-1] = true;
      fixed[Math.trunc(nbData/2)] = true;
      points[Math.trunc(nbData/2)].y = 30;
      t = 0;
    }

    function drawPlot(p) {
      p.beginDraw();
      p.drawXAxis();
      p.drawYAxis();
      p.setPointColors(colorsBuffer);
      p.setPointSizes(sizes);
      p.getMainLayer().drawPoints();
      p.endDraw();
    }
  });