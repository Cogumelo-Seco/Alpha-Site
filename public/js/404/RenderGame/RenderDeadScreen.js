export default async (ctx, canvas, game, Listener, functions) => {
    ctx.fillStyle = 'red'

    ctx.font = 'bold 100px Arial'
    functions.fillText({
        style: 'red',
        text: 'GAME OVER',
        x: canvas.width/2-(ctx.measureText('GAME OVER').width/2), 
        y: canvas.height/2,
        add: 2
    })
}