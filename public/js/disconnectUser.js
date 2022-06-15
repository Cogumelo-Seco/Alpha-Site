module.exports = ([ cookie, router ]) => {
    const userButtons = document.getElementsByClassName('user-button-image')
    let language = document.URL.replace('https://', '').replace('http://', '').split('/')[1]

    require('../../lib/data').user = {}
    for (let i in cookie) document.cookie = `${i}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;

    setTimeout(() => {
        for (userButton of userButtons) {
            userButton.src = 'https://cdn.discordapp.com/embed/avatars/0.png'
            userButton.title = language == 'br' ? 'Desconectado' : 'Disconnected'
        }

        router.push(`/${language}`)
    }, 1000)
}