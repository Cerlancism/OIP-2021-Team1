import { Main } from "../states/Main";

import { defaultConfig, initConfig } from "./Client";
import { TextButton } from "./TextButton";

export function preloadConfigurator(this: Main)
{
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

export function createConfigurator(this: Main)
{
    this.mainConfigurationObject = this.add.group(this.world, "mainConfiguration")
    this.mainConfigurationObject.x = 10
    this.mainConfigurationObject.y = 10
    this.mainConfigurationObject.create(0, 0, this.texturePopup)
    this.mainConfigurationText = this.add.text(150, 10, "Configurations", { fill: "#000000", fontSize: 26, fontWeight: 100 }, this.mainConfigurationObject)
    this.mainConfigurationText.anchor.set(0.5, 0)
    this.configUvText = this.add.text(25, 50, "UV", { fill: "#000000", fontSize: 20, fontWeight: 100 }, this.mainConfigurationObject)
    this.configFanText = this.add.text(25, 90, "Fan", { fill: "#000000", fontSize: 20, fontWeight: 100 }, this.mainConfigurationObject)
    this.configConcurrentText = this.add.text(25, 130, "Concurrent", { fill: "#000000", fontSize: 20, fontWeight: 100 }, this.mainConfigurationObject)

    this.configUvCheckbox = new TextButton(this.game, 150, 60, this.textureSquare as any, "✔")
        .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
        .groupTo(this.mainConfigurationObject)
        .withInputScale()
        .setCallBack(() => 
        {
            if (this.configUvCheckbox.text.text === "✔")
            {
                this.configUvCheckbox.text.text = ""
                this.configUvValuesButton.visible = false
                this.configUvValuesButton.text.visible = false
            }
            else
            {
                this.configUvCheckbox.text.text = "✔"
                this.configUvValuesButton.visible = true
                this.configUvValuesButton.text.visible = true
            }
        })

    this.configFanCheckbox = new TextButton(this.game, 150, 100, this.textureSquare as any, "✔")
        .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
        .groupTo(this.mainConfigurationObject)
        .withInputScale()
        .setCallBack(() => 
        {
            if (this.configFanCheckbox.text.text === "✔")
            {
                this.configFanCheckbox.text.text = ""
                this.configFanValuesButton.visible = false
                this.configFanValuesButton.text.visible = false
            }
            else
            {
                this.configFanCheckbox.text.text = "✔"
                this.configFanValuesButton.visible = true
                this.configFanValuesButton.text.visible = true
            }
        })

    this.configConcurrentCheckbox = new TextButton(this.game, 150, 140, this.textureSquare as any, "✔")
        .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
        .groupTo(this.mainConfigurationObject)
        .withInputScale()
        .setCallBack(() => 
        {
            if (this.configConcurrentCheckbox.text.text === "✔")
            {
                initConfig.concurrent = false
                this.configConcurrentCheckbox.text.text = ""
            }
            else
            {
                initConfig.concurrent = true
                this.configConcurrentCheckbox.text.text = "✔"
            }
        })

    this.configProceedButton = new TextButton(this.game, 150, 190, this.texturePopupChoiceButton as any, "Proceed")
        .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
        .groupTo(this.mainConfigurationObject)
        .withInputScale()
        .setCallBack(() =>
        {
            this.mainConfigurationObject.scale.set(0, 0)
            this.startProcess()
        })

    this.configUvValuesButton = new TextButton(this.game, 240, 60, this.textureConfigurationsValues as any, initConfig.uvSeconds / 60 + " Mins")
        .withStyle({ fill: "#000000", fontSize: 18, fontWeight: 100 })
        .groupTo(this.mainConfigurationObject)
        .withInputScale()
        .setCallBack(() =>
        {
            this.uvConfigurationObject.scale.set(1, 1)
        })

    this.configFanValuesButton = new TextButton(this.game, 240, 100, this.textureConfigurationsValues as any, "Auto")
        .withStyle({ fill: "#000000", fontSize: 18, fontWeight: 100 })
        .groupTo(this.mainConfigurationObject)
        .withInputScale()
        .setCallBack(() =>
        {
            this.fanConfigurationObject.scale.set(1, 1)
        })

    // uv configuration

    this.uvConfigurationObject = this.add.group(this.world, "uv config")
    this.uvConfigurationObject.x = 10
    this.uvConfigurationObject.y = 10
    this.uvConfigurationObject.create(0, 0, this.texturePopup)
    this.configUvTitleText = this.add.text(150, 10, "UV Configuration", { fill: "#000000", fontSize: 24, fontWeight: 100, align: "center" }, this.uvConfigurationObject)
    this.configUvTitleText.anchor.set(0.5, 0)

    this.configUvValueText = this.add.text(150, 90, initConfig.uvSeconds / 60 + " Mins", { fill: "#000000", fontSize: 20, fontWeight: 100, align: "center" }, this.uvConfigurationObject)
    this.configUvValueText.anchor.set(0.5, 0)
    this.configUvDecrementButton = new TextButton(this.game, 80, 100, this.textureSquare as any, " - ")
        .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
        .groupTo(this.uvConfigurationObject)
        .withInputScale()
        .setCallBack(() => 
        {
            if (initConfig.uvSeconds / 60 > 1)
            {
                initConfig.uvSeconds = initConfig.uvSeconds - 60
                this.configUvValueText.text = initConfig.uvSeconds / 60 + " Mins"
            }
        })

    this.configUvIncrementButton = new TextButton(this.game, 220, 100, this.textureSquare as any, " + ")
        .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
        .groupTo(this.uvConfigurationObject)
        .withInputScale()
        .setCallBack(() => 
        {
            if (initConfig.uvSeconds / 60 < 10)
            {
                initConfig.uvSeconds = initConfig.uvSeconds + 60
                this.configUvValueText.text = initConfig.uvSeconds / 60 + " Mins"
            }
        })

    this.configUvProceedButton = new TextButton(this.game, 150, 190, this.texturePopupChoiceButton as any, "Ok")
        .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
        .groupTo(this.uvConfigurationObject)
        .withInputScale()
        .setCallBack(() =>
        {
            this.configUvValuesButton.text.text = initConfig.uvSeconds / 60 + " Mins"
            this.uvConfigurationObject.scale.set(0, 0)
        })

    // fan config

    this.fanConfigurationObject = this.add.group(this.world, "fan config")
    this.fanConfigurationObject.x = 10
    this.fanConfigurationObject.y = 10
    this.fanConfigurationObject.create(0, 0, this.texturePopup)
    this.configFanTitleText = this.add.text(150, 10, "Fan Configuration", { fill: "#000000", fontSize: 24, fontWeight: 100, align: "center" }, this.fanConfigurationObject)
    this.configFanTitleText.anchor.set(0.5, 0)
    this.configFanAutoText = this.add.text(75, 75, "Auto", { fill: "#000000", fontSize: 20, fontWeight: 100 }, this.fanConfigurationObject)
    this.configFanAutoDescriptionText = this.add.text(150, 110, "Run for at least 5 mins and auto detect dryness up to 30 mins.", { fill: "#000000", fontSize: 16, fontWeight: 100, align: "center", wordWrap: true, wordWrapWidth: 280 }, this.fanConfigurationObject)
    this.configFanAutoDescriptionText.anchor.set(0.5, 0)
    this.configFanAutoCheckbox = new TextButton(this.game, 200, 85, this.textureSquare as any, "✔")
        .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
        .groupTo(this.fanConfigurationObject)
        .withInputScale()
        .setCallBack(() => 
        {
            if (this.configFanAutoCheckbox.text.text === "✔")
            {
                initConfig.fanAuto = false
                this.configFanAutoDescriptionText.visible = false
                this.configFanValueText.text = initConfig.fanSeconds / 60 + " Mins"
                this.configFanAutoCheckbox.text.text = ""
                this.configFanValueText.scale.set(1, 1)
                this.configFanDecrementButton.scale.set(1, 1)
                this.configFanDecrementButton.text.text = "-"
                this.configFanIncrementButton.text.text = "+"
                this.configFanIncrementButton.scale.set(1, 1)
            }
            else
            {
                initConfig.fanAuto = true
                this.configFanAutoDescriptionText.visible = true
                this.configFanAutoCheckbox.text.text = "✔"
                this.configFanValueText.scale.set(0, 0)
                this.configFanDecrementButton.scale.set(0, 0)
                this.configFanDecrementButton.text.text = ""
                this.configFanIncrementButton.text.text = ""
                this.configFanIncrementButton.scale.set(0, 0)
            }
        })

    this.configFanValueText = this.add.text(150, 125, defaultConfig.fanSeconds / 60 + " Mins", { fill: "#000000", fontSize: 20, fontWeight: 100, align: "center" }, this.fanConfigurationObject)
    this.configFanValueText.anchor.set(0.5, 0)
    this.configFanDecrementButton = new TextButton(this.game, 80, 137, this.textureSquare as any, " - ")
        .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
        .groupTo(this.fanConfigurationObject)
        .withInputScale()
        .setCallBack(() => 
        {
            if (initConfig.fanSeconds / 60 > 1)
            {
                initConfig.fanSeconds = initConfig.fanSeconds - 60
                this.configFanValueText.text = initConfig.fanSeconds / 60 + " Mins"
            }
        })

    this.configFanIncrementButton = new TextButton(this.game, 220, 137, this.textureSquare as any, " + ")
        .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
        .groupTo(this.fanConfigurationObject)
        .withInputScale()
        .setCallBack(() => 
        {
            if (initConfig.fanSeconds / 60 < 30)
            {
                initConfig.fanSeconds = initConfig.fanSeconds + 60
                this.configFanValueText.text = initConfig.fanSeconds / 60 + " Mins"
            }
        })

    this.configFanProceedButton = new TextButton(this.game, 150, 190, this.texturePopupChoiceButton as any, "Ok")
        .withStyle({ fill: "#000000", fontSize: 20, fontWeight: 100 })
        .groupTo(this.fanConfigurationObject)
        .withInputScale()
        .setCallBack(() =>
        {
            if (initConfig.fanAuto)
            {
                this.configFanValuesButton.text.text = "Auto"
            }
            else
            {
                this.configFanValuesButton.text.text = initConfig.fanSeconds / 60 + " Mins"
            }
            this.fanConfigurationObject.scale.set(0, 0)
        })

    this.configFanDecrementButton.text.text = ""
    this.configFanIncrementButton.text.text = ""
    this.configFanValueText.scale.set(0, 0)
    this.configFanDecrementButton.scale.set(0, 0)
    this.configFanIncrementButton.scale.set(0, 0)

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

    this.mainConfigurationObject.scale.set(0, 0)

    this.uvConfigurationObject.scale.set(0, 0)

    this.fanConfigurationObject.scale.set(0, 0)
}