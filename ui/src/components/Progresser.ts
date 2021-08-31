import { pointLerp } from "./Helper"
import { TextButton } from "./TextButton"
import { Main } from "/states/Main"

const fillTargets =
{
    a: 0,
    b: 0
}

export function preloadProgresser(this: Main)
{
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

export function createProgresser(this: Main)
{
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
        .setCallBack(() => this.showConfig())
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
}

export function updateProgresser(this: Main)
{
    this.fillA.scale.x = pointLerp(new Phaser.Point(this.fillA.scale.x, this.fillA.scale.y), fillTargets.a, 1, 0.1).x
    this.fillB.scale.x = pointLerp(new Phaser.Point(this.fillB.scale.x, this.fillA.scale.y), fillTargets.b, 1, 0.2).x
}

export function setProgresser(action: (x: typeof fillTargets) => void)
{
    action(fillTargets)
}