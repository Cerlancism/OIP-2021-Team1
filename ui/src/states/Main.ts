import { Base } from "./Base"
import { Client, IClient, OfflineClient, defaultConfig, initConfig, progressConfig, setConfiguration, SensorModel } from "/components/Client"
import { Clock } from "/components/Clock"

import { createConfigurator, preloadConfigurator } from "/components/Configurator"
import { isDired, meanHumidity, sampleData } from "/components/DrynessDetector"
import { createProgresser, preloadProgresser, setProgresser, updateProgresser } from "/components/Progresser"

const ProximityThreshold = 200

// console.log("average humidity", mean(sampleData.map(x => x.humidity)))

export class Main extends Base
{
    public static onCreate = new Phaser.Signal()

    clock = new Clock(this)

    stateText: Phaser.Text

    debugText: Phaser.Text

    private updateEvent: Phaser.TimerEvent
    private updateEventTick = 0

    client: IClient
    private sensorUpdater: Phaser.TimerEvent
    sensorData: { temperature: number; humidity: number; proximity: number }
    isPaused = false

    private tickProgress = 0
    private tick = 0
    private previousTickTime = performance.now()
    private tickPaused = false

    private isReady: Promise<void>
    private finished = false

    textMin: Phaser.Text
    textMax: Phaser.Text
    graphHumidity: Phaser.Graphics
    graphWidth: number
    graphHeight: number
    graphHumidityRaw: Phaser.Graphics

    constructor()
    {
        super()
    }

    async initClientAsync()
    {
        // this.client = new OfflineClient()
        this.client = new Client(this.debugText)

        const isOnline = await this.client.ping(1000)

        if (!isOnline)
        {
            console.warn("Offline mode")
            this.debugText.text = "Offline Mode"
            this.client = new OfflineClient()

            this.demo()
        }
        else
        {
            console.info("Online")
        }

        window["client"] = this.client
        this.sensorUpdater = this.time.events.repeat(1000, Infinity, () => this.sensorUpdate())

        return await Promise.resolve()
    }

    init()
    {
        this.game.stage.disableVisibilityChange = true
        this.scale.scaleMode = Phaser.ScaleManager.RESIZE
    }

    preload()
    {
        this.clock.preload()

        preloadProgresser.call(this)
        preloadConfigurator.call(this)
    }

    create()
    {
        this.clock.create()

        this.debugText = this.add.text(0, 0, "Debug Mode", { font: "monospace" })
        this.stateText = this.add.text(160, 130, "", { fontSize: 24, align: "center" })

        this.textMax = this.add.text(20, 20, "0", { fontSize: 12 })
        this.textMin = this.add.text(20, 80, "0", { fontSize: 12 })

        this.graphWidth = 220
        this.graphHeight = 60

        this.graphHumidity = this.add.graphics(50, 20)
        this.graphHumidityRaw = this.add.graphics(50, 20)

        createProgresser.call(this)
        createConfigurator.call(this)

        Main.onCreate.dispatch()
        this.isReady = this.initClientAsync()
    }

    demo()
    {
        this.clock.clockObject.visible = false
        // this.debugText.visible = false
        this.time.events.repeat(1, Infinity, () => this.updateGraph())
        this.startButtuon.setActive(false)
        this.circleA.tint = 0x00AA00
    }

    drawPoint(total: number, current: number, min: number, max: number, value: number, action = (x: number, y: number) => this.graphHumidity.lineTo(x, y))
    {
        const width = (this.graphWidth) / (total - 1)
        const x = width * current
        const height = max - min
        const y = this.graphHeight - (((value - min) / height) * this.graphHeight)

        // console.log(x, y)
        action(x, y)
    }

    secondsPassed = 0
    maxSeen = 0
    minSeen = 100
    lables: Phaser.Text[] = []

    isDiredDetected = false

