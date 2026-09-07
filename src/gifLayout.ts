// Shared machinery for the screen-gif layers. Each screen (menu, restart) owns
// its own table of placements; this file only knows how to pin a gif to one.

export type Placement = { x: number; y: number; h: number };

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


export function layout(container: Element, urls: Record<string, string>, table: Record<string, Placement>) {
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
