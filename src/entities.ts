import type { SheetName } from "./sprites";
import { drawSprite, sheetsNamed } from "./renderer";
import {
    SPEED, TABLE_END,
    DUDU_X, DUDU_H, DUDU_SWITCH,
    BUBU_SIZE, FUDU_SIZE,
} from "./constants";

const DUDU_SHEETS = ["dudu1", "dudu2", "dancing-animated"] as const satisfies readonly SheetName[];
const BUBU_SHEETS = sheetsNamed("bubu");
const FUDU_SHEETS = sheetsNamed("fudu");


export class Bubu {
    x: number;
    y: number;
    pause: number = 0;
    move: number = 0;
    isFatty: boolean = false;
    age: number = 0;
    sheet: SheetName = BUBU_SHEETS[Math.floor(Math.random() * BUBU_SHEETS.length)];

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    update(dt: number): void {
        this.age += dt;
        if (this.pause < 0.25) {
            this.pause += dt;
            return;
        } 
        this.x -= SPEED * dt;
        this.move += dt;
        if (this.move > 0.5) {
            this.move = 0;
            this.pause = 0;
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
        this.x += SPEED * dt;
    }

    draw(): void {
        drawSprite(this.sheet, this.x, this.y, FUDU_SIZE, 0);
    }
}


export function drawDudu(y: number, duduTime: number) {
    const i = Math.floor(duduTime / DUDU_SWITCH) % DUDU_SHEETS.length;
    drawSprite(DUDU_SHEETS[i], DUDU_X, y, DUDU_H, duduTime % DUDU_SWITCH);
}
