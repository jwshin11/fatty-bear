// Where every gif of gifs/complete/ sits on the win screen. This table is the
// only place that knows the win screen's arrangement.
import { layout } from "./gifLayout";
import type { Placement } from "./gifLayout";

const COMPLETE_GIFS = import.meta.glob("../gifs/complete/*.gif", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;


// One row, centred on the apex and tapering outwards, as on the restart screen.
const COMPLETE_APEX_H = 290;
const COMPLETE_FLANK_H = 200;
const COMPLETE_OUTER_H = 170;
const COMPLETE_ROW_Y = 155;

const COMPLETE_LAYOUT: Record<string, Placement> = {
    "dance.gif": { x: 170, y: COMPLETE_ROW_Y, h: COMPLETE_OUTER_H },
    "bubu-happy.gif": { x: 425, y: COMPLETE_ROW_Y, h: COMPLETE_FLANK_H },
    "bubu-dance-bubu-dudu.gif": { x: 700, y: COMPLETE_ROW_Y, h: COMPLETE_APEX_H },
    "bubu-bubu-dudu.gif": { x: 975, y: COMPLETE_ROW_Y, h: COMPLETE_FLANK_H },
    "bubu-dudu-sseeyall.gif": { x: 1230, y: COMPLETE_ROW_Y, h: COMPLETE_OUTER_H },
};

export function mountCompleteGifs(container: Element) {
    layout(container, COMPLETE_GIFS, COMPLETE_LAYOUT);
}
