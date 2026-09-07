// Where every gif of gifs/menu/ sits on the menu screen. This table is the only
// place that knows the menu's arrangement.
import { layout } from "./gifLayout";
import type { Placement } from "./gifLayout";

const MENU_GIFS = import.meta.glob("../gifs/menu/*.gif", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;


const MENU_H = 135;
const MENU_ANCHOR_H = 340;

const MENU_LAYOUT: Record<string, Placement> = {
    "menu.gif": { x: 114, y: 300, h: MENU_ANCHOR_H },
    "dudu-dancing-bubu-dudu-dancing.gif": { x: 319, y: 300, h: MENU_ANCHOR_H },

    "restart.gif": { x: 1100, y: 60, h: MENU_H },
    "tkthao219-bubududu.gif": { x: 900, y: 110, h: MENU_H },
    "danilimz.gif": { x: 1330, y: 90, h: MENU_H },

    "bubu-dudu.gif": { x: 125, y: 730, h: MENU_H },
    "maichi-chichi.gif": { x: 355, y: 680, h: MENU_H },
    "dudu-bubu-dancing-dancung.gif": { x: 550, y: 700, h: MENU_H },
    "bubu-love-bubu-dudu-love.gif": { x: 965, y: 660, h: 60},
    "dudu-eating-bubu-dudu-bubu.gif": { x: 970, y: 750, h: 100 },
    "sad-dudu-kiss-bubu.gif": { x: 1180, y: 725, h: MENU_H },
    "bubu-dudu1.gif": { x: 1340, y: 645, h: MENU_H },
};

export function mountMenuGifs(container: Element) {
    layout(container, MENU_GIFS, MENU_LAYOUT);
}
