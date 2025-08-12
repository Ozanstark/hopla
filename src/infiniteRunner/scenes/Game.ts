import Phaser from 'phaser'
import SceneKeys from "../consts/SceneKeys";
import TextureKeys from "../consts/TextureKeys";
import LaserObstacle from "../game/LaserObstacle";
import RocketMouse from "../game/RocketMouse";

export default class Game extends Phaser.Scene{

    private background!: Phaser.GameObjects.TileSprite
    private mouseHole!: Phaser.GameObjects.Image

    private window1!: Phaser.GameObjects.Image
    private window2!: Phaser.GameObjects.Image
    private windows!: Phaser.GameObjects.Image[]

    private bookcase1!: Phaser.GameObjects.Image
    private bookcase2!: Phaser.GameObjects.Image
    private bookcases!: Phaser.GameObjects.Image[]

    private laserObstacle!: LaserObstacle;

    private mouse!: RocketMouse

    private coins!: Phaser.Physics.Arcade.StaticGroup

    private scoreLabel!: Phaser.GameObjects.Text
    private score:number = 0

    // Difficulty and UX
    private reduceMotion = false
    private isAlive = true
    private currentSpeed = 130
    private maxSpeed = 260
    private speedAccel = 3 // per second

    // Magnet power-up
    private magnets!: Phaser.Physics.Arcade.StaticGroup
    private magnetActive = false
    private magnetRadius = 180

    // Resume countdown
    private resumeText?: Phaser.GameObjects.Text
    // Start-of-run invincibility and hint
    private isInvincible = false
    private startText?: Phaser.GameObjects.Text

