import { mountMenuGifs } from "./menuLayout";
import { mountRestartGifs } from "./restartLayout";
import { canvas } from "./renderer";
import { erase, drawMenu, drawGameOver } from "./screens";
import { Bubu, Fudu, drawDudu } from "./entities";
import { audio, playSound } from "./audio";
import { STAGE_H, TABLE_END, DUDU_MIN, DUDU_MAX, DUDU_H, DUDU_SPEED, BUBU_SIZE, FUDU_SIZE } from "./constants";
import type { GameState } from "./types";

const stage = document.getElementById("stage")!;
const menuGifs = document.getElementById("menu-gifs")!;
const restartGifs = document.getElementById("restart-gifs")!;

mountMenuGifs(menuGifs);
mountRestartGifs(restartGifs);

stage.insertBefore(canvas, menuGifs);


const KEYS = {
    "ArrowUp": false,
    "ArrowDown": false,
    "Space": false,
}

let state: GameState = "menu";
let last = performance.now();

let dudu_y = 20;
let bubus: Bubu[] = [];
let fudus: Fudu[] = [];

let elapsedTime = 0;
let interval = 1;
let duduTime = 0;


window.addEventListener("keydown", function(event) {
    if (state !== "playing") return;
    if (event.code !== "ArrowUp" && event.code !== "ArrowDown" && event.code !== "Space") return;
    event.preventDefault();
    

    if (event.code == "Space") {
        if (!event.repeat)
            KEYS["Space"] = true;
        return;
    } 
    KEYS[event.code] = true;
});

window.addEventListener("keyup", function(event) {
    if (state !== "playing") return;
    if (event.code !== "ArrowUp" && event.code !== "ArrowDown" && event.code !== "Space") return;
    event.preventDefault();
    

    if (event.code == "Space") {
        KEYS["Space"] = false;
        return;
    }
    KEYS[event.code] = false;
})


canvas.addEventListener("click", function() {
    if (state !== "menu" && state !== "gameOver") return;
    startGame();
});

function startGame() {
    bubus = [];
    fudus = [];
    dudu_y = 20;
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


function addBubu() {
    if (elapsedTime < interval) return

    interval = Math.random()*2;
    elapsedTime = 0;
    const randomY = Math.floor(Math.random()*STAGE_H - 50);
    const bubu = new Bubu(canvas.width, randomY);
    bubus.push(bubu);
    audio.atata.play();
}

function spawnFudu() {
    const fudu = new Fudu(TABLE_END - 50, dudu_y + DUDU_H/2 - 30);
    fudus.push(fudu);
    playSound(audio.shoot);
}


function collided(fudu: Fudu, bubu: Bubu) {
    return fudu.x + FUDU_SIZE > bubu.x && fudu.y > bubu.y - BUBU_SIZE/3 && fudu.y + FUDU_SIZE < bubu.y + BUBU_SIZE*4/3;
}

function draw(now: number) {
    // Time
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    showScreenGifs(state);

    if (state === "menu") {
        erase(state);
        drawMenu();
        window.requestAnimationFrame(draw);
        return;
    } else if (state === "gameOver") {
        erase(state);
        drawGameOver();
        audio.atata.pause();
        audio.dudu_sorry.play();
        window.requestAnimationFrame(draw);
        return;
    }

    elapsedTime += dt;
    duduTime += dt;

    // Update
    if (KEYS["Space"]) {
        spawnFudu();
        KEYS["Space"] = false;
    }
    if (KEYS["ArrowDown"]) dudu_y = Math.min(dudu_y + DUDU_SPEED*dt, DUDU_MAX);
    if (KEYS["ArrowUp"]) dudu_y = Math.max(dudu_y - DUDU_SPEED*dt, DUDU_MIN);

    addBubu();
    for (const fudu of fudus) {
        if (fudu.x > canvas.width) {
                state = "gameOver";
                break;
        }
        for (const bubu of bubus) {
            if (collided(fudu, bubu)) {
                fudu.eaten = true;
                bubu.isFatty = true;
                break;
            }

        }
    }

    for (const bubu of bubus) {
        if (bubu.isAngry()) {
            state = "gameOver";
            break;
        }
    }
    bubus = bubus.filter(b => !b.isFatty);
    for (const bubu of bubus) bubu.update(dt);
    for (const fudu of fudus) fudu.update(dt);
    fudus = fudus.filter(f => !f.eaten);

    erase(state);

    // Draw
    drawDudu(dudu_y, duduTime);
    for (const bubu of bubus) bubu.draw();
    for (const fudu of fudus) fudu.draw();


    window.requestAnimationFrame(draw);
}


window.requestAnimationFrame(draw);
