class Conway extends Automata {

    nextValue(x, y) {
        let liveNeighbors = this.liveNeighbors(x, y);
        let isAlive = liveNeighbors == 3 || (liveNeighbors == 2 && this.get(x, y));
        return isAlive ? 1 : 0;
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
    
    randomize(factor) {
        if (!factor) factor = 0.1 + 0.6 * Math.random();
        this.ticks = 0;
        this.iterate(i => this.state[i] = Math.random() < factor ? 1 : 0);
    }
}

let conway = new Conway();
conway.randomize();
conway.start();
