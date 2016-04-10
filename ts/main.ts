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
            this.physics.startSystem(Phaser.Physics.P2JS);
            this.physics.p2.gravity.y = 100;

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
            this.physics.p2.enable(this.ball);
            this.ball.body.clearShapes();
            this.ball.body.setCircle(10);
            this.ball.body.fixedRotation = true;

            this.leftArm = this.addArm(this.world.centerX - 80, this.world.height - 150, true, Phaser.Keyboard.LEFT);
            this.rightArm = this.addArm(this.world.centerX + 80, this.world.height - 150, false, Phaser.Keyboard.RIGHT);

            // this.ball.inputEnabled = true;
            // this.ball.events.onInputDown.add(() => {
            //     this.ball.body.applyImpulse([0, -10], this.ball.x, this.ball.y);
            // });
        }

        addArm(x:number, y:number, left:boolean, keyCode:number):Phaser.Sprite {
            var rect = this.make.graphics(0, 0);
            rect.lineStyle(8, 0xFF0000, 0.8);
            rect.beginFill(0xFF700B, 1);

            rect.drawRect(-50, -50, 100, 20);
            rect.endFill();

            var arm = this.add.sprite(x, y, rect.generateTexture());
            this.physics.p2.enable(arm);

            var offsetX = arm.width*0.45;
            var offsetY = 0;
            var maxDegrees = 45;
            if (left) { 
                offsetX = -offsetX;
                maxDegrees = -maxDegrees;
            }

            var pivotPoint = this.game.add.sprite(arm.x + offsetX, arm.y + offsetY);
            this.physics.p2.enable(pivotPoint);
            pivotPoint.body.static = true;
            pivotPoint.body.clearCollision(true, true);
            var constraint = this.game.physics.p2.createRevoluteConstraint(arm, [offsetX, offsetY], pivotPoint, [0, 0]);
            constraint.upperLimit = Phaser.Math.degToRad(maxDegrees);
            constraint.lowerLimit = Phaser.Math.degToRad(maxDegrees);
            constraint.upperLimitEnabled = true;
            constraint.lowerLimitEnabled = true;
            constraint.setMotorSpeed(2);
            constraint.enableMotor();

            var key = this.input.keyboard.addKey(keyCode);
            key.onDown.add(() => { 
                this.leftDown = true;
                constraint.upperLimit = Phaser.Math.degToRad(-maxDegrees);
                constraint.lowerLimit = Phaser.Math.degToRad(-maxDegrees);
            });
            key.onUp.add(() => { 
                this.leftDown = false;
                constraint.upperLimit = Phaser.Math.degToRad(maxDegrees);
                constraint.lowerLimit = Phaser.Math.degToRad(maxDegrees);
            });

            return arm;
        }

        update() {
            if (this.input.activePointer.isDown) {
                this.ball.body.x = this.input.activePointer.x;
                this.ball.body.y = this.input.activePointer.y;
                this.ball.body.velocity.x = 0;
                this.ball.body.velocity.y = 0;
            }
        }
    }
}
