PinBall = {};
PinBall.Main = function(game) {
}

PinBall.Main.prototype = {
    create: function() {
        var circle = this.make.graphics(0, 0);
        circle.lineStyle(8, 0xFF0000, 0.8);
        circle.beginFill(0xFF700B, 1);
        circle.drawCircle(-50, -50, 10);
        circle.endFill();

        this.ball = this.add.sprite(
            this.world.centerX,
            this.world.centerY,
            circle.generateTexture()
        );
        this.ball.anchor.set(0.5);
    }
}
