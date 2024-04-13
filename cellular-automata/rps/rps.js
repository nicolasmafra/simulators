class Rps extends Automata {

    zoom = 20;
    delay = 200;

    colors = [
        [255, 127, 127],
        [127, 255, 127],
        [127, 127, 255],
    ];

    nextValue(x, y) {
        let t = this.get(x, y);
        let total = this.totalNeighbors(x, y, t);
        return total > 0 ? ((total + 1) % this.colors.length) : total;
    }

    totalNeighbors(x, y, t) {
        return this.getRel(x  ,y-1,t)
            +  this.getRel(x-1,y  ,t)
            +  this.getRel(x+1,y  ,t)
            +  this.getRel(x  ,y+1,t);
    }

    getRel(x, y, t) {
        return (this.colors.length + t - this.get(x, y)) % this.colors.length;
    }
    
    randomize(factor) {
        if (!factor) factor = 0.1 + 0.6 * Math.random();
        this.ticks = 0;
        this.iterate(i => this.state[i] = Math.random() < factor ? 1 : 0);
    }
}

let conway = new Rps();
conway.randomize();
conway.start();
