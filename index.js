window.addEventListener('load', function () {
    console.log(" === sashimi === ");
    const width = document.getElementById("container").clientWidth;
    const height = document.getElementById("container").clientHeight;
    console.log(width, height);

    const canvas = document.getElementById('app');
    canvas.width = width;
    canvas.height = height;

    const sashimi_path = "./images/food_sashimi.png";
    const tampopo_path = "./images/flower_tanpopo.png";
    const nakayoshi_path = "./images/kaisya_nakayoshi.png";
    const player_path = "./images/pose_udemakuri_man.png";

    const stage = new createjs.Stage("app");

    const shape = new createjs.Shape();
    shape.graphics.beginFill("DarkRed");
    shape.graphics.drawCircle(0, 0, 100);
    stage.addChild(shape);

    const player = new createjs.Bitmap(player_path);
    stage.addChild(player);

    createjs.Ticker.setFPS(30);
    createjs.Ticker.addEventListener('tick', function(){
        stage.update();
    });

    console.log('ready');
});