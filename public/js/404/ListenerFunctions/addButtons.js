export default (state, handleKeys) => {
    let arrowButtons = document.getElementsByClassName('mobileButtons');

    for (let buttonElement of arrowButtons) {
        buttonElement.onclick = () => {
            handleKeys({ event: {
                code: 'Arrow'+buttonElement.id.replace(/mobileButton/g, ''),
                key: 'Arrow'+buttonElement.id.replace(/mobileButton/g, '')
            }, on: true })

            setTimeout(() => {
                handleKeys({ event: {
                    code: 'Arrow'+buttonElement.id.replace(/mobileButton/g, ''),
                    key: 'Arrow'+buttonElement.id.replace(/mobileButton/g, '')
                }, on: false })
            }, 0)
        }
    }
/*
    state.buttons['MouseInfoButton'] = {
        minX: 0,
        maxX: 80,
        minY: 0,
        maxY: 30,
        pointer: true,
        over: false,
        onClick: () => {
            if (state.mouseInfo.mouseInfoType == 'percent') state.mouseInfo.mouseInfoType = 'integer'
            else state.mouseInfo.mouseInfoType = 'percent'
        }
    }

    state.buttons['DebugButton'] = {
        minX: 0,
        maxX: 80,
        minY: 30,
        maxY: 50,
        pointer: true,
        over: false,
        onClick: () => {
            state.game.state.debug = state.game.state.debug ? false : true
        }
    }

    state.buttons['BotPlayButton'] = {
        minX: 0,
        maxX: 80,
        minY: 50,
        maxY: 74,
        pointer: true,
        over: false,
        onClick: () => {
            state.game.state.botPlay = state.game.state.botPlay ? false : true
        }
    }

    state.buttons['RenderTypeButton'] = {
        minX: 0,
        maxX: 80,
        minY: 74,
        maxY: 95,
        pointer: true,
        over: false,
        onClick: () => {
            state.game.state.renderType = state.game.state.renderType == 'limited' ? 'unlimited' : 'limited'
        }
    }
*/
}