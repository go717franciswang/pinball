var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="./phaser.d.ts"/>
/// <reference path="./p2.d.ts"/>
var Pinball;
(function (Pinball) {
    var Main = (function (_super) {
        __extends(Main, _super);
        function Main() {
            _super.apply(this, arguments);
        }
        Main.prototype.create = function () {
            var _this = this;
            var circle = this.make.graphics(0, 0);
            circle.lineStyle(8, 0xFF0000, 0.8);
            circle.beginFill(0xFF700B, 1);
            circle.drawCircle(-50, -50, 10);
            circle.endFill();
            this.ball = this.add.sprite(this.world.width - 10, this.world.height - 10, circle.generateTexture());
            this.ball.anchor.set(0.5);
            var rect = this.make.graphics(0, 0);
            rect.lineStyle(8, 0xFF0000, 0.8);
            rect.beginFill(0xFF700B, 1);
            rect.drawRect(-50, -50, 100, 20);
            rect.endFill();
            this.leftArm = this.add.sprite(this.world.centerX - 120, this.world.height - 100, rect.generateTexture());
            this.leftArm.anchor.set(0.1, 0.5);
            //this.leftArm.angle = 45;
            this.rightArm = this.add.sprite(this.world.centerX + 120, this.world.height - 100, rect.generateTexture());
            this.rightArm.anchor.set(0.9, 0.5);
            this.rightArm.angle = -45;
            var rightKey = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            rightKey.onDown.add(function () { _this.rightDown = true; });
            rightKey.onUp.add(function () { _this.rightDown = false; });
            this.leftDown = false;
            this.rightDown = false;
            this.physics.startSystem(Phaser.Physics.P2JS);
            this.physics.p2.enable([this.ball, this.leftArm /*, this.rightArm */], true);
            this.ball.body.clearShapes();
            this.ball.body.setCircle(10);
            this.ball.inputEnabled = true;
            this.ball.events.onInputDown.add(function () {
                _this.ball.body.applyImpulse([0, -10], _this.ball.x, _this.ball.y);
            });
            // var leftArmBody:Phaser.Physics.P2.Body = this.leftArm.body;
            var offsetX = -this.leftArm.width * 0.45;
            var offsetY = 0;
            var pivotPoint = this.game.add.sprite(this.leftArm.x + offsetX, this.leftArm.y + offsetY);
            this.game.physics.p2.enable(pivotPoint);
            pivotPoint.body.static = true;
            pivotPoint.body.clearCollision(true, true);
            var constraint = this.game.physics.p2.createRevoluteConstraint(this.leftArm, [offsetX, offsetY], pivotPoint, [0, 0]);
            constraint.upperLimit = Phaser.Math.degToRad(-45);
            constraint.lowerLimit = Phaser.Math.degToRad(-45);
            constraint.upperLimitEnabled = true;
            constraint.lowerLimitEnabled = true;
            constraint.setMotorSpeed(2);
            constraint.enableMotor();
            var leftKey = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            leftKey.onDown.add(function () {
                _this.leftDown = true;
                constraint.upperLimit = Phaser.Math.degToRad(45);
                constraint.lowerLimit = Phaser.Math.degToRad(45);
            });
            leftKey.onUp.add(function () {
                _this.leftDown = false;
                constraint.upperLimit = Phaser.Math.degToRad(-45);
                constraint.lowerLimit = Phaser.Math.degToRad(-45);
            });
            // this.leftArm.anchor.set(0.1, 0.5);
            // leftArmBody.updateCollisionMask();
            // leftArmBody.clearShapes();
            // leftArmBody.setRectangleFromSprite(this.leftArm);
        };
        Main.prototype.update = function () {
            // if (this.leftDown) {
            //     this.leftArm.body.angle -= 15;
            // } else {
            //     this.leftArm.body.angle += 15;
            // }
            // this.leftArm.body.angle = Phaser.Math.clamp(this.leftArm.body.angle, -45, 45);
            if (this.rightDown) {
                this.rightArm.angle += 15;
            }
            else {
                this.rightArm.angle -= 15;
            }
            this.rightArm.angle = Phaser.Math.clamp(this.rightArm.angle, -45, 45);
        };
        return Main;
    }(Phaser.State));
    Pinball.Main = Main;
})(Pinball || (Pinball = {}));
