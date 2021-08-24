import { Clock } from "./Clock"
import { pointLerp } from "./Helper"
import { TextButton } from "./TextButton"

const EndPoint = "http://localhost:5000"

const ReferenceLength = 1080

export class Boot extends Phaser.State
{
    public static onCreate = new Phaser.Signal()

    clock = new Clock(this)

    progressOject: Phaser.Group

    startButtuon: TextButton
    cancelButton: TextButton

    textureStartButton: Phaser.RenderTexture
    textureStopButton: Phaser.RenderTexture

    stateText: Phaser.Text

    debugText: Phaser.Text
    progressCircleTexture: Phaser.RenderTexture
    progressBarTexture: Phaser.RenderTexture
    progressFillTexture: Phaser.RenderTexture

    fillA: Phaser.Sprite
    fillB: Phaser.Sprite
    circleA: Phaser.Sprite
    circleB: Phaser.Sprite
    circleC: Phaser.Sprite

    updateEvent: Phaser.TimerEvent
    updateEventTick = 0

    constructor()
    {
        super()
    }

    init()
    {
        this.game.stage.disableVisibilityChange = true
        this.scale.scaleMode = Phaser.ScaleManager.RESIZE

    }

    preload()
    {
        this.clock.preload()

        this.progressCircleTexture = new Phaser.Graphics(this.game)
            .beginFill(0xFFFFFF)
            .lineStyle(1, 0xAAAAAA)
            .drawCircle(0, 0, 25)
            .endFill()
            .generateTexture()

        this.progressBarTexture = new Phaser.Graphics(this.game)
            .beginFill(0xAAAAAA)
            .drawRect(0, 0, 85, 15)
            .endFill()
            .generateTexture()

        this.progressFillTexture = new Phaser.Graphics(this.game)
            .beginFill(0x00AA00)
            .drawRect(0, 0, 85, 15)
            .endFill()
            .generateTexture()

        this.textureStartButton = new Phaser.Graphics(this.game)
            .beginFill(0x00AA00, 0.8)
            .drawRoundedRect(0, 0, 150, 60, 20)
            .generateTexture()

        this.textureStopButton = new Phaser.Graphics(this.game)
            .beginFill(0xAA0000, 0.8)
            .drawRoundedRect(0, 0, 150, 60, 20)
            .generateTexture()
    }

    create()
    {
        this.clock.create()

        this.debugText = this.add.text(0, 0, "Debug Mode", { font: "monospace" })
        this.stateText = this.add.text(160, 120, "", { fontSize: 24 })

        this.progressOject = this.add.group(this.world, "progress")
        this.progressOject.x = 25
        this.progressOject.y = 70
        this.circleA = this.progressOject.create(0, 0, this.progressCircleTexture)

        this.progressOject.create(30, 5, this.progressBarTexture)

        this.fillA = this.progressOject.create(30, 5, this.progressFillTexture)
        this.fillA.scale.x = 0

        this.circleB = this.progressOject.create(120, 0, this.progressCircleTexture)

        this.progressOject.create(150, 5, this.progressBarTexture)

        this.fillB = this.progressOject.create(150, 5, this.progressFillTexture)
        this.fillB.scale.x = 0

        this.circleC = this.progressOject.create(240, 0, this.progressCircleTexture)

        const buttonY = 200

        this.startButtuon = new TextButton(this.game, 320 / 2, buttonY, this.textureStartButton as any, "Start")
            .withStyle({ fill: "#FFFFFF", fontSize: 37.5, fontWeight: 100 })
            .withInputScale()
            .withDisabledAlpha(0)
            .setCallBack(() => this.startProcess())
        // .setActive(false)

        this.cancelButton = new TextButton(this.game, 320 / 2, buttonY, this.textureStopButton as any, "Cancel")
            .withStyle({ fill: "#FFFFFF", fontSize: 37.5, fontWeight: 100 })
            .withInputScale()
            .withDisabledAlpha(0)
            .setCallBack(() => this.stopProcess())
            .setActive(false)

        Boot.onCreate.dispatch()
    }

    setStateText(text: string)
    {
        this.stateText.text = text;
        this.stateText.anchor.setTo(0.5, 0);
    }

    async stopProcess()
    {
        if (!this.isFinished())
        {

            const response = await fetch(`${EndPoint}/stop`)
            const result = await response.text()
            console.log("Stop", result)
            if (!response.ok)
            {
                this.debugText.text = "Stop error"
                throw "Stop error"
            }

            this.setStateText("Canceled")
            this.time.events.add(2000, () =>
            {
                if (this.stateText.text !== "Canceled")
                {
                    return
                }
                this.setStateText("")
            })
            this.resetProgressView()
        }
        else
        {
            this.setStateText("Finished")
        }

        this.startButtuon.setActive(true)
        this.cancelButton.setActive(false)

        this.time.events.remove(this.updateEvent)

    }

    resetProgressView()
    {
        this.updateEventTick = 0
        this.circleA.tint = 0xFFFFFF
        this.circleB.tint = 0xFFFFFF
        this.circleC.tint = 0xFFFFFF
        this.fillAX = 0
        this.fillBX = 0
    }

    isFinished()
    {
        return this.updateEventTick >= (this.refProg * 3)
    }

    async startProcess()
    {
        console.log("Starting process")
        this.resetProgressView()
        this.startButtuon.setActive(false)

        /*
        TODO:
        "http://localhost:5000/start?ignore_door&concurrent&fan=300&uv=10"
        */
        const response = await fetch(`${EndPoint}/start`)
        const result = await response.text()
        console.log("Start", result)
        
        if (!response.ok)
        {
            this.debugText.text = "Start error"
            throw "Start error"
        }

        this.cancelButton.setActive(true)

        this.setStateText("Sterilising and Drying")
        this.updateEvent = this.time.events.repeat(100, Infinity, this.updateProgress, this)
        this.circleA.tint = 0x00AA00

    }

    refProg = 25.0
    fillAX = 0
    fillBX = 0

    updateProgress()
    {
        if (this.input.activePointer.isDown)
        {
            this.updateEventTick++
        }

        if (this.updateEventTick <= this.refProg)
        {
            // this.fillA.scale.x = this.updateEventTick / this.refProg
            this.fillAX = this.updateEventTick / this.refProg
        }

        if (this.updateEventTick >= this.refProg && this.updateEventTick <= this.refProg * 2)
        {
            this.circleB.tint = 0x00AA00
            this.fillBX = (this.updateEventTick - this.refProg) / this.refProg
            this.setStateText("Drying")
        }

        if (this.updateEventTick >= this.refProg * 2 && this.updateEventTick < this.refProg * 3)
        {
            this.circleC.tint = 0xAAAA00
            this.setStateText("Comfirming Dry")
        }

        if (this.updateEventTick >= this.refProg * 3)
        {
            this.circleC.tint = 0x00AA00
            this.stopProcess()
        }

        console.log("Progress Update", this.updateEventTick / 10.0, "s")
    }

    update()
    {
        this.fillA.scale.x = pointLerp(new Phaser.Point(this.fillA.scale.x, this.fillA.scale.y), this.fillAX, 1, 0.1).x
        this.fillB.scale.x = pointLerp(new Phaser.Point(this.fillB.scale.x, this.fillA.scale.y), this.fillBX, 1, 0.2).x
    }
}
