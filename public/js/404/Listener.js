export default function createListener() {
    const state = {
        buttons: {},
        keys: {},
        codeText: '',
        gamepadLoop: false,
        gamepadButtons: {},
        mouseInfo: {
            lastMoveTime: null,
            x: null,
            y: null
        }
    }

    require('./ListenerFunctions/addButtons').default(state, handleKeys)

    document.onmousemove = (event) => {
        state.mouseInfo.lastMoveTime = +new Date()
        state.mouseInfo.x = event.pageX/window.innerWidth
        state.mouseInfo.y = event.pageY/window.window.innerHeight

        let X = Math.floor(event.pageX/window.innerWidth*1000)
        let Y = Math.floor(event.pageY/window.window.innerHeight*1000)
        
        let onAButton = false
        if (state.game) for (let i in state.buttons) {
            let button = state.buttons[i]
            if (
                button.gameStage && button.gameStage.includes(state.game.state.gameStage) && X > button.minX && X < button.maxX && Y > button.minY && Y < button.maxY ||
                !button.gameStage && X > button.minX && X < button.maxX && Y > button.minY && Y < button.maxY
            ) {
                if (!button.over && button.onOver) button.onOver()
                button.over = true
                if (button.pointer) {
                    onAButton = true                    
                    state.mouseInfo.mouseOnHover = true
                }
            } else button.over = false
        }
        if (!onAButton) state.mouseInfo.mouseOnHover = false
    }

    document.addEventListener('click', (event) => {
        //if (event.target?.id == 'screenElements') {
            handleKeys({ event: { code: 'MouseClick' }, on: true })

            let X = Math.floor(event.pageX/window.innerWidth*1000)
            let Y = Math.floor(event.pageY/window.window.innerHeight*1000)

            if (state.game && !state.onChangeKeyBind) for (let i in state.buttons) {
                let button = state.buttons[i]
                if (
                    button.gameStage && button.gameStage.includes(state.game.state.gameStage) && X > button.minX && X < button.maxX && Y > button.minY && Y < button.maxY && button.onClick ||
                    !button.gameStage && X > button.minX && X < button.maxX && Y > button.minY && Y < button.maxY && button.onClick
                ) {
                    if (button.songClick) {
                        state.game.playSong(button.songClick)
                    }
                    button.onClick()
                }
            }
        //}
    })

    document.getElementById('body').onwheel = (event) => {
        if (event.deltaY < 0) handleKeys({ event: { code: 'WheelUp' }, on: true })
        else handleKeys({ event: { code: 'WheelDown' }, on: true })
    }

    window.addEventListener("gamepadconnected", (e) => {
        console.log(
            "Gamepad connected at index %d: %s. %d buttons, %d axes.",
            e.gamepad.index,
            e.gamepad.id,
            e.gamepad.buttons.length,
            e.gamepad.axes.length
        );

        const replaces = (b) => {
            switch(b) {
                case '0':
                    return 'Enter'
                case '1':
                    return 'Escape'
                case '9':
                    return 'Enter'
                case '12':
                    return 'ArrowUp'
                case '13':
                    return 'ArrowDown'
                case '14':
                    return 'ArrowLeft'
                case '15':
                    return 'ArrowRight'
            }
            return b
        }
        const verifyButtonPressed  = (b) => typeof b === "object" ? b.pressed : b === 1.0
        const gamepadLoop = () => {
            const gamepads = navigator.getGamepads();
            if (!gamepads || !gamepads[0]) return state.gamepadLoop = false
            state.gamepadLoop = true
            let gamepad = gamepads[0]

            for (let i in gamepad.buttons) {
                let buttonId = i
                let buttonPressed = verifyButtonPressed(gamepad.buttons[i])
                if (state.gamepadButtons[buttonId] == undefined) state.gamepadButtons[buttonId] = {
                    pressed: 0,
                    count: 0
                }

                if (+new Date()-state.gamepadButtons[buttonId].pressed >= 150 && buttonPressed || state.gamepadButtons[buttonId].pressed && !buttonPressed) {
                    state.gamepadButtons[buttonId].pressed = buttonPressed ? +new Date() : 0
                    state.gamepadButtons[buttonId].count = buttonPressed ? state.gamepadButtons[buttonId].count+1 : 1
                    handleKeys({ event: { code: replaces(i), repeat: state.gamepadButtons[buttonId].count >= 3 }, on: buttonPressed })

                    //if (buttonPressed) console.log(buttonId)
                }
            }

            window.requestAnimationFrame(gamepadLoop)
        }
        if (!state.gamepadLoop) gamepadLoop()
    });

    window.addEventListener("gamepaddisconnected", (e) => {
        state.game.state.musicInfo.oldPauseTime = state.game.state.music?.currentTime
        state.game.state.music?.pause()
        if (state.game.state.musicVoice) state.game.state.musicVoice.pause()
        if (state.game.state.videoBackground) state.game.state.videoBackground.pause()
    })

    document.addEventListener('keydown', (event) => handleKeys({ event, on: true }))
    document.addEventListener('keyup', (event) => handleKeys({ event, on: false }))
    
    async function handleKeys({ event, on }) {
        let keyPressed = event.code
        let lastClick = state.keys[keyPressed]
        let hold = !state.keys[keyPressed] || +new Date()-state.keys[keyPressed]?.time <= 50
        state.keys[keyPressed] = {
            key: event.key || '',
            code: keyPressed || '',
            hold,
            clicked: on,
            time: +new Date(),
            lastClickTime: lastClick?.time || null
        }

        state.game.keyPress({ event, on })
    }

    return {
        state,
        handleKeys
    }
}