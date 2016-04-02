/// <reference path="./phaser.d.ts"/>

module Pinball {

    export class Main extends Phaser.State {

        ball: Phaser.Sprite;
        leftArm: Phaser.Sprite;
        rightArm: Phaser.Sprite;

        create() {
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

            rect.drawRect(-50, -50, 100, 20);
            rect.endFill();

            this.leftArm = this.add.sprite(
                this.world.centerX - 120, 
                this.world.centerY,
                rect.generateTexture()
            );
            this.leftArm.anchor.set(0.1, 0.5);
            this.leftArm.angle = 45;

            this.leftArm = this.add.sprite(
                this.world.centerX + 120, 
                this.world.centerY,
                rect.generateTexture()
            );
            this.leftArm.anchor.set(0.9, 0.5);
            this.leftArm.angle = -45;

        }
    }
}
