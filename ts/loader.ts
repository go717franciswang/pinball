/// <reference path="./phaser.d.ts"/>

module Pinball {
    export class Loader extends Phaser.State {
        preloadBar: Phaser.Sprite;
        boardSetting: any;

        init(boardSetting) {
            this.boardSetting = boardSetting;
        }

        preload() {
            this.load.path = 'assets/';
            this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloadBar');
            this.preloadBar.anchor.setTo(0.5);
            this.load.setPreloadSprite(this.preloadBar);

            this.boardSetting.assets.forEach((a) => {
                switch (a.type) {
                    case "images":
                        this.load.images(a.files);
                    break;
                    case "spritesheet":
                        this.load.spritesheet(a.key, a.file, a.w, a.h);
                    break;
                    case "physics":
                        this.load.physics(a.file);
                    break;
                }
            });
        }

        create() {
            var tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
            tween.onComplete.add(() => {
                this.game.state.start('Main', true, false, this.boardSetting);
            }, this);
        }
    }
}
