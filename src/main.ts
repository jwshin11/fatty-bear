const canvas = document.createElement("canvas");
document.body.insertBefore(canvas, document.body.childNodes[0]);
canvas.width = 800;
canvas.height = 800;
const ctx = canvas.getContext("2d")!;

// CONSTANTS
const ROWS = 4;
const SPEED = 150;
const TABLE_END = 200;
const DUDU_X = 30;

type GameState = "menu" | "playing" | "gameOver";
let state: GameState = "menu";

let row = 0;
let last = performance.now();

const rowHeight = canvas.height / ROWS;
const rowY = (r: number) => r*rowHeight + (rowHeight - 120) / 2;

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
    last = performance.now();
    state = "playing";
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
    ctx.fillRect(0, 0, 800, 800);
}


class Bubu {
    x: number;
    row: number;
    ctx: CanvasRenderingContext2D;
    pause: number = 0;
    move: number = 0;
    isFatty: boolean = false;

    constructor(x: number, row: number, ctx: CanvasRenderingContext2D) {
        this.x = x;
        this.row = row;
        this.ctx = ctx;
    }

    update(dt: number): void {
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
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, rowY(this.row), 20, 20);
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

    constructor(x: number, row: number, ctx: CanvasRenderingContext2D) {
        this.x = x;
        this.row = row;
        this.ctx = ctx;
    }

    update(dt: number): void {
        this.x += SPEED * dt;
    }

    draw(): void {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x, rowY(this.row), 15, 15);
    }
}

function drawTables(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < ROWS; i++) {
        ctx.fillStyle = "white";
        ctx.fillRect(TABLE_END, rowY(i) + 50, 600, 50);
    }
}

function drawDudu(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "red";
    ctx.fillRect(DUDU_X, rowY(row), 100, 120);

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

    // Update
    addBubu();
    for (const fudu of fudus) {
        if (fudu.x > canvas.width) {
                state = "gameOver";
                break;
        }
        for (const bubu of bubus) {
            if (fudu.x > bubu.x - 10 && fudu.x < bubu.x + 10 && fudu.row === bubu.row) {
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
    drawTables(ctx);
    drawDudu(ctx);
    drawBubus();
    drawFudus();


    window.requestAnimationFrame(draw);
}


window.requestAnimationFrame(draw);
