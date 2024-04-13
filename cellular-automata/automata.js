class Automata {
    zoom = 8;
    width;
    height;
    delay = 50;
    ticks = 0;
    lastTime;
    deltas = [];
    colors = [
        [0,   0,   0  ],
        [255, 255, 255],
    ];

    constructor() {
        this.width = Math.floor(window.innerWidth / this.zoom);
        this.height = Math.floor(window.innerHeight / this.zoom);
        
        const size = this.width * this.height;
        this.state = Array(size);
        this.nextState = Array(size);
        this.oldState = Array(size);

        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext("2d", { alpha: false });
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.img = new ImageData(this.width, this.height);
        this.img.data.forEach((_, i) => this.img.data[i] = 255);
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
        this.iterate((i,x,y) => this.nextState[i] = this.nextValue(x,y));
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

    getNeighbors(x, y) {
        return [
            this.get(x-1,y-1),
            this.get(x  ,y-1),
            this.get(x+1,y-1),
            this.get(x-1,y  ),
            this.get(x+1,y  ),
            this.get(x-1,y+1),
            this.get(x  ,y+1),
            this.get(x+1,y+1),
        ];
    }
    
    print() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.iterate((i,x,y) => {
            let color = this.colors[this.get(x,y)];
            let i4 = i*4;
            this.img.data[i4  ] = color[0];
            this.img.data[i4+1] = color[1];
            this.img.data[i4+2] = color[2];
        });
        this.ctx.putImageData(this.img, 0, 0);
    }
    
    set(x, y, value = 1) {
        x = (x + this.width) % this.width;
        y = (y + this.height) % this.height;
        let i = x + this.width * y;
        this.state[i] = value;
    }
    
    randomize() {
        this.ticks = 0;
        this.iterate(i => this.state[i] = Math.floor(this.colors.length*Math.random()));
    }
}
