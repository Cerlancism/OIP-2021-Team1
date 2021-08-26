import { Client, IClient, OfflineClient } from "./Client"
import { Clock } from "./Clock"
import { pointLerp } from "./Helper"
import { TextButton } from "./TextButton"

const ProximityThreshold = 4000

export class Boot extends Phaser.State
{
    public static onCreate = new Phaser.Signal()

    clock = new Clock(this)

    progressOject: Phaser.Group
    popupObject: Phaser.Group

    mainConfigurationObject: Phaser.Group
    uvConfigurationObject: Phaser.Group
    
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
    textureSquare: Phaser.RenderTexture
    textureConfigurationsValues: Phaser.RenderTexture

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
    ignoreDoor: boolean = false

    mainConfigurationText: Phaser.Text
    configFanText: Phaser.Text
    configUvText : Phaser.Text
    configConcurrentText : Phaser.Text

    configUvTitleText: Phaser.Text
    configUvAutoText: Phaser.Text
    configUvValueText: Phaser.Text

    configurations = { fan: -1, uv: 10, concurrent: true}
    configUvCheckbox: TextButton
    configFanCheckbox: TextButton
    configConcurrentCheckbox: TextButton
    configProceedButton: TextButton

    configUvValues: TextButton
    configFanValues: TextButton

    configUvAutoCheckbox: TextButton
    configUvIncrementButton: TextButton
    configUvDecrementButton: TextButton
    configUvProceedButton: TextButton

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
            .drawRoundedRect(0, 0, 300, 220, 20)
            .generateTexture()

        this.texturePopupCloseButton = new Phaser.Graphics(this.game)
            .beginFill(0xE06666, 1)
            .drawRoundedRect(0, 0, 50, 50, 20)
            .generateTexture()

        this.texturePopupChoiceButton = new Phaser.Graphics(this.game)
            .beginFill(0xFFFFFF, 1)
            .lineStyle(1, 0x000000, 1)
            .drawRoundedRect(0, 0, 100, 50, 10)
            .generateTexture()

        this.textureSquare = new Phaser.Graphics(this.game)
            .beginFill(0xFFFFFF, 0)
            .lineStyle(1, 0x000000, 1)
            .drawRoundedRect(0, 0, 20, 20, 5)
            .generateTexture()

        this.textureConfigurationsValues = new Phaser.Graphics(this.game)
            .beginFill(0xFFFFFF, 0)
            .lineStyle(1, 0x000000, 1)
            .drawRoundedRect(0, 0, 90, 25, 5)
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

        const buttonY = 190

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
            .setCallBack(() =>
            {
                this.setPopupYesNoCancel()
                this.popupObject.scale.set(1, 1)
            })
            .setActive(false)
        
        // configuration stuff

        this.mainConfigurationObject = this.add.group(this.world, "mainConfiguration")
        this.mainConfigurationObject.x = 10
        this.mainConfigurationObject.y = 10
        this.mainConfigurationObject.create(0, 0, this.texturePopup)
        this.mainConfigurationText = this.add.text(150, 10, "Configurations", {fill: "#000000", fontSize: 26, fontWeight:100}, this.mainConfigurationObject)
        this.mainConfigurationText.anchor.set(0.5, 0)
        this.configUvText = this.add.text(25, 50, "UV", {fill: "#000000", fontSize: 20, fontWeight:100}, this.mainConfigurationObject)
        this.configFanText = this.add.text(25, 90, "Fan", {fill: "#000000", fontSize: 20, fontWeight:100}, this.mainConfigurationObject)
        this.configConcurrentText = this.add.text(25, 130, "Concurrent", {fill: "#000000", fontSize: 20, fontWeight:100}, this.mainConfigurationObject)

        this.configUvCheckbox = new TextButton(this.game, 150, 60, this.textureSquare as any, "✔")
            .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
            .groupTo(this.mainConfigurationObject)
            .withInputScale()
            .setCallBack(() => 
            {
                if(this.configUvCheckbox.text.text === "✔")
                {
                    this.configUvCheckbox.text.text = ""
                }
                else
                {
                    this.configUvCheckbox.text.text = "✔"
                }
            })

