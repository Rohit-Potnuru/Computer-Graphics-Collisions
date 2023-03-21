//import {pacMan} from "./shapes/PacMan.js"

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const TOTALBALL = [];
const TOTALPACMAN = [];
const TOTALWALL = [];
const TOTALRECTANGLE = [];

let FRICTION = 0.01;
let ELASTICITY = 1;
let LEFT, UP, RIGHT, DOWN;
let WIDTH = 1000;
let HEIGHT = 900;

function round(number, precision) {
    let factor = 10 ** precision;
    return Math.round(number * factor);
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vec) {
        return new Vector(this.x + vec.x, this.y + vec.y);
    }

    sub(vec) {
        return new Vector(this.x - vec.x, this.y - vec.y);
    }

    mul(val) {
        return new Vector(this.x * val, this.y * val);
    }

    mag() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    unit() { 
        if(this.mag() == 0)
            return new Vector(0, 0);
        else
            return new Vector(this.x/this.mag(), this.y/this.mag());
    }

    normal() {
        return new Vector(-this.y, this.x).unit();
    }

    static dot(vec1, vec2) {
        return vec1.x * vec2.x + vec1.y * vec2.y;
    }

    drawVector(start_x, start_y, n = 1,  color = "white") {
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

class BALL {
    constructor(x, y, r, mass = 1, color = "yellow") {
        this.pos = new Vector(x, y);
        this.r = r; 
        this.mass = mass;
        this.inverseMass = 0;
        if(mass != 0)
            this.inverseMass = 1/mass;
        this.color = color;

        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
        this.acceleration = 1;
        this.player = false;
        TOTALBALL.push(this);
    }

    reposition() {
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mul(1 - FRICTION);
        this.pos = this.pos.add(this.vel);

        this.pos.x = (this.pos.x + WIDTH)% WIDTH;
        this.pos.y = (this.pos.y + HEIGHT)% HEIGHT;
    }
    drawBall() {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
        
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
    }

    display() {
        this.acc.drawVector(this.pos.x, this.pos.y, 100, "white");
        this.vel.drawVector(this.pos.x, this.pos.y, 10, "red");

        // ctx.beginPath();
        // ctx.arc(800, 800, 40, 0, 2 * Math.PI);
        // ctx.fillStyle = "white";
        // ctx.fill();
        // ctx.strokeStyle = "black";
        // ctx.stroke();
        // this.acc.drawVector(800, 800, 10, "white");
        // this.vel.drawVector(800, 800, 20, "red");   
    }


}

class WALL {
    constructor(x1, y1, x2, y2, color = "yellow") {
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2, y2);
        this.color = color;

        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
        this.acceleration = 1;
        this.player = false;
        TOTALWALL.push(this);
    }

    drawWall() {
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
    }

    wallUnit() {
        return this.end.sub(this.start).unit();
    }
}

class RECTANGLE {
    constructor(x1, y1, x2, y2, color = "brown") {
        this.pos1 = new Vector(x1, y1);
        this.pos2 = new Vector(x2, y2);
        this.color = color;

        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
        this.acceleration = 1;
        this.player = false;
        TOTALRECTANGLE.push(this);
    }

    drawShape() {
        ctx.beginPath();
        ctx.fillRect(this.pos1.x, this.pos1.y, this.pos2.x, this.pos2.y);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
}

class PacMan {
    constructor(x, y, r, color = "yellow") {
        this.pos = new Vector(x, y);
        this.r = r;
        this.color = color;
        this.mouthAngle = Math.PI/10;
        this.state = 0;
        this.speed = 10;

        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
        this.acceleration = 1;
        this.player = false;

        TOTALPACMAN.push(this);
    }

    drawPacMan() {
        let dir = 0;
        if(this.vel.mag() != 0) {
            dir = Math.acos(this.vel.x/this.vel.mag());
            if (this.vel.y < 0)
                dir = -dir;
        }

        ctx.beginPath();
        let angle = (this.state/this.speed)  * this.mouthAngle;
        ctx.arc(this.pos.x, this.pos.y, this.r, dir + angle, dir + 2 * Math.PI - angle);
        ctx.lineTo(this.pos.x - 5, this.pos.y);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.fill();
        this.state = (this.state + 1)% (3 * this.speed);
    }
}

class pacEater {
    constructor(x, y, r, color = "yellow") {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
        this.mouthAngle = Math.PI/5;

        this.vel = [0, 0, 0];
        this.acc = [0, 0, 0];
        this.acceleration = 1;
        this.player = false;
    }

