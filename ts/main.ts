/// <reference path="./phaser.d.ts"/>
/// <reference path="./p2.d.ts"/>

module Pinball {

    export class Main extends Phaser.State {

        ball: Phaser.Sprite;
        leftArm: Phaser.Sprite;
        rightArm: Phaser.Sprite;
        leftDown: boolean;
        rightDown: boolean;

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
                this.world.height - 100,
                rect.generateTexture()
            );
            this.leftArm.anchor.set(0.1, 0.5);
            this.leftArm.angle = 45;

            this.rightArm = this.add.sprite(
                this.world.centerX + 120, 
                this.world.height - 100,
                rect.generateTexture()
            );
            this.rightArm.anchor.set(0.9, 0.5);
            this.rightArm.angle = -45;

            var leftKey = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            leftKey.onDown.add(() => { console.log('left down'); this.leftDown = true });
            leftKey.onUp.add(() => { this.leftDown = false });

            var rightKey = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            rightKey.onDown.add(() => { this.rightDown = true });
            rightKey.onUp.add(() => { this.rightDown = false });

            this.leftDown = false;
            this.rightDown = false;

            this.physics.startSystem(Phaser.Physics.P2JS);
            this.physics.p2.enable([ this.ball, this.leftArm /*, this.rightArm */ ], true);
            this.ball.body.clearShapes();
            this.ball.body.setCircle(10);
            this.ball.inputEnabled = true;
            this.ball.events.onInputDown.add(() => {
                this.ball.body.applyImpulse([0, -10], this.ball.x, this.ball.y);
            });

            // var leftArmBody:Phaser.Physics.P2.Body = this.leftArm.body;
            var offset = 20;
            var pivotPoint = this.game.add.sprite(this.leftArm.x + offset, this.leftArm.y);
            this.game.physics.p2.enable(pivotPoint);
            pivotPoint.body.static = true;
            pivotPoint.body.clearCollision(true, true);
            var constraint = this.game.physics.p2.createRevoluteConstraint(this.leftArm, [offset, 0], pivotPoint, [0, 0]);
            // this.leftArm.anchor.set(0.1, 0.5);
            // leftArmBody.updateCollisionMask();
            // leftArmBody.clearShapes();
            // leftArmBody.setRectangleFromSprite(this.leftArm);
        }

        update() {
            if (this.leftDown) {
                this.leftArm.body.angle -= 15;
            } else {
                this.leftArm.body.angle += 15;
            }
            this.leftArm.angle = Phaser.Math.clamp(this.leftArm.angle, -45, 45);

            if (this.rightDown) {
                this.rightArm.angle += 15;
            } else {
                this.rightArm.angle -= 15;
            }
            this.rightArm.angle = Phaser.Math.clamp(this.rightArm.angle, -45, 45);
        }
    }
}
