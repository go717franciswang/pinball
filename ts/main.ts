/// <reference path="./phaser.d.ts"/>
/// <reference path="./p2.d.ts"/>
/// <reference path="./jquery.d.ts"/>

var game;
var DEBUG = true;
module Pinball {

    export class Main extends Phaser.State {

        boardSetting: any;
        table: Phaser.Sprite;
        tableMaterial: Phaser.Physics.P2.Material;
        gun: Phaser.Sprite;
        ball: Phaser.Sprite;
        ballMaterial: Phaser.Physics.P2.Material;
        leftArm: Phaser.Sprite;
        rightArm: Phaser.Sprite;
        bumpers: Phaser.Group;
        dropHole: Phaser.Sprite;
        bumperMaterial: Phaser.Physics.P2.Material;
        ballVsTableMaterial: Phaser.Physics.P2.ContactMaterial;
        ballVsBumperMaterial: Phaser.Physics.P2.ContactMaterial;
        score: number;
        scoreText: Phaser.BitmapText;
        lifes: number;
        lifesText: Phaser.BitmapText;

        init(boardSetting) {
            this.boardSetting = boardSetting;
        }

        create() {
            this.stage.backgroundColor = 0xffffff;
            this.physics.startSystem(Phaser.Physics.P2JS);
            this.physics.p2.gravity.y = 100;
            this.physics.p2.setImpactEvents(true);

            this.ballMaterial = this.physics.p2.createMaterial('ballMaterial');
            this.tableMaterial = this.physics.p2.createMaterial('tableMaterial');
            this.bumperMaterial = this.physics.p2.createMaterial('bumperMaterial');

            this.table = this.addTable(this.boardSetting.table);
            this.ball = this.addBall(this.boardSetting.ball);
            this.leftArm = this.addArm(this.boardSetting.arm_left, true, Phaser.Keyboard.LEFT);
            this.rightArm = this.addArm(this.boardSetting.arm_right, false, Phaser.Keyboard.RIGHT);
            this.bumpers = this.add.physicsGroup(Phaser.Physics.P2JS);
            this.boardSetting.bumpers.positions.forEach((p) => {
                this.addBumper(p);
            });
            this.gun = this.addGun(this.world.width - 30, this.world.height - 50, 10, 50, Phaser.Keyboard.SPACEBAR);
            this.dropHole = this.addDropHole();

            this.ballVsTableMaterial = this.physics.p2.createContactMaterial(
                this.ballMaterial, this.tableMaterial);
            this.ballVsTableMaterial.restitution = 0.5;
            this.ballVsBumperMaterial = this.physics.p2.createContactMaterial(
                this.ballMaterial, this.bumperMaterial);
            this.ballVsBumperMaterial.restitution = 2.5;

            this.score = 0;
            this.scoreText = this.add.bitmapText(0, this.world.height, '04B_30', 'SCORE: 0', 12);
            this.scoreText.anchor.setTo(0, 1);

            this.lifes = 3;
            this.lifesText = this.add.bitmapText(0, this.world.height-20, '04B_30', 'LIFES: 3', 12);
            this.lifesText.anchor.setTo(0, 1);
        }

        addTable(c) {
            var table = this.add.sprite(this.world.width/2, this.world.height/2, c.key);
            this.physics.p2.enable(table);
            table.body.clearShapes();
            table.body.loadPolygon(c.physics, 'table');
            table.body.static = true;
            table.body.setMaterial(this.tableMaterial);
            return table;
        }

        addGun(x:number, y:number, w:number, h:number, keyCode:number) {
            var rect = this.make.graphics(0, 0);
            rect.lineStyle(8, 0xFF0000, 0.8);
            rect.beginFill(0xFF700B, 1);

            rect.drawRect(-50, -50, w, h);
            rect.endFill();

            var gun = this.add.sprite(x+w/2, y+h/2, rect.generateTexture());
            this.physics.p2.enable(gun);
            gun.body.static = true;
            var key = this.input.keyboard.addKey(keyCode);
            var moveDown = () => { gun.body.y += 20; };
            var moveUp = () => { gun.body.y -= 20; };
            key.onDown.add(moveDown);
            key.onUp.add(moveUp);

            gun.inputEnabled = true;
            gun.events.onInputDown.add(moveDown);
            gun.events.onInputUp.add(moveUp);

            gun.body.onEndContact.add((contactWithBody, a2, a3, a4) => {
                contactWithBody.applyImpulseLocal([0, 50], 0, 0);
            });

            return gun;
        }

        addBall(c):Phaser.Sprite {
            var ball = this.add.sprite(c.x, c.y, c.key);
            ball.scale.set(2);
            this.physics.p2.enable(ball);
            ball.body.clearShapes();
            ball.body.setCircle(10);
            ball.body.fixedRotation = true;
            ball.body.setMaterial(this.ballMaterial);

            return ball;
        }

