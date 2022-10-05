export default ([ user, router ]) => {
    const userButtons = document.getElementsByClassName('user-button-image')
    const language = document.URL.replace('https://', '').replace('http://', '').split('/')[1]

    for (let userButton of userButtons) {
        if (user.avatarURL && user.avatarURL.endsWith('.gif')) {
            userButton.src = user.avatarURL.replace('.gif', '.png');
            userButton.addEventListener('mouseover', () => userButton.src = user.avatarURL.replace('.png', '.gif'));
            userButton.addEventListener('mouseout', () => userButton.src = user.avatarURL.replace('.gif', '.png'));
        } else if (user.avatarURL) userButton.src = user.avatarURL
        userButton.title = `${user.tag}\n(${user.id})`
    }

    document.cookie = `userId=${user.id}; path=/`;
    document.cookie = `alphaToken=${user.alphaToken}; path=/`;
    document.cookie = `language=${language || 'pt-br'}; path=/`;

    return require('../../lib/data').user = user
}