import './global'
import { Boot } from '/states'

if (module.hot)
{
    module.hot.dispose(destroyGame)
    module.hot.accept(() => console.log("[HMR]", "Accept"))
}

!(async () =>
{
    if (!window.GameInstance)
    {
        window.GameInstance = await startGameAsync()
    }
})()

async function startGameAsync()
{
    return new Promise<Phaser.Game>(resolve =>
    {
        Phaser.Device.whenReady((device: Phaser.Device) =>
        {
            console.log("Device Ready", device)

            const config: Phaser.IGameConfig =
            {
                renderer: Phaser.CANVAS,
                parent: 'content',
                width: 320,
                height: 240,
                roundPixels: true,
                backgroundColor: '#FFF',
                state: Boot
            }

            // Walkaround to prevent canvas from appearing as black from top left corner when starting the game.
            const { style: contentStyle } = document.querySelector<HTMLDivElement>("#content")
            contentStyle.setProperty("visibility", "hidden")

            const game = new Phaser.Game(config)

            Boot.onCreate.addOnce(() =>
            {
                contentStyle.removeProperty("visibility")
            })

            resolve(game)
        })
    })
}

function destroyGame()
{
    console.log("[HMR]", "Destroy Game")
    window.GameInstance.destroy()
    delete window.GameInstance
}
