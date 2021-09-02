export type SensorModel = {
    temperature: number,
    humidity: number,
    proximity: number
}

type ConfigurationModel = {
    fanEnabled: boolean
    fanAuto: boolean,
    fanSeconds: number,
    uvEnabed: boolean,
    uvSeconds: number,
    concurrent: boolean
}

export const defaultConfig: ConfigurationModel = {
    fanEnabled: true,
    fanAuto: true,
    fanSeconds: 180,
    uvEnabed: true,
    uvSeconds: 120,
    concurrent: true
}


export const initConfig = Object.assign({}, defaultConfig)
export const progressConfig = Object.assign({}, defaultConfig)

const sensors: SensorModel = {
    humidity: 99,
    proximity: 700,
    temperature: 30,
}

window["sensors"] = sensors
window["initConfig"] = initConfig
window["progressConfig"] = progressConfig

export function setConfiguration(source: ConfigurationModel, target: ConfigurationModel)
{
    for (const key in source)
    {
        if (Object.prototype.hasOwnProperty.call(source, key))
        {
            target[key] = source[key]
        }
    }
}

export interface IClient
{
    start(): Promise<void>
    stop(): Promise<void>
    actuate(component: "fan" | "uv" | "motor", state: boolean, bypass?: boolean): Promise<void>
    sensors(): Promise<SensorModel | undefined>
    ping(timeout: number): Promise<boolean>
}

export class Client implements IClient
{
    endpoint: string;
    debugText: Phaser.Text;

    constructor(debugText: Phaser.Text, endpoint = "http://localhost:5000")
    {
        this.endpoint = endpoint
        this.debugText = debugText
    }

    async start()
    {
        /*
        TODO:
        "http://localhost:5000/start?ignore_door&concurrent&fan=300&uv=10"
        */
        const response = await fetch(`${this.endpoint}/start`)
        const result = await response.text()
        console.log("Start", result)

        if (!response.ok)
        {
            this.debugText.text = "Start error"
            throw "Start error"
        }
    }

    async stop()
    {
        const response = await fetch(`${this.endpoint}/stop`)
        const result = await response.text()
        console.log("Stop", result)
        if (!response.ok)
        {
            this.debugText.text = "Stop error"
            throw "Stop error"
        }
    }

    cacheState = {
        "fan": false,
        "uv": false,
        "motor": false,
    }

    async actuate(component: "fan" | "uv" | "motor", state: boolean, bypass = false)
    {
        // if (component === "motor")
        // {
        //     return
        // }
        if (bypass && this.cacheState[component] === state)
        {
            return
        }
        this.cacheState[component] = state
        const response = await fetch(`${this.endpoint}/${component}?${state ? "on" : "off"}`)
        const result = await response.text()
        console.log("Actuate", component, result)
        if (!response.ok)
        {
            this.debugText.text = `Actuate ${component} error`
            throw `Actuate ${component} error`
        }
    }

    async sensors()
    {
        const response = await fetch(`${this.endpoint}/sensors`)
        const result = await response.json() as SensorModel
        sensors.humidity = result.humidity
        sensors.temperature = result.temperature
        sensors.proximity = result.proximity
        return sensors
    }

    async ping(timeout = 1000)
    {
        const controller = new AbortController()
        const timeoutId = setTimeout(() =>
        {
            controller.abort()
        }, timeout)

        try
        {
            const responseTask = await fetch(`${this.endpoint}/ping`, { signal: controller.signal })

            if (!responseTask.ok)
            {
                throw "Ping not ok"
            }

            clearTimeout(timeoutId)
            return true
        } catch (error)
        {
            if (error instanceof DOMException)
            {
                console.warn("Ping timed out")
            }
            else
            {
                console.warn(error)
            }
            return false
        }
    }
}

export class OfflineClient implements IClient
{
    rng = new Phaser.RandomDataGenerator()

    constructor()
    {

    }

    async ping(timeout: number)
    {
        return true
    }

    async start()
    {

    }

    async stop()
    {

    }

    async actuate(component: "fan" | "uv" | "motor", state: boolean, bypass = false)
    {

    }

    async sensors(): Promise<SensorModel>
    {
        return sensors
    }

}