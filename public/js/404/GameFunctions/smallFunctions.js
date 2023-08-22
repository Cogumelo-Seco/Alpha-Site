export default (state, Listener) => {
    let functions = {
        addFruit: () => {
            state.fruits.push({
                x: Math.floor(Math.random()*state.screenInfo.width),
                y: Math.floor(Math.random()*state.screenInfo.height)
            })
        },
        checkPlayerCollision: (playerInfo) => {
            for (let i in state.fruits) {
                if (playerInfo.x == state.fruits[i].x && playerInfo.y == state.fruits[i].y) {
                    delete state.fruits[i]
                    functions.addFruit()
                    state.playSong('Sounds/up.mp3', { volume: 0.5 })
                    playerInfo.score += 1
                }
            }
    
            for (let i in state.playerInfo.traces) {
                let trace = state.playerInfo.traces[i]
                if (trace.x == state.playerInfo.x && trace.y == state.playerInfo.y) {
                    state.gameStage = 'dead'
                }
            }
        },
        movePlayer: (playerInfo) => {
            playerInfo.traces.unshift({ x: playerInfo.x, y: playerInfo.y })
            playerInfo.traces = playerInfo.traces.slice(0, playerInfo.score)
    
            switch(playerInfo.direction) {
                case 'right':
                    playerInfo.x += 1
                    break
                case 'left':
                    playerInfo.x -= 1
                    break
                case 'up':
                    playerInfo.y -= 1
                    break
                case 'down':
                    playerInfo.y += 1
                    break
            }
    
            if (playerInfo.x >= state.screenInfo.width) playerInfo.x = 0
            if (playerInfo.x < 0) playerInfo.x = state.screenInfo.width-1
            if (playerInfo.y >= state.screenInfo.height) playerInfo.y = 0
            if (playerInfo.y < 0) playerInfo.y = state.screenInfo.height-1
    
            functions.checkPlayerCollision(playerInfo)
        }
    }

    return functions
}