    constructor(){
        super(SceneKeys.Game)
    }
    init(){
        this.score = 0;
        this.isAlive = true;
        this.currentSpeed = 140;
        this.magnetActive = false;
    }
    public preload():void{

    }
    /**
     * Creates the game
     */
    public create():void{
        const width = this.scale.width;
        const height = this.scale.height;
        /**
         * Add an TileSprite (repeadted image) on a position from 0 - 1 
         * 0 being left or top and 1 being right or bottom 
         * The width and height are given to calculate how much to repeat the image troughout the screen
         */
        this.background = this.add.tileSprite(0, 0, width, height, TextureKeys.Background)
            .setOrigin(0,0)
            .setScrollFactor(0,0); // Keep from scrolling

        this.mouseHole = this.add.image(
            Phaser.Math.Between(900, 1500),
            502,
            TextureKeys.MouseHole
        )
        this.window1 = this.add.image(
            Phaser.Math.Between(900, 1300),
            Phaser.Math.Between(150, 250), 
            TextureKeys.Window1
        );
        this.window2 = this.add.image(
            Phaser.Math.Between(1600, 2000),
            Phaser.Math.Between(150, 250), 
            TextureKeys.Window2
        );
        this.windows = [this.window1, this.window2]
        this.bookcase1 = this.add.image(
            Phaser.Math.Between(2200, 2700),
            580, 
            TextureKeys.Bookcase1
        ).setOrigin(0.5, 1);
        this.bookcase2 = this.add.image(
            Phaser.Math.Between(2900, 3400),
            580, 
            TextureKeys.Bookcase2
        ).setOrigin(0.5, 1);
        this.bookcases = [this.bookcase1, this.bookcase2]
        this.laserObstacle = new LaserObstacle(this, 900, 100)
        this.add.existing(this.laserObstacle)
        this.mouse = new RocketMouse(this, width * 0.25, height - 30)
        this.add.existing(this.mouse);

        // Touch: tap/hold to fly handled inside RocketMouse
        
        this.coins = this.physics.add.staticGroup()
        this.spawnCoins()

        const body = this.mouse.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setVelocityX(this.currentSpeed);
        // Setting world bounds
        this.physics.world.setBounds(
            0, // X 
            0, // Y
            Number.MAX_SAFE_INTEGER, // Width
            height -55 // Height
        )

        this.cameras.main.startFollow(this.mouse, true, 1, 1, -this.scale.width * 0.25, 0);
        this.cameras.main.setBounds(0,0,Number.MAX_SAFE_INTEGER, height)

        this.physics.add.overlap(
            this.laserObstacle,
            this.mouse,
            this.handleOverlapLaser,
            undefined,
            this
        )

        this.physics.add.overlap(
            this.coins,
            this.mouse,
            this.handleCollectCoin,
            undefined,
            this
        )

        // Preferences
        this.reduceMotion = (typeof localStorage !== 'undefined' && localStorage.getItem('ir-reduce-motion') === '1');

        // Magnet pickups
        this.magnets = this.physics.add.staticGroup();
        this.physics.add.overlap(
            this.magnets,
            this.mouse,
            this.handleCollectMagnet as unknown as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );

        // Resume countdown handler
        this.events.on('resume', () => {
            this.startResumeCountdown();
        });

        // Listen for reduce-motion changes from UI
        const onReduceMotionChange = (e: any) => {
            this.reduceMotion = !!(e?.detail);
        };
        window.addEventListener('ir:reduce-motion-change', onReduceMotionChange as EventListener);
        this.events.once('shutdown', () => {
            window.removeEventListener('ir:reduce-motion-change', onReduceMotionChange as EventListener);
        });

        this.scoreLabel = this.add.text(10, 10, `Score: ${this.score}`, {
            fontSize: "24px",
            color: "#080808",
            backgroundColor: "#F8E71C",
            shadow: {fill: true, blur: 0, offsetY: 0},
            padding: {left: 15, right: 15, top: 10, bottom: 10}
        }).setScrollFactor(0)

        // BGM
        const existing = this.sound.get('bgm') as Phaser.Sound.BaseSound | null;
        if (existing) {
            if (!existing.isPlaying) existing.play({ loop: true, volume: 0.25 });
        } else {
            const music = this.sound.add('bgm', { loop: true, volume: 0.25 });
            music.play();
        }

        // Start-of-run invincibility and hint
        this.isInvincible = true;
        const showStart = () => {
            if (this.startText) this.startText.destroy();
            this.startText = this.add.text(width/2, height/2, 'Hazır!', {
                fontSize: '48px',
                color: '#ffffff',
                backgroundColor: '#00000080',
                padding: { left: 16, right: 16, top: 8, bottom: 8 }
            }).setOrigin(0.5).setScrollFactor(0);
        };
        showStart();
        this.time.delayedCall(2000, () => {
            this.isInvincible = false;
            if (this.startText) { this.startText.destroy(); this.startText = undefined; }
        });
    }
    update(){
        this.wrapMouseHole()
        this.wrapWindows()
        this.wrapBookcases()
        this.wrapLaserObstacle()
        this.background.setTilePosition(this.cameras.main.scrollX);

        // Progressive difficulty: ramp horizontal speed while alive
        if (this.isAlive && !this.physics.world.isPaused) {
            const body = this.mouse.body as Phaser.Physics.Arcade.Body;
            const dt = this.game.loop.delta / 1000;
            this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed + this.speedAccel * dt);
            body.setVelocityX(this.currentSpeed);
        }
        
        // Magnet attraction towards the mouse
        if (this.magnetActive) {
            const mx = this.mouse.x;
            const my = this.mouse.y;
            this.coins.children.each((child: Phaser.GameObjects.GameObject) => {
                const coin = child as Phaser.Physics.Arcade.Sprite
                if (!coin.active) {
                    return true
                }
                const dx = mx - coin.x;
                const dy = my - coin.y;
                const dist = Math.hypot(dx, dy);
                if (dist < this.magnetRadius) {
                    coin.x += (dx / (dist || 1)) * 200 * (this.game.loop.delta / 1000);
                    coin.y += (dy / (dist || 1)) * 200 * (this.game.loop.delta / 1000);
                    const body = coin.body as Phaser.Physics.Arcade.StaticBody
                    body.updateFromGameObject()
                }
                return true
            }, this)
        }
        
