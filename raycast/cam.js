class Cam {

    constructor(x, y, fov) {
        this.pos = createVector(x, y);
        this.angle = 0;
        this.dir = p5.Vector.fromAngle(this.angle);
        this.rays = [];
        this.intersections = [];
        this.nbRays = 400;
        this.setFov(fov);
        this.fishEye = false;
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
        for (let i = 0; i < this.nbRays; i++) {
            this.rays[i].setAngle(map(i, 0, this.nbRays-1, this.angle - this.fov / 2, this.angle + this.fov / 2));
        }
    }

    setPos(x, y) {
        this.pos.x = x;
        this.pos.y = y;
        this.updateRayPos();
    }

    toggleFishEye() {
        this.fishEye = !this.fishEye;
    }

    initRays() {
        this.rays.splice(0, this.rays.length);
        for (let i = 0; i < this.nbRays; i++) {
            this.rays.push(new Ray(this.pos.x, this.pos.y, map(i, 0, this.nbRays-1, this.angle - this.fov / 2, this.angle + this.fov / 2)));            
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
        for (let i = 0; i < this.nbRays; i++) {
            let ray = this.rays[i];
            let shortestDist = Infinity;
            let closestPoint;
            for (let wall of walls) {
                let intersection = ray.getIntersection(wall);
                if (!intersection) continue;
                let distance = this.pos.dist(intersection);
                if (!this.fishEye) distance *= cos(ray.dir.heading() - this.dir.heading());
                if (distance < shortestDist) {
                    shortestDist = distance;
                    closestPoint = intersection;
                }
            }
            this.intersections[i] = shortestDist;
            if (closestPoint) {
                strokeWeight(1);
                stroke(255, 255, 255, 10);
                line(this.pos.x, this.pos.y, closestPoint.x, closestPoint.y);
                stroke(255, 255, 255);
                strokeWeight(2);
                point(closestPoint.x, closestPoint.y);
                stroke(255);
            }
        }
    }

    renderTopView() {
        fill(255);
        ellipse(this.pos.x, this.pos.y, 5, 5);
        push();
        strokeWeight(2);
        stroke(255, 0, 0);
        translate(this.pos.x, this.pos.y);
        line(0, 0, this.dir.x * 10, this.dir.y * 10);
        pop();
    }

    renderScene(sceneWidth, sceneHeight) {
        noStroke();
        rectMode(CENTER);
        const stripe = sceneWidth / this.nbRays;
        for (let i = 0; i < this.nbRays; i++) {
            let ratio = this.intersections[i] / sceneWidth;
            let height = 30 / ratio;
            if (height > sceneHeight) height = sceneHeight;
            fill(10 / ratio ** 2);
            rect((i + 0.5) * stripe, sceneHeight / 2, stripe, height);
        }
    }
}