window.addEventListener('load', function () {
    console.log(" === sashimi === ");
    const width = window.innerWidth;
    const height = window.innerHeight * 0.9;
    console.log(width, height);

    const canvas = document.getElementById('app');
    canvas.width = width;
    canvas.height = height;

    const sashimi_path = "./images/food_sashimi.png";
    const tampopo_path = "./images/flower_tanpopo.png";

    // Stageオブジェクトを作成します
    var stage = new createjs.Stage("app");

    // 円を作成します
    var shape = new createjs.Shape();
    shape.graphics.beginFill("DarkRed"); // 赤色で描画するように設定
    shape.graphics.drawCircle(0, 0, 100); //半径 100px の円を描画
    shape.x = 200; // X 座標 200px の位置に配置
    shape.y = 200; // Y 座標 200px の位置に配置
    stage.addChild(shape); // 表示リストに追加

    // Stageの描画を更新します
    stage.update();

    console.log('ready');
});