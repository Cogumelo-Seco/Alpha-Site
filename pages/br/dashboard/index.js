import React, { useEffect  } from 'react';
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
        
        function loadState(user, complete) {
            functions('setUser', user, router)
            
            //if (!complete) return

            if (user.guilds && !complete) {
                let guilds = user.guilds
                socket.emit('dashboard', {
                    type: 'get-guilds',
                    guilds: guilds,
                    noUserConfig: true,
                    user
                })

                socket.on('dashboard-guilds-return', (serverProps) => {
                    listGuilds(serverProps)
                })

                let lastCurrent = 0
                socket.on('dashboard-guilds-return-loading', (serverProps) => {
                    let loadingMsg = document.getElementById('loadingMsg')
                    loadingMsg.innerText = `${Number.parseInt(serverProps.current/serverProps.total*100)}% (${serverProps.current}/${serverProps.total})`
                    lastCurrent = serverProps.current
                    setTimeout(() => {
                        if (lastCurrent <= serverProps.current && serverProps.current/serverProps.total < 1) {
                            loadingMsg.style.color = '#BB3333'
                            //router.push(`/${props.language == 'pt' ? 'br' : 'en'}/dashboard`)
                        }
                    }, 4000)
                })
            } else if (!user.guilds) router.push(`/${props.language == 'pt' ? 'br' : 'en'}/auth`)

            function listGuilds(guilds) {
                const noGuildsMsg = document.getElementById('noGuildsMsg');
                const serverInfos = document.getElementById('serverInfos');
                const welcomeMessageSwitch = document.getElementById('welcomeSwitch');
                const leaveMessageSwitch = document.getElementById('leaveSwitch');
                const lang = document.getElementById('langDescription');
                const rankMessageSwitch = document.getElementById('rankSwitch');

                document.getElementById('loadingCircle').style.display = 'none';
                document.getElementById('loadingMsg').style.display = 'none';
                if (!guilds[0] && noGuildsMsg) return noGuildsMsg.innerText = props.language == 'pt' ? 'Desculpe, parece que você não tem servidores para gerenciar!' : 'Sorry, it looks like you don\'t have any servers to manage!';

                const userGuilds = user.guilds

                for (let i in guilds) {
                    let guild = userGuilds.find((g) => g.id == guilds[i].DBGuild._id)
                    guild.DBGuild = guilds[i].DBGuild
                    //guild.channels = guilds[i].channels

                    let verify = document.getElementById(guild ? guild.id : null)
                    if (!verify && guild && guild.id) {
                        let serversList = document.getElementById('serversList');
                        let servButton = document.createElement('div');
                        servButton.className = 'dashboard-server-buttons'
                        servButton.id = guild.id
                        servButton.innerHTML = `
                            <img class="serverImage" src="${guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : 'https://cdn.discordapp.com/embed/avatars/1.png'}" />
                            <span class="serverName">${guild.name}</span>
                        `
                        serversList.appendChild(servButton)
                        document.getElementById(servButton.id).addEventListener('click', () => router.push({ pathname: `/${props.language == 'pt' ? 'br' : 'en'}/dashboard/guild`, query: { id: servButton.id } }))
                        document.getElementById(servButton.id).addEventListener('mouseover', () => {
                            let DBGuild = guild.DBGuild

                            serverInfos.className = 'serverInfos'
                            if (DBGuild) setTimeout(() => {
                                serverInfos.className = 'serverInfos on'
                                
                                lang.innerText = DBGuild.language.replace('pt', 'PT-BR').replace('en', 'EN')

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
                                for (let i in embedsNames) reloadEmbeds(embedsNames[i].Name, embedsNames[i].DBName)

                                if (DBGuild.welcomeChannel != 'off') welcomeMessageSwitch.className = 'slider on'
                                else welcomeMessageSwitch.className = 'slider off'

                                if (DBGuild.leaveChannel != 'off') leaveMessageSwitch.className = 'slider on'
                                else leaveMessageSwitch.className = 'slider off'
                                
                                if (DBGuild.rankChannel != 'off') rankMessageSwitch.className = 'slider on'
                                else rankMessageSwitch.className = 'slider off'
                            }, 400)
                        })

                        function reloadEmbeds(name, DBName) {
                            let message = null
                            try {                    
                                message = JSON.parse(guild.DBGuild[DBName])
                            } catch (err) {}
            
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
            
                            if (typeof message != 'object') messageContent.innerHTML = message
                            else {
                                let embed = message.embeds[0]
                                let showEmbed = false
            
                                if (typeof embed.author != 'object') embed.author = {}
                                if (typeof embed.thumbnail != 'object') embed.thumbnail = {}
                                if (typeof embed.image != 'object') embed.image = {}
                                if (typeof embed.footer != 'object') embed.footer = {}

                                messageContent.innerHTML = message.content ? replaces(message.content, 'content') : ''

                                elementEmbed.style.borderLeftColor = embed.color ? replaces(embed.color, 'color') : ''
 
                                if (embed.title) {
                                    showEmbed = true
                                    embedTitle.style.display = 'block'
                                    embedTitle.innerHTML = replaces(embed.title, 'title')
                                } else embedTitle.style.display = 'none'

                                if (embed.description) {
                                    showEmbed = true
                                    embedDescription.style.display = 'block'
                                    embedDescription.innerHTML = replaces(embed.description, 'description')
                                } else embedDescription.style.display = 'none'

                                if (embed.footer.text) {
                                    showEmbed = true
                                    embedFooter.style.display = 'block'
                                    embedFooterDiv.style.marginTop = '8px'
                                    embedFooter.innerHTML = replaces(embed.footer.text, 'footerText')
                                } else {
                                    embedFooterDiv.style.marginTop = '0'
                                    embedFooter.style.display = 'none'
                                }

                                if (embed.footer.iconURL) {
                                    showEmbed = true
                                    embedFooterIcon.style.display = 'block'
                                    embedFooterDiv.style.marginTop = '8px'
                                    embedFooterIcon.src = replaces(embed.footer.iconURL, 'footerIcon')
                                } else {
                                    embedFooterIcon.style.display = 'none'
                                }

                                if (embed.author.name) {
                                    showEmbed = true
                                    embedAuthorName.style.display = 'block'
                                    embedAuthorDiv.style.marginTop = '8px'
                                    embedAuthorName.innerHTML = replaces(embed.author.name, 'authorName')
                                } else {
                                    embedAuthorDiv.style.margin = '0'
                                    embedAuthorName.style.display = 'none'
                                }

                                if (embed.author.icon_url) {
                                    showEmbed = true
                                    embedAuthorAvatar.style.display = 'block'
                                    embedAuthorDiv.style.marginTop = '8px'
                                    embedAuthorAvatar.src = replaces(embed.author.icon_url, 'authorAvatar')                   
                                } else {
                                    embedAuthorAvatar.style.display = 'none'
                                }

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

                        function replaces(text, type) {
                            if (!text) return
                            if (type == 'color' && text == 'DEFAULT-COLOR') return text = '#000000'
                            
                            text = text
                                .replace(/{guildMemberCount}/g, 13)
                                .replace(/{guildName}/g, guild.name)
                                .replace(/{avatar}/g, user.avatarURL || '/imgs/avatar/Default.png')
                                .replace(/{@member}/g, `<alpha-metion>@${user.global_name || user.username}</alpha-metion>`)
                                .replace(/{member}/g, user.global_name || user.username)
                                .replace(/{memberTag}/g, user.username)
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
                    }
                }
            }
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
                <title>Alpha Site | Dashboard</title>

                <meta property="theme-color" content="#010101" />
                <meta property="og:title" content="Alpha Bot" />
                <meta property="og:site_name" content="Alpha Site" />
                <meta property="og:url" content="https://alpha-site.vercel.app/br/dashboard/" />                
                <meta property="og:image" content="/avatar/Roxo.png" />
                <meta property="og:description" content="Olá eu sou o Alpha Bot, com um ótimo sistema de RPG para divertir a todos e um sistemas de rank para deixar todos ativos e competitivos para o 1° lugar!" />
            </Head>
            <head>
                <link rel="stylesheet" href="/css/dashboard-guilds-list/animations.css" />
                <link rel="stylesheet" href="/css/dashboard-guilds-list/dashboard-guilds-list.css" />
                <link rel="stylesheet" href="/css/dashboard-guilds-list/resizable.css" />
                <link rel="stylesheet" href="/css/dashboard/index.css" />
            </head>
            <body>
                <section>
                    <div id="controlPanel">
                        <p className="controlPanel-buttons" onClick={myServersClick} id="myGuilds">{props.language == 'pt' ? 'Meus Servidores' : 'My Servers'}</p>
                        <p className="controlPanel-buttons" onClick={myInformationsClick} id="myInformations">{props.language == 'pt' ? 'Minhas informações' : 'My informations'}</p>
                        <p className="controlPanel-buttons" onClick={disconnectUser} id="disconnectUser">{props.language == 'pt' ? 'Sair' : 'Exit'}</p>
                    </div>
                    <div id="dashboardContent">
                        <div id="alertsContaner">
                            <div id="loadingCircle" />
                            <p id="loadingMsg" />
                            <p id="noGuildsMsg" />
                        </div>
                        <div id="contaner">
                            <div id="serversList" />
                            <div id="serverInfos" className="serverInfos">
                                <div className="serverInfo">
                                    <p className="infoName">{props.language == 'pt' ? 'Idioma' : 'Language'}</p>
                                    <p className="infoDescription low center" id="langDescription" />
                                </div>
                                <div className="serverInfo">
                                    <p className="infoName">{props.language == 'pt' ? 'Mensagem de Bem-Vindo' : 'Welcome message'}  <span id="welcomeSwitch" className="slider off"><div className="circle" /></span></p>
                                    <p className="infoDescription" id="welcomeDescription">
                                        <div id="welcomeMessageContent" className="messageContent" />
                                        <div className="Embed" id="welcomeEmbed">
                                            <div className="grid">
                                                <div className="embedAuthor" id="welcomeEmbedAuthor">
                                                    <img id="welcomeEmbedAuthorAvatar" className="embedAuthorAvatar image" />
                                                    <span id="welcomeEmbedAuthorName" className="embedAuthorName" />
                                                </div>
                                                <div className="embedThumbnail" id="welcomeEmbedThumbnailDiv">
                                                    <img id="welcomeEmbedThumbnail" className="embedThumbnail image" />
                                                </div>

                                                <div id="welcomeEmbedTitle" className="embedTitle" />
                                                <div id="welcomeEmbedDescription" className="embedDescription" />
                                                <div className="embedImage" id="welcomeEmbedImageDiv">
                                                    <img className="embedImage image" id="welcomeEmbedImage" />
                                                </div>
                                                <div className="embedFooter" id="welcomeEmbedFooterDiv">
                                                    <img className="embedFooterIcon image" id="welcomeEmbedFooterIcon" />
                                                    <span className="embedFooter" id="welcomeEmbedFooter" />
                                                </div>
                                            </div>
                                        </div>
                                    </p>
                                </div>
                                <div className="serverInfo">
                                    <p className="infoName">{props.language == 'pt' ? 'Mensagem de Saída' : 'Leave message'} <span id="leaveSwitch" className="slider off"><div className="circle" /></span></p>
                                    <p className="infoDescription" id="leaveDescription">
                                        <div id="leaveMessageContent" className="messageContent" />
                                        <div className="Embed" id="leaveEmbed">
                                            <div className="grid">
                                                <div className="embedAuthor" id="leaveEmbedAuthor">
                                                    <img id="leaveEmbedAuthorAvatar" className="embedAuthorAvatar image" />
                                                    <span id="leaveEmbedAuthorName" className="embedAuthorName" />
                                                </div>
                                                <div className="embedThumbnail" id="leaveEmbedThumbnailDiv">
                                                    <img id="leaveEmbedThumbnail" className="embedThumbnail image" />
                                                </div>

                                                <div id="leaveEmbedTitle" className="embedTitle" />
                                                <div id="leaveEmbedDescription" className="embedDescription" />
                                                <div className="embedImage" id="leaveEmbedImageDiv">
                                                    <img className="embedImage image" id="leaveEmbedImage" />
                                                </div>
                                                <div className="embedFooter" id="leaveEmbedFooterDiv">
                                                    <img className="embedFooterIcon image" id="leaveEmbedFooterIcon" />
                                                    <span className="embedFooter" id="leaveEmbedFooter" />
                                                </div>
                                            </div>
                                        </div>
                                    </p>
                                </div>
                                <div className="serverInfo">
                                    <p className="infoName">{props.language == 'pt' ? 'Mensagem de Up de rank' : 'Up of rank message'} <span id="rankSwitch" className="slider off"><div className="circle" /></span></p>
                                    <p className="infoDescription" id="rankDescription">
                                        <div id="rankMessageContent" className="messageContent" />
                                        <div className="Embed" id="rankEmbed">
                                            <div className="grid">
                                                <div className="embedAuthor" id="rankEmbedAuthor">
                                                    <img id="rankEmbedAuthorAvatar" className="embedAuthorAvatar image" />
                                                    <span id="rankEmbedAuthorName" className="embedAuthorName" />
                                                </div>
                                                <div className="embedThumbnail" id="rankEmbedThumbnailDiv">
                                                    <img id="rankEmbedThumbnail" className="embedThumbnail image" />
                                                </div>

                                                <div id="rankEmbedTitle" className="embedTitle" />
                                                <div id="rankEmbedDescription" className="embedDescription" />
                                                <div className="embedImage" id="rankEmbedImageDiv">
                                                    <img className="embedImage image" id="rankEmbedImage" />
                                                </div>
                                                <div className="embedFooter" id="rankEmbedFooterDiv">
                                                    <img className="embedFooterIcon image" id="rankEmbedFooterIcon" />
                                                    <span className="embedFooter" id="rankEmbedFooter" />
                                                </div>
                                            </div>
                                        </div>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
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