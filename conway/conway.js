class Conway {
    width;
    height;
    delay = 50;
    ticks = 0;
    lastTime;
    deltas = [];

    constructor(width, height) {
        this.width = width || 80;
        this.height = height || 24;
        const size = this.width * this.height;
        this.state = Array(size);
        this.nextState = Array(size);
        this.oldState = Array(size);
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
        this.iterate((i,x,y) => this.nextState[i] = this.isAlive(x,y) ? 1 : 0);
        this.nextState.forEach((v,i) => this.state[i] = v);
        this.print();

        if (this.ticks % 20 == 1) {
            if (this.state.find((v,i) => v != this.oldState[i]) === undefined) {
                this.randomize();
            }
            this.state.forEach((v,i) => this.oldState[i] = v);
        }
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
    
    isAlive(x, y) {
        let liveNeighbors = this.liveNeighbors(x, y);
        return liveNeighbors == 3 || (liveNeighbors == 2 && this.get(x, y));
    }

    liveNeighbors(x, y) {
        return this.get(x-1,y-1)
            +  this.get(x  ,y-1)
            +  this.get(x+1,y-1)
            +  this.get(x-1,y  )
            +  this.get(x+1,y  )
            +  this.get(x-1,y+1)
            +  this.get(x  ,y+1)
            +  this.get(x+1,y+1);
    }
    
    iterate(fn) {
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                let i = x + this.width * y;
                fn(i,x,y);
            }
        }
    }
    
    get(x, y) {
        if (x < 0 || x >= this.width) x = (x + this.width) % this.width;
        if (y < 0 || y >= this.height) y = (y + this.height) % this.height;
        return this.state[x + this.width * y];
    }
    
    print() {
        let text = '\u001b[2J\u001b[0;0H';
        this.iterate((i,x) => {
            if (x == 0) text += '\n';
            text += this.state[i] ? '▆' : ' ';
        });
        console.log(text);
    }
    
    set(x, y, value = 1) {
        x = (x + this.width) % this.width;
        y = (y + this.height) % this.height;
        let i = x + this.width * y;
        this.state[i] = value;
    }
    
    randomize(factor) {
        if (!factor) factor = 0.1 + 0.6 * Math.random();
        this.ticks = 0;
        this.iterate(i => this.state[i] = Math.random() < factor ? 1 : 0);
    }
    
    glider() {
        this.set(1, 0);
        this.set(2, 1);
        this.set(0, 2);
        this.set(1, 2);
        this.set(2, 2);
    }
}

if (require) {
    let conway = new Conway();
    conway.randomize();
    conway.start();
}
