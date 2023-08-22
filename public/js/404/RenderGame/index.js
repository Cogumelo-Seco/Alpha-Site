export default async function renderGame(game, Listener) {
    if (+new Date()-game.state.fps.split('-')[1] > 1000) {
        game.state.changeRenderTypeCount += 1
        game.state.fpsDisplay = game.state.fps.split('-')[0]
        game.state.fps = `0-${+new Date()}`
    }
    game.state.fps = `${Number(game.state.fps.split('-')[0]) + 1}-${game.state.fps.split('-')[1]}`

    const canvas = document.getElementById('gameCanvas')
    canvas.width = game.state.screenInfo.width*game.state.screenInfo.tileSize
    canvas.height = game.state.screenInfo.height*game.state.screenInfo.tileSize
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const functions = require('./functions').default(ctx, canvas, game.state, Listener)
    switch (game.state.gameStage) {
        case 'game':
            require('./RenderFruits').default(ctx, canvas, game, Listener, functions)
            require('./RenderPlayer').default(ctx, canvas, game, Listener, functions)
            require('./RenderHUD').default(ctx, canvas, game, Listener, functions)
            break
        case 'dead':
            require('./RenderDeadScreen').default(ctx, canvas, game, Listener, functions)
            require('./RenderHUD').default(ctx, canvas, game, Listener, functions)
            break
    }

    //require('./RenderScreenInformation').default(ctx, canvas, game, Listener, functions)

    game.gameLoop()

    window.requestAnimationFrame(() => renderGame(game, Listener))
}