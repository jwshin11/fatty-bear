import { mountMenuGifs } from "./menuLayout";
import { mountRestartGifs } from "./restartLayout";
import { mountCompleteGifs } from "./completeLayout";
import { canvas } from "./renderer";
import { erase, drawMenu, drawGameOver, drawWin, drawMeter } from "./screens";
import { Bubu, Fudu, drawDudu } from "./entities";
import { audio, playSound } from "./audio";
import { HUD_H, BUBU_Y_MIN, BUBU_Y_MAX, TABLE_END, DUDU_MIN, DUDU_MAX, DUDU_H, DUDU_SPEED, BUBU_SIZE, FUDU_SIZE, FEED_GOAL } from "./constants";
import type { GameState } from "./types";

const stage = document.getElementById("stage")!;
const menuGifs = document.getElementById("menu-gifs")!;
const restartGifs = document.getElementById("restart-gifs")!;
const completeGifs = document.getElementById("complete-gifs")!;

mountMenuGifs(menuGifs);
mountRestartGifs(restartGifs);
mountCompleteGifs(completeGifs);

stage.insertBefore(canvas, menuGifs);

// Every gif table was laid out against the 800-tall playfield, so the layers
// start where the playfield starts rather than at the top of the taller stage.
menuGifs.style.top = `${HUD_H}px`;
restartGifs.style.top = `${HUD_H}px`;
completeGifs.style.top = `${HUD_H}px`;


const KEYS = {
    "ArrowUp": false,
    "ArrowDown": false,
    "Space": false,
}

let state: GameState = "menu";
let last = performance.now();

let dudu_y = DUDU_MIN;
let fed = 0;
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
    if (state === "playing") return;
    startGame();
});

function startGame() {
    bubus = [];
    fudus = [];
    dudu_y = DUDU_MIN;
    fed = 0;
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
    completeGifs.style.display = state === "win" ? "block" : "none";
}


function addBubu() {
    if (elapsedTime < interval) return

    interval = Math.random()*2;
    elapsedTime = 0;
    const randomY = BUBU_Y_MIN + Math.random() * (BUBU_Y_MAX - BUBU_Y_MIN);
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
    } else if (state === "win") {
        erase(state);
        drawWin();
        audio.atata.pause();
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
                fed++;
                break;
            }

        }
    }

    if (fed >= FEED_GOAL) {
        state = "win";
        window.requestAnimationFrame(draw);
        return;
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
    drawMeter(fed, duduTime, dt);


    window.requestAnimationFrame(draw);
}


window.requestAnimationFrame(draw);
