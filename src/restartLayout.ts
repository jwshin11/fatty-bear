// Where every gif of gifs/restart/ sits on the game-over screen. This table is
// the only place that knows the restart screen's arrangement.
import { layout } from "./gifLayout";
import type { Placement } from "./gifLayout";

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

export function mountRestartGifs(container: Element) {
    layout(container, RESTART_GIFS, RESTART_LAYOUT);
}
