import { SHEETS } from "./sprites";
import type { SheetName } from "./sprites";

const stage = document.getElementById("stage")!;
const menuGifs = document.getElementById("menu-gifs")!;
const restartGifs = document.getElementById("restart-gifs")!;

const MENU_GIFS = import.meta.glob("../gifs/menu/*.gif", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;


const STAGE_W = 1400;
const STAGE_H = 800;


const MENU_H = 135;
const MENU_ANCHOR_H = 340;
const TOP_Y = 90;
const BOTTOM_Y = 710;
const COL = [125, 355, 585, 815, 1045, 1275];

type Placement = { x: number; y: number; h: number };


const MENU_LAYOUT: Record<string, Placement> = {
    "menu.gif": { x: 114, y: 400, h: MENU_ANCHOR_H },
    "dudu-dancing-bubu-dudu-dancing.gif": { x: 319, y: 400, h: MENU_ANCHOR_H },

    "sad-dudu-kiss-bubu.gif": { x: COL[0], y: TOP_Y, h: MENU_H },
    "restart.gif": { x: COL[1], y: TOP_Y, h: MENU_H },
    "tkthao219-bubududu.gif": { x: COL[2], y: TOP_Y, h: MENU_H },
    "bubu-love-bubu-dudu-love.gif": { x: COL[3], y: TOP_Y, h: MENU_H },
    "dudu-eating-bubu-dudu-bubu.gif": { x: COL[4], y: TOP_Y, h: MENU_H },
    "danilimz.gif": { x: COL[5], y: TOP_Y, h: MENU_H },

    "bubu-dudu.gif": { x: COL[0], y: BOTTOM_Y, h: MENU_H },
    "maichi-chichi.gif": { x: COL[1], y: BOTTOM_Y, h: MENU_H },
    "sseeyall-bubu-dudu.gif": { x: COL[3], y: BOTTOM_Y, h: MENU_H },
    "dudu-bubu-dancing-dancung.gif": { x: COL[4], y: BOTTOM_Y, h: MENU_H },
    "bubu-dudu1.gif": { x: COL[5], y: BOTTOM_Y, h: MENU_H },
};

const basename = (path: string) => path.slice(path.lastIndexOf("/") + 1);


function pinned(urls: Record<string, string>, path: string, spot: Placement) {
    const img = document.createElement("img");
    img.alt = "";
    img.style.left = `${spot.x}px`;
    img.style.top = `${spot.y}px`;
    img.style.height = `${spot.h}px`;
    img.src = urls[path];
    return img;
}


function layout(container: Element, urls: Record<string, string>, table: Record<string, Placement>) {
    for (const path of Object.keys(urls).sort()) {
        const name = basename(path);
        const spot = table[name];
        if (spot === undefined) {
            console.warn(`${name} has no entry in the layout table, so it is not on screen`);
            continue;
        }
        container.append(pinned(urls, path, spot));
    }
}

layout(menuGifs, MENU_GIFS, MENU_LAYOUT);

const RESTART_GIFS = import.meta.glob("../gifs/restart/*.gif", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;


const RESTART_APEX_H = 290;
const RESTART_FLANK_H = 200;
const RESTART_ROW_Y = 155;

const RESTART_LAYOUT: Record<string, Placement> = {
    "bubu-dudu-sseeyallafd.gif": { x: 425, y: RESTART_ROW_Y, h: RESTART_FLANK_H },
    "toory-dudu-bubu-osita.gif": { x: 700, y: RESTART_ROW_Y, h: RESTART_APEX_H },
    "bubu-angry-on-dudu-bubu-cry.gif": { x: 975, y: RESTART_ROW_Y, h: RESTART_FLANK_H },
};

layout(restartGifs, RESTART_GIFS, RESTART_LAYOUT);

const canvas = document.createElement("canvas");
stage.insertBefore(canvas, menuGifs);
canvas.width = STAGE_W;
canvas.height = STAGE_H;
const ctx = canvas.getContext("2d")!;

// CONSTANTS
const ROWS = 4;
const SPEED = 150;
const TABLE_END = 250;
const DUDU_X = 30;

const DUDU_H = 170;
const BUBU_SIZE = 120;
const FUDU_SIZE = 70;


const DUDU_SWITCH = 3;
const DUDU_SHEETS = ["dudu1", "dudu2", "dancing-animated"] as const satisfies readonly SheetName[];
const sheetsNamed = (prefix: string) =>
    (Object.keys(SHEETS) as SheetName[]).filter((name) => name.startsWith(prefix));
const BUBU_SHEETS = sheetsNamed("bubu");
const FUDU_SHEETS = sheetsNamed("fudu");

type GameState = "menu" | "playing" | "gameOver";
let state: GameState = "menu";

let row = 0;
let last = performance.now();

const rowHeight = canvas.height / ROWS;
const rowFeet = (r: number) => r*rowHeight + (rowHeight + DUDU_H) / 2;
const rowY = (r: number, h: number) => rowFeet(r) - h;

const sheetImages = new Map<SheetName, HTMLImageElement>();
for (const name of Object.keys(SHEETS) as SheetName[]) {
    const img = new Image();
    img.src = SHEETS[name].src;
    sheetImages.set(name, img);
}

const audio = {
    shoot: new Audio("sounds/pew.mp3"),
    atata: new Audio("sounds/atata.mp3"),
    dudu_sorry: new Audio("sounds/dudu-sorry.mp3")
}


function drawSprite(name: SheetName, x: number, r: number, h: number, t: number) {
    const sheet = SHEETS[name];
    const img = sheetImages.get(name)!;
    if (!img.complete || img.naturalWidth === 0) return;

    const frame = Math.floor(t * sheet.fps) % sheet.frames;
    const w = h * (sheet.w / sheet.h);
    ctx.drawImage(img, frame * sheet.w, 0, sheet.w, sheet.h, x, rowY(r, h), w, h);
}

function playSound(sound: HTMLAudioElement) {
    sound.currentTime = 0;
    sound.play();
}

audio.atata.loop = true;
audio.atata.volume = 0.5;

window.addEventListener("keydown", function(event) {
    if (state !== "playing") return;
    if (event.code !== "ArrowUp" && event.code !== "ArrowDown" && event.code !== "Space") return;
    event.preventDefault();
    if (event.repeat) return;
    
    if (event.code == "Space") {
        const fudu = new Fudu(TABLE_END - 50, row);
        fudus.push(fudu);
        audio.shoot.volume = 0.5;
        playSound(audio.shoot);
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
    audio.dudu_sorry.pause();
}

function showScreenGifs(state: GameState) {
    menuGifs.style.display = state === "menu" ? "block" : "none";
    restartGifs.style.display = state === "gameOver" ? "block" : "none";
}

function drawMenu() {
    ctx.textAlign = "center";

    ctx.fillStyle = "#54a036";
    ctx.font = "bold 64px sans-serif";
    ctx.fillText("The Fudu Bear", canvas.width / 2, canvas.height / 2 + 20);

    ctx.fillStyle = "#898787";
    ctx.font = "24px sans-serif";
    ctx.fillText("Click anywhere to start feeding", canvas.width / 2, canvas.height / 2 + 60);

    ctx.textAlign = "start";
}

function drawGameOver() {
    ctx.textAlign = "center";

    ctx.fillStyle = "white";
    ctx.font = "bold 64px sans-serif";
    ctx.fillText("The Fudu Bear Was Not Fed", canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "24px sans-serif";
    ctx.fillText("Click anywhere to start feeding again", canvas.width / 2, canvas.height / 2 + 30);

    ctx.textAlign = "start";
}


const backdrop = (file: string) => {
    const img = new Image();
    img.src = `backgrounds/${file}`;
    return img;
};


const BACKGROUNDS: Partial<Record<GameState, HTMLImageElement>> = {
    menu: backdrop("camp.jpg"),
    gameOver: backdrop("bubu-caught.webp"),
};


function erase() {
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bg = BACKGROUNDS[state];
    if (bg === undefined || !bg.complete || bg.naturalWidth === 0) return;
    const scale = Math.max(canvas.width / bg.naturalWidth, canvas.height / bg.naturalHeight);
    const w = bg.naturalWidth * scale;
    const h = bg.naturalHeight * scale;
    ctx.drawImage(bg, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
}


class Bubu {
    x: number;
    row: number;
    pause: number = 0;
    move: number = 0;
    isFatty: boolean = false;
    age: number = 0;
    sheet: SheetName = BUBU_SHEETS[Math.floor(Math.random() * BUBU_SHEETS.length)];

    constructor(x: number, row: number) {
        this.x = x;
        this.row = row;
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
        drawSprite(this.sheet, this.x, this.row, BUBU_SIZE, this.age);
    }

    isAngry(): boolean {
        return this.x < TABLE_END;
    }
}

class Fudu {
    x: number;
    row: number;
    eaten: boolean = false;
    sheet: SheetName = FUDU_SHEETS[Math.floor(Math.random() * FUDU_SHEETS.length)];

    constructor(x: number, row: number) {
        this.x = x;
        this.row = row;
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
    const bubu = new Bubu(canvas.width, randomRow);
    bubus.push(bubu);
    audio.atata.play();
}

function draw(now: number) {
    // Time
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    showScreenGifs(state);

    if (state === "menu") {
        erase();
        drawMenu();
        window.requestAnimationFrame(draw);
        return;
    } else if (state === "gameOver") {
        erase();
        drawGameOver();
        audio.atata.pause();
        audio.dudu_sorry.play();
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
    fudus = fudus.filter(f => !f.eaten);

    erase();

    // Draw
    drawTables();
    drawDudu();
    drawBubus();
    drawFudus();


    window.requestAnimationFrame(draw);
}


window.requestAnimationFrame(draw);
