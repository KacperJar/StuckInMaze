// States / States Machines:
var states = Object.freeze({
    ALIVE: 1,
    DEAD: 0
})

var movementStates = Object.freeze({
    IDLE: 0,
    WALKING: () => {

    },
    RUNNING: () => {

    }
})

// Classes:
class Angle {
    #deg;

    constructor(startDeg = 0) {
        this.#deg = startDeg;
    }

    static #roundify(deg) {
        let temp = deg % 360;
        if (temp < 0) temp = 360 + temp;
        return temp
    }

    getDeg() {
        return this.#deg
    }

    setDeg(deg) {
        deg = Angle.#roundify(deg);
        this.#deg = deg;
    }

    rotate(deg) {
        let temp = this.#deg;
        temp += deg;
        temp = Angle.#roundify(temp);
        this.#deg = temp;
    }
};

// Globals
var headAngle = new Angle();
console.log(headAngle.getDeg());
headAngle.rotate(-400);
console.log(headAngle.getDeg());

function main() {
    return 0;
}