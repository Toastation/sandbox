let sketch2D = new p5((sketch) => {
    const WIDTH = 400;
    const HEIGHT = 400;
    const GW = 10, GH = 10;
    const CW = WIDTH/GW, CH = HEIGHT/GH;

    let grid;
    let fixed;
    let colors;
    let t = 0, dtAcc = 0;
  
    sketch.setup = function() {
      let canvas = sketch.createCanvas(WIDTH, HEIGHT);
      canvas.parent("harmo2d");
      sketch.frameRate(60);

      initGrid();
      colors = d3.range(20).map(i => d3.interpolatePlasma(sketch.norm(i, 0, 20)))
      sketch.textFont("Consolas")
      sketch.textSize(14);
    };
  
    sketch.draw = function() {
      sketch.background(255);
      sketch.strokeWeight(1);
      for (var i = 0; i < GH; i++) {
        for (var j = 0; j < GW; j++) {
          sketch.fill(colors[Math.ceil(sketch.map(grid[i][j], 0, 1, 0, 19))]);
          sketch.rect(j*CW, i*CH, CW, CH);
        }
      }

      if (insideWindow(sketch.mouseX, sketch.mouseY)) {
        sketch.fill(255);
        sketch.strokeWeight(0);
        sketch.textAlign(sketch.CENTER);
        sketch.text(sketch.str(sketch.round(grid[Math.ceil(sketch.mouseX/CW)-1][Math.ceil(sketch.mouseY/CH)-1], 2)), sketch.mouseX, sketch.mouseY);
      }

      if (dtAcc > 200) {
        updateGrid();
        t++;
        dtAcc = 0;
      }
      if (t >= 60) {
        t = 0;
        initGrid();
      }
      dtAcc += sketch.deltaTime;
    };

    function initGrid() {
      // create grid and set default values
      grid = new Array(GH);
      fixed = new Array(GH);
      for (var i = 0; i < GH; i++) {
        grid[i] = new Float32Array(GW);
        fixed[i] = new Array(GW);
        for (var j = 0; j < GW; j++) {
          grid[i][j] = 0.0;
          fixed[i][j] = false;
        }
      }
      // set contraints 
      for (var i = 0; i < GH; i++) {
        grid[i][0] = 1.0;
        grid[i][GW-1] = .5;
        fixed[i][0] = true;
        fixed[i][GW-1] = true;
      }
      for (var j = 0; j < GW; j++) {
        grid[0][j] = 1.0;
        grid[GH-1][j] = .5;
        fixed[0][j] = true;
        fixed[GH-1][j] = true;
      }
    } 

    function updateGrid() {
      let di = [-1, 1, 0, 0];
      let dj = [0, 0, 1, -1];
      // create buffer
      let buffer = [];
      for (var i = 0; i < GH; i++)
        buffer[i] = grid[i].slice(); 
      // compute and set avg of each cell
      for (var i = 0; i < GH; i++) {
        for (var j = 0; j < GW; j++) {
          if (fixed[i][j]) continue;
          var nbNeighbors = 0;
          var tot = 0;
          for (var k = 0; k < 4; k++) {
            if (inside(i+di[k], j+dj[k])) {
              nbNeighbors++;
              tot += buffer[i+di[k]][j+dj[k]];
            }
          }
          tot /= nbNeighbors;
          grid[i][j] = tot;
        }
      }
    }

    function inside(i, j) {
      return i >= 0 && i < GH && j >= 0 && j < GW;
    }

    function insideWindow(x, y) {
      return x > 0 && x < WIDTH && y > 0 && y < HEIGHT;
    }

});