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

let row = 0;
let last = performance.now();

const rowHeight = canvas.height / ROWS;
const rowY = (r: number) => r*rowHeight + (rowHeight - 120) / 2;

window.addEventListener("keydown", function(event) {
    if (event.code !== "ArrowUp" && event.code !== "ArrowDown") return;
    event.preventDefault();
    if (event.repeat) return;

    const dir = event.code === "ArrowUp" ? -1 : 1;
    row = (row + dir + ROWS) % ROWS;
});


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

    constructor(x: number, row: number, ctx: CanvasRenderingContext2D) {
        this.x = x;
        this.row = row;
        this.ctx = ctx;
    }

    update(dt: number): void {
        if (this.pause < 0.25) {
            this.pause += dt;
            this.draw();
            return;
        } 
        this.x -= SPEED * dt;
        this.move += dt;
        if (this.move > 0.5) {
            this.move = 0;
            this.pause = 0;
        }
        this.draw();
    }

    draw(): void {
        if (this.x > TABLE_END) {
            ctx.fillStyle = "green";
            ctx.fillRect(this.x, rowY(this.row), 20, 20);
        } else this.x = canvas.width;
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

const bubu1 = new Bubu(canvas.width, 0, ctx);
const bubu2 = new Bubu(canvas.width, 1, ctx);

function draw(now: number) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    erase();

    drawTables(ctx);
    drawDudu(ctx);
    bubu1.update(dt);
    bubu2.update(dt);

    window.requestAnimationFrame(draw);
}


window.requestAnimationFrame(draw);
