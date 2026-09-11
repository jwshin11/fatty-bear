export const STAGE_W = 1400;

// The stage is a HUD band stacked on top of the playfield. The playfield keeps
// the 800px it has always had; the meter gets its own strip above it.
export const HUD_H = 70;
export const PLAY_H = 800;
export const STAGE_H = HUD_H + PLAY_H;

export const TABLE_END = 250;

export const DUDU_X = 30;
export const DUDU_H = 170;
export const DUDU_MIN = HUD_H + 20;
export const DUDU_MAX = STAGE_H - DUDU_H;
export const DUDU_SPEED = 250;
export const DUDU_SWITCH = 3;

export const BUBU_SIZE = 120;
export const FUDU_SIZE = 70;

// A bubu walks in bursts: it creeps for a while, stops, then creeps again. Each
// bubu draws its own pace from these ranges, and re-draws the two durations on
// every burst, so no two of them march in step. The midpoints match the single
// pace they all used to share, so the average crossing time is unchanged.
export const BUBU_SPEED_MIN = 110;
export const BUBU_SPEED_MAX = 200;
export const BUBU_PAUSE_MIN = 0.15;
export const BUBU_PAUSE_MAX = 0.45;
export const BUBU_MOVE_MIN = 0.35;
export const BUBU_MOVE_MAX = 0.80;

export const FUDU_SPEED = 190;

// The band a bubu's sprite has to stay inside to be fully on screen.
export const BUBU_Y_MIN = HUD_H;
export const BUBU_Y_MAX = STAGE_H - BUBU_SIZE;

// Bubus walk a straight line in. The one riding a duck flies instead, drifting
// up and down as it comes, on its own amplitude and period. Which sprite that
// is lives in entities.ts, next to the other sheet names.
export const BUBU_WANDER_AMP_MIN = 45;
export const BUBU_WANDER_AMP_MAX = 110;
export const BUBU_WANDER_PERIOD_MIN = 1.6;
export const BUBU_WANDER_PERIOD_MAX = 3.2;

// Fudus a bubu has to eat before the bears are full.
export const FEED_GOAL = 30;
