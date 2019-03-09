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

console.log('config', config);
// const
const sashimi_path = "./images/food_sashimi.png";
const player_path = "./images/food_sashimi.png";

const stage = new createjs.Stage("app");
if(createjs.Touch.isSupported()) {
    createjs.Touch.enable(stage);
}

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
stage.addChild(counter_text);

createjs.Ticker.addEventListener('tick', function(){
    tick();
    stage.update();
});

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

// nの数だけShapeを確保する
function initialize_shot(n) {
    const dst = [];
    for(let i = 0 ; i < n ; ++i) {
        const s = new createjs.Bitmap(shot_path);
        s.scaleX = 0.5;
        s.scaleY = 0.5;
        // s.visible = false;
        stage.addChild(s);
        shots_use.push(s);
        dst.push(s);
    }
    return dst;
}
// shots_freeかinitialize_shot()で指定された数を取得して返します。
// 同時にshots_useに登録する
function alloc_shot(n) {
    const dst = [];
    const count = Math.min(shots_free.length, n);
    for(let i = 0 ; i < count ; ++i) {
        dst.push(shots_free[i]);
        shots_use.push(shots_free[i]);
        shots_free.shift();
    }
    if (n == count) {
        // console.log("reuse", n);
        return dst;
    } else {
        // 追加確保
        const dst2 = dst.concat(initialize_shot(n - count));
        // console.log("reuse", count, "initialize", n - count);
        return dst2;
    }
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
function guruguru(x, y, n = 300, c = 11, t = 2000, t_start = 200, delta_t = 50) {
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
                .wait(config.delay)
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
    console.log(dx,dy,r,rad, sx, sy);
    const shots = alloc_shot(n);
    for(let i = 0 ; i < n ; ++i) {
        createjs.Tween
                .get(shots[i])
                .to({x: x, y: y, visible: true})
                .wait(config.delay)
                .to({x: dx, y: dy}, t + delta_t * i, createjs.Ease.sineIn);
    }
}
circle(10, 10);
guruguru(10, 10);
horming(0, 0);

//======================== danmaku generator ========================


//============================== game ==============================

let start_date = new Date(); // 生存時間計算用
let is_run = true; // ゲームオーバー時に止める
function game_init() {
    start_date = new Date();
    is_run = true;
    createjs.Ticker.paused = false;
}
game_init();

function tick() {
    if (is_run) {
        // counter
        counter_text.text = window.innerWidth + "x" + window.innerHeight + " " + ((new Date() - start_date) / 1000.0) + " [sec]";
        // mouse cursor
        player_center.x = stage.mouseX;
        player_center.y = stage.mouseY - config.center_shift_y;
        player.x = stage.mouseX;
        player.y = stage.mouseY;
        // hit test
        if(update_shot() && !config.no_stop) {
            // createjs.Ticker.paused = true;
            // is_run = false;
            console.log("gameover");

        }
    } else {
        // TODO:リスタート
    }
}
//============================== game ==============================
