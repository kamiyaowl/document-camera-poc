//============================== setup ==============================
console.log(" === sashimi === ");
// config params
function get_query() {
    if(!window.location.search) return {};
    else {
        const dst = {};
        const params = window.location.search.split("?")[1].split("&");
        params.forEach(function(v, i) {
            const values = v.split("=");
            dst[values[0]] = values[1];
        });
        return dst;
    }
}
const config = get_query();
if(!config.margin) config.margin = 100;
if(!config.center_shift_y) config.center_shift_y = 5;
if(!config.delay) config.delay = 200;
if(!config.interval) config.interval = 3000;
if(!config.difficulty) config.difficulty = 10; // 0 ~ 100で
if(!config.increase_difficulty) config.increase_difficulty = 1; 

console.log('config', config);
// const
const enemy_path = "./images/pose_udemakuri_man.png";
const player_path = "./images/food_sashimi.png";

const stage = new createjs.Stage("app");
if(createjs.Touch.isSupported()) {
    createjs.Touch.enable(stage);
}
const enemy = new createjs.Bitmap(enemy_path);
enemy.scaleX = 0.5;
enemy.scaleY = 0.5;
enemy.regX = 644 / 3;
enemy.regY = 800 / 2;
enemy.x = window.innerWidth / 2;
enemy.y = window.innerHeight / 5;
enemy.visible = true;
stage.addChild(enemy);

const player = new createjs.Bitmap(player_path);
player.regX = 400 / 2;
player.regY = 253 / 2;
stage.addChild(player);

const player_center = new createjs.Shape();
player_center.graphics.beginFill("Red").drawCircle(0,0,10);
player_center.alpha = 0.3;
player_center.visible = (config.show_pointer ? true : false);
stage.addChild(player_center);

const counter_text = new createjs.Text("Ready", "32px sans-serif", "Orange");
counter_text.z = 100;
stage.addChild(counter_text);

function fit_screen() {
    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;
}
fit_screen();
window.addEventListener('resize', function(){
    fit_screen();
});
console.log('ready');
//============================== setup ==============================


//======================== shot generator ========================
const shot_path = "./images/flower_tanpopo.png";
const shots_use = []; // .visible = true 使用中のリソース
const shots_free = []; // .visible = false 使用中のリソース
let shots_sum = 0;
// nの数だけShapeを確保する
function initialize_shot(n) {
    const dst = [];
    for(let i = 0 ; i < n ; ++i) {
        const s = new createjs.Bitmap(shot_path);
        s.scaleX = 0.5;
        s.scaleY = 0.5;
        s.visible = false;
        stage.addChild(s);
        shots_use.push(s);
        dst.push(s);
    }
    return dst;
}
// shots_freeかinitialize_shot()で指定された数を取得して返します。
// 同時にshots_useに登録する
function alloc_shot(n) {
    shots_sum += n;
    // 長生きしないしまぁもういいやって感じ
    return initialize_shot(n);
}
function update_shot() {
    for(let i = 0 ; i < shots_use.length ; ++i) {
        // 画面外のリソース開放管理
        if((!shots_use[i].visible) ||
           (shots_use[i].x < -config.margin || shots_use[i].x > window.innerWidth + config.margin) ||
           (shots_use[i].y < -config.margin || shots_use[i].y > window.innerHeight + config.margin)) {
            shots_use[i].visible = false;
            shots_free.push(shots_use[i]);
            shots_use.splice(i, 1);
            // console.log("release");
            continue;
        }
        // 自機との当たり判定
        const p = player_center.localToLocal(0, 0, shots_use[i]);
        if(shots_use[i].hitTest(p.x, p.y)) {
            return true;
        }
    }
    return false;
}

//======================== shot generator ========================

//======================== danmaku generator ========================

