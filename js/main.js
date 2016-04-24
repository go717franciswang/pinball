var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="./phaser.d.ts"/>
/// <reference path="./p2.d.ts"/>
/// <reference path="./jquery.d.ts"/>
var game;
var Pinball;
(function (Pinball) {
    var Main = (function (_super) {
        __extends(Main, _super);
        function Main() {
            _super.apply(this, arguments);
        }
        Main.prototype.preload = function () {
            this.load.path = 'assets/';
            this.load.images(['ball', 'arm_left', 'table']);
            this.load.spritesheet('faces', 'faces.png', 20, 20);
            this.load.physics('arm');
            this.load.physics('physicsData');
            game = this;
        };
        Main.prototype.create = function () {
            this.stage.backgroundColor = 0xffffff;
            this.physics.startSystem(Phaser.Physics.P2JS);
            this.physics.p2.gravity.y = 100;
            this.physics.p2.setImpactEvents(true);
            this.table = this.addTable();
            this.ball = this.addBall(this.world.width - 20, this.world.height - 100);
            this.gun = this.addGun(this.world.width - 30, this.world.height - 50, 10, 50, Phaser.Keyboard.SPACEBAR);
            this.leftArm = this.addArm(this.world.centerX - 90, this.world.height - 130, true, Phaser.Keyboard.LEFT);
            this.rightArm = this.addArm(this.world.centerX + 40, this.world.height - 130, false, Phaser.Keyboard.RIGHT);
            this.bumpers = this.add.physicsGroup(Phaser.Physics.P2JS);
            this.addBumper(217, 122);
            this.addBumper(217, 215);
            this.addBumper(169, 165);
            this.addBumper(268, 165);
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
        // taken from http://www.html5gamedevs.com/topic/4795-it-is-possible-to-scale-the-polygon-with-p2-physics/
        Main.prototype.resizePolygon = function (originalPhysicsKey, newPhysicsKey, shapeKey, scale) {
            var newData = [];
            var cache = this.cache;
            $.each(cache._cache.physics[originalPhysicsKey].data, function (key, values) {
                $.each(values, function (key2, values2) {
                    var shapeArray = [];
                    $.each(values2.shape, function (key3, values3) {
                        shapeArray.push(values3 * scale);
                    });
                    newData.push({ shape: shapeArray });
                });
            });
            var item = {};
            item[shapeKey] = newData;
            this.game.load.physics(newPhysicsKey, '', item);
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
            var b = arm.body;
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
        Main.prototype.addBumper = function (x, y) {
            var bumper = this.bumpers.create(x, y, 'faces', 0);
            bumper.originalX = x;
            bumper.scale.setTo(2);
            this.physics.p2.enable(bumper);
            bumper.body.clearShapes();
            bumper.body.setCircle(bumper.width / 2);
            bumper.body.static = true;
            bumper.body.createBodyCallback(this.ball, this.hitBumper, this);
            return bumper;
        };
        Main.prototype.hitBumper = function (bumperBody, ballBody) {
            var s = bumperBody.sprite;
            var f = s.frame;
            s.frame = (f + 1) % 5;
            var offset = 5;
            if (Math.random() > 0.5)
                offset = -5;
            var shake = this.add.tween(bumperBody).to({ x: s.x + offset }, 50, Phaser.Easing.Bounce.InOut, false, 0, 4, true);
            // make sure it bumps back to the original position
            shake.onComplete.add(function () { bumperBody.x = bumperBody.sprite.originalX; });
            shake.start();
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
            //this.game.debug.spriteInfo(this.ball, 32, 32);
            this.game.debug.pointer(this.input.activePointer);
        };
        return Main;
    }(Phaser.State));
    Pinball.Main = Main;
})(Pinball || (Pinball = {}));
