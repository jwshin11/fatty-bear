// The canvas itself and everything that draws a sprite sheet onto it.
import { SHEETS } from "./sprites";
import type { SheetName } from "./sprites";
import { STAGE_W, STAGE_H } from "./constants";

export const canvas = document.createElement("canvas");
canvas.width = STAGE_W;
canvas.height = STAGE_H;
export const ctx = canvas.getContext("2d")!;


const sheetImages = new Map<SheetName, HTMLImageElement>();
for (const name of Object.keys(SHEETS) as SheetName[]) {
    const img = new Image();
    img.src = SHEETS[name].src;
    sheetImages.set(name, img);
}

export const sheetsNamed = (prefix: string) =>
    (Object.keys(SHEETS) as SheetName[]).filter((name) => name.startsWith(prefix));


export function drawSprite(name: SheetName, x: number, y: number, h: number, t: number) {
    const sheet = SHEETS[name];
    const img = sheetImages.get(name)!;
    if (!img.complete || img.naturalWidth === 0) return;

    const frame = Math.floor(t * sheet.fps) % sheet.frames;
    const w = h * (sheet.w / sheet.h);
    ctx.drawImage(img, frame * sheet.w, 0, sheet.w, sheet.h, x, y, w, h);
}
