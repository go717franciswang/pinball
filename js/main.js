var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="./phaser.d.ts"/>
var Pinball;
(function (Pinball) {
    var Menu = (function (_super) {
        __extends(Menu, _super);
        function Menu() {
            _super.apply(this, arguments);
        }
        Menu.prototype.preload = function () {
            this.load.path = 'assets/';
            this.load.bitmapFont('04B_30', '04B_30.png', '04B_30.fnt');
            this.load.json('gameSetting', 'gameSetting.json');
            this.load.image('preloadBar', 'loader.png');
        };
        Menu.prototype.create = function () {
            var _this = this;
            this.setting = this.cache.getJSON('gameSetting');
            this.stage.backgroundColor = 0xc0c0c0;
            this.buttons = this.add.group();
            var spacing = 50;
            this.setting['boards'].forEach(function (boardSetting, idx) {
                var callback = function () {
                    _this.game.state.start('Loader', true, false, boardSetting);
                };
                var x = _this.world.centerX;
                var y = idx * spacing;
                var text = _this.add.bitmapText(x, y, '04B_30', boardSetting['name']);
                text.anchor.setTo(0.5);
                text.inputEnabled = true;
                text.events.onInputUp.add(callback);
                _this.buttons.addChild(text);
            });
            this.buttons.y = this.world.centerY - spacing * this.setting['boards'].length / 2;
        };
        return Menu;
    }(Phaser.State));
    Pinball.Menu = Menu;
})(Pinball || (Pinball = {}));
/// <reference path="./phaser.d.ts"/>
var Pinball;
(function (Pinball) {
    var Loader = (function (_super) {
        __extends(Loader, _super);
        function Loader() {
            _super.apply(this, arguments);
        }
        Loader.prototype.init = function (boardSetting) {
            this.boardSetting = boardSetting;
        };
        Loader.prototype.preload = function () {
            var _this = this;
            this.load.path = 'assets/';
            this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloadBar');
            this.preloadBar.anchor.setTo(0.5);
            this.load.setPreloadSprite(this.preloadBar);
            this.boardSetting.assets.forEach(function (a) {
                switch (a.type) {
                    case "images":
                        _this.load.images(a.files);
                        break;
                    case "spritesheet":
                        _this.load.spritesheet(a.key, a.file, a.w, a.h);
                        break;
                    case "physics":
                        _this.load.physics(a.file);
                        break;
                }
            });
        };
        Loader.prototype.create = function () {
            var _this = this;
            var tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
            tween.onComplete.add(function () {
                _this.game.state.start('Main', true, false, _this.boardSetting);
            }, this);
        };
        return Loader;
    }(Phaser.State));
    Pinball.Loader = Loader;
})(Pinball || (Pinball = {}));
/// <reference path="./phaser.d.ts"/>
/// <reference path="./p2.d.ts"/>
/// <reference path="./jquery.d.ts"/>
var game;
var DEBUG = true;
var Pinball;
(function (Pinball) {
    var Main = (function (_super) {
        __extends(Main, _super);
        function Main() {
            _super.apply(this, arguments);
        }
        Main.prototype.init = function (boardSetting) {
            this.boardSetting = boardSetting;
        };
        Main.prototype.create = function () {
            var _this = this;
            this.stage.backgroundColor = 0xffffff;
            this.physics.startSystem(Phaser.Physics.P2JS);
            this.physics.p2.gravity.y = 100;
            this.physics.p2.setImpactEvents(true);
            this.ballMaterial = this.physics.p2.createMaterial('ballMaterial');
            this.tableMaterial = this.physics.p2.createMaterial('tableMaterial');
            this.bumperMaterial = this.physics.p2.createMaterial('bumperMaterial');
            this.boardSetting.components.forEach(function (c) {
                switch (c.component) {
                    case "table":
                        _this.table = _this.addTable(c);
                        break;
                    case "ball":
                        _this.ballStartingPos = c;
                        _this.ball = _this.addBall(c);
                        break;
                    case "arm_left":
                        _this.leftArm = _this.addArm(c, true, Phaser.Keyboard.LEFT);
                        break;
                    case "arm_right":
                        _this.rightArm = _this.addArm(c, false, Phaser.Keyboard.RIGHT);
                        break;
                    case "bumpers":
                        _this.bumpers = _this.add.physicsGroup(Phaser.Physics.P2JS);
                        c.positions.forEach(function (p) {
                            _this.addBumper(p, c);
                        });
                        break;
                }
            });
            this.gun = this.addGun(this.world.width - 30, this.world.height - 50, 10, 50, Phaser.Keyboard.SPACEBAR);
            this.dropHole = this.addDropHole();
            this.ballVsTableMaterial = this.physics.p2.createContactMaterial(this.ballMaterial, this.tableMaterial);
            this.ballVsTableMaterial.restitution = 0.5;
            this.ballVsBumperMaterial = this.physics.p2.createContactMaterial(this.ballMaterial, this.bumperMaterial);
            this.ballVsBumperMaterial.restitution = 2.5;
            this.score = 0;
            this.scoreText = this.add.bitmapText(0, this.world.height, '04B_30', 'SCORE: 0', 12);
            this.scoreText.anchor.setTo(0, 1);
            this.lifes = 3;
            this.lifesText = this.add.bitmapText(0, this.world.height - 20, '04B_30', 'LIFES: 3', 12);
            this.lifesText.anchor.setTo(0, 1);
        };
        Main.prototype.addTable = function (c) {
            var table = this.add.sprite(this.world.width / 2, this.world.height / 2, c.key);
            this.physics.p2.enable(table);
            table.body.clearShapes();
            table.body.loadPolygon(c.physics, 'table');
            table.body.static = true;
            table.body.setMaterial(this.tableMaterial);
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
            var moveDown = function () { gun.body.y += 20; };
            var moveUp = function () { gun.body.y -= 20; };
            key.onDown.add(moveDown);
            key.onUp.add(moveUp);
            gun.inputEnabled = true;
            gun.events.onInputDown.add(moveDown);
            gun.events.onInputUp.add(moveUp);
            gun.body.onEndContact.add(function (contactWithBody, a2, a3, a4) {
                contactWithBody.applyImpulseLocal([0, 50], 0, 0);
            });
            return gun;
        };
        Main.prototype.addBall = function (c) {
            var ball = this.add.sprite(c.x, c.y, c.key);
            ball.scale.set(2);
            this.physics.p2.enable(ball);
            ball.body.clearShapes();
            ball.body.setCircle(10);
            ball.body.fixedRotation = true;
            ball.body.setMaterial(this.ballMaterial);
            return ball;
        };
        Main.prototype.addArm = function (c, left, keyCode) {
            var _this = this;
            var arm = this.add.sprite(c.x, c.y, c.key);
            this.physics.p2.enable(arm);
            arm.body.clearShapes();
            if (left) {
                arm.body.loadPolygon(c.physics, 'arm_left');
            }
            else {
                arm.body.loadPolygon(c.physics, 'arm_right');
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
            this.setConstraintBound(constraint, maxDegrees);
            constraint.upperLimitEnabled = true;
            constraint.lowerLimitEnabled = true;
            constraint.setMotorSpeed(2);
            constraint.enableMotor();
            var key = this.input.keyboard.addKey(keyCode);
            var flipUp = function () { _this.setConstraintBound(constraint, -maxDegrees); };
            var flipDown = function () { _this.setConstraintBound(constraint, maxDegrees); };
            key.onDown.add(flipUp);
            key.onUp.add(flipDown);
            arm.inputEnabled = true;
            arm.events.onInputDown.add(flipUp);
            arm.events.onInputUp.add(flipDown);
            return arm;
        };
        Main.prototype.setConstraintBound = function (constraint, maxDegrees) {
            constraint.upperLimit = Phaser.Math.degToRad(maxDegrees);
            constraint.lowerLimit = Phaser.Math.degToRad(maxDegrees);
        };
        Main.prototype.addBumper = function (p, c) {
            var bumper = this.bumpers.create(p.x, p.y, c.key, 0);
            bumper.originalX = p.x;
            bumper.scale.setTo(2);
            this.physics.p2.enable(bumper);
            bumper.body.clearShapes();
            bumper.body.setCircle(bumper.width / 2);
            bumper.body.static = true;
            bumper.body.setMaterial(this.bumperMaterial);
            bumper.body.createBodyCallback(this.ball, this.hitBumper, this);
            return bumper;
        };
        Main.prototype.hitBumper = function (bumperBody, ballBody) {
            var _this = this;
            var s = bumperBody.sprite;
            var f = s.frame;
            s.frame = (f + 1) % 5;
            var sameBumersCount = 0;
            this.bumpers.forEach(function (bumper) {
                if (bumper.frame == s.frame) {
                    sameBumersCount++;
                    _this.animateBumper(bumper);
                }
            }, this);
            var offset = 5;
            if (Math.random() > 0.5)
                offset = -5;
            var shake = this.add.tween(bumperBody).to({ x: s.x + offset }, 50, Phaser.Easing.Bounce.InOut, false, 0, 4, true);
            // make sure it bumps back to the original position
            shake.onComplete.add(function () { bumperBody.x = bumperBody.sprite.originalX; });
            shake.start();
            this.score += 10 * Math.pow(2, sameBumersCount - 1);
            this.scoreText.text = 'SCORE: ' + this.score;
        };
        Main.prototype.animateBumper = function (bumper) {
            var copy = this.add.sprite(bumper.x, bumper.y, 'faces', bumper.frame);
            copy.anchor.setTo(0.5);
            var s = bumper.scale.x;
            copy.scale.setTo(s);
            var tween = this.add.tween(copy.scale).to({ x: s * 2, y: s * 2 }, 100, Phaser.Easing.Bounce.Out, true, 0, 0, true);
            this.add.tween(copy).to({ alpha: 0.5 }, 100, Phaser.Easing.Bounce.Out, true, 0, 0, true);
            tween.onComplete.add(function () {
                copy.destroy();
            });
        };
        Main.prototype.addDropHole = function () {
            var _this = this;
            var dropHole = this.add.sprite(this.world.centerX, this.world.height);
            this.physics.p2.enable(dropHole, DEBUG);
            dropHole.body.static = true;
            dropHole.body.clearShapes();
            var body = dropHole.body;
            body.addRectangle(200, 20, 0, 10);
            body.onBeginContact.add(function (contactWithBody) {
                if (contactWithBody == _this.ball.body) {
                    _this.ball.destroy();
                    _this.lifes--;
                    if (_this.lifes > 0) {
                        _this.ball = _this.addBall(_this.ballStartingPos);
                        _this.lifesText.text = 'LIFES: ' + _this.lifes;
                    }
                    else {
                        _this.lifesText.text = 'GAME OVER';
                    }
                }
            });
            return dropHole;
        };
        Main.prototype.update = function () {
            if (DEBUG && this.input.activePointer.isDown) {
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