        this.teleportBackwards()
    }
    private teleportBackwards(){
        const scrollX = this.cameras.main.scrollX
        const maxX = 2380

        if (scrollX > maxX) {
            this.mouse.x -= maxX
            this.mouseHole.x -= maxX

            this.windows.forEach(win=>{
                win.x -= maxX
            })
            this.bookcases.forEach(bc=>{
                bc.x -= maxX
            })

            this.laserObstacle.x -= maxX

            const laserBody = this.laserObstacle.body as Phaser.Physics.Arcade.StaticBody
            laserBody.x -= maxX

            this.spawnCoins()
            // Rare chance to spawn a magnet pickup
            if (Phaser.Math.Between(0, 3) === 0) {
                this.spawnMagnet();
            }
            
            this.coins.children.each((child: Phaser.GameObjects.GameObject) => {
                const coin = child as Phaser.Physics.Arcade.Sprite
                if (!coin.active) {
                    return true
                }

                coin.x -= maxX
                const body = coin.body as Phaser.Physics.Arcade.StaticBody
                body.updateFromGameObject()
                return true
            }, this)

            // Shift magnet pickups as well
            this.magnets?.children.each((child: Phaser.GameObjects.GameObject) => {
                const m = child as Phaser.Physics.Arcade.Sprite
                if (!m.active) {
                    return true
                }
                m.x -= maxX
                const body = m.body as Phaser.Physics.Arcade.StaticBody
                body.updateFromGameObject()
                return true
            }, this)
        }
    }
    private handleCollectCoin(
        obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
        obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody
    ){
        const coin = obj2 as Phaser.Physics.Arcade.Sprite;

        this.coins.killAndHide(coin);
        coin.body.enable = false;

        // Simple burst effect (tweened sprites) + haptics
        if (!this.reduceMotion) {
          try {
            for (let i = 0; i < 8; i++) {
              const s = this.add.image(coin.x, coin.y, TextureKeys.Coin).setScale(0.4).setAlpha(0.9);
              this.tweens.add({
                targets: s,
                x: coin.x + Phaser.Math.Between(-80, 80),
                y: coin.y + Phaser.Math.Between(-80, 80),
                alpha: 0,
                scale: 0,
                duration: 350,
                ease: 'Quad.easeOut',
                onComplete: () => s.destroy()
              });
            }
          } catch {}
          if (typeof navigator !== "undefined" && 'vibrate' in navigator) {
            try { navigator.vibrate(10); } catch {}
          }
        }

        const inc = this.score < 10 ? 2 : 1;
        this.score += inc;
        this.scoreLabel.text = `Score: ${this.score}`;
        this.sound.play('sfx-coin', { volume: 0.5 });
    }
    private spawnCoins(){
        this.coins.children.each((child: Phaser.GameObjects.GameObject) => {
            const coin = child as Phaser.Physics.Arcade.Sprite
            this.coins.killAndHide(coin)
            coin.body.enable = false
            return true
        }, this)

        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;

        let x = rightEdge + 100;

        const early = this.score < 10;
        const numCoins = Phaser.Math.Between(early ? 8 : 1, early ? 24 : 18)

        for (let i = 0; i < numCoins; i++) {
            const coin = this.coins.get(
                x,
                Phaser.Math.Between(100, this.scale.height -100),
                TextureKeys.Coin
            ) as Phaser.Physics.Arcade.Sprite

            coin.setVisible(true)
            coin.setActive(true)

            const body = coin.body as Phaser.Physics.Arcade.StaticBody
            body.setCircle(body.width * 0.5)
            body.enable = true
            
            // Update new coins body
            body.updateFromGameObject()
            x += coin.width * 1.5;
            
        }
    }

    private spawnMagnet(){
        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;
        const x = rightEdge + Phaser.Math.Between(200, 800);
        const y = Phaser.Math.Between(120, this.scale.height - 140);
        const pickup = this.magnets.get(x, y, TextureKeys.Coin) as Phaser.Physics.Arcade.Sprite;
        if (!pickup) return;
        pickup.setTint(0x00c8ff).setScale(0.9);
        pickup.setVisible(true);
        pickup.setActive(true);
        const body = pickup.body as Phaser.Physics.Arcade.StaticBody;
        body.setCircle(body.width * 0.5);
        body.enable = true;
        body.updateFromGameObject();
    }

    private handleCollectMagnet(
        obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
        obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody
    ){
        const pickup = obj1 as Phaser.Physics.Arcade.Sprite;
        this.magnets.killAndHide(pickup);
        pickup.body.enable = false;

        this.magnetActive = true;
        // Auto-disable after duration
        this.time.delayedCall(6000, () => { this.magnetActive = false; });

        if (!this.reduceMotion) {
            // Small pulse effect
            const circle = this.add.circle(this.mouse.x, this.mouse.y, 10, 0x00c8ff, 0.25).setScrollFactor(0);
            this.tweens.add({
                targets: circle,
                radius: 80,
                alpha: 0,
                duration: 400,
                onComplete: () => circle.destroy()
            });
            try { this.sound.play('sfx-coin', { volume: 0.3 }); } catch {}
        }
    }

    private startResumeCountdown(){
        // Pause physics while counting down
        this.physics.world.pause();
        const makeText = (txt: string) => {
            if (this.resumeText) this.resumeText.destroy();
            this.resumeText = this.add.text(this.scale.width/2, this.scale.height/2, txt, {
                fontSize: '64px',
                color: '#ffffff',
                backgroundColor: '#00000080',
                padding: { left: 20, right: 20, top: 10, bottom: 10 }
            }).setOrigin(0.5).setScrollFactor(0);
        };
        makeText('3');
        this.time.delayedCall(700, () => { makeText('2'); });
        this.time.delayedCall(1400, () => { makeText('1'); });
        this.time.delayedCall(2100, () => {
            if (this.resumeText) { this.resumeText.destroy(); this.resumeText = undefined; }
            this.physics.world.resume();
        });
    }
    private handleOverlapLaser(){
        if (this.isInvincible) return;
        console.log("overlap!")
        this.sound.play('sfx-hit', { volume: 0.6 });
        this.isAlive = false;
        this.magnetActive = false;
        // Camera shake + haptics
        if (!this.reduceMotion) {
            try { this.cameras.main.shake(250, 0.01); } catch {}
            if (typeof navigator !== "undefined" && 'vibrate' in navigator) {
              try { navigator.vibrate([40, 80, 40]); } catch {}
            }
        }
        this.mouse.kill()
        try {
            window.dispatchEvent(new CustomEvent('infinite-runner:game-over', { detail: { score: this.score } }))
        } catch {}
    }
    private wrapMouseHole(){
        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;

        if(this.mouseHole.x + this.mouseHole.width < scrollX){
            this.mouseHole.x = Phaser.Math.Between(rightEdge+100,
                rightEdge + 1000);
        }
    }
    private wrapLaserObstacle(){
        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;

        const body = this.laserObstacle.body as Phaser.Physics.Arcade.StaticBody

        const width = this.laserObstacle.width
        if(this.laserObstacle.x + width < scrollX){
            this.laserObstacle.x = Phaser.Math.Between(
                rightEdge+800,
                rightEdge + 1600
            );
            this.laserObstacle.y = Phaser.Math.Between(0, 300);

            body.position.x = this.laserObstacle.x + body.offset.x
            body.position.y = this.laserObstacle.y
        }
    }
    private wrapWindows(){
        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;

        let width = this.window1.width * 2
        if ( this.window1.x + width < scrollX ){
            
            this.window1.x = Phaser.Math.Between(
                rightEdge + width,
                rightEdge + width + 800
            );

            const overlap = this.bookcases.find(bc=>{
                return Math.abs(this.window1.x - bc.x) <= this.window1.width
            })
            
            this.window1.visible = !overlap;
        }

        width = this.window2.width
        if( this.window2.x + width < scrollX ){
            
            this.window2.x = Phaser.Math.Between(
                this.window1.x + width,
                this.window1.x + width + 800
            )
            
            const overlap = this.bookcases.find(bc=>{
                return Math.abs(this.window2.x - bc.x) <= this.window2.width
            })
            
            this.window2.visible = !overlap;
        }
    }
    private wrapBookcases(){
        const scrollX = this.cameras.main.scrollX
        const rightEdge = scrollX + this.scale.width

        let width = this.bookcase1.width * 2;
        if(this.bookcase1.x + width < scrollX){
            this.bookcase1.x = Phaser.Math.Between(
                rightEdge + width,
                rightEdge + width + 800
            )
        }

        width = this.bookcase2.width * 2;
        if(this.bookcase2.x + width < scrollX){
            this.bookcase2.x = Phaser.Math.Between(
                this.bookcase1.x + width,
                this.bookcase1.x + width + 800
            )

            this.spawnCoins()
        }
    }
}