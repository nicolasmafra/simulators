const dataLength = 4;
const NEUTRAL = 1;
const POSITIVE = 2;
const NEGATIVE = 3;
const X1 = 0;
const X2 = 1;
const Y1 = 2;
const Y2 = 3;

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
        this.parity = Math.random() < 0.5;
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
        let x1 = this.get(x, y, X1);
        let x2 = this.get(x, y, X2);
        let y1 = this.get(x, y, Y1);
        let y2 = this.get(x, y, Y2);

        if (x1 == NEUTRAL && x2 == NEUTRAL) {
            this.change(0, 0, this.typeParity(0), this.typeParity(1));
        }
        if (y1 == NEUTRAL && y2 == NEUTRAL) {
            this.change(this.typeParity(0), this.typeParity(1), 0, 0);
        }
        if (x1 == this.typeParity(1) && x2 == this.typeParity(0)) {
            this.change(0, 0, NEUTRAL, NEUTRAL);
        }
        if (y1 == this.typeParity(1) && y2 == this.typeParity(0)) {
            this.change(NEUTRAL, NEUTRAL, 0, 0);
        }
    }

    change(x, y, x1, x2, y1, y2) {
        this.set(x, y, X1, x1);
        this.set(x, y, X2, x2);
        this.set(x, y, Y1, y1);
        this.set(x, y, Y2, y2);
    }

    typeParity(flip) {
        return flip
            ? (this.parity ? NEGATIVE : POSITIVE)
            : (this.parity ? POSITIVE : NEGATIVE);
    }

    copy() {
        for (var i = 0; i < this.state.length; i++) {
            this.state[i] = this.nextState[i];
        }
    }

    translate(n, x, y) {
        this.nextState[n  ] = this.get(x-1, y  , 0);
        this.nextState[n+1] = this.get(x+1, y  , 1);
        this.nextState[n+2] = this.get(x  , y-1, 2);
        this.nextState[n+3] = this.get(x  , y+1, 3);
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
        let i = dataLength * (x + this.width * y);
        this.nextState[i + dir] = type;
    }
    
    randomize(factor = 0.001) {
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
