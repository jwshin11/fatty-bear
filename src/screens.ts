// The painted parts of the menu and game-over screens: backdrops and text.
// The gifs layered over them live in menuLayout.ts and restartLayout.ts.
import { canvas, ctx } from "./renderer";
import type { GameState } from "./types";

const backdrop = (file: string) => {
    const img = new Image();
    img.src = `backgrounds/${file}`;
    return img;
};


const BACKGROUNDS: Partial<Record<GameState, HTMLImageElement>> = {
    menu: backdrop("camp.jpg"),
    gameOver: backdrop("bubu-caught.webp"),
};


export function erase(state: GameState) {
    ctx.fillStyle = "#000000"
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