        addArm(c, left:boolean, keyCode:number):Phaser.Sprite {
            var arm = this.add.sprite(c.x, c.y, c.key);
            this.physics.p2.enable(arm);
            arm.body.clearShapes();
            if (left) {
                arm.body.loadPolygon(c.physics, 'arm_left');
            } else {
                arm.body.loadPolygon(c.physics, 'arm_right');
            }

            var offsetX = arm.width*0.45;
            var offsetY = 0;
            var maxDegrees = c.maxDegrees;
            if (left) { 
                offsetX = -offsetX;
                maxDegrees = -maxDegrees;
            } else {
                arm.scale.x *= -1;
            }
            var b:Phaser.Physics.P2.Body = arm.body;

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
            var flipUp = () => { this.setConstraintBound(constraint, -maxDegrees); };
            var flipDown = () => { this.setConstraintBound(constraint, maxDegrees); };
            key.onDown.add(flipUp);
            key.onUp.add(flipDown);

            arm.inputEnabled = true;
            arm.events.onInputDown.add(flipUp);
            arm.events.onInputUp.add(flipDown);

            return arm;
        }

        setConstraintBound(constraint, maxDegrees) {
            constraint.upperLimit = Phaser.Math.degToRad(maxDegrees);
            constraint.lowerLimit = Phaser.Math.degToRad(maxDegrees);
        }

        addBumper(p) {
            var bumper = this.bumpers.create(p.x, p.y, this.boardSetting.bumpers.key, 0);
            bumper.originalX = p.x;
            bumper.scale.setTo(this.boardSetting.bumpers.scale);
            this.physics.p2.enable(bumper);
            bumper.body.clearShapes();
            bumper.body.setCircle(bumper.width/2);
            bumper.body.static = true;
            bumper.body.setMaterial(this.bumperMaterial);
            bumper.body.createBodyCallback(this.ball, this.hitBumper, this);

            return bumper;
        }

        hitBumper(bumperBody, ballBody) {
            var s:Phaser.Sprite = bumperBody.sprite;
            var f:any = s.frame;
            s.frame = (f + 1) % 5;

            var sameBumersCount = 0;
            this.bumpers.forEach((bumper) => {
                if (bumper.frame == s.frame) {
                    sameBumersCount++;
                    this.animateBumper(bumper);
                }
            }, this);

            var offset = 5;
            if (Math.random() > 0.5) offset = -5;
            var shake = this.add.tween(bumperBody).to({ x: s.x + offset }, 50, Phaser.Easing.Bounce.InOut, false, 0, 4, true);
            // make sure it bumps back to the original position
            shake.onComplete.add(() => { bumperBody.x = bumperBody.sprite.originalX; });
            shake.start();

            this.score += 10 * Math.pow(2, sameBumersCount-1);
            this.scoreText.text = 'SCORE: ' + this.score;
        }

        animateBumper(bumper:Phaser.Sprite) {
            var copy:Phaser.Sprite = this.add.sprite(bumper.x, bumper.y, 'faces', bumper.frame);
            copy.anchor.setTo(0.5);
            var s = bumper.scale.x;
            copy.scale.setTo(s);
            var tween = this.add.tween(copy.scale).to({ x: s*2, y: s*2 }, 100, Phaser.Easing.Bounce.Out, true, 0, 0, true);
            this.add.tween(copy).to({ alpha: 0.5 }, 100, Phaser.Easing.Bounce.Out, true, 0, 0, true);
            tween.onComplete.add(() => {
                copy.destroy();
            });
        }

        addDropHole() {
            var dropHole = this.add.sprite(this.world.centerX, this.world.height);
            this.physics.p2.enable(dropHole, DEBUG);
            dropHole.body.static = true;
            dropHole.body.clearShapes();
            var body:Phaser.Physics.P2.Body = dropHole.body;
            body.addRectangle(200, 20, 0, 10);
            body.onBeginContact.add((contactWithBody) => {
                if (contactWithBody == this.ball.body) {
                    this.ball.visible = false;
                    this.lifes--;
                    if (this.lifes > 0) {
                        this.ball.visible = true;
                        this.ball.body.x = this.boardSetting.ball.x;
                        this.ball.body.y = this.boardSetting.ball.y;
                        this.lifesText.text = 'LIFES: ' + this.lifes;
                    } else {
                        this.lifesText.text = 'GAME OVER';
                    }
                }
            });
            return dropHole;
        }

        update() {
            if (DEBUG && this.input.activePointer.isDown) {
                this.ball.body.x = this.input.activePointer.x;
                this.ball.body.y = this.input.activePointer.y;
                this.ball.body.velocity.x = 0;
                this.ball.body.velocity.y = 0;
            }
        }

        render() {
            //console.log(this.input.activePointer.x, this.input.activePointer.y);
            //this.game.debug.spriteInfo(this.ball, 32, 32);
            this.game.debug.pointer(this.input.activePointer);
        }
    }
}
