class Cam {

    constructor(x, y, fov) {
        this.pos = createVector(x, y);
        this.angle = 0;
        this.dir = p5.Vector.fromAngle(this.angle);
        this.rays = [];
        this.nbRays = 40;
        this.setFov(fov);
    }

    setFov(fov) {
        this.fov = fov;
        this.initRays();
    }

    setNbRays(nbRays) {
        this.nbRays = nbRays;
        this.initRays();
    }

    initRays() {
        const angleDelta = this.fov / this.nbRays;
        this.rays.splice(0, this.rays.length);
        for (let i = this.angle - this.fov / 2; i < this.angle + this.fov / 2; i += angleDelta) {
            this.rays.push(new Ray(this.pos.x, this.pos.y, i));
        }
    }

    render() {
        ellipse(this.pos.x, this.pos.y, 5, 5);
    }

}