//============================== setup ==============================
console.log(" === sashimi === ");
// const
const sashimi_path = "./images/food_sashimi.png";
const tampopo_path = "./images/flower_tanpopo.png";
const nakayoshi_path = "./images/kaisya_nakayoshi.png";
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
player_center.graphics.beginFill("Red").drawCircle(0,0,100);
player_center.alpha = 0.3;
stage.addChild(player_center);

createjs.Ticker.addEventListener('tick', function(){
    tick();
    stage.update();
});

fit_screen();
console.log('ready');
//============================== setup ==============================
function fit_screen() {
    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;
}
function tick() {
    // mouse cursor
    player_center.x = stage.mouseX;
    player_center.y = stage.mouseY;
    player.x = stage.mouseX;
    player.y = stage.mouseY;
}
window.addEventListener('resize', function(){
    fit_screen();
});