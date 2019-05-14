class Wall {

    constructor(x1, y1, x2, y2) {
        this.a = createVector(x1, y1);
        this.b = createVector(x2, y2);
    }

    render() {
        strokeWeight(1);
        stroke(255);
        translate();
        line(this.a.x, this.a.y, this.b.x, this.b.y);
    }

}