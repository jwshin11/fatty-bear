import { SHEETS } from "./sprites";
import type { SheetName } from "./sprites";

const stage = document.getElementById("stage")!;
const menuGif = document.getElementById("menu-gif") as HTMLImageElement;
const restartGif = document.getElementById("restart-gif") as HTMLImageElement;

const canvas = document.createElement("canvas");
// Before the GIFs so they stay the upper layers.
stage.insertBefore(canvas, menuGif);
canvas.width = 1400;
canvas.height = 800;
const ctx = canvas.getContext("2d")!;

// CONSTANTS
const ROWS = 4;
const SPEED = 150;
const TABLE_END = 250;
const DUDU_X = 30;

// Entity sizes. Rows are 200 tall, so these leave room to stand on the table.
// Only heights are fixed: a sprite's drawn width comes from its own cell
// aspect ratio, so the sheets keep their proportions instead of being squashed
// into one box. BUBU_SIZE stays the hitbox width -- see the collision check.
const DUDU_H = 170;
const BUBU_SIZE = 120;
const FUDU_SIZE = 70;

// Dudu alternates between its two sheets on this cadence, in seconds.
const DUDU_SWITCH = 3;
const DUDU_SHEETS = ["dudu1", "dudu2"] as const satisfies readonly SheetName[];
const sheetsNamed = (prefix: string) =>
    (Object.keys(SHEETS) as SheetName[]).filter((name) => name.startsWith(prefix));
const BUBU_SHEETS = sheetsNamed("bubu");
const FUDU_SHEETS = sheetsNamed("fudu");

type GameState = "menu" | "playing" | "gameOver";
let state: GameState = "menu";

let row = 0;
let last = performance.now();

const rowHeight = canvas.height / ROWS;
// Everything in a row stands on the same line, so sprites of different
// heights stay aligned instead of floating at different depths.
const rowFeet = (r: number) => r*rowHeight + (rowHeight + DUDU_H) / 2;
const rowY = (r: number, h: number) => rowFeet(r) - h;

// Decoded once up front; every draw just indexes into these.
const sheetImages = new Map<SheetName, HTMLImageElement>();
for (const name of Object.keys(SHEETS) as SheetName[]) {
    const img = new Image();
    img.src = SHEETS[name].src;
    sheetImages.set(name, img);
}

// One frame of a sheet, standing on the row's feet line with its left edge at
// x. `t` is that sprite's own age in seconds, so entities animate on separate
// clocks rather than in lockstep. Nothing is drawn until the image has
// decoded, which the click-to-start menu makes a non-event in practice.
function drawSprite(name: SheetName, x: number, r: number, h: number, t: number) {
    const sheet = SHEETS[name];
    const img = sheetImages.get(name)!;
    if (!img.complete || img.naturalWidth === 0) return;

    const frame = Math.floor(t * sheet.fps) % sheet.frames;
    const w = h * (sheet.w / sheet.h);
    ctx.drawImage(img, frame * sheet.w, 0, sheet.w, sheet.h, x, rowY(r, h), w, h);
}

window.addEventListener("keydown", function(event) {
    if (state !== "playing") return;
    if (event.code !== "ArrowUp" && event.code !== "ArrowDown" && event.code !== "Space") return;
    event.preventDefault();
    if (event.repeat) return;
    
    if (event.code == "Space") {
        const fudu = new Fudu(TABLE_END - 50, row, ctx);
        fudus.push(fudu);
        return;
    }
    const dir = event.code === "ArrowUp" ? -1 : 1;
    row = (row + dir + ROWS) % ROWS;
});


canvas.addEventListener("click", function() {
    if (state !== "menu" && state !== "gameOver") return;
    startGame();
});

function startGame() {
    bubus = [];
    fudus = [];
    row = 0;
    elapsedTime = 0;
    interval = 1;
    duduTime = 0;
    last = performance.now();
    state = "playing";
}

function showScreenGifs(state: GameState) {
    menuGif.style.display = state === "menu" ? "block" : "none";
    restartGif.style.display = state === "gameOver" ? "block" : "none";
}