    sensoryHistorySeconds: SensorModel[] = [sampleData[0]]
    updateGraph()
    {
        // if (this.secondsPassed >= sampleData.length)
        // {
        //     this.setStateText("Finished")
        //     this.circleC.tint = 0x00AA00
        //     return
        // }
        this.secondsPassed++

        if (sampleData[this.secondsPassed])
        {
            const { humidity, temperature, proximity } = sampleData[this.secondsPassed]
            this.debugText.text = `h:${humidity.toFixed(1)} t:${temperature.toFixed(1)} p:${proximity.toFixed(0)}`
            this.sensoryHistorySeconds.push(sampleData[this.secondsPassed])
        }
        else
        {
            return
        }


        this.tickProgress = this.secondsPassed <= 60 * 5 ? ((this.secondsPassed / (60 * 5)) * 50) : (50 + ((this.secondsPassed) / (60 * 20)) * 50)

        this.updateProgressBar()

        // const dataRange = sampleData.slice(0, this.secondsPassed)

        const latest = meanHumidity(this.sensoryHistorySeconds)
        const latestRaw = this.sensoryHistorySeconds[this.secondsPassed].humidity

        if (latestRaw > this.maxSeen)
        {
            this.maxSeen = latestRaw
        }
        if (latestRaw < this.minSeen)
        {
            this.minSeen = latestRaw
        }


        this.graphHumidity.clear()
        this.graphHumidityRaw.clear()

        if (this.sensoryHistorySeconds.length <= 10) {
            return
        }

        this.drawPoint(this.secondsPassed, 0, this.minSeen, this.maxSeen, this.sensoryHistorySeconds[10].humidity, (x, y) => this.graphHumidityRaw.moveTo(x, y))
        this.drawPoint(this.secondsPassed, 0, this.minSeen, this.maxSeen, meanHumidity(this.sensoryHistorySeconds, 10), (x, y) => this.graphHumidity.moveTo(x, y))
        const timeStamp = `${Math.floor(this.secondsPassed / 60).toString().padStart(2, "0")}:${(this.secondsPassed % 60).toString().padStart(2, "0")}`
        for (let index = 10; index < this.secondsPassed; index++)
        {
            if (index < 20 * 60)
            {
                this.graphHumidity.lineStyle(1, 0xFF0000)
                this.graphHumidityRaw.lineStyle(1, 0xFF0000, 0.1)

                if (this.secondsPassed < 5 * 60)
                {
                    this.setStateText(`Sterialising ${timeStamp}`)
                }
                else if (this.secondsPassed < 20 * 60)
                {
                    this.setStateText(`Drying ${timeStamp}`)
                }

            }
            else
            {
                this.graphHumidity.lineStyle(2, 0xFF9900)
                this.graphHumidityRaw.lineStyle(1, 0xFF9900, 0.1)
                const { result, percent} = isDired(this.sensoryHistorySeconds, index)
                if (result)
                {
                    if (!this.isDiredDetected)
                    {
                        this.isDiredDetected = true
                        this.setStateText(`Finished at: ${timeStamp}`)
                    }
                    this.circleC.tint = 0x00AA00
                    this.graphHumidity.lineStyle(2, 0x00FF00)
                    this.graphHumidityRaw.lineStyle(1, 0x00FF00, 0.1)
                }
                else
                {
                    if (!this.isDiredDetected)
                    {
                        this.setStateText(`Detecting Dryness ${timeStamp} \n${(percent * 100).toFixed(0)}%`)
                    }
                }
            }

            this.drawPoint(this.secondsPassed, index, this.minSeen, this.maxSeen, meanHumidity(this.sensoryHistorySeconds, index))
            this.drawPoint(this.secondsPassed, index, this.minSeen, this.maxSeen, this.sensoryHistorySeconds[index].humidity, (x, y) => this.graphHumidityRaw.lineTo(x, y))
        }

        this.textMin.text = this.minSeen.toFixed(1)
        this.textMax.text = this.maxSeen.toFixed(1)
    }

    setStateText(text: string)
    {
        this.stateText.text = text;
        this.stateText.anchor.setTo(0.5, 0);
    }

    async startProcess()
    {
        console.log("Starting process")

        if (this.isPaused)
        {
            this.isPaused = false
        }
        else
        {
            console.log("New process")
            this.finished = false
            setConfiguration(initConfig, progressConfig)

            if (!progressConfig.fanEnabled)
            {
                progressConfig.fanSeconds = 0
            }
            if (!progressConfig.uvEnabed)
            {
                progressConfig.uvSeconds = 0
            }
            this.resetProgressView()
        }

        this.tickPaused = false
        this.setPopupYesNoCancel()

        this.startButtuon.setActive(false)

        await this.client.start()

        this.cancelButton.setActive(true)

        this.time.events.remove(this.updateEvent)
        this.updateEvent = this.time.events.repeat(500, Infinity, this.updateProgress, this)
        this.circleA.tint = 0x00AA00

    }

    async stopProcess()
    {
        console.log("Stopping Process")
        this.time.events.remove(this.updateEvent)
        setTimeout(async () =>
        {
            await this.client.stop()
            await this.client.actuate("motor", false)
            await this.client.actuate("uv", false)
            await this.client.actuate("fan", false)
        }, 1000)

        if (!this.isFinished())
        {
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
            setConfiguration(defaultConfig, initConfig)
        }

        this.startButtuon.setActive(true)
        this.cancelButton.setActive(false)
        console.log("Stopped Process")
    }

