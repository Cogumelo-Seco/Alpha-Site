import React, { useEffect } from 'react';
import cookies from 'next-cookies';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import Head from "next/head";

const functions = (type, ...props) => require(`../../../public/js/${type}.js`).default(props)

function page(props) {
    let cookiesProps = require('../../../lib/data').cookies
    let cookie = cookies(cookiesProps)

    const router = useRouter()

    useEffect(() => {
        document.getElementById('myGuilds').style.backgroundColor = '#b27bf290';

        const socket = io(props.serv, {
            withCredentials: true,
        })
        
        function loadState(user) {
            functions('setUser', user, router)

            const serverContents = document.getElementById('serverContents');

            socket.on('testMessagePassed', () => alert(props.language == 'pt' ? 'Mensagem enviada!' : 'Message sent!'))
            socket.on('testMessageFailure', () => alert(props.language == 'pt' ? 'Falha ao enviar mensagem.' : 'Failed to send message.'))
            socket.on('passed', () => alert(props.language == 'pt' ? 'Configurações salvas!' : 'Saved settings!'))
            socket.on('error', (msg) => alert(`ERROR: ${msg}`))

            if (!user.guilds || !router.query.id) return
            let guild = user.guilds.find((g) => g.id == router.query.id);
            if (!guild) {
                router.push(require('../../../lib/data').page || '/')
                alert('Permission denied')
                return
            }

            socket.emit('dashboard', { 
                type: 'get-guild',
                id: guild.id,
                user
            })

            socket.on('dashboard-guild-return', (DBGuild, channels, YTchannels) => {
                if (!DBGuild || guild.permissions != 2147483647) return router.push('/br/dashboard');

                let activeLoop = true

                document.getElementById('save-button').style.display = 'inline-block';
                document.getElementById('serverProps').style.display = 'inline-block';

                const guildIcon = document.getElementById('guildIcon');
                const guildName = document.getElementById('guildName');

                document.getElementById('loadingCircle').style.display = 'none';
                serverContents.style.display = 'inline-block';
                if (guild.icon) guildIcon.src = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
                else guildIcon.src = 'https://cdn.discordapp.com/embed/avatars/1.png'
                guildName.innerText = guild.name

                const selectServerLang = document.getElementById('selectServerLang');

                const YTChannelsChannelSelect = document.getElementById('YTChannelsChannelSelect');
                const YTChannelsSearchChannel = document.getElementById('YTChannelsSearchChannel');
                const YTChannelsAddChannelInput = document.getElementById('YTChannelsAddChannelInput')
                const YTChannelsAddChannelImage = document.getElementById('YTChannelsAddChannelImage')
                const YTChannelsAddChannelName = document.getElementById('YTChannelsAddChannelName')
                const YTChannelsAddChannelIdentifier = document.getElementById('YTChannelsAddChannelIdentifier')
                const YTChannelsAddChannel = document.getElementById('YTChannelsAddChannel')
                const YTChannelsList = document.getElementById('YTChannelsList');

                const welcomeCheckbox = document.getElementById('welcomeCheckbox');
                const leaveCheckbox = document.getElementById('leaveCheckbox');
                const rankCheckbox = document.getElementById('rankCheckbox');

                const welcomeChannelSelect = document.getElementById('welcomeChannelSelect');
                const leaveChannelSelect = document.getElementById('leaveChannelSelect');
                const rankChannelSelect = document.getElementById('rankChannelSelect');

                const welcomeMessageTestButton = document.getElementById('welcomeMessageTestButton');
                const leaveMessageTestButton = document.getElementById('leaveMessageTestButton');
                const rankMessageTestButton = document.getElementById('rankMessageTestButton');
                
                selectServerLang.value = DBGuild.language.replace('pt', 'PT-BR').replace('en', 'EN');

                let channelsInnerHTML = ''
                for (let i in channels) channelsInnerHTML += `<option>${channels[i].name.replace(/[<>]/gi, '')}</option>`
                welcomeChannelSelect.innerHTML = channelsInnerHTML
                leaveChannelSelect.innerHTML = channelsInnerHTML
                rankChannelSelect.innerHTML = channelsInnerHTML
                YTChannelsChannelSelect.innerHTML = channelsInnerHTML

                if (channels.find(c => c.id == DBGuild.welcomeChannel)) {
                    welcomeCheckbox.checked = true
                    welcomeChannelSelect.value = channels.find(c => c.id == DBGuild.welcomeChannel)?.name
                }
                if (channels.find(c => c.id == DBGuild.leaveChannel)) {
                    leaveCheckbox.checked = true
                    leaveChannelSelect.value = channels.find(c => c.id == DBGuild.leaveChannel)?.name
                }
                if (channels.find(c => c.id == DBGuild.rankChannel)) {
                    rankCheckbox.checked = true
                    rankChannelSelect.value = channels.find(c => c.id == DBGuild.rankChannel)?.name
                }

                let welcomeMessage = DBGuild.welcomeMessage
                let leaveMessage = DBGuild.leaveMessage
                let rankMessage = DBGuild.rankMessage

                function testMessage(a) {
                    socket.emit('dashboard', {
                        type: 'testMessage',
                        messageType: a.srcElement.id.split('MessageTestButton')[0],
                        id: guild.id,
                        welcomeMessage,
                        leaveMessage,
                        rankMessage,
                        user,
                    })
                }

                welcomeMessageTestButton.removeEventListener('click', testMessage)
                welcomeMessageTestButton.addEventListener('click', testMessage)
                leaveMessageTestButton.removeEventListener('click', testMessage)
                leaveMessageTestButton.addEventListener('click', testMessage)
                rankMessageTestButton.removeEventListener('click', testMessage)
                rankMessageTestButton.addEventListener('click', testMessage)

                function reloadEmbeds(initial, name, DBName) {
                    let message = null
                    try {                    
                        message = JSON.parse(DBGuild[DBName])
                    } catch (err) {}

                    if (name == 'welcome') welcomeMessage = message
                    if (name == 'leave') leaveMessage = message
                    if (name == 'rank') rankMessage = message

                    let messageContent = document.getElementById(`${name}MessageContent`);
                    let elementEmbed = document.getElementById(`${name}Embed`);
                    let embedTitle = document.getElementById(`${name}EmbedTitle`);
                    let embedDescription = document.getElementById(`${name}EmbedDescription`);
                    let embedFooter = document.getElementById(`${name}EmbedFooter`);
                    let embedFooterIcon = document.getElementById(`${name}EmbedFooterIcon`);
                    let embedFooterDiv = document.getElementById(`${name}EmbedFooterDiv`);
                    let embedAuthorAvatar = document.getElementById(`${name}EmbedAuthorAvatar`);
                    let embedAuthorName = document.getElementById(`${name}EmbedAuthorName`);
                    let embedAuthorDiv = document.getElementById(`${name}EmbedAuthor`);
                    let embedThumbnail = document.getElementById(`${name}EmbedThumbnail`);
                    let embedThumbnailDiv = document.getElementById(`${name}EmbedThumbnailDiv`);
                    let embedImage = document.getElementById(`${name}EmbedImage`);
                    let embedImageDiv = document.getElementById(`${name}EmbedImageDiv`);

                    let inputEditContent = document.getElementById(`${name}InputEditContent`);
                    let inputEditTitle = document.getElementById(`${name}InputEditTitle`);
                    let inputEditDescription = document.getElementById(`${name}InputEditDescription`);
                    let inputEditColor = document.getElementById(`${name}InputEditColor`);
                    let inputEditFooter = document.getElementById(`${name}InputEditFooter`);
                    let inputEditFooterIcon = document.getElementById(`${name}InputEditFooterIcon`);
                    let inputEditAuthorAvatar = document.getElementById(`${name}InputEditAuthorAvatar`);
                    let inputEditAuthorName = document.getElementById(`${name}InputEditAuthorName`);
                    let inputEditThumbnail = document.getElementById(`${name}InputEditThumbnail`);
                    let inputEditImage = document.getElementById(`${name}InputEditImage`);
                    
                    if (!inputEditContent) return activeLoop = false

                    if (typeof message != 'object') messageContent.innerHTML = message
                    else {
                        let embed = message.embeds[0]
                        let showEmbed = false

                        if (typeof embed.author != 'object') embed.author = {}
                        if (typeof embed.thumbnail != 'object') embed.thumbnail = {}
                        if (typeof embed.image != 'object') embed.image = {}
                        if (typeof embed.footer != 'object') embed.footer = {}
                        
                        if (initial) inputEditContent.value = message.content
                        else message.content = inputEditContent.value
                        messageContent.innerHTML = message.content ? replaces(message.content.replace(/[<>]/gi, ''), 'content') : ''

                        if (initial) inputEditColor.value = embed.color || ''
                        else embed.color = inputEditColor.value
                        elementEmbed.style.borderLeftColor = embed.color ? replaces(embed.color, 'color') : ''

                        if (initial) inputEditTitle.value = embed.title || ''
                        else embed.title = inputEditTitle.value
                        if (embed.title) {
                            showEmbed = true
                            embedTitle.style.display = 'block'
                            embedTitle.innerHTML = replaces(embed.title.replace(/[<>]/gi, ''), 'title')
                        } else embedTitle.style.display = 'none'

                        if (initial) inputEditDescription.value = embed.description || ''
                        else embed.description = inputEditDescription.value
                        if (embed.description) {
                            showEmbed = true
                            embedDescription.style.display = 'block'
                            embedDescription.innerHTML = replaces(embed.description.replace(/[<>]/gi, ''), 'description')
                        } else embedDescription.style.display = 'none'

                        if (initial) inputEditFooter.value = embed.footer.text || ''
                        else embed.footer.text = inputEditFooter.value
                        if (embed.footer.text) {
                            showEmbed = true
                            embedFooter.style.display = 'block'
                            embedFooterDiv.style.marginTop = '8px'
                            embedFooter.innerHTML = replaces(embed.footer.text.replace(/[<>]/gi, ''), 'footerText')
                        } else {
                            embedFooterDiv.style.marginTop = '0'
                            embedFooter.style.display = 'none'
                        }

                        if (initial) inputEditFooterIcon.value = embed.footer.iconURL || ''
                        else embed.footer.iconURL = inputEditFooterIcon.value
                        if (embed.footer.iconURL) {
                            showEmbed = true
                            embedFooterIcon.style.display = 'block'
                            embedFooterDiv.style.marginTop = '8px'
                            embedFooterIcon.src = replaces(embed.footer.iconURL, 'footerIcon')
                        } else {
                            embedFooterIcon.style.display = 'none'
                        }

                        if (initial) inputEditAuthorName.value = embed.author.name || ''
                        else embed.author.name = inputEditAuthorName.value
                        if (embed.author.name) {
                            showEmbed = true
                            embedAuthorName.style.display = 'block'
                            embedAuthorDiv.style.marginTop = '8px'
                            embedAuthorName.innerHTML = replaces(embed.author.name.replace(/[<>]/gi, ''), 'authorName')
                        } else {
                            embedAuthorDiv.style.margin = '0'
                            embedAuthorName.style.display = 'none'
                        }

                        if (initial) inputEditAuthorAvatar.value = embed.author.icon_url || ''
                        else embed.author.icon_url = inputEditAuthorAvatar.value
                        if (embed.author.icon_url) {
                            showEmbed = true
                            embedAuthorAvatar.style.display = 'block'
                            embedAuthorDiv.style.marginTop = '8px'
                            embedAuthorAvatar.src = replaces(embed.author.icon_url, 'authorAvatar')                   
                        } else {
                            embedAuthorAvatar.style.display = 'none'
                        }

                        if (initial) inputEditThumbnail.value = embed.thumbnail.url || ''
                        else embed.thumbnail.url = inputEditThumbnail.value
                        if (embed.thumbnail.url) {
                            showEmbed = true
                            embedThumbnail.style.display = 'block'
                            if (window.innerWidth > 445) {
                                embedThumbnailDiv.style.height = '80px'
                                embedThumbnailDiv.style.width = '80px'
                            } else {
                                embedThumbnailDiv.style.height = '50px'
                                embedThumbnailDiv.style.width = '50px'
                            }
                            embedThumbnail.src = replaces(embed.thumbnail.url, 'thumbnail')                   
                        } else {                        
                            embedThumbnailDiv.style.height = '0'
                            embedThumbnailDiv.style.width = '0'
                            embedThumbnail.style.display = 'none'
                        }

                        if (initial) inputEditImage.value = embed.image.url || ''
                        else embed.image.url = inputEditImage.value
                        if (embed.image.url) {
                            showEmbed = true
                            embedImage.style.display = 'block'
                            embedImageDiv.style.marginTop = '16px'
                            embedImage.src = replaces(embed.image.url, 'image')
                        } else {
                            embedImageDiv.style.margin = '0'
                            embedImage.style.display = 'none'
                        }

                        if (showEmbed) elementEmbed.style.display = 'inline-grid'
                        else elementEmbed.style.display = 'none'
                    }
                }

                let embedsNames = [
                    {
                        Name: 'welcome',
                        DBName: 'welcomeMessage'
                    },
                    {
                        Name: 'leave',
                        DBName: 'leaveMessage'
                    },
                    {
                        Name: 'rank',
                        DBName: 'rankMessage'
                    },
                ]

                for (let i in embedsNames) reloadEmbeds(true, embedsNames[i].Name, embedsNames[i].DBName)
                function loop() {
                    for (let i in embedsNames) reloadEmbeds(false, embedsNames[i].Name, embedsNames[i].DBName)

                    let rAF = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.requestAnimationFrame;

                    if (activeLoop) rAF(() => {
                        loop()
                    })
                }
                loop()

                let YTChannelToAdd = []

                YTChannelsChannelSelect.innerHTML = channelsInnerHTML
                YTChannelsChannelSelect.value = channels.find(c => c.id == DBGuild.YTNotificationChannel)?.name
                function reloadYTChannels() {
                    YTChannelsList.innerHTML = ''
                    if (!DBGuild.YTChannelsToNotify[0]) YTChannelsList.innerHTML = `<p>${props.language == 'pt' ? 'Sem canais para notificar' : 'No channels to notify'}</p>`
                    else for (let i in DBGuild.YTChannelsToNotify) {
                        let channelId = DBGuild.YTChannelsToNotify[i]
                        let channelInfo = YTchannels.find((c) => c.externalId == channelId)

                        if (channelInfo){
                            let channelAvatar = channelInfo.avatar ? channelInfo.avatar.thumbnails[0]?.url || '/imgs/sticker-sla.png' : '/imgs/sticker-sla.png'

                            let YTChannel = document.createElement('div')
                            YTChannel.className = 'YTChannel'
                            YTChannel.id = `YTChannel-${channelId}`
                            YTChannel.innerHTML = `
                                <img class="YTChannelImage" src="${channelAvatar}" />
                                <div id="YTChannelInfo">
                                    <p id="YTChannelName">${channelInfo.title || channelId}</p>
                                    <p id="YTChannelIdentifier">${channelInfo.vanityChannelUrl.split('/')[channelInfo.vanityChannelUrl.split('/').length-1]}</p>
                                </div>
                                
                                <button class="YTChannelButton" id="YTChannelButton-${channelId}">X</button>
                            `
                            YTChannelsList.append(YTChannel)

                            let YTChannelImage = YTChannel.getElementsByClassName('YTChannelImage')[0]
                            if (YTChannelImage) YTChannelImage.addEventListener('click', () => zoomImage(YTChannelImage.src))

                            let YTChannelButton = YTChannel.getElementsByClassName('YTChannelButton')[0]
                            if (YTChannelButton) YTChannelButton.addEventListener('click', () => {
                                DBGuild.YTChannelsToNotify.splice(DBGuild.YTChannelsToNotify.indexOf(channelId), 1)
                                reloadYTChannels()
                            })
                        }
                    }
                }
                reloadYTChannels()

                YTChannelsSearchChannel.addEventListener('click', () => {
                    socket.emit('dashboard', {
                        type: 'get-yt-channel',
                        query: YTChannelsAddChannelInput.value
                    })
                })
                YTChannelsAddChannel.addEventListener('click', () => {
                    if (YTChannelToAdd && YTChannelToAdd.externalId && !DBGuild.YTChannelsToNotify.includes(YTChannelToAdd.externalId)) {
                        DBGuild.YTChannelsToNotify.push(YTChannelToAdd.externalId)
                        reloadYTChannels()
                    }
                })
                socket.on('dashboard-yt-channel-return', (channelInfo) => {
                    if (!YTchannels.includes(channelInfo)) YTchannels.push(channelInfo)
                    YTChannelToAdd = channelInfo
                    YTChannelsAddChannelImage.src = channelInfo.avatar ? channelInfo.avatar.thumbnails[0]?.url || 'https://www.youtube.com/s/desktop/6007d895/img/favicon_144x144.png' : 'https://www.youtube.com/s/desktop/6007d895/img/favicon_144x144.png'
                    YTChannelsAddChannelName.innerHTML = channelInfo.title
                    YTChannelsAddChannelIdentifier.innerHTML = channelInfo.vanityChannelUrl.split('/')[channelInfo.vanityChannelUrl.split('/').length-1]
                })

                function replaces(text, type) {
                    if (!text) return
                    if (type == 'color' && text == 'DEFAULT-COLOR') return text = '#000000'
                    
                    text = text
                        .replace(/{guildMemberCount}/g, 13)
                        .replace(/{guildName}/g, guild.name)
                        .replace(/{avatar}/g, user.avatarURL || '/imgs/avatar/Default.png')
                        .replace(/{@member}/g, `<alpha-metion>@${user.username}</alpha-metion>`)
                        .replace(/{member}/g, user.username)
                        .replace(/{memberTag}/g, user.tag)
                        .replace(/{memberId}/g, user.id)
                        .replace(/{lv}/g, 13)

                    const re = /<code(?:\s[^>]*)?>[\s\S]*?<\/code>|`{3}([\S\s]*?)`{3}|`{2}([\S\s]*?)`{2}|`([^`]*)`|~~([\S\s]*?)~~|\*{2}([\s\S]*?)\*{2}(?!\*)|\*([^*]*)\*|__([\s\S]*?)__/g;
                    let tmp = '';
                    do {
                        tmp = text;
                        text = text.replace(re, (match, a, b, c, d, e, f, g) => {
                            if (a && type != 'title') return `<code ${type == 'content' ? 'class="content box"' : 'class="box"'}>${a}</code>`
                            if (b || c) return `<code ${type == 'content' ? 'class="inline content"' : 'class="inline"'}>${b || c}</code>`
                            if (d) return `<s>${d}</s>`
                            if (e) return `<b>${e}</b>`
                            if (f) return `<i>${f}</i>`
                            if (g) return `<u>${g}</u>`
                            return match
                        });
                    }  while (text != tmp);

                    return text
                }

                const save = () => {
                    socket.emit('dashboard', {
                        type: 'set-guild',
                        user,
                        id: guild.id,
                        data: {
                            welcomeChannel: welcomeCheckbox.checked ? channels?.find((c) => c.name == welcomeChannelSelect.value) ? channels?.find((c) => c.name == welcomeChannelSelect.value).id : 'off' : 'off',
                            welcomeMessage,
                            leaveChannel: leaveCheckbox.checked ? channels?.find((c) => c.name == leaveChannelSelect.value) ? channels?.find((c) => c.name == leaveChannelSelect.value).id : 'off' : 'off',
                            leaveMessage,
                            rankChannel: rankCheckbox.checked ? channels?.find((c) => c.name == rankChannelSelect.value) ? channels?.find((c) => c.name == rankChannelSelect.value).id : 'off' : 'off',
                            rankMessage,
                            language: selectServerLang.value,
                            YTChannelsToNotify: DBGuild.YTChannelsToNotify,
                            YTNotificationChannel: channels?.find((c) => c.name == YTChannelsChannelSelect.value) ? channels?.find((c) => c.name == YTChannelsChannelSelect.value).id : 'off',
                        }
                    })
                }
                document.getElementById('save-button').removeEventListener('click', () => save())
                document.getElementById('save-button').addEventListener('click', () => save())
            })
        }
        functions('getUser', cookie, socket, loadState, router, true)

        const imageElements = document.getElementsByClassName('image')
        for (let imageElement of imageElements) {
            imageElement.addEventListener('click', () => zoomImage(imageElement.src))
            imageElement.style.cursor = 'pointer'
        }

        function zoomImage(src) {
            const zoom = document.getElementById('zoom');
            const zoomImage = document.getElementById('zoomImage');
            const openOriginal = document.getElementById('openOriginal')

            zoom.classList.toggle('open')
            zoomImage.src = src
            openOriginal.href = src
        }
    })

    let myInformationsClick = () => router.push(`/${props.language == 'pt' ? 'br' : 'en'}/dashboard/my`)
    let myServersClick = () => router.push(`/${props.language == 'pt' ? 'br' : 'en'}/dashboard`)
    let disconnectUser = () => functions('disconnectUser', cookie, router)
    
    return (
        <html lang="pt-BR">
            <Head>
                <title>Alpha Site | Dashboard Guild</title>

                <meta property="theme-color" content="#010101" />
                <meta property="og:title" content="Alpha Bot" />
                <meta property="og:site_name" content="Alpha Site" />
                <meta property="og:url" content="https://alpha-site.vercel.app/br/dashboard/guild" />                
                <meta property="og:image" content="/avatar/Roxo.png" />
                <meta property="og:description" content="Olá eu sou o Alpha Bot, com um ótimo sistema de RPG para divertir a todos e um sistemas de rank para deixar todos ativos e competitivos para o 1° lugar!" />
            </Head>
            <head>
                <link rel="stylesheet" href="/css/dashboard-guild/animations.css" />
                <link rel="stylesheet" href="/css/dashboard-guild/dashboard-guild.css" />
                <link rel="stylesheet" href="/css/dashboard-guild/resizable.css" />
                <link rel="stylesheet" href="/css/dashboard/index.css" />
            </head>
            <body>
                <section>
                    <div id="controlPanel">
                        <p className="controlPanel-buttons" onClick={myServersClick} id="myGuilds">{props.language == 'pt' ? 'Meus Servidores' : 'My Servers'}</p>
                        <p className="controlPanel-buttons" onClick={myInformationsClick} id="myInformations">{props.language == 'pt' ? 'Minhas informações' : 'My informations'}</p>
                        <p className="controlPanel-buttons" onClick={disconnectUser} id="disconnectUser">{props.language == 'pt' ? 'Sair' : 'Exit'}</p>
                    </div>
                    <nav id="dashboardContent">
                        <div id="loadingCircle" />
                        <div id="serverContents">
                            <div id="serverHeader">
                                <p>
                                    <img id="guildIcon" className="image" /><br />
                                    <a id="guildName" />
                                </p>
                            </div>
                                <div id="serverProps">                                
                                    <div className="dashboardContentSeparation">
                                        <p className="dashboardContentTitle">{props.language == 'pt' ? 'Placeholders que eu posso usar' : 'Placeholders I can use'}</p>
                                        <a id="helpOpaneContent" className="openContents down" onClick={() => {
                                            const Button = document.getElementById('helpOpaneContent');
                                            const Element = document.getElementById('helpContent');

                                            if (Element.style.display == 'block') {
                                                Element.style.display = 'none'
                                                Button.className = 'openContents down'
                                            } else if (Element) {
                                                Element.style.display = 'block'
                                                Button.className = 'openContents up'
                                            }
                                        }}>
                                            <svg width="20" height="10">
                                                <polygon fill="currentColor" points="0,-2 10,10 20,-2" style={{ fill: 'transparent', stroke: 'white', strokeWidth: 2 }} />
                                            </svg>
                                        </a>
                                        <div id="helpContent" className="dashboardContents">
                                            <p className="dashboardContentCaption">
                                                <div className="placeholdersTable">
                                                    <table className="placeholdersTable">
                                                        <tr className="tableTitle">
                                                            <td>Placeholder</td>
                                                            <td>{props.language == 'pt' ? 'Significado' : 'Meaning'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{'{guildMemberCount}'}</td>
                                                            <td>{props.language == 'pt' ? 'Quantidade de membros do servidor' : 'Number of server members'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{'{guildName}'}</td>
                                                            <td>{props.language == 'pt' ? 'Nome do servidor' : 'Server name'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{'{avatar}'}</td>
                                                            <td>{props.language == 'pt' ? 'Avatar do usuário que provocou a ação' : 'Avatar of the user who triggered the action'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{'{@member}'}</td>
                                                            <td>{props.language == 'pt' ? 'Menção do usuário que provocou a ação' : 'Mention of the user who provoked the action'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{'{member}'}</td>
                                                            <td>{props.language == 'pt' ? 'Nome do usuário que provocou a ação' : 'Name of the user who provoked the action'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{'{memberTag}'}</td>
                                                            <td>{props.language == 'pt' ? 'Tag do usuário que provocou a ação' : 'Tag of the user who provoked the action'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{'{memberId}'}</td>
                                                            <td>{props.language == 'pt' ? 'Id do usuário que provocou a ação' : 'Id of the user who provoked the action'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{'{lv}'}</td>
                                                            <td>{props.language == 'pt' ? 'Nivel de rank do usuário que provocou a ação (Para mensagem de rank)' : 'Rank level of the user who provoked the action (For rank message)'}</td>
                                                        </tr>
                                                    </table>
                                                </div>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="dashboardContentSeparation">
                                        <p className="dashboardContentTitle">{props.language == 'pt' ? 'Idioma' : 'Language'}</p>
                                        <select className="serverPropsSelect serverPropsInputs Language" id="selectServerLang" >
                                            <option>PT-BR</option>
                                            <option>EN</option>
                                        </select>
                                    </div>
                                    <div className="dashboardContentSeparation">
                                        <p className="dashboardContentTitle">{props.language == 'pt' ? 'Notificado do YT' : 'YT notifier'}</p>
                                        <img id="YTChannelsYTIcon" src="https://www.youtube.com/s/desktop/6007d895/img/favicon_144x144.png" />
                                        <a id="YTChannelsOpaneContent" className="openContents down" onClick={() => {
                                            const Button = document.getElementById('YTChannelsOpaneContent');
                                            const Element = document.getElementById('YTChannelsContent');

                                            if (Element.style.display == 'block') {
                                                Element.style.display = 'none'
                                                Button.className = 'openContents down'
                                            } else if (Element) {
                                                Element.style.display = 'block'
                                                Button.className = 'openContents up'
                                            }
                                        }}>
                                            <svg width="20" height="10">
                                                <polygon fill="currentColor" points="0,-2 10,10 20,-2" style={{ fill: 'transparent', stroke: 'white', strokeWidth: 2 }} />
                                            </svg>
                                        </a>
                                        <div id="YTChannelsContent" className="dashboardContents">
                                            <p className="dashboardContentCaption">{props.language == 'pt' ? 'Canal do notificador' : 'Notifier channel'} <select className="serverPropsSelect serverPropsInputs" id="YTChannelsChannelSelect" /></p>
                                            <div className="YTChannelsContaner">
                                                <div className="YTChannelsDisplay List" id="YTChannelsList" />
                                                <div className="YTChannelsDisplay Contaner">
                                                    <div id="YTChannelsAddChannelInfo">
                                                        <img className="image" id="YTChannelsAddChannelImage" src="/imgs/sticker-sla.png" />
                                                        <div id="YTChannelInfo">
                                                            <p id="YTChannelsAddChannelName">?????</p>
                                                            <p id="YTChannelsAddChannelIdentifier">@?????</p>
                                                        </div>
                                                    </div>
                                                    <input placeholder={props.language == 'pt' ? 'Link do canal ou ID' : 'Channel link or ID'} id="YTChannelsAddChannelInput" />
                                                    <button className="YTChannelsSearchButtons" id="YTChannelsSearchChannel" title={props.language == 'pt' ? 'Procurar canal' : 'Search'}>
                                                        <img id="YTChannelsSearchChannelButtonImage" src="/imgs/lupa.png" />
                                                    </button><button className="YTChannelsSearchButtons" id="YTChannelsAddChannel">{props.language == 'pt' ? 'Adicionar' : 'Add'}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="dashboardContentSeparation">
                                        <p className="dashboardContentTitle">{props.language == 'pt' ? 'Mensagem de Bem-Vindo' : 'Welcome message'}</p>
                                        <label className="switch">
                                            <input type="checkbox" id="welcomeCheckbox" />
                                            <span className="slider"></span>
                                        </label>
                                        <a id="welcomeOpaneContent" className="openContents down" onClick={() => {
                                            const Button = document.getElementById('welcomeOpaneContent');
                                            const Element = document.getElementById('welcomeContent');

                                            if (Element.style.display == 'block') {
                                                Element.style.display = 'none'
                                                Button.className = 'openContents down'
                                            } else if (Element) {
                                                Element.style.display = 'block'
                                                Button.className = 'openContents up'
                                            }
                                        }}>
                                            <svg width="20" height="10">
                                                <polygon fill="currentColor" points="0,-2 10,10 20,-2" style={{ fill: 'transparent', stroke: 'white', strokeWidth: 2 }} />
                                            </svg>
                                        </a>
                                        <div id="welcomeContent" className="dashboardContents">
                                            <p className="dashboardContentCaption">{props.language == 'pt' ? 'Canal de Bem-Vindo' : 'Welcome channel'} <select className="serverPropsSelect serverPropsInputs" id="welcomeChannelSelect" /></p>
                                            <p className="dashboardContentCaption">
                                                {props.language == 'pt' ? 'Mensagem de Bem-Vindo' : 'Welcome message'}
                                                <button id="welcomeMessageTestButton" className="messageTestButton">{props.language == 'pt' ? 'Testar mensagem' : 'Test message'}</button>
                                            </p>
                                            <div className="dashboardMessageEditContent">
                                                <div className="dashboardMessageEdit Panel">
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Conteúdo' : 'Content'}</p>
                                                        <textarea id="welcomeInputEditContent" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Autor' : 'Author'}</p>
                                                        <input placeholder="Avatar" id="welcomeInputEditAuthorAvatar" />
                                                        <input placeholder={props.language == 'pt' ? 'Nome' : 'Name'} id="welcomeInputEditAuthorName" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Miniatura' : 'Thumbnail'}</p>
                                                        <input id="welcomeInputEditThumbnail" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Título' : 'Title'}</p>
                                                        <textarea id="welcomeInputEditTitle" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Descrição' : 'Description'}</p>
                                                        <textarea id="welcomeInputEditDescription" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Imagem' : 'Image'}</p>
                                                        <input id="welcomeInputEditImage" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Cor' : 'Color'}</p>
                                                        <input id="welcomeInputEditColor" className="inputColor" type="color" />
                                                    </div>
                                                    <div style={{ borderBottom: 0 }}>
                                                        <p>Footer</p>
                                                        <input placeholder={props.language == 'pt' ? 'Texto' : 'Text'} id="welcomeInputEditFooter" />
                                                        <input placeholder={props.language == 'pt' ? 'Icone' : 'Icon'} id="welcomeInputEditFooterIcon" />
                                                    </div>
                                                </div>
                                                <div className="dashboardMessageEdit Massage">
                                                    &emsp;
                                                    <div className="messageContent" id="welcomeMessageContent" />
                                                    <div className="dashboardMessageEdit Embed" id="welcomeEmbed">
                                                        <div className="grid">
                                                            <div className="embedAuthor" id="welcomeEmbedAuthor">
                                                                <img className="embedAuthorAvatar image" id="welcomeEmbedAuthorAvatar" />
                                                                <span className="embedAuthorName" id="welcomeEmbedAuthorName" />
                                                            </div>
                                                            <div className="embedThumbnail" id="welcomeEmbedThumbnailDiv">
                                                                <img className="embedThumbnail image" id="welcomeEmbedThumbnail" />
                                                            </div>                                                            
                                                            <div className="embedTitle" id="welcomeEmbedTitle" />
                                                            <div className="embedDescription" id="welcomeEmbedDescription" />
                                                            <div className="embedImage" id="welcomeEmbedImageDiv">
                                                                <img className="embedImage image" id="welcomeEmbedImage" />
                                                            </div>
                                                            <div className="embedFooter" id="welcomeEmbedFooterDiv">
                                                                <img className="embedFooterIcon image" id="welcomeEmbedFooterIcon" />
                                                                <span className="embedFooter" id="welcomeEmbedFooter" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    &emsp;
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="dashboardContentSeparation">
                                        <p className="dashboardContentTitle">{props.language == 'pt' ? 'Mensagem de Saída' : 'Leave message'}</p>
                                        <label className="switch">
                                            <input type="checkbox" id="leaveCheckbox" />
                                            <span className="slider"></span>
                                        </label>
                                        <a id="leaveOpaneContent" className="openContents down" onClick={() => {
                                            const Button = document.getElementById('leaveOpaneContent');
                                            const Element = document.getElementById('leaveContent');

                                            if (Element.style.display == 'block') {
                                                Element.style.display = 'none'
                                                Button.className = 'openContents down'
                                            } else if (Element) {
                                                Element.style.display = 'block'
                                                Button.className = 'openContents up'
                                            }
                                        }}>
                                            <svg width="20" height="10">
                                                <polygon fill="currentColor" points="0,-2 10,10 20,-2" style={{ fill: 'transparent', stroke: 'white', strokeWidth: 2 }} />
                                            </svg>
                                        </a>
                                        <div id="leaveContent" className="dashboardContents">
                                            <p className="dashboardContentCaption">{props.language == 'pt' ? 'Canal de Saída' : 'Leave channel'} <select className="serverPropsSelect serverPropsInputs" id="leaveChannelSelect" /></p>
                                            <p className="dashboardContentCaption">
                                                {props.language == 'pt' ? 'Mensagem de Saída' : 'Leave message'}
                                                <button id="leaveMessageTestButton" className="messageTestButton">{props.language == 'pt' ? 'Testar mensagem' : 'Test message'}</button>
                                            </p>
                                            <div className="dashboardMessageEditContent">
                                                <div className="dashboardMessageEdit Panel">
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Conteúdo' : 'Content'}</p>
                                                        <textarea id="leaveInputEditContent" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Autor' : 'Author'}</p>
                                                        <input placeholder="Avatar" id="leaveInputEditAuthorAvatar" />
                                                        <input placeholder={props.language == 'pt' ? 'Nome' : 'Name'} id="leaveInputEditAuthorName" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Miniatura' : 'Thumbnail'}</p>
                                                        <input id="leaveInputEditThumbnail" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Título' : 'Title'}</p>
                                                        <textarea id="leaveInputEditTitle" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Descrição' : 'Description'}</p>
                                                        <textarea id="leaveInputEditDescription" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Imagem' : 'Image'}</p>
                                                        <input id="leaveInputEditImage" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Cor' : 'Color'}</p>
                                                        <input id="leaveInputEditColor" className="inputColor" type="color" />
                                                    </div>
                                                    <div style={{ borderBottom: 0 }}>
                                                        <p>Footer</p>
                                                        <input placeholder={props.language == 'pt' ? 'Texto' : 'Text'} id="leaveInputEditFooter" />
                                                        <input placeholder={props.language == 'pt' ? 'Icone' : 'Icon'} id="leaveInputEditFooterIcon" />
                                                    </div>
                                                </div>
                                                <div className="dashboardMessageEdit Massage">
                                                    &emsp;
                                                    <div className="messageContent" id="leaveMessageContent" />
                                                    <div className="dashboardMessageEdit Embed" id="leaveEmbed">
                                                        <div className="grid">
                                                            <div className="embedAuthor" id="leaveEmbedAuthor">
                                                                <img className="embedAuthorAvatar image" id="leaveEmbedAuthorAvatar" />
                                                                <span className="embedAuthorName" id="leaveEmbedAuthorName" />
                                                            </div>
                                                            <div className="embedThumbnail"  id="leaveEmbedThumbnailDiv">
                                                                <img className="embedThumbnail image" id="leaveEmbedThumbnail" />
                                                            </div>
                                                            <div className="embedTitle" id="leaveEmbedTitle" />
                                                            <div className="embedDescription" id="leaveEmbedDescription" />
                                                            <div className="embedImage" id="leaveEmbedImageDiv">
                                                                <img className="embedImage image" id="leaveEmbedImage" />
                                                            </div>
                                                            <div className="embedFooter" id="leaveEmbedFooterDiv">
                                                                <img className="embedFooterIcon image" id="leaveEmbedFooterIcon" />
                                                                <span className="embedFooter" id="leaveEmbedFooter" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    &emsp;
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="dashboardContentSeparation">
                                        <p className="dashboardContentTitle">{props.language == 'pt' ? 'Mensagem de Up de rank' : 'Up of rank message'}</p>
                                        <label className="switch">
                                            <input type="checkbox" id="rankCheckbox" />
                                            <span className="slider"></span>
                                        </label>
                                        <a id="rankOpaneContent" className="openContents down" onClick={() => {
                                            const Button = document.getElementById('rankOpaneContent');
                                            const Element = document.getElementById('rankContent');

                                            if (Element.style.display == 'block') {
                                                Element.style.display = 'none'
                                                Button.className = 'openContents down'
                                            } else if (Element) {
                                                Element.style.display = 'block'
                                                Button.className = 'openContents up'
                                            }
                                        }}>
                                            <svg width="20" height="10">
                                                <polygon fill="currentColor" points="0,-2 10,10 20,-2" style={{ fill: 'transparent', stroke: 'white', strokeWidth: 2 }} />
                                            </svg>
                                        </a>
                                        <div id="rankContent" className="dashboardContents">
                                            <p className="dashboardContentCaption">{props.language == 'pt' ? 'Canal de Up de rank' : 'Up of rank channel'} <select className="serverPropsSelect serverPropsInputs" id="rankChannelSelect" /></p>
                                            <p className="dashboardContentCaption">
                                                {props.language == 'pt' ? 'Mensagem de Up de rank' : 'Up of rank message'}
                                                <button id="rankMessageTestButton" className="messageTestButton">{props.language == 'pt' ? 'Testar mensagem' : 'Test message'}</button>
                                            </p>
                                            <div className="dashboardMessageEditContent">
                                                <div className="dashboardMessageEdit Panel">
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Conteúdo' : 'Content'}</p>
                                                        <textarea id="rankInputEditContent" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Autor' : 'Author'}</p>
                                                        <input placeholder="Avatar" id="rankInputEditAuthorAvatar" />
                                                        <input placeholder={props.language == 'pt' ? 'Nome' : 'Name'} id="rankInputEditAuthorName" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Miniatura' : 'Thumbnail'}</p>
                                                        <input id="rankInputEditThumbnail" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Título' : 'Title'}</p>
                                                        <textarea id="rankInputEditTitle" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Descrição' : 'Description'}</p>
                                                        <textarea id="rankInputEditDescription" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Imagem' : 'Image'}</p>
                                                        <input id="rankInputEditImage" />
                                                    </div>
                                                    <div>
                                                        <p>{props.language == 'pt' ? 'Cor' : 'Color'}</p>
                                                        <input id="rankInputEditColor" className="inputColor" type="color" />
                                                    </div>
                                                    <div style={{ borderBottom: 0 }}>
                                                        <p>Footer</p>
                                                        <input placeholder={props.language == 'pt' ? 'Texto' : 'Text'} id="rankInputEditFooter" />
                                                        <input placeholder={props.language == 'pt' ? 'Icone' : 'Icon'} id="rankInputEditFooterIcon" />
                                                    </div>
                                                </div>
                                                <div className="dashboardMessageEdit Massage">
                                                    &emsp;
                                                    <div className="messageContent" id="rankMessageContent" />
                                                    <div className="dashboardMessageEdit Embed" id="rankEmbed">
                                                        <div className="grid">
                                                            <div className="embedAuthor" id="rankEmbedAuthor">
                                                                <img className="embedAuthorAvatar image" id="rankEmbedAuthorAvatar" />
                                                                <span className="embedAuthorName" id="rankEmbedAuthorName" />
                                                            </div>
                                                            <div className="embedThumbnail"   id="rankEmbedThumbnailDiv">
                                                                <img className="embedThumbnail image" id="rankEmbedThumbnail" />
                                                            </div>
                                                            <div className="embedTitle" id="rankEmbedTitle" />
                                                            <div className="embedDescription" id="rankEmbedDescription" />
                                                            <div className="embedImage" id="rankEmbedImageDiv">
                                                                <img className="embedImage image" id="rankEmbedImage" />
                                                            </div>
                                                            <div className="embedFooter" id="rankEmbedFooterDiv">
                                                                <img className="embedFooterIcon image" id="rankEmbedFooterIcon" />
                                                                <span className="embedFooter" id="rankEmbedFooter" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    &emsp;
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <div><button id="save-button">{props.language == 'pt' ? 'Salvar' : 'Save'}</button></div>
                        </div>
                    </nav>
                </section>
            </body>
        </html>
    )
}

export async function getStaticProps() {
    let serv = process.env.SERVER
    let botInvite = process.env.botInvite

    return {
        props: {
            serv,
            botInvite,
            languageChangeLink: '/dashboard',
            language: 'pt'
        },
        revalidate: 1800
    }
}

export default page