// 全方位に一斉に出す
// x,y: 中心
// n: 玉の数
// t: 時間
function circle(x, y, n = 15, t = 2000) {
    const shots = alloc_shot(n);
    const r = 2 * Math.max(window.innerWidth, window.innerHeight) + config.margin;
    for(let i = 0 ; i < n ; ++i) {
        const rad = 2 * Math.PI * i / n;
        const dx = r * Math.cos(rad) + x;
        const dy = r * Math.sin(rad) + y;
        createjs.Tween
                .get(shots[i])
                .to({x: x, y: y, visible: true})
                .wait(config.delay)
                .to({x: dx, y: dy}, t, createjs.Ease.sineIn);
    }
}

// 全方位に順番に玉を出す
// x,y: 中心
// n: 玉の数
// c: 回転数
// t: 時間
// t_start: 最初に球が出現してから止まっている時間
// delta_t: 弾ごとのディレイ
// start_ratio: 初速が本命の速度のどれ位化
function guruguru(x, y, n = 300, c = 11, t = 2000, t_start = 200, delta_t = 50, start_ratio = 0.05) {
    const shots = alloc_shot(n);
    const r = 2 * Math.max(window.innerWidth, window.innerHeight) + config.margin;
    const r_start = r * 0.05;
    for(let i = 0 ; i < n ; ++i) {
        const rad = 2 * Math.PI * i / (n / c);
        const dx_start = r_start * Math.cos(rad) + x;
        const dy_start = r_start * Math.sin(rad) + y;
        const dx = r * Math.cos(rad) + x;
        const dy = r * Math.sin(rad) + y;
        createjs.Tween
                .get(shots[i])
                .wait(delta_t * i)
                .to({x: x, y: y, visible: true})
                .to({x: dx_start, y: dy_start}, t_start, createjs.Ease.sineIn)
                .to({x: dx, y: dy}, t, createjs.Ease.sineIn);
    }
}

// 敵の方向に速度の違う玉を一気に出す
// x,y: 中心
// n: 玉の数
// t: 時間
// delta_t: 弾ごとのスピード差分 
function horming(x, y, n = 10, t = 2000, delta_t = 500) {
    const sx = player.x - x;
    const sy = player.y - y;
    const rad = Math.atan2(sy, sx);

    const r = 2 * Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2));
    const dx = r * Math.cos(rad) + x;
    const dy = r * Math.sin(rad) + y;
    const shots = alloc_shot(n);
    for(let i = 0 ; i < n ; ++i) {
        createjs.Tween
                .get(shots[i])
                .to({x: x, y: y, visible: true})
                .wait(config.delay)
                .to({x: dx, y: dy}, t + delta_t * i, createjs.Ease.sineIn);
    }
}
// 敵の方向に落ちていくような玉を出す
// x,y: 中心
// n: 玉の数
// t: 時間
// delta_t: 弾ごとのスピード差分 
function fall(x, y, n = 20, random_r = 500, t = 2000, random_t = 1000) {
    const shots = alloc_shot(n);
    for(let i = 0 ; i < n ; ++i) {
        const sx = x + (Math.random() * random_r - random_r / 2);
        const sy = y + (Math.random() * random_r - random_r / 2);
        const gx = x + (Math.random() * random_r - random_r / 2);
        const gy = window.innerHeight + config.margin;
        const delay = t + Math.random() * random_t;
        createjs.Tween
                .get(shots[i])
                .to({x: sx, y: sy, visible: true})
                .wait(delay)
                .to({x: gx, y: gy}, t, createjs.Ease.sineIn);
    }
}
function explode(x, y, n = 100, t = 2000, random_t = 2000) {
    const shots = alloc_shot(n);
    const r = 2 * Math.max(window.innerWidth, window.innerHeight) + config.margin;
    const r_start = r * 0.05;
    for(let i = 0 ; i < n ; ++i) {
        const rad = 2 * Math.PI * Math.random();
        const dx_start = r_start * Math.cos(rad) + x;
        const dy_start = r_start * Math.sin(rad) + y;
        const dx = r * Math.cos(rad) + x;
        const dy = r * Math.sin(rad) + y;
        const delay = Math.random() * random_t;
        createjs.Tween
                .get(shots[i])
                .to({x: x, y: y, visible: true})
                .wait(delay)
                .to({x: dx_start, y: dy_start}, t, createjs.Ease.sineIn)
                .to({x: dx, y: dy}, t, createjs.Ease.sineIn);
    }
}
//======================== danmaku generator ========================
// 使うたびに難しくしておく
let global_n = 10;
let global_t = 2000;
let guruguru_c = 11;
let guruguru_t_start = 200;
let guruguru_delta_t = 50;
let guruguru_start_ratio = 0.05;
let horming_delta_t = 500;
let fall_random_r = 500;
let fall_random_t = 1000;
let explode_random_t = 2000;

