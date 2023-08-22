export default async (ctx, canvas, game, Listener, functions) => {
    let playerScoreElement = document.getElementById('playerScore')

    playerScoreElement.innerText = `SCORE ${game.state.playerInfo.score}`
}