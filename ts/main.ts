/// <reference path="./phaser.d.ts"/>
/// <reference path="./p2.d.ts"/>
/// <reference path="./jquery.d.ts"/>

var game;
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
            this.load.physics('physicsData');
            game = this;
        }

        create() {
            this.stage.backgroundColor = 0xffffff;
            this.physics.startSystem(Phaser.Physics.P2JS);
            this.physics.p2.gravity.y = 100;

            this.table = this.addTable();

            this.resizePolygon('arm', 'arm_left', 'arm_left', 0.75);
            this.resizePolygon('arm', 'arm_right', 'arm_right', 0.75);
            this.ball = this.addBall(this.world.width - 20, this.world.height - 100);
            this.gun = this.addGun(this.world.width - 30, this.world.height - 50, 10, 50, Phaser.Keyboard.SPACEBAR);
            this.leftArm = this.addArm(this.world.centerX - 90, this.world.height - 150, true, Phaser.Keyboard.LEFT);
            this.rightArm = this.addArm(this.world.centerX + 60, this.world.height - 150, false, Phaser.Keyboard.RIGHT);
        }

        addTable() {
            var table = this.add.sprite(this.world.width/2, this.world.height/2, 'table');
            this.physics.p2.enable(table);
            table.body.clearShapes();
            table.body.loadPolygon('physicsData', 'table');
            table.body.static = true;
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

        // taken from http://www.html5gamedevs.com/topic/4795-it-is-possible-to-scale-the-polygon-with-p2-physics/
        resizePolygon(originalPhysicsKey, newPhysicsKey, shapeKey, scale) {      
            var newData = [];      
            console.log(this.cache._cache.physics);
            $.each(this.cache._cache.physics[originalPhysicsKey].data, function (key, values) {        
                $.each(values, function (key2, values2) {          
                    var shapeArray = [];          
                    $.each(values2.shape, function (key3, values3) {
                        shapeArray.push(values3 * scale);          
                    });          
                    newData.push({shape: shapeArray});
                });      
            });
            var item = {};      
            item[shapeKey] = newData;      
            this.game.load.physics(newPhysicsKey, '', item);    
        }

        addArm(x:number, y:number, left:boolean, keyCode:number):Phaser.Sprite {
            var arm = this.add.sprite(x, y, 'arm_left');
            this.physics.p2.enable(arm);
            arm.body.clearShapes();
            if (left) {
                arm.body.loadPolygon('arm_left', 'arm_left');
            } else {
                arm.body.loadPolygon('arm_right', 'arm_right');
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
            arm.scale.x *= 0.75;
            arm.scale.y *= 0.75;
            var b:Phaser.Physics.P2.Body = arm.body;

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
            this.game.debug.spriteInfo(this.leftArm, 32, 32);
        }
    }
}
