// The painted parts of every screen: backdrops, the feed meter and text.
// The gifs layered over them live in menuLayout.ts and restartLayout.ts.
import { canvas, ctx, drawSprite } from "./renderer";
import { SHEETS } from "./sprites";
import { HUD_H, FEED_GOAL } from "./constants";
import type { GameState } from "./types";

const backdrop = (file: string) => {
    const img = new Image();
    img.src = `backgrounds/${file}`;
    return img;
};


const camp = backdrop("camp.jpg");

const BACKGROUNDS: Partial<Record<GameState, HTMLImageElement>> = {
    menu: camp,
    win: camp,
    gameOver: backdrop("bubu-caught.webp"),
};

// Shows through on the play screen, which has no backdrop of its own. The other
// screens scale their backdrop to cover, so it never shows there.
const BACKDROP = "#8f96a1";


export function erase(state: GameState) {
    ctx.fillStyle = BACKDROP;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bg = BACKGROUNDS[state];
    if (bg === undefined || !bg.complete || bg.naturalWidth === 0) return;
    const scale = Math.max(canvas.width / bg.naturalWidth, canvas.height / bg.naturalHeight);
    const w = bg.naturalWidth * scale;
    const h = bg.naturalHeight * scale;
    ctx.drawImage(bg, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
}


export function drawMenu() {
    ctx.textAlign = "center";

    ctx.fillStyle = "#54a036";
    ctx.font = "bold 64px sans-serif";
    ctx.fillText("The Fudu Bear", canvas.width / 2, canvas.height / 2 + 20);

    ctx.fillStyle = "#898787";
    ctx.font = "24px sans-serif";
    ctx.fillText("Click anywhere to start feeding", canvas.width / 2, canvas.height / 2 + 60);

    ctx.textAlign = "start";
}


export function drawGameOver() {
    ctx.textAlign = "center";

    ctx.fillStyle = "white";
    ctx.font = "bold 64px sans-serif";
    ctx.fillText("You Failed to Feed the Fudu Bear", canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "24px sans-serif";
    ctx.fillText("Click anywhere to start feeding again", canvas.width / 2, canvas.height / 2 + 30);

    ctx.textAlign = "start";
}


// The feed meter: a track across the HUD band, with the snacking bubu walking
// along it as it fills.
const TRACK_W = 620;
const TRACK_H = 24;

const METER_BUBU = "goma-peach-bubu";
const METER_BUBU_H = 58;

// How quickly the drawn fill chases the real one, per second. Feeding moves the
// meter a whole step at a time, so without this the bubu would teleport.
const METER_EASE = 8;

let shownFill = 0;

export function drawMeter(fed: number, t: number, dt: number) {
    const target = Math.min(fed, FEED_GOAL) / FEED_GOAL;
    shownFill += (target - shownFill) * Math.min(dt * METER_EASE, 1);

    const x = (canvas.width - TRACK_W) / 2;
    const y = (HUD_H - TRACK_H) / 2;
    const r = TRACK_H / 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, 0, canvas.width, HUD_H);

    ctx.fillStyle = "#2b2b2b";
    ctx.beginPath();
    ctx.roundRect(x, y, TRACK_W, TRACK_H, r);
    ctx.fill();

    if (shownFill > 0.001) {
        ctx.fillStyle = "#54a036";
        ctx.beginPath();
        ctx.roundRect(x, y, Math.max(TRACK_W * shownFill, TRACK_H), TRACK_H, r);
        ctx.fill();
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, TRACK_W, TRACK_H, r);
    ctx.stroke();

    // The bubu rides the head of the fill, so it walks the length of the track
    // over the course of a game.
    const sheet = SHEETS[METER_BUBU];
    const bubuW = METER_BUBU_H * (sheet.w / sheet.h);
    drawSprite(METER_BUBU, x + TRACK_W * shownFill - bubuW / 2, (HUD_H - METER_BUBU_H) / 2, METER_BUBU_H, t);
}


export function drawWin() {
    ctx.textAlign = "center";

    ctx.fillStyle = "#54a036";
    ctx.font = "bold 64px sans-serif";
    ctx.fillText("The Fudu Bear Is Full!", canvas.width / 2, canvas.height / 2 + 30);

    ctx.fillStyle = "#ffffff";
    ctx.font = "24px sans-serif";
    ctx.fillText("You fed the bubus. Click anywhere to feed them again", canvas.width / 2, canvas.height / 2 + 80);

    ctx.textAlign = "start";
}
