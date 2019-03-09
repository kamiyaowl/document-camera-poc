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


//======================== danmaku generator ========================
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
        return dst;
    } else {
        // 追加確保
        const dst2 = dst.concat(initialize_shot(n - count));
        return dst2;
    }
}
function update_shot() {
    for(let i = 0 ; i < shots_use.length ; ++i) {
        // 画面外のリソース開放管理
        const margin = 100;
        if((!shots_use[i].visible) ||
           (shots_use[i].x < -margin || shots_use[i].x > window.innerWidth + margin) ||
           (shots_use[i].y < -margin || shots_use[i].y > window.innerHeight + margin)) {
            shots_use[i].visible = false;
            shots_free.push(shots_use[i]);
            shots_use.splice(i, 1);
        }
        // 自機との当たり判定
        const p = player_center.localToLocal(0, 0, shots_use[i]);
        if(shots_use[i].hitTest(p.x, p.y)) {
            return true;
        }
    }
    return false;
}
console.log(alloc_shot(3));
//======================== danmaku generator ========================


//============================== game ==============================

let start_date = new Date(); // 生存時間計算用
let is_run = true; // ゲームオーバー時に止める
function game_init() {
    start_date = new Date();
    is_run = true;
}
game_init();

function tick() {
    if (is_run) {
        // counter
        counter_text.text = window.innerWidth + "x" + window.innerHeight + " " + ((new Date() - start_date) / 1000.0) + " [sec]";
        // mouse cursor
        player_center.x = stage.mouseX;
        player_center.y = stage.mouseY;
        player.x = stage.mouseX;
        player.y = stage.mouseY;
        // hit test
        if(update_shot()) {
            console.log("gameover");
            is_run = false;
        }
    } else {
        // TODO:リスタート
    }
}
//============================== game ==============================
