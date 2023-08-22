export default async (ctx, canvas, game, Listener, functions) => {
    let fruits = game.state.fruits
    let screenInfo = game.state.screenInfo

    for (let fruit of fruits) {
        ctx.fillStyle = 'red'
        let fruitImage = game.state.images['fruit.png']?.image
        if (fruit && fruitImage) {
            ctx.drawImage(fruitImage, fruit?.x*screenInfo.tileSize, fruit?.y*screenInfo.tileSize, screenInfo.tileSize, screenInfo.tileSize);
            //ctx.fillRect(fruit?.x*screenInfo.tileSize, fruit?.y*screenInfo.tileSize, screenInfo.tileSize, screenInfo.tileSize)
        }
    }
}