    resetProgressView()
    {
        this.updateEventTick = 0
        this.circleA.tint = 0xFFFFFF
        this.circleB.tint = 0xFFFFFF
        this.circleC.tint = 0xFFFFFF

        setProgresser(x =>
        {
            x.a = 0
            x.b = 0
        })
    }

    isFinished()
    {
        const uvDone = !progressConfig.uvEnabed || progressConfig.uvSeconds <= 0
        const fanDone = !progressConfig.fanEnabled || progressConfig.fanSeconds <= 0

        const autoFanDone = (() =>
        {
            if (!progressConfig.fanAuto)
            {
                return true
            }
        })()

        return uvDone && fanDone && autoFanDone
    }

    updateProgress()
    {
        const currentTickTime = performance.now()
        const deltaTickTime = (currentTickTime - this.previousTickTime) / 1000.0
        this.previousTickTime = currentTickTime
        this.tick++

        if (this.tick % 10 == 0)
        {
            if (!this.tickPaused)
            {
                console.log("progress", this.tickProgress, progressConfig)
            }
            else
            {
                console.log("progress", "paused")
            }
        }

        if (this.sensorData.proximity > ProximityThreshold)
        {
            if (!this.ignoreDoor)
            {
                if (!this.tickPaused)
                {
                    this.setPopupDoorCheck("Stop")
                    this.popupObject.scale.set(1, 1)
                    this.tickPaused = true
                }

                !(async () =>
                {
                    await this.client.actuate("motor", false, true)
                    await this.client.actuate("uv", false, true)
                    await this.client.actuate("fan", false, true)
                })()
                return
            }
            else
            {
                this.client.actuate("motor", true, true)
            }
        }
        else
        {
            this.client.actuate("motor", true, true)
            if (this.tickPaused)
            {
                this.tickPaused = false
                this.popupObject.scale.set(0, 0)
            }
        }

        if (this.isPaused || this.finished)
        {
            return
        }

        progressConfig.uvSeconds -= deltaTickTime

        if (progressConfig.concurrent || progressConfig.uvSeconds <= 0)
        {
            progressConfig.fanSeconds -= deltaTickTime
            this.client.actuate("uv", true, true)
        }

        if (progressConfig.uvEnabed && progressConfig.uvSeconds <= 0)
        {
            progressConfig.uvEnabed = false
            this.client.actuate("uv", false, true)
        }

        if (progressConfig.fanEnabled && !progressConfig.fanAuto && progressConfig.fanSeconds <= 0)
        {
            progressConfig.fanEnabled = false
            this.client.actuate("fan", false, true)
        }

        if (progressConfig.concurrent && progressConfig.fanAuto)
        {
            this.client.actuate("fan", true, true)
        }

        let uvProgress = 0
        let fanProgress = 0

        if (progressConfig.uvSeconds > 0)
        {
            uvProgress = (initConfig.uvSeconds - progressConfig.uvSeconds) / initConfig.uvSeconds * 50
        }
        else
        {
            uvProgress = 50
        }

        if (progressConfig.uvSeconds <= 0 && progressConfig.fanSeconds > 0)
        {
            fanProgress = (initConfig.fanSeconds - progressConfig.fanSeconds) / initConfig.fanSeconds * 50
            this.client.actuate("fan", true, true)
        }
        else
        {
            fanProgress = 50
        }

        this.tickProgress = uvProgress + (uvProgress === 50 ? fanProgress : 0)

        this.updateProgressBar()
    }

    updateProgressBar()
    {
        if (this.tickProgress <= 50)
        {
            // this.setStateText("Sterilising (UV)")
            setProgresser(x =>
            {
                x.a = this.tickProgress / 50
            })
        }

        if (this.tickProgress > 50 && this.tickProgress <= 100)
        {
            // this.setStateText("Drying")
            this.circleB.tint = 0x00AA00
            setProgresser(x =>
            {
                x.a = 1
                x.b = (this.tickProgress - 50) / 50
            })
        }

        if (this.tickProgress >= 100)
        {
            if (this.isFinished())
            {
                this.circleC.tint = 0x00AA00
                // this.setStateText("Finished")
                this.finished = true
                this.stopProcess()
                return
            }

            // this.setStateText("Detecting Dryness")
            this.circleC.tint = 0xAAAA00
            setProgresser(x =>
            {
                x.b = 1
            })
        }
    }

    async sensorUpdate()
    {
        this.sensorData = await this.client.sensors()
        this.debugText.text = `h:${this.sensorData.humidity.toFixed(1)} t:${this.sensorData.temperature.toFixed(1)} p:${this.sensorData.proximity}`
    }

    update()
    {
        updateProgresser.call(this)
    }
}
