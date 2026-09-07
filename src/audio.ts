export const audio = {
    shoot: new Audio("sounds/pew.mp3"),
    atata: new Audio("sounds/atata.mp3"),
    dudu_sorry: new Audio("sounds/dudu-sorry.mp3"),
};

audio.atata.loop = true;
audio.atata.volume = 0.5;
audio.shoot.volume = 0.5;

export function playSound(sound: HTMLAudioElement) {
    sound.currentTime = 0;
    sound.play();
}
