class Cam {

    constructor(x, y, fov) {
        this.pos = createVector(x, y);
        this.angle = 0;
        this.dir = p5.Vector.fromAngle(this.angle);
        this.rays = [];
        this.nbRays = 400;
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

    setAngle(angle) {
        this.angle = angle;
        this.dir = p5.Vector.fromAngle(radians(this.angle));
        const angleDelta = this.fov / this.nbRays;
        let index = 0;
        for (let i = this.angle - this.fov / 2; i < this.angle + this.fov / 2; i += angleDelta) {
            this.rays[index].setAngle(i);
            index++;
        }
    }

    setPos(x, y) {
        this.pos.x = x;
        this.pos.y = y;
        this.updateRayPos();
    }

    initRays() {
        const angleDelta = this.fov / this.nbRays;
        this.rays.splice(0, this.rays.length);
        for (let i = this.angle - this.fov / 2; i < this.angle + this.fov / 2; i += angleDelta) {
            this.rays.push(new Ray(this.pos.x, this.pos.y, i));
        }
    }

    updateRayPos() {
        for (let ray of this.rays) {
            ray.setPos(this.pos.x, this.pos.y);
        }
    }

    rotate(amount) {
        this.angle += amount;
        this.setAngle(this.angle);
    }

    move(speed) {
        let speedVec = p5.Vector.fromAngle(radians(this.angle));
        this.pos.add(speedVec.setMag(speed));
        this.updateRayPos();
    }

    update() {
        if (keyIsDown(LEFT_ARROW)) {
            this.rotate(-2);
        } else if (keyIsDown(RIGHT_ARROW)) {
            this.rotate(2);
        }
        if (keyIsDown(UP_ARROW)) {
            this.move(4);
        } else if (keyIsDown(DOWN_ARROW)) {
            this.move(-4);
        }
    }

    cast(walls) {
        for (let ray of this.rays) {
            let shortestDist = Infinity;
            let closestPoint;
            for (let wall of walls) {
                let intersection = ray.getIntersection(wall);
                if (!intersection) continue;
                let distance = this.pos.dist(intersection);
                if (distance < shortestDist) {
                    shortestDist = distance;
                    closestPoint = intersection;
                }
            }
            if (closestPoint) {
                strokeWeight(1);
                fill(255);
                line(this.pos.x, this.pos.y, closestPoint.x, closestPoint.y);
            }
        }
    }

    render() {
        fill(255);
        ellipse(this.pos.x, this.pos.y, 5, 5);
        push();
        strokeWeight(2);
        stroke(255, 0, 0);
        translate(this.pos.x, this.pos.y);
        line(0, 0, this.dir.x * 10, this.dir.y * 10);
        pop();
    }
}