    drawPacMan() {
        ctx.beginPath();

        ctx.beginPath();
        ctx.moveTo(this.x, this.y); //83, 116);
        ctx.lineTo(83, 102);
        ctx.bezierCurveTo(83, 94, 89, 88, 97, 88);
        ctx.bezierCurveTo(105, 88, 111, 94, 111, 102);
        ctx.lineTo(111, 116);
        ctx.lineTo(106.333, 111.333);
        ctx.lineTo(101.666, 116);
        ctx.lineTo(97, 111.333);
        ctx.lineTo(92.333, 116);
        ctx.lineTo(87.666, 111.333);
        ctx.lineTo(83, 116);

        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}


function detectSphereToRectangleCollision (s1, r1) {
    if(s1.r + s2.r >= s1.pos.sub(s2.pos).mag())
        return true;
    else
        return false;
}

//BALL - BALL Functions 
function detectSphereToSphereCollision (s1, s2) {
    if(s1.r + s2.r >= s1.pos.sub(s2.pos).mag())
        return true;
    else
        return false;
}

function transformSphereToSpherePentration (s1, s2) {
    let dist = s1.pos.sub(s2.pos);
    let depth = s1.r + s2.r - dist.mag();
    let normal = dist.unit().mul(depth/2);
    s1.pos = s1.pos.add(normal);
    s2.pos = s2.pos.add(normal.mul(-1));
}

function transformSphereToSphereCollision (s1, s2) {
    let dist = s1.pos.sub(s2.pos).unit();
    let relVel = s1.vel.sub(s2.vel);
    let proj = Vector.dot(dist, relVel);
    let newProj = -proj * (ELASTICITY + 1)/(s1.inverseMass + s2.inverseMass);

    s1.vel = s1.vel.add(dist.mul(newProj).mul(s1.inverseMass));
    s2.vel = s2.vel.add(dist.mul(-newProj).mul(s2.inverseMass));
}

//BALL - WALL Functions 
function shortestPointSphereToWall (s1, w1) {
    let ballToWallStart = w1.start.sub(s1.pos);
    if(Vector.dot(ballToWallStart, w1.wallUnit()) > 0) 
        return w1.start;
        
    let wallToBallStop = s1.pos.sub(w1.end);
    if(Vector.dot(wallToBallStop, w1.wallUnit()) > 0)
        return w1.end;

    let closestDist = Vector.dot(ballToWallStart, w1.wallUnit());
    let closestVect = w1.wallUnit().mul(closestDist);
    return w1.start.sub(closestVect);
}

function detectSphereToWallCollision (s1, w1) {
    if(shortestPointSphereToWall(s1, w1).sub(s1.pos).mag() <= s1.r)
        return true;
    else
        return false;
}

function transformSphereToWallPentration (s1, w1) {
    let dist = shortestPointSphereToWall(s1, w1).sub(s1.pos);
    let depth = dist.mag() - s1.r;
    let normal = dist.unit().mul(depth);
    s1.pos = s1.pos.add(normal);
}

function transformSphereToWallCollision (s1, w1) {
    let normal = s1.pos.sub(shortestPointSphereToWall(s1, w1)).unit();
    let sepVel = Vector.dot(normal, s1.vel);
    let newSepVel = -sepVel * ELASTICITY;
    let vsepDiff = sepVel - newSepVel;
    s1.vel = s1.vel.add(normal.mul(-vsepDiff));
}


function keyControl(b) {

    canvas.addEventListener("keydown", (e) => {
        if(e.keyCode === 37) {
            LEFT = true;
        }
        if(e.keyCode === 38) {
            UP = true;
        }
        if(e.keyCode === 39) {
            RIGHT = true;
        }
        if(e.keyCode === 40) {
            DOWN = true;
        }
        //console.log(e.keyCode, e.key);
    });
    
    canvas.addEventListener("keyup", (e) => {
        if(e.keyCode === 37) {
            LEFT = false;
        }
        if(e.keyCode === 38) {
            UP = false;
        }
        if(e.keyCode === 39) {
            RIGHT = false;
        }
        if(e.keyCode === 40) {
            DOWN = false;
        }
    });
    
    function move() {
        if(LEFT)
            b.acc.x = -b.acceleration;
        if(RIGHT)
            b.acc.x = b.acceleration;
        if(UP)
            b.acc.y = -b.acceleration;
        if(DOWN)
            b.acc.y = b.acceleration;
        if(!RIGHT && !LEFT)
            b.acc.x = 0;
        if(!UP && !DOWN)
            b.acc.y = 0;

    }
    move();
}


function repeatOften() {
    //Clearing the whole canvas
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    //Loading Ball
    TOTALBALL.forEach((b, index) => {
        
        if(b.player) {
            keyControl(b);
            b.display();
        }
        //BALL - BALL Collisions
        for(let i = index + 1; i < TOTALBALL.length; i++) {
            if (detectSphereToSphereCollision(b, TOTALBALL[i])) {
                transformSphereToSpherePentration(b, TOTALBALL[i]);
                transformSphereToSphereCollision(b, TOTALBALL[i]);
            }
        }

        //BALL - WALL
        for(let i = 0; i < TOTALWALL.length; i++) {
            if(detectSphereToWallCollision(b, TOTALWALL[i])) {
                transformSphereToWallPentration(b, TOTALWALL[i]);
                transformSphereToWallCollision(b, TOTALWALL[i]);
            }
        }
        b.drawBall();
        b.reposition();

    });

    TOTALWALL.forEach((w, index) => {
        w.drawWall();
    });

    TOTALRECTANGLE.forEach((r) => {
        r.drawShape();
        if(r.player) {
            keyControl(r);
        }
    });

    TOTALPACMAN.forEach((p) => {
        p.drawPacMan();
        if(p.player) {
            keyControl(p);
        }
    });

    requestAnimationFrame(repeatOften);
}




let BALL2 = new BALL(400, 100, 100, 1000000, "red");


let WALL2 = new WALL(0, HEIGHT, WIDTH, HEIGHT);
let WALL3 = new WALL(WIDTH, HEIGHT, WIDTH, 0);
let WALL4 = new WALL(WIDTH, 0, 0, 0);



let colors = ["red", "pink", "brown", "green", "violet", "black", "orange", "white"]
for(let i = 0; i < 700; i++) {
    let BALL3 = new BALL(i*10, i*10, 3, 100, colors[i%colors.length]);
}

BALL2.player = true;

// let RECTANGLE1 = new RECTANGLE(40, 40, 900, 49, "red");


//let PacMan1 = new PacMan(400, 250, 40);
//PacMan1.player = false;








requestAnimationFrame(repeatOften);