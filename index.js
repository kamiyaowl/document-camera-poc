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
const shots = [];
function generate_shot(n) {
    const diff = n - shots.length;
    if(diff < 1) return;
    else {
        for(let i = 0 ; i < diff ; ++i) {
            const s = new createjs.Bitmap(shot_path);
            s.scaleX = 0.5;
            s.scaleY = 0.5;
            // s.visible = false;
            stage.addChild(s);
            shots.push(s);
        }
    }
}
function is_hit() {
    for(let i = 0 ; i < shots.length ; ++i) {
        if(!shots[i].visible) continue;
        const p = player_center.localToLocal(0, 0, shots[i]);
        if(shots[i].hitTest(p.x, p.y)) {
            return true;
        }
    }
    return false;
}
generate_shot(100);
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
        if(is_hit()) {
            console.log("gameover");
            is_run = false;
        }
    } else {
        // TODO:リスタート
    }
}
//============================== game ==============================
