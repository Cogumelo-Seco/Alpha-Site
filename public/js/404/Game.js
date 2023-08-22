function createGame(Listener, canvas) {
    const state = {
        debug: false,
        fps: '0-0',
        gameStage: 'game',
        gameLoopFPSControlTime: 0,
        rainbowColor: 0,
        images: {},
        sounds: {},
        animations: {},
        loading: {
            loaded: 0,
            total: 0,
            msg: 'Loading...'
        },
        screenInfo: {
            width: 20,
            height: 20,
            tileSize: 50
        },
        fruits: [
            {
                x: 5,
                y: 9
            }
        ],
        playerInfo: {
            x: 10,
            y: 10,
            speed: 150,
            speedDelay: 0,
            score: 1,
            direction: 'up',
            traces: []
        },
        keyBinds: {
            up: (key) => ['KeyW', 'ArrowUp'].includes(key),
            down: (key) => ['KeyS', 'ArrowDown'].includes(key),
            left: (key) => ['KeyA', 'ArrowLeft'].includes(key),
            right: (key) => ['KeyD', 'ArrowRight'].includes(key)
        }
    }

    const addImages = (command) => require('./GameFunctions/addImages').default(state)
    const addSounds = (command) => require('./GameFunctions/addSounds').default(state)
    
    const playSong = (type, command) => require('./GameFunctions/playSong').default(type, command, state)
    const smallFunctions = require('./GameFunctions/smallFunctions').default(state, Listener)
    state.Listener = Listener
    state.smallFunctions = smallFunctions
    state.playSong = playSong
    state.canvas = canvas

    async function keyPress({ event, on }) {
        let keyPressed = event.code
        let inMovement = false

        if (state.gameStage == 'game' && on) {
            let playerInfo = state.playerInfo

            if (playerInfo.direction != 'left' && state.keyBinds.right(keyPressed)) 
                state.playerInfo.direction = 'right'
            if (playerInfo.direction != 'right' && state.keyBinds.left(keyPressed))
                state.playerInfo.direction = 'left'
            if (playerInfo.direction != 'down' && state.keyBinds.up(keyPressed))
                state.playerInfo.direction = 'up'
            if (playerInfo.direction != 'up' && state.keyBinds.down(keyPressed))
                state.playerInfo.direction = 'down'
        } else if (state.gameStage == 'dead') {
            if (keyPressed.includes('Mouse')) {
                state.gameStage = 'game'
                state.playerInfo = {
                    x: 10,
                    y: 10,
                    defaultSpeed: 200,
                    speed: 200,
                    speedDelay: 0,
                    score: 1,
                    direction: 'up',
                    traces: []
                }
            }
        }
    }

    async function gameLoop(command) {
        let playerInfo = state.playerInfo
        let pressedKeys = []
        for (let i in Listener.state.keys) if (Listener.state.keys[i].clicked && Listener.state.keys[i].key) pressedKeys.push(Listener.state.keys[i].code)
        
        if (playerInfo.speedDelay+playerInfo.speed <= +new Date()) {
            playerInfo.speedDelay = +new Date()

            let moved = false
            for (let keyPressed of pressedKeys) {
                if (playerInfo.direction != 'left' && state.keyBinds.right(keyPressed)) {
                    state.playerInfo.direction = 'right'
                    smallFunctions.movePlayer(state.playerInfo)
                    moved = true
                }
                if (playerInfo.direction != 'right' && state.keyBinds.left(keyPressed)) {
                    state.playerInfo.direction = 'left'
                    smallFunctions.movePlayer(state.playerInfo)
                    moved = true
                }
                if (playerInfo.direction != 'down' && state.keyBinds.up(keyPressed)) {
                    state.playerInfo.direction = 'up'
                    smallFunctions.movePlayer(state.playerInfo)
                    moved = true
                }
                if (playerInfo.direction != 'up' && state.keyBinds.down(keyPressed)) {
                    state.playerInfo.direction = 'down'
                    smallFunctions.movePlayer(state.playerInfo)
                    moved = true
                }
            }
            if (!moved) smallFunctions.movePlayer(playerInfo)
            //else playerInfo.speedDelay = playerInfo.speedDelay-(playerInfo.speed*0.5)
        }

        /* !!!!!!! FPS LIMITADO !!!!!!! */

        if (state.gameLoopFPSControlTime+25 <= +new Date()) {
            state.gameLoopFPSControlTime = +new Date()

            for (let i in state.animations) {
                let animation = state.animations[i]

                if (animation.dalay <= +new Date() && !animation.paused) {
                    animation.frame += animation.boomerang ? animation.boomerangForward ? 1 : -1 : 1
                    if (animation.frame > animation.endFrame) {
                        if (!animation.boomerang) animation.frame = animation.loop ? animation.startFrame : animation.endFrame
                        else animation.boomerangForward = animation.boomerangForward ? false : true
                    } else if (animation.frame < animation.startFrame) {
                        animation.boomerangForward = animation.boomerangForward ? false : true
                        animation.frame = animation.startFrame
                    }
                    animation.dalay = +new Date()+animation.totalDalay
                }
            }

            state.rainbowColor += 1
        }
    }

    async function loading(command) {
        let loadingImagesTotal = await addImages()
        let loadingSoundsTotal = await addSounds()
        state.loading.total = loadingImagesTotal
        state.loading.total += loadingSoundsTotal

        let toLoad = state.images.concat(state.sounds)

        const newLoad = (msg) => {
            state.loading.loaded += 1
            state.loading.msg = `(${state.loading.loaded}/${state.loading.total}) - ${msg}`

            if (state.loading.loaded >= state.loading.total) completeLoading()
            else load(toLoad[state.loading.loaded])
        }

        const completeLoading = () => {
            state.loading.msg = `(${state.loading.loaded}/${state.loading.total}) 100% - Complete loading`
            if (state.gameStage == 'loading') {
                let interval = setInterval(() => {
                    if (!state.inLogin) {
                        state.animations.loadingLogo.paused = false

                        if (state.animations.loadingLogo.frame >= state.animations.loadingLogo.endFrame) {
                            clearInterval(interval)
                            state.animations.loadingLogo.paused = true
                            state.smallFunctions.redirectGameStage('menu')
                        }
                    }
                }, 1000)
            }
        }

        const load = async({ dir, animationConfigDir}) => {
            let loaded = false

            setTimeout(() => {
                if (!loaded) newLoad('[ERROR File failed to load] '+dir)
            }, 10000)

            if ([ 'ogg', 'mp3' ].includes(dir.split('.')[dir.split('.').length-1])) {
                //let link = 'https://raw.githubusercontent.com/Cogumelo-Seco/Cogu-FNF-Files/main/'+dir

                let sound = new Audio()
                sound.addEventListener('loadeddata', (e) => {
                    loaded = true
                    //newLoad(e.path[0].src)
                    newLoad(dir)
                })
                sound.addEventListener('error', (e) => newLoad('[ERROR] '+dir))
                sound.src = `/${dir}`//dir.split('/')[0] == 'Sounds' ? `/${dir}` : link
                sound.preload = 'auto'
                state.sounds[dir] = sound
            } else {
                //let link = 'https://raw.githubusercontent.com/Cogumelo-Seco/Cogu-FNF-Files/main/imgs/'+dir
                let animationConfig = null
                //animationConfigDir ? JSON.parse(await fetch('https://raw.githubusercontent.com/Cogumelo-Seco/Cogu-FNF-Files/main/imgs/'+animationConfigDir).then(r => r.text())) : null

                let img = new Image()
                img.addEventListener('load', (e) => {
                    loaded = true
                    //newLoad(e.path[0].src)
                    newLoad(dir)
                })
                img.addEventListener('error',(e) => newLoad('[ERROR] '+dir))
                img.src = '/imgs/'+dir//link
                img.id = dir
                state.images[dir] = {
                    image: img,
                    animationConfig
                }
            }
        }

        if (toLoad[0]) load(toLoad[0])
    }
    
    return {
        gameLoop,
        loading,
        playSong,
        keyPress,
        state
    }
}

export default createGame