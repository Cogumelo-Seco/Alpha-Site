export default async (state) => {
    state.sounds = [
        { dir: 'Sounds/up.mp3' }
    ]

    return state.sounds.length
}