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
            this.world.width - 10,
            this.world.height - 10,
            circle.generateTexture()
        );
        this.ball.anchor.set(0.5);

        var rect = this.make.graphics(0, 0);
        rect.lineStyle(8, 0xFF0000, 0.8);
        rect.beginFill(0xFF700B, 1);
        rect.drawRectangle(-50, -50, 50, 50);
        rect.endFill();

        this.arm = this.add.sprite(
            this.world.centerX, 
            this.world.centerY,
            rect.generateTexture()
        );
        this.arm.anchor.set(0.5);
    }
}