const random_danmaku = [
    (x, y) => {
        circle(x, y, global_n, global_t);
        global_n += config.difficulty / 10;
        global_t += config.difficulty / 10;
    },
    (x, y) => {
        guruguru(x, y, global_n, guruguru_c, global_t, guruguru_t_start, guruguru_delta_t, guruguru_start_ratio);
        global_n += config.difficulty / 10;
        global_t += config.difficulty / 10;
        guruguru_c += 1;
        guruguru_t_start += config.difficulty / 10;
        guruguru_delta_t += config.difficulty / 10;
    },
    (x, y) => {
        horming(x, y, global_n, global_t, horming_delta_t);
        global_n += config.difficulty / 10;
        global_t += config.difficulty / 10;
        horming_delta_t += 20;
    },
    (x, y) => {
        fall(x, y, global_n, fall_random_r, global_t, fall_random_t);
        global_n += config.difficulty / 10;
        global_t += config.difficulty / 10;
        fall_random_r += 20;
        fall_random_t += 20;
    },
    (x, y) => {
        explode(x, y, global_n,  global_t, explode_random_t);
        global_n += config.difficulty / 10;
        global_t += config.difficulty / 10;
        explode_random_r += 20;
    },
];
function update_enemy() {
    if ((new Date() - last_event) > config.interval) {
        // 本体の移動
        const x = window.innerWidth * Math.random();
        const y = window.innerHeight / 3 * Math.random();
        createjs.Tween
                .get(enemy)
                .wait(config.interval / 10)
                .to({x: x, y: y, visible: true}, config.interval / 10, createjs.Ease.sineInOut);
        // 弾幕を発生させる
        random_danmaku[Math.round(Math.random() * random_danmaku.length)](enemy.x, enemy.y);
        // だんだん難易度を上げる
        config.interval -= config.difficulty * 10;
        config.difficulty += config.increase_difficulty; // 難易度も上げとく
        if (config.interval < 1000) config.interval = 1000;
        last_event = new Date();
    }
}

//============================== game ==============================

let start_date = new Date(); // 生存時間計算用
let is_run = false; // ゲームオーバー時に止める
let last_event = new Date();
function game_init() {
    start_date = new Date();
    last_event = new Date() - config.interval / 2;
    is_run = true;
    createjs.Ticker.paused = false;
}
function tick() {
    if (is_run) {
        // counter
        counter_text.text = window.innerWidth + "x" + window.innerHeight + " tampopo:" + Math.floor(shots_sum) + " " + Math.floor((new Date() - start_date) / 1000.0) + " [sec]";
        // mouse cursor
        player_center.x = stage.mouseX;
        player_center.y = stage.mouseY - config.center_shift_y;
        player.x = stage.mouseX;
        player.y = stage.mouseY;
        // enemy event
        update_enemy();
        // hit test
        if(update_shot() && !config.no_stop) {
            if (!config.debug) {
                createjs.Ticker.paused = true;
                is_run = false;
            }
            console.log("gameover", config);
        }
    }
}

//============================== game ==============================
createjs.Ticker.addEventListener('tick', function(){
    tick();
    stage.update();
});
setTimeout(function(){
    game_init();
}, 1000);
