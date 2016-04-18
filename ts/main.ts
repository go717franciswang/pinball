/// <reference path="./phaser.d.ts"/>
/// <reference path="./p2.d.ts"/>

module Pinball {

    export class Main extends Phaser.State {

        table: Phaser.Sprite;
        gun: Phaser.Sprite;
        ball: Phaser.Sprite;
        leftArm: Phaser.Sprite;
        rightArm: Phaser.Sprite;

        preload() {
            this.load.path = 'assets/';
            this.load.images(['ball', 'arm_left', 'angry_face', 'confused_face', 
                             'dead_face', 'happy_face', 'sad_face', 'table']);
            this.load.physics('arm');
            this.load.physics('physics');
        }

        create() {
            this.stage.backgroundColor = 0xffffff;
            this.physics.startSystem(Phaser.Physics.P2JS);
            this.physics.p2.gravity.y = 100;

            this.table = this.addTable();

            var thickness = 10;
            // this.addWall(0, 0, this.world.width, thickness);
            // this.addWall(0, 0, 10, this.world.height);
            // this.addWall(this.world.width-thickness, 0, thickness, this.world.height);
            // this.addWall(this.world.width-100, 0, 120, thickness, 45);
            // this.addWall(this.world.width-50, 100, thickness, this.world.height);
            // this.addWall(0, 580, 100, thickness);
            // this.addWall(350, 580, 50, thickness);

            this.ball = this.addBall(this.world.width - 20, this.world.height - 100);
            this.gun = this.addGun(this.world.width - 30, this.world.height - 50, thickness, 50, Phaser.Keyboard.SPACEBAR);
            this.leftArm = this.addArm(this.world.centerX - 80, this.world.height - 150, true, Phaser.Keyboard.LEFT);
            this.rightArm = this.addArm(this.world.centerX + 80, this.world.height - 150, false, Phaser.Keyboard.RIGHT);
        }

        addTable() {
            var table = this.add.sprite(this.world.width/2, this.world.height/2, 'table');
            this.physics.p2.enable(table);
            table.body.static = true;
            table.body.clearShapes();
            table.body.loadPolygon('physics', 'table');
            return table;
        }

        addWall(x:number, y:number, w:number, h:number, a:number=0) {
            var rect = this.make.graphics(0, 0);
            rect.lineStyle(8, 0xFF0000, 0.8);
            rect.beginFill(0xFF700B, 1);

            rect.drawRect(-50, -50, w, h);
            rect.endFill();

            var wall = this.add.sprite(x+w/2, y+h/2, rect.generateTexture());
            this.physics.p2.enable(wall);
            wall.body.static = true;
            wall.body.angle = a;

            return wall;
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
            key.onDown.add(() => {
                gun.body.y += 20;
            });
            key.onUp.add(() => {
                gun.body.y -= 20;
            });
            gun.body.onEndContact.add((contactWithBody, a2, a3, a4) => {
                contactWithBody.applyImpulseLocal([0, 50], 0, 0);
            });

            return gun;
        }

        addBall(x:number, y:number):Phaser.Sprite {
            var ball = this.add.sprite(x, y, 'ball');
            ball.scale.set(2);
            this.physics.p2.enable(ball);
            ball.body.clearShapes();
            ball.body.setCircle(10);
            ball.body.fixedRotation = true;

            return ball;
        }

        addArm(x:number, y:number, left:boolean, keyCode:number):Phaser.Sprite {
            var arm = this.add.sprite(x, y, 'arm_left');
            this.physics.p2.enable(arm);
            arm.body.clearShapes();
            if (left) {
                arm.body.loadPolygon('arm', 'arm_left');
            } else {
                arm.body.loadPolygon('arm', 'arm_right');
            }

            var offsetX = arm.width*0.45;
            var offsetY = 0;
            var maxDegrees = 45;
            if (left) { 
                offsetX = -offsetX;
                maxDegrees = -maxDegrees;
            } else {
                arm.scale.x *= -1;
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
                constraint.upperLimit = Phaser.Math.degToRad(-maxDegrees);
                constraint.lowerLimit = Phaser.Math.degToRad(-maxDegrees);
            });
            key.onUp.add(() => { 
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

        render() {
            //console.log(this.input.activePointer.x, this.input.activePointer.y);
        }
    }
}
