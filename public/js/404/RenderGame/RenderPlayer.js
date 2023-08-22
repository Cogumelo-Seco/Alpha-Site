export default async (ctx, canvas, game, Listener, functions) => {
    let playerInfo = game.state.playerInfo
    let screenInfo = game.state.screenInfo

    for (let trace of playerInfo.traces) {
        ctx.fillStyle = '#fcba03'
        ctx.globalAlpha = 0.5
        ctx.fillRect(trace.x*screenInfo.tileSize, trace.y*screenInfo.tileSize, screenInfo.tileSize, screenInfo.tileSize)
    }

    ctx.fillStyle = '#fcba03'
    ctx.globalAlpha = 1
    ctx.fillRect(playerInfo.x*screenInfo.tileSize, playerInfo.y*screenInfo.tileSize, screenInfo.tileSize, screenInfo.tileSize)
}