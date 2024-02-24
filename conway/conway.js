class Conway {
    width;
    height;
    delay = 50;

    constructor(width, height) {
        this.width = width || 80;
        this.height = height || 24;
        const size = this.width * this.height;
        this.state = Array(size);
        this.nextState = Array(size);
    }

    run() {
        this.executeStep();
        this.loop();
    }

    loop() {
        if (this.delay) this.promise = new Promise(() => setTimeout(() => this.run(), this.delay));
    }

    executeStep() {
        this.iterate((i,x,y) => this.nextState[i] = this.isAlive(x,y));
        this.iterate(i => this.state[i] = this.nextState[i]);
        this.print();
    }
    
    isAlive(x, y) {
        let current = this.get(x, y);
        let liveNeighbors = this.liveNeighbors(x, y);
        return liveNeighbors == 3 || (current && liveNeighbors == 2);
    }

    liveNeighbors(x, y) {
        let liveNeighbors = 0;
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if ((i != 0 || j != 0) && this.get(x + i, y + j)) liveNeighbors++;
            }
        }
        return liveNeighbors;
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
        x = (x + this.width) % this.width;
        y = (y + this.height) % this.height;
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
    
    set(x, y, value = true) {
        x = (x + this.width) % this.width;
        y = (y + this.height) % this.height;
        let i = x + this.width * y;
        this.state[i] = value;
    }
    
    randomize(factor = 0.3) {
        this.iterate(i => this.state[i] = Math.random() < factor);
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
    conway.run();
}
