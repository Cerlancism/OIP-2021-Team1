import { TextButton } from "/components/TextButton"

export abstract class Base extends Phaser.State
{
    mainConfigurationObject: Phaser.Group
    uvConfigurationObject: Phaser.Group
    fanConfigurationObject: Phaser.Group

    configFanText: Phaser.Text
    configUvText: Phaser.Text
    configConcurrentText: Phaser.Text

    configUvTitleText: Phaser.Text
    configUvValueText: Phaser.Text

    configFanTitleText: Phaser.Text
    configFanAutoText: Phaser.Text
    configFanValueText: Phaser.Text

    configUvCheckbox: TextButton
    configFanCheckbox: TextButton
    configConcurrentCheckbox: TextButton
    configProceedButton: TextButton

    configUvValuesButton: TextButton
    configFanValuesButton: TextButton

    configUvIncrementButton: TextButton
    configUvDecrementButton: TextButton
    configUvProceedButton: TextButton

    configFanAutoCheckbox: TextButton
    configFanIncrementButton: TextButton
    configFanDecrementButton: TextButton
    configFanProceedButton: TextButton
    configFanAutoDescriptionText: Phaser.Text

    popupYesButton: TextButton
    popupNoButton: TextButton
    popUpCloseButton: TextButton

    texturePopupChoiceButton: Phaser.RenderTexture
    texturePopupCloseButton: Phaser.RenderTexture
    texturePopup: Phaser.RenderTexture
    textureSquare: Phaser.RenderTexture
    textureConfigurationsValues: Phaser.RenderTexture

    popupText: Phaser.Text
    popupObject: Phaser.Group

    mainConfigurationText: Phaser.Text

    progressOject: Phaser.Group

    startButtuon: TextButton
    cancelButton: TextButton

    textureStartButton: Phaser.RenderTexture
    textureStopButton: Phaser.RenderTexture

    progressCircleTexture: Phaser.RenderTexture
    progressBarTexture: Phaser.RenderTexture
    progressFillTexture: Phaser.RenderTexture

    fillA: Phaser.Sprite
    fillB: Phaser.Sprite
    circleA: Phaser.Sprite
    circleB: Phaser.Sprite
    circleC: Phaser.Sprite

    ignoreDoor: boolean = false

    abstract stopProcess(): Promise<void>
    abstract startProcess(): Promise<void>

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

    setPopupDoorCheck(noText = "Cancel")
    {
        this.popupText.text = "Door is not fully closed, do you want to overide?"
        this.popupYesButton.text.text = "Overide"
        this.popupYesButton.setCallBack(() =>
        {
            this.popupObject.scale.set(0, 0)
            this.ignoreDoor = true
            this.startProcess()
        })
        this.popupNoButton.text.text = noText
        this.popupNoButton.setCallBack(() =>
        {
            this.popupObject.scale.set(0, 0)
        })
    }

    showConfig()
    {
        this.mainConfigurationObject.scale.set(1, 1)
    }
}