const dataLength = 4;
const NEUTRAL = 1;
const POSITIVE = 2;
const NEGATIVE = 3;
const X1 = 0;
const X2 = 1;
const Y1 = 2;
const Y2 = 3;
const parityMod = 3;

class Particle {
    width;
    height;
    delay = 50;
    ticks = 0;
    lastTime;
    deltas = [];

    constructor(width, height) {
        this.width = width || 80;
        this.height = height || 24;
        this.size = dataLength * this.width * this.height;
        this.state = Array(this.size);
        this.nextState = Array(this.size);
    }

    start() {
        this.lastTime = new Date();
        this.loop();
    }

    loop() {
        this.executeStep();
        this.promise = new Promise(() => setTimeout(() => this.loop(), this.delay));
    }

    executeStep() {
        this.log();
        this.typeParity = Math.random() < 0.5;
        this.positionParity = Math.floor(parityMod*Math.random());
        this.iterate((n,x,y) => this.translate(n,x,y));
        this.copy();
        this.iterate((n,x,y) => this.update(n,x,y));
        this.copy();
        this.print();
    }

    log() {
        this.ticks++;
        let now = new Date();
        let delta = now - this.lastTime;
        this.lastTime = now;
        this.deltas.push(delta);
        if (this.deltas.length > 60) this.deltas.shift();
        let avg = this.deltas.reduce((a, b) => a + b, 0) / this.deltas.length;
        if (this.ticks % 60 == 0) {
            console.log('avg delta: ' + Math.floor(avg*10)/10);
        }
    }

    update(n, x, y) {
        let parity = this.getPositionParity(n);
        let x1 = this.get(x, y, X1);
        let x2 = this.get(x, y, X2);
        let y1 = this.get(x, y, Y1);
        let y2 = this.get(x, y, Y2);

        if (!parity) {
            if (x1 && x2) this.change(x, y, x2, x1,  0,  0);
            if (y1 && y2) this.change(x, y,  0,  0, y2, y1);
            if (x1 && y1) this.change(x, y, y1, x1,  0,  0);
            if (y1 && x2) this.change(x, y,  0, y1, x2,  0);
            if (x2 && y2) this.change(x, y,  0,  0, y2, x2);
            if (y2 && x1) this.change(x, y, y2,  0,  0, x1);
        }

        if (!parity && x1 == NEUTRAL && x2 == NEUTRAL) {
            this.change(x, y, 0, 0, this.getTypeParity(0), this.getTypeParity(1));
        }
        if (!parity && y1 == NEUTRAL && y2 == NEUTRAL) {
            this.change(x, y, this.getTypeParity(0), this.getTypeParity(1), 0, 0);
        }
        if (parity && x1 == this.getTypeParity(1) && x2 == this.getTypeParity(0)) {
            this.change(x, y, 0, 0, NEUTRAL, NEUTRAL);
        }
        if (parity && y1 == this.getTypeParity(1) && y2 == this.getTypeParity(0)) {
            this.change(x, y, NEUTRAL, NEUTRAL, 0, 0);
        }
    }

    change(x, y, x1, x2, y1, y2) {
        this.set(x, y, X1, x1);
        this.set(x, y, X2, x2);
        this.set(x, y, Y1, y1);
        this.set(x, y, Y2, y2);
    }

    getTypeParity(flip) {
        return flip
            ? (this.typeParity ? NEGATIVE : POSITIVE)
            : (this.typeParity ? POSITIVE : NEGATIVE);
    }

    getPositionParity(n) {
        return n % parityMod == this.positionParity;
    }

    copy() {
        for (var i = 0; i < this.state.length; i++) {
            this.state[i] = this.nextState[i];
        }
    }

    translate(n, x, y) {
        let x1 = this.get(x, y, X1);
        let x2 = this.get(x, y, X2);
        let y1 = this.get(x, y, Y1);
        let y2 = this.get(x, y, Y2);

        this.set(x+this.speed(x1), y               , X1, x1);
        this.set(x-this.speed(x2), y               , X2, x2);
        this.set(x               , y+this.speed(y1), Y1, y1);
        this.set(x               , y-this.speed(y2), Y2, y2);
    }

    speed(type) {
        return 1;//type == NEUTRAL ? 2 : 1;
    }
    
    iterate(fn) {
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                let n = dataLength * (x + this.width * y);
                fn(n,x,y);
            }
        }
    }
    
    get(x, y, dir) {
        if (x < 0 || x >= this.width) x = (x + this.width) % this.width;
        if (y < 0 || y >= this.height) y = (y + this.height) % this.height;
        return this.state[dataLength * (x + this.width * y) + dir];
    }

    getByType(x, y, type) {
        return (this.get(x, y, X1) == type ? 1 : 0)
            + (this.get(x, y, X2) == type ? 1 : 0)
            + (this.get(x, y, Y1) == type ? 1 : 0)
            + (this.get(x, y, Y2) == type ? 1 : 0);
    }
    
    print() {
        let text = '\u001b[2J\u001b[0;0H';
        this.iterate((i,x) => {
            if (x == 0) text += '\n';
            text += this.state[i] ? '▆' : ' ';
        });
        console.log(text);
    }
    
    set(x, y, dir, type) {
        x = (x + this.width) % this.width;
        y = (y + this.height) % this.height;
        let n = dataLength * (x + this.width * y);
        this.nextState[n + dir] = type;
    }
    
    randomize(factor = 0.002) {
        for (var i = 0; i < this.size; i++) {
            let type = 1;//Math.floor(3 * Math.random());
            this.state[i] = Math.random() < factor ? type : 0;
        }
    }
}

if (require) {
    let conway = new Conway();
    conway.randomize();
    conway.start();
}
