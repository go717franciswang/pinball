/// <reference path="./phaser.d.ts"/>

module Pinball {
    export class Menu extends Phaser.State {
        setting: any;
        buttons: Phaser.Group;

        preload() {
            this.load.path = 'assets/';
            this.load.bitmapFont('04B_30', '04B_30.png', '04B_30.fnt');
            this.load.json('gameSetting', 'gameSetting.json');
        }

        create() {
            this.setting = this.cache.getJSON('gameSetting');
            this.stage.backgroundColor = 0xc0c0c0;
            this.buttons = this.add.group();
            var spacing = 50;
            this.setting['boards'].forEach((boardSetting, idx) => {
                var callback = () => { 
                    console.log(boardSetting); 
                };
                var x = this.world.centerX;
                var y = idx*spacing;
                var text = this.add.bitmapText(x, y, '04B_30', boardSetting['name']);
                text.anchor.setTo(0.5);
                text.inputEnabled = true;
                text.events.onInputUp.add(callback);
                this.buttons.addChild(text);
            });

            this.buttons.y = this.world.centerY - spacing*this.setting['boards'].length/2;
        }
    }
}