        this.configFanCheckbox = new TextButton(this.game, 150, 100, this.textureSquare as any, "✔")
            .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
            .groupTo(this.mainConfigurationObject)
            .withInputScale()
            .setCallBack(() => 
            {
                if(this.configFanCheckbox.text.text === "✔")
                {
                    this.configFanCheckbox.text.text = ""
                }
                else
                {
                    this.configFanCheckbox.text.text = "✔"
                }
            })

        this.configConcurrentCheckbox = new TextButton(this.game, 150, 140, this.textureSquare as any, "✔")
            .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
            .groupTo(this.mainConfigurationObject)
            .withInputScale()
            .setCallBack(() => 
            {
                if(this.configConcurrentCheckbox.text.text === "✔")
                {
                    this.configConcurrentCheckbox.text.text = ""
                }
                else
                {
                    this.configConcurrentCheckbox.text.text = "✔"
                }
            })
        
        this.configProceedButton = new TextButton(this.game, 150, 190, this.texturePopupChoiceButton as any, "Proceed")
            .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
            .groupTo(this.mainConfigurationObject)
            .withInputScale()

        this.configUvValues = new TextButton(this.game, 240, 60, this.textureConfigurationsValues as any, "5 Mins")
            .withStyle({ fill: "#000000", fontSize: 18, fontWeight: 100 })
            .groupTo(this.mainConfigurationObject)
            .withInputScale()

        this.configFanValues = new TextButton(this.game, 240, 100, this.textureConfigurationsValues as any, "Auto")
            .withStyle({ fill: "#000000", fontSize: 18, fontWeight: 100 })
            .groupTo(this.mainConfigurationObject)
            .withInputScale()

        // uv configuration

        this.uvConfigurationObject = this.add.group(this.world, "uv config")
        this.uvConfigurationObject.x = 10
        this.uvConfigurationObject.y = 10
        this.uvConfigurationObject.create(0,0, this.texturePopup)
        this.configUvTitleText = this.add.text(150, 10, "UV Configuration", {fill: "#000000", fontSize: 24, fontWeight: 100, align:"center"}, this.uvConfigurationObject)
        this.configUvTitleText.anchor.set(0.5, 0)
        this.configUvAutoText = this.add.text(75, 75, "Auto", {fill:"#000000", fontSize: 20, fontWeight:100}, this.uvConfigurationObject)
        this.configUvCheckbox = new TextButton(this.game, 200, 85, this.textureSquare as any, "✔")
            .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
            .groupTo(this.uvConfigurationObject)
            .withInputScale()
            .setCallBack(() => 
            {
                if(this.configUvCheckbox.text.text === "✔")
                {
                    this.configUvCheckbox.text.text = ""
                    this.configUvValueText.scale.set(0,0)
                    this.configUvDecrementButton.scale.set(0,0)
                    this.configUvDecrementButton.text.text = ""
                    this.configUvIncrementButton.text.text = ""
                    this.configUvIncrementButton.scale.set(0,0)
                }
                else
                {
                    this.configUvCheckbox.text.text = "✔"
                    this.configUvValueText.scale.set(1,1)
                    this.configUvDecrementButton.scale.set(1,1)
                    this.configUvDecrementButton.text.text = "-"
                    this.configUvIncrementButton.text.text = "+"
                    this.configUvIncrementButton.scale.set(1,1)
                }
            })

        this.configUvValueText = this.add.text(150, 125, this.configurations.uv + " Mins", {fill :"#000000", fontSize: 20, fontWeight:100, align:"center"}, this.uvConfigurationObject)
        this.configUvValueText.anchor.set(0.5, 0)
        this.configUvDecrementButton = new TextButton(this.game, 80, 137, this.textureSquare as any, " - ")
            .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
            .groupTo(this.uvConfigurationObject)
            .withInputScale()
            .setCallBack(() => 
            {
                if(this.configurations.uv > 1)
                {
                    this.configurations.uv = this.configurations.uv - 1
                    this.configUvValueText.text = this.configurations.uv + " Mins"
                }
            })

