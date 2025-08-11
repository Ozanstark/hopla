import Phaser from 'phaser'
import SceneKeys from "../consts/SceneKeys";

export default class GameOver extends Phaser.Scene{
    constructor(){
        super(SceneKeys.GameOver)
    }
    create(){
        const {width, height} = this.scale;
        const x = width * 0.5;
        const y = height * 0.5;

        this.add.text(x,y, "Tekrar oynamak için ekrana dokun veya SPACE'e bas!", {
            fontSize: "32px",
            color: "#FFFFFF",
            backgroundColor: "#000000",
            shadow: {fill: true, blur: 0, offsetY: 0},
            padding: {left: 15, right: 15, top: 10, bottom: 10}
        }).setOrigin(0.5)
    
        const restart = () => {
            this.scene.stop(SceneKeys.GameOver)
            this.scene.stop(SceneKeys.Game)
            this.scene.start(SceneKeys.Game)
        }
        this.input.keyboard.once("keydown-SPACE", restart)
        this.input.once('pointerdown', restart)

    }
}