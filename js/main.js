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
        Main.prototype.preload = function () {
            this.load.path = 'assets/';
            this.load.images(['ball', 'arm_left', 'angry_face', 'confused_face',
                'dead_face', 'happy_face', 'sad_face', 'table']);
            this.load.physics('arm');
            this.load.physics('physicsData');
        };
        Main.prototype.create = function () {
            this.stage.backgroundColor = 0xffffff;
            this.physics.startSystem(Phaser.Physics.P2JS);
            this.physics.p2.gravity.y = 100;
            this.table = this.addTable();
            this.ball = this.addBall(this.world.width - 20, this.world.height - 100);
            this.gun = this.addGun(this.world.width - 30, this.world.height - 50, 10, 50, Phaser.Keyboard.SPACEBAR);
            this.leftArm = this.addArm(this.world.centerX - 90, this.world.height - 150, true, Phaser.Keyboard.LEFT);
            this.rightArm = this.addArm(this.world.centerX + 60, this.world.height - 150, false, Phaser.Keyboard.RIGHT);
        };
        Main.prototype.addTable = function () {
            var table = this.add.sprite(this.world.width / 2, this.world.height / 2, 'table');
            this.physics.p2.enable(table);
            table.body.clearShapes();
            table.body.loadPolygon('physicsData', 'table');
            table.body.static = true;
            return table;
        };
        Main.prototype.addGun = function (x, y, w, h, keyCode) {
            var rect = this.make.graphics(0, 0);
            rect.lineStyle(8, 0xFF0000, 0.8);
            rect.beginFill(0xFF700B, 1);
            rect.drawRect(-50, -50, w, h);
            rect.endFill();
            var gun = this.add.sprite(x + w / 2, y + h / 2, rect.generateTexture());
            this.physics.p2.enable(gun);
            gun.body.static = true;
            var key = this.input.keyboard.addKey(keyCode);
            key.onDown.add(function () {
                gun.body.y += 20;
            });
            key.onUp.add(function () {
                gun.body.y -= 20;
            });
            gun.body.onEndContact.add(function (contactWithBody, a2, a3, a4) {
                contactWithBody.applyImpulseLocal([0, 50], 0, 0);
            });
            return gun;
        };
        Main.prototype.addBall = function (x, y) {
            var ball = this.add.sprite(x, y, 'ball');
            ball.scale.set(2);
            this.physics.p2.enable(ball);
            ball.body.clearShapes();
            ball.body.setCircle(10);
            ball.body.fixedRotation = true;
            return ball;
        };
        Main.prototype.addArm = function (x, y, left, keyCode) {
            var arm = this.add.sprite(x, y, 'arm_left');
            this.physics.p2.enable(arm);
            arm.body.clearShapes();
            if (left) {
                arm.body.loadPolygon('arm', 'arm_left');
            }
            else {
                arm.body.loadPolygon('arm', 'arm_right');
            }
            var offsetX = arm.width * 0.45;
            var offsetY = 0;
            var maxDegrees = 45;
            if (left) {
                offsetX = -offsetX;
                maxDegrees = -maxDegrees;
            }
            else {
                arm.scale.x *= -1;
            }
            arm.scale.x *= 0.75;
            arm.scale.y *= 0.75;
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
            key.onDown.add(function () {
                constraint.upperLimit = Phaser.Math.degToRad(-maxDegrees);
                constraint.lowerLimit = Phaser.Math.degToRad(-maxDegrees);
            });
            key.onUp.add(function () {
                constraint.upperLimit = Phaser.Math.degToRad(maxDegrees);
                constraint.lowerLimit = Phaser.Math.degToRad(maxDegrees);
            });
            return arm;
        };
        Main.prototype.update = function () {
            if (this.input.activePointer.isDown) {
                this.ball.body.x = this.input.activePointer.x;
                this.ball.body.y = this.input.activePointer.y;
                this.ball.body.velocity.x = 0;
                this.ball.body.velocity.y = 0;
            }
        };
        Main.prototype.render = function () {
            //console.log(this.input.activePointer.x, this.input.activePointer.y);
            this.game.debug.spriteInfo(this.leftArm, 32, 32);
        };
        return Main;
    }(Phaser.State));
    Pinball.Main = Main;
})(Pinball || (Pinball = {}));
