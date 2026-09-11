import type { SheetName } from "./sprites";
import { drawSprite, sheetsNamed } from "./renderer";
import {
    TABLE_END,
    DUDU_X, DUDU_H, DUDU_SWITCH,
    BUBU_SIZE, FUDU_SIZE, FUDU_SPEED,
    BUBU_SPEED_MIN, BUBU_SPEED_MAX,
    BUBU_PAUSE_MIN, BUBU_PAUSE_MAX,
    BUBU_MOVE_MIN, BUBU_MOVE_MAX,
    BUBU_Y_MIN, BUBU_Y_MAX,
    BUBU_WANDER_AMP_MIN, BUBU_WANDER_AMP_MAX,
    BUBU_WANDER_PERIOD_MIN, BUBU_WANDER_PERIOD_MAX,
} from "./constants";

const between = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

const DUDU_SHEETS = ["dudu1", "dudu2", "dancing-animated"] as const satisfies readonly SheetName[];
const BUBU_SHEETS = sheetsNamed("bubu");
// The bubu riding a duck: the only one that leaves the ground.
const WANDERING_SHEET = "bubu7" satisfies SheetName;
const FUDU_SHEETS = sheetsNamed("fudu");


export class Bubu {
    x: number;
    y: number;
    pause: number = 0;
    move: number = 0;
    speed: number = between(BUBU_SPEED_MIN, BUBU_SPEED_MAX);
    pauseFor: number = between(BUBU_PAUSE_MIN, BUBU_PAUSE_MAX);
    moveFor: number = between(BUBU_MOVE_MIN, BUBU_MOVE_MAX);
    isFatty: boolean = false;
    age: number = 0;
    sheet: SheetName = BUBU_SHEETS[Math.floor(Math.random() * BUBU_SHEETS.length)];

    // The line this bubu drifts around, and how far off it strays. A
    // straight-line bubu has an amplitude of zero and never leaves the line.
    baseY: number;
    wanderAmp: number;
    wanderPeriod: number = between(BUBU_WANDER_PERIOD_MIN, BUBU_WANDER_PERIOD_MAX);
    wanderPhase: number = Math.random() * Math.PI * 2;

    constructor(x: number, y: number) {
        this.x = x;
        this.wanderAmp = this.sheet === WANDERING_SHEET
            ? between(BUBU_WANDER_AMP_MIN, BUBU_WANDER_AMP_MAX)
            : 0;
        // Pull the line far enough from the edges that the whole arc fits on
        // screen, so a wanderer never has to be clipped at the top or bottom.
        this.baseY = clamp(y, BUBU_Y_MIN + this.wanderAmp, BUBU_Y_MAX - this.wanderAmp);
        this.y = this.baseY;
    }

    update(dt: number): void {
        this.age += dt;

        // The drift runs off its own clock, so a bubu keeps bobbing through the
        // pauses in its sideways walk.
        if (this.wanderAmp > 0) {
            const turns = (this.age / this.wanderPeriod) * Math.PI * 2;
            this.y = this.baseY + this.wanderAmp * Math.sin(this.wanderPhase + turns);
        }

        if (this.pause < this.pauseFor) {
            this.pause += dt;
            return;
        }
        this.x -= this.speed * dt;
        this.move += dt;
        if (this.move > this.moveFor) {
            this.move = 0;
            this.pause = 0;
            this.pauseFor = between(BUBU_PAUSE_MIN, BUBU_PAUSE_MAX);
            this.moveFor = between(BUBU_MOVE_MIN, BUBU_MOVE_MAX);
        }
    }

    draw(): void {
        drawSprite(this.sheet, this.x, this.y, BUBU_SIZE, this.age);
    }

    isAngry(): boolean {
        return this.x < TABLE_END;
    }
}

export class Fudu {
    x: number;
    y: number;
    eaten: boolean = false;
    sheet: SheetName = FUDU_SHEETS[Math.floor(Math.random() * FUDU_SHEETS.length)];

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    update(dt: number): void {
        this.x += FUDU_SPEED * dt;
    }

    draw(): void {
        drawSprite(this.sheet, this.x, this.y, FUDU_SIZE, 0);
    }
}


export function drawDudu(y: number, duduTime: number) {
    const i = Math.floor(duduTime / DUDU_SWITCH) % DUDU_SHEETS.length;
    drawSprite(DUDU_SHEETS[i], DUDU_X, y, DUDU_H, duduTime % DUDU_SWITCH);
}
