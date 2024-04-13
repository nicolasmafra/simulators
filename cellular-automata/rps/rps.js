class Rps extends Automata {

    colors = [
        [255, 100, 100],
        [100, 255, 100],
        [100, 100, 255],
    ];

    nextValue(x, y) {
        let t = this.get(x, y);
        let beaten = (t + 1) % this.colors.length;
        let beatenCount = this.getNeighbors(x, y).filter(k => k == beaten).length;
        return beatenCount > 2 ? beaten : t;
    }
}

let conway = new Rps();
conway.randomize();
conway.start();
