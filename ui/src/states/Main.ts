import { Base } from "./Base"
import { Client, IClient, OfflineClient, defaultConfig, initConfig, progressConfig, setConfiguration } from "/components/Client"
import { Clock } from "/components/Clock"

import { createConfigurator, preloadConfigurator } from "/components/Configurator"
import { createProgresser, preloadProgresser, setProgresser, updateProgresser } from "/components/Progresser"

const ProximityThreshold = 200
const HumidityThreshold = 62

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

    startingHumidity = HumidityThreshold

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
        this.stateText = this.add.text(160, 120, "", { fontSize: 24 })

        createProgresser.call(this)
        createConfigurator.call(this)

        Main.onCreate.dispatch()
        this.isReady = this.initClientAsync()
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
            else if (this.sensorData.humidity <= HumidityThreshold)
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
                if (!this.tickPaused) {
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

        if (this.tickProgress <= 50)
        {
            this.setStateText("Sterilising (UV)")
            setProgresser(x =>
            {
                x.a = this.tickProgress / 50
            })
        }

        if (this.tickProgress > 50 && this.tickProgress <= 100)
        {
            this.setStateText("Drying")
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
                this.setStateText("Finished")
                this.finished = true
                this.stopProcess()
                return
            }

            this.setStateText("Detecting Dryness")
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
