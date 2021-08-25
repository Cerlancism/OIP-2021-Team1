import { Client, IClient, OfflineClient } from "./Client"
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
    popupObject: Phaser.Group

    startButtuon: TextButton
    cancelButton: TextButton

    popupYesButton: TextButton
    popupNoButton: TextButton
    popUpCloseButton: TextButton

    textureStartButton: Phaser.RenderTexture
    textureStopButton: Phaser.RenderTexture

    texturePopupChoiceButton: Phaser.RenderTexture
    texturePopupCloseButton: Phaser.RenderTexture
    texturePopup: Phaser.RenderTexture

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

    popupText: Phaser.Text

    client: IClient
    sensorUpdater: Phaser.TimerEvent
    sensorData: { temperature: number; humidity: number; proximity: number }

    constructor()
    {
        super()
        this.client = new OfflineClient()
        // this.client = new Client(this.debugText)
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

        this.texturePopup = new Phaser.Graphics(this.game)
            .beginFill(0xEEEEEE, 1)
            .drawRoundedRect(0, 0, 275, 175, 20)
            .generateTexture()

        this.texturePopupCloseButton = new Phaser.Graphics(this.game)
            .beginFill(0xE06666, 1)
            .drawRoundedRect(0, 0, 50, 50, 20)
            .generateTexture()

        this.texturePopupChoiceButton = new Phaser.Graphics(this.game)
            .beginFill(0xFFFFFF, 1)
            .lineStyle(1, 0x000000, 1)
            .drawRoundedRect(0, 0, 75, 50, 20)
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
            .setCallBack(() => {
                this.cancelButton.setActive(false)
                this.popupObject.scale.set(1, 1)
            })
            .setActive(false)


        //popup stuff

        this.popupObject = this.add.group(this.world, "popup")
        this.popupObject.x = 10
        this.popupObject.y = 20
        this.popupObject.create(12, 15, this.texturePopup)
        //this.popupObject.create(255, -10, this.texturePopupCloseButton)
        //this.popupObject.create(50, 125, this.texturePopupChoiceButton)
        //this.popupObject.create(175, 125, this.texturePopupChoiceButton)

        this.popupText = this.add.text(150, 50, "Are you sure you want to cancel?", { fill: "#000000", fontSize: 24, fontWeight: 100, wordWrap: true, wordWrapWidth: 225, align: "center" }, this.popupObject)
        this.popupText.anchor.set(0.5, 0)

        this.popUpCloseButton = new TextButton(this.game, 275, 20, this.texturePopupCloseButton as any, "X")
            .withStyle({ fill: "#000000", fontSize: 26, fontWeight: 100 })
            .groupTo(this.popupObject)
            .withInputScale()
            .withDisabledAlpha(0)
            .setActive(false)

        this.popupYesButton = new TextButton(this.game, 75, 150, this.texturePopupChoiceButton as any, "Yes")
            .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
            .groupTo(this.popupObject)
            .withInputScale()
            .setCallBack(() => 
            {
                this.popupObject.scale.set(0, 0)
                this.stopProcess()
            })

        this.popupNoButton = new TextButton(this.game, 225, 150, this.texturePopupChoiceButton as any, "No")
            .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
            .groupTo(this.popupObject)
            .withInputScale()
            .setCallBack(() => {
                this.cancelButton.setActive(true)
                this.popupObject.scale.set(0, 0)
            })

        this.popupObject.scale.set(0, 0)

        Boot.onCreate.dispatch()

        this.sensorUpdater = this.time.events.repeat(1000, Infinity, () => this.sensorUpdate())
        this.sensorUpdate()
    }

    setStateText(text: string)
    {
        this.stateText.text = text;
        this.stateText.anchor.setTo(0.5, 0);
    }

    async startProcess()
    {
        console.log("Starting process")

        if (this.sensorData.proximity < 3000)
        {
            console.warn("Door is not closed")
            return
        }

        this.resetProgressView()
        this.startButtuon.setActive(false)

        await this.client.start()

        this.cancelButton.setActive(true)

        this.setStateText("Sterilising and Drying")
        this.updateEvent = this.time.events.repeat(100, Infinity, this.updateProgress, this)
        this.circleA.tint = 0x00AA00

    }

    async stopProcess()
    {
        if (!this.isFinished())
        {
            this.client.stop()

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

    async sensorUpdate()
    {
        this.sensorData = await this.client.sensors()
        this.debugText.text = `h:${this.sensorData.humidity.toFixed(1)} t:${this.sensorData.temperature.toFixed(1)} p:${this.sensorData.proximity}`
    }

    update()
    {
        this.fillA.scale.x = pointLerp(new Phaser.Point(this.fillA.scale.x, this.fillA.scale.y), this.fillAX, 1, 0.1).x
        this.fillB.scale.x = pointLerp(new Phaser.Point(this.fillB.scale.x, this.fillA.scale.y), this.fillBX, 1, 0.2).x
    }
}