        this.configUvIncrementButton = new TextButton(this.game, 220, 137, this.textureSquare as any, " + ")
            .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
            .groupTo(this.uvConfigurationObject)
            .withInputScale()
            .setCallBack(() => 
            {
                if(this.configurations.uv < 10)
                {
                    this.configurations.uv = this.configurations.uv + 1
                    this.configUvValueText.text = this.configurations.uv + " Mins"
                }
            })

        this.configUvProceedButton = new TextButton(this.game, 150, 190, this.texturePopupChoiceButton as any, "Proceed")
            .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
            .groupTo(this.uvConfigurationObject)
            .withInputScale()
        
        

        //popup stuff
        this.popupObject = this.add.group(this.world, "popup")
        this.popupObject.x = 10
        this.popupObject.y = 10
        const popupBackground = this.popupObject.create(0, 0, this.texturePopup) as Phaser.Sprite
        popupBackground.inputEnabled = true

        this.popupText = this.add.text(150, 20, "Sample Text", { fill: "#000000", fontSize: 24, fontWeight: 100, wordWrap: true, wordWrapWidth: 230, align: "center" }, this.popupObject)
        this.popupText.anchor.set(0.5, 0)

        this.popUpCloseButton = new TextButton(this.game, 275, 20, this.texturePopupCloseButton as any, "X")
            .withStyle({ fill: "#000000", fontSize: 26, fontWeight: 100 })
            .groupTo(this.popupObject)
            .withInputScale()
            .withDisabledAlpha(0)
            .setActive(false)

        this.popupYesButton = new TextButton(this.game, 75, 180, this.texturePopupChoiceButton as any, "1")
            .withStyle({ fill: "#000000", fontSize: 24, fontWeight: 100 })
            .groupTo(this.popupObject)
            .withInputScale()

        this.popupNoButton = new TextButton(this.game, 225, 180, this.texturePopupChoiceButton as any, "2")
            .withStyle({ fill: "#000000", fontSize: 24, fontWeight: 100 })
            .groupTo(this.popupObject)
            .withInputScale()

        this.popupObject.scale.set(0, 0)

        this.mainConfigurationObject.scale.set(0,0)

        this.uvConfigurationObject.scale.set(0,0)

        Boot.onCreate.dispatch()

        this.sensorUpdater = this.time.events.repeat(1000, Infinity, () => this.sensorUpdate())
        this.sensorUpdate()
    }

    setStateText(text: string)
    {
        this.stateText.text = text;
        this.stateText.anchor.setTo(0.5, 0);
    }

    setPopupYesNoCancel()
    {
        this.popupText.text = "Are you sure you want to cancel?"
        this.popupYesButton.text.text = "Yes"
        this.popupYesButton.setCallBack(() =>
        {
            this.popupObject.scale.set(0, 0)
            this.stopProcess()
        })
        this.popupNoButton.text.text = "No"
        this.popupNoButton.setCallBack(() =>
        {
            this.popupObject.scale.set(0, 0)
        })
    }

    setPopupDoorCheck()
    {
        this.popupText.text = "Door is not fully closed, do you want to overide?"
        this.popupYesButton.text.text = "Overide"
        this.popupYesButton.setCallBack(() =>
        {
            this.popupObject.scale.set(0, 0)
            this.ignoreDoor = true
            this.startProcess()
        })
        this.popupNoButton.text.text = "Cancel"
        this.popupNoButton.setCallBack(() =>
        {
            this.popupObject.scale.set(0, 0)
        })
    }

    async startProcess()
    {
        console.log("Starting process")

        if (this.sensorData.proximity < ProximityThreshold)
        {
            console.warn("Door is not closed")

            if (!this.ignoreDoor)
            {
                this.setPopupDoorCheck()
                this.popupObject.scale.set(1, 1)
                return
            }
        }

        this.setPopupYesNoCancel()

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

        if (this.sensorData.proximity < ProximityThreshold)
        {
            if (!this.ignoreDoor)
            {
                this.setPopupDoorCheck()
                this.popupObject.scale.set(1, 1)
            }
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