function drawMenu() {
    ctx.textAlign = "center";

    ctx.fillStyle = "white";
    ctx.font = "bold 64px sans-serif";
    ctx.fillText("The Fudu Bear", canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "24px sans-serif";
    ctx.fillText("Click anywhere to start", canvas.width / 2, canvas.height / 2 + 30);

    ctx.textAlign = "start";
}

function drawGameOver() {
    ctx.textAlign = "center";

    ctx.fillStyle = "white";
    ctx.font = "bold 64px sans-serif";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "24px sans-serif";
    ctx.fillText("Click anywhere to play again", canvas.width / 2, canvas.height / 2 + 30);

    ctx.textAlign = "start";
}

function erase() {
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


class Bubu {
    x: number;
    row: number;
    ctx: CanvasRenderingContext2D;
    pause: number = 0;
    move: number = 0;
    isFatty: boolean = false;
    age: number = 0;
    // Rolled once at spawn, so a bubu keeps one look for its whole run.
    sheet: SheetName = BUBU_SHEETS[Math.floor(Math.random() * BUBU_SHEETS.length)];

    constructor(x: number, row: number, ctx: CanvasRenderingContext2D) {
        this.x = x;
        this.row = row;
        this.ctx = ctx;
    }

    update(dt: number): void {
        // Ahead of the pause check: a paused bubu has stopped walking, not
        // stopped animating.
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
        drawSprite(this.sheet, this.x, this.row, BUBU_SIZE, this.age);
    }

    isAngry(): boolean {
        return this.x < TABLE_END;
    }
}

class Fudu {
    x: number;
    row: number;
    ctx: CanvasRenderingContext2D;
    eaten: boolean = false;
    wasted: boolean = false;
    // Rolled once at spawn, like Bubu's. These sheets are stills, so there is
    // no age to track alongside it.
    sheet: SheetName = FUDU_SHEETS[Math.floor(Math.random() * FUDU_SHEETS.length)];

    constructor(x: number, row: number, ctx: CanvasRenderingContext2D) {
        this.x = x;
        this.row = row;
        this.ctx = ctx;
    }

    update(dt: number): void {
        this.x += SPEED * dt;
    }

    draw(): void {
        drawSprite(this.sheet, this.x, this.row, FUDU_SIZE, 0);
    }
}

function drawTables() {
    for (let i = 0; i < ROWS; i++) {
        ctx.fillStyle = "white";
        ctx.fillRect(TABLE_END, rowFeet(i) + 15, canvas.width - TABLE_END, 20);
    }
}

function drawDudu() {
    const i = Math.floor(duduTime / DUDU_SWITCH) % DUDU_SHEETS.length;
    // Time since the last swap, so each sheet restarts from its first frame.
    drawSprite(DUDU_SHEETS[i], DUDU_X, row, DUDU_H, duduTime % DUDU_SWITCH);
}

let bubus: Bubu[] = [];
let fudus: Fudu[] = [];

function drawBubus() {
    for (const bubu of bubus) bubu.draw();
}

function drawFudus() {
    for (const fudu of fudus) fudu.draw();
}


let elapsedTime = 0;
let interval = 1;
let duduTime = 0;

function addBubu() {
    if (elapsedTime < interval) return

    interval = Math.random()*2;
    elapsedTime = 0;
    const randomRow = Math.floor(Math.random()*4);
    const bubu = new Bubu(canvas.width, randomRow, ctx);
    bubus.push(bubu);
}

function draw(now: number) {
    // Time
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    // Driven off state every frame so no transition can leave a GIF stranded.
    showScreenGifs(state);

    if (state === "menu") {
        erase();
        drawMenu();
        window.requestAnimationFrame(draw);
        return;
    } else if (state === "gameOver") {
        erase();
        drawGameOver();
        window.requestAnimationFrame(draw);
        return;
    }

    elapsedTime += dt;
    duduTime += dt;

    // Update
    addBubu();
    for (const fudu of fudus) {
        if (fudu.x > canvas.width) {
                state = "gameOver";
                break;
        }
        for (const bubu of bubus) {
            // Box overlap, so the tolerance tracks the sprite sizes instead of
            // being a fixed +/-10 tuned for the old 20px squares.
            if (fudu.x + FUDU_SIZE > bubu.x && fudu.x < bubu.x + BUBU_SIZE && fudu.row === bubu.row) {
                fudu.eaten = true;
                bubu.isFatty = true;
                break;
            }

        }
    }

    for (const bubu of bubus) bubu.update(dt);
    bubus = bubus.filter(b => !b.isAngry() && !b.isFatty);
    for (const fudu of fudus) fudu.update(dt);
    fudus = fudus.filter(f => !f.eaten && !f.wasted);

    erase();

    // Draw
    drawTables();
    drawDudu();
    drawBubus();
    drawFudus();


    window.requestAnimationFrame(draw);
}


window.requestAnimationFrame(draw);
