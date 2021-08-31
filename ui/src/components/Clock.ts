function stepToAngle(totalSteps: number, input: number)
{
    return overFlowAngle(360 / totalSteps * (input % totalSteps))
}

function overFlowAngle(value: number)
{
    return value > 180 ? -180 + (value - 180) : value
}

function getSyncedTime()
{
    const now = Date.now()
    const offset = now % 1000
    const dateTime = new Date(now + (offset > 500 ? (-offset + 1000) : -offset))

    return dateTime
}

export class Clock
{
    referenceLength: number

    circleTexture: Phaser.RenderTexture
    circleDotTexture: Phaser.RenderTexture
    hourHandTexture: Phaser.RenderTexture
    minuteHandTexture: Phaser.RenderTexture
    secondHandTexture: Phaser.RenderTexture
    thickMarkingTexture: Phaser.RenderTexture
    thinMarkingTexture: Phaser.RenderTexture
    shortMarkingTexture: Phaser.RenderTexture

    clockObject: Phaser.Group
    clockBody: Phaser.Sprite
    hourHand: Phaser.Sprite
    minuteHand: Phaser.Sprite
    secondHand: Phaser.Sprite
    state: Phaser.State
    game: Phaser.Game
    // timeStamp: Phaser.Text

    constructor(state: Phaser.State)
    {
        this.state = state
        this.game = this.state.game
    }

    preload()
    {
        this.circleTexture = new Phaser.Graphics(this.game)
            .lineStyle(10, 0, 1)
            .drawCircle(0, 0, 800)
            .generateTexture()


        this.circleDotTexture = new Phaser.Graphics(this.game)
            .beginFill(0xFF00000)
            .drawCircle(0, 0, 30)
            .endFill()
            .generateTexture()

        this.hourHandTexture = new Phaser.Graphics(this.game)
            .beginFill(0x444444)
            .drawRect(0, 0, 30, 250)
            .endFill()
            .generateTexture()

        this.minuteHandTexture = new Phaser.Graphics(this.game)
            .beginFill(0)
            .drawRect(0, 0, 20, 400)
            .endFill()
            .generateTexture()

        this.secondHandTexture = new Phaser.Graphics(this.game)
            .beginFill(0xFF0000)
            .drawRect(0, 0, 10, 450)
            .endFill()
            .generateTexture()

        this.thickMarkingTexture = new Phaser.Graphics(this.game)
            .beginFill(0)
            .drawRect(0, 0, 15, 85)
            .endFill()
            .generateTexture()

        this.thinMarkingTexture = new Phaser.Graphics(this.game)
            .beginFill(0)
            .drawRect(0, 0, 8, 85)
            .endFill()
            .generateTexture()

        this.shortMarkingTexture = new Phaser.Graphics(this.game)
            .beginFill(0)
            .drawRect(0, 0, 5, 30)
            .endFill()
            .generateTexture()
    }

    create()
    {
        this.clockObject = this.state.add.group(this.state.world, "clock")

        this.clockBody = this.createClockComponent(Phaser.Sprite, 0, 0, this.circleTexture)
        this.clockBody.anchor.set(0.5)
        this.clockBody.y -= 100

        this.createClockMarkings()

        this.hourHand = this.createClockComponent(Phaser.Sprite, this.clockBody.x, this.clockBody.y, this.hourHandTexture)
        this.hourHand.anchor.set(0.5, 0.8)

        this.minuteHand = this.createClockComponent(Phaser.Sprite, this.clockBody.x, this.clockBody.y, this.minuteHandTexture)
        this.minuteHand.anchor.set(0.5, 0.8)

        this.secondHand = this.createClockComponent(Phaser.Sprite, this.clockBody.x, this.clockBody.y, this.secondHandTexture)
        this.secondHand.anchor.set(0.5, 0.8)

        // this.timeStamp = this.createClockComponent(Phaser.Text, 0, 0)
        // this.timeStamp.anchor.set(0.5)
        // this.timeStamp.fontSize = 84
        // this.timeStamp.y = 425

        const clockDot = this.createClockComponent(Phaser.Sprite, 0, 0, this.circleDotTexture)
        clockDot.anchor.set(0.5)
        clockDot.position = this.clockBody.position

        this.secondHand.angle = stepToAngle(60, new Date().getSeconds())

        // addEventListener("resize", () => this.handleScale())

        this.handleScale()

        const ticker = () =>
        {
            const dateTime = getSyncedTime()
            this.updateClock(dateTime)

            const current = new Date()

            const timeToNextSecond = 1000 - current.getMilliseconds()
            this.state.time.events.add(timeToNextSecond, ticker)
        }

        ticker()
    }


    createClockComponent<T extends PIXI.DisplayObject>(type: new (...args: any) => T, x: number, y: number, key?: string | Phaser.RenderTexture): T
    {
        const originalType = this.clockObject.classType
        this.clockObject.classType = type
        const output = this.clockObject.create(x, y, key)
        this.clockObject.classType = originalType
        return output
    }

    createClockMarkings()
    {
        for (let minute = 0; minute < 60; minute++)
        {
            const marking = this.createClockComponent(Phaser.Sprite, 0, 0, this.getMarkingTexture(minute))
            marking.anchor.set(0.5, 1 / marking.height * 380)
            marking.position = this.clockBody.position
            marking.angle = stepToAngle(60, minute)
        }
    }

    getMarkingTexture(minute: number)
    {
        if (minute % 5)
        {
            return this.shortMarkingTexture
        }
        else
        {
            if (minute % 15)
            {
                return this.thinMarkingTexture
            }
            else
            {
                return this.thickMarkingTexture
            }
        }
    }

    handleScale()
    {
        const adjustPositions = () =>
        {
            this.clockObject.scale.set(0.05)
            this.clockObject.position.set(300, 25)
        }

        adjustPositions()

        setTimeout(adjustPositions, 1000 / this.state.game.time.desiredFps)
    }

    updateClock(dateTime: Date)
    {
        this.setDigitalClock(dateTime)
        this.setAnalogClock(dateTime)
    }

    setAnalogClock(dateTime: Date)
    {
        this.hourHand.angle = stepToAngle(12, dateTime.getHours() + (dateTime.getMinutes() * 60 + dateTime.getSeconds()) / 3600)
        this.minuteHand.angle = stepToAngle(60, dateTime.getMinutes() + dateTime.getSeconds() / 60)
        this.state.add.tween(this.secondHand).to({ angle: stepToAngle(60, dateTime.getSeconds()) }, 200, Phaser.Easing.Bounce.Out, true)
    }

    setDigitalClock(dateTime: Date)
    {
        // this.timeStamp.text = dateTime.toLocaleString('en-GB', { hour12: false })
    }
}