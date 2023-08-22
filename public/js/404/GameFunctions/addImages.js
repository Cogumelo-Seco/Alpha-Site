export default async (state) => {
    state.images = [
        { dir: 'fruit.png' }
    ]
    
    return state.images.length
}