type SensorModel = {
    temperature: number,
    humidity: number,
    proximity: number
}


export interface IClient
{
    start(): Promise<any>
    stop(): Promise<any>
    sensors(): Promise<SensorModel | undefined>
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

    async sensors()
    {
        return null
    }
}

export class OfflineClient implements IClient
{
    rng = new Phaser.RandomDataGenerator()
    stub: SensorModel

    constructor()
    {
        this.stub = {
            humidity: 99,
            proximity: 700,
            temperature: 30,
        }

        window["sensor"] = this.stub
    }

    async start()
    {

    }

    async stop()
    {

    }

    async sensors(): Promise<SensorModel>
    {
        return this.stub
    }

}