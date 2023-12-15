import React, { useEffect } from 'react';
import cookies from 'next-cookies';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import Head from "next/head";

const functions = (type, ...props) => require(`../../../public/js/${type}.js`).default(props)

function page(props) {
    let cookiesProps = require('../../../lib/data').cookies
    let cookie = cookies(cookiesProps)

    require('../../../lib/data').page = '/br'
    const router = useRouter()

    useEffect(() => {
        const socket = io(props.serv, {
            withCredentials: true,
        })

        document.getElementById('myInformations').style.backgroundColor = '#b27bf290';

        function loadState(user, complete) {
            /*user.bannerURL = 'https://cdn.discordapp.com/banners/561315445026586635/3822ba4bbbde691e616ef1bb8e8dfc83.png?size=512'
            user.avatarURL = 'https://cdn.discordapp.com/avatars/584860173085048832/a_2c2a155090db7d2e24df2f4f28e6e0e1.gif'*/
            functions('setUser', user, router)

            if (user.bannerURL) document.getElementById('userHeader').style.backgroundImage = `url(${user.bannerURL})`;
            if (user.banner_color) document.getElementById('userHeader').style.backgroundColor = user.banner_color;
            if (user.avatarURL) document.getElementById('userAvatar').src = user.avatarURL+'?size=2048';
            document.getElementById('userName').innerText = user.global_name
            document.getElementById('costAlert').style.color = 'white';
            document.getElementById('save-button').style.display = 'inline-block';
            document.getElementById('userProps').style.display = 'inline-block';

            if (user.guilds || complete) {
                const userContents = document.getElementById('userContents');

                const aboutmeBox = document.getElementById('aboutme-box');
                const bankInfo = document.getElementById('bank-info');
                const diamondsInfo = document.getElementById('diamonds-info');
                const alphaCoin = document.getElementById('alphaCoin-info');
                const magicstonesInfo = document.getElementById('magicstones-info');
                const colorBox = document.getElementById('color-box');
                const colorButton = document.getElementById('color-button');
                const votesInfo = document.getElementById('votes-info');
                const counterInfo = document.getElementById('counter-info');
                const marryInfo = document.getElementById('marry-info-name');
                const marryInfoImg = document.getElementById('marry-info-img');
                const marry = document.getElementById('marry');                

                let dbuser = null
                document.getElementById('save-button').addEventListener('click', () => {
                    socket.emit('dashboard', {
                        type: 'set-user',
                        user,
                        data: {
                            aboutme: aboutmeBox.value || null,
                            color: colorBox.value
                        }
                    })           
                })

                socket.on('insufficientDiamonds', () => alert(props.language == 'pt' ? 'Diamantes insuficientes no seu bolso para a troca de cor' : 'Not enough diamonds in your pocket for color change'))
                socket.on('passed', () => alert(props.language == 'pt' ? 'Configurações salvas!' : 'Saved settings!'))
                socket.on('error', (msg) => alert(`ERROR: ${msg}`))

                socket.emit('dashboard', {
                    type: 'get-user',
                    user
                })

                socket.on('dashboard-user-return', ({ DBuser, spouse }) => {
                    const noUserMsg = document.getElementById('noUserMsg');
                    document.getElementById('loadingCircle').style.display = 'none';

                    if (!DBuser && noUserMsg) {
                        noUserMsg.innerText = props.language == 'pt' ? 'Desculpe, parece que você não está em meu banco de dados, presiso detectar uma mensagem sua para lhe registrar.' : 'Sorry, it looks like you\'re not in my database, I need to detect a message from you to register you.'
                    } else {
                        let defaultUserColor = DBuser.color
                        colorButton.addEventListener('click', () => colorBox.value = defaultUserColor)

                        userContents.style.display = 'inline-block';
                        dbuser = DBuser
                        aboutmeBox.value = dbuser.aboutme
                        colorBox.value = dbuser.color
                        bankInfo.innerText = `${dbuser.bank} 💎`
                        diamondsInfo.innerText = `${dbuser.diamonds} 💎`
                        alphaCoin.innerText = `${dbuser.alphaCoins} A$`
                        magicstonesInfo.innerText = `${dbuser.magicstones} 🔮`
                        votesInfo.innerText = dbuser.voteCounter
                        counterInfo.innerText = dbuser.commandsCounter
                        if (spouse) {
                            marryInfo.innerText = spouse.username
                            marryInfoImg.title = spouse.id
                            marryInfoImg.src = spouse.avatarURL+'?size=2048' || spouse.defaultAvatarURL
                        } else marry.style.display = 'none'

                        function loop() {
                            let dashboardContentSeparation = document.getElementsByClassName('dashboardContentSeparation')[0]
        
                            let rAF = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.requestAnimationFrame;
                            if (dashboardContentSeparation) {
                                dashboardContentSeparation.style.borderColor = colorBox.value; 
                                rAF(loop)
                            }
                        }
                        loop()
                    }
                })
            }
        } 
        functions('getUser', cookie, socket, loadState, router, true)
        //require(`../../../public/js/getUser.js`).default(cookie, socket, loadState, router, true)

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
                <title>Alpha Site | Dashboard my</title>

                <meta property="theme-color" content="#010101" />
                <meta property="og:title" content="Alpha Bot" />
                <meta property="og:site_name" content="Alpha Site" />
                <meta property="og:url" content="https://alpha-site.vercel.app/br/dashboard/my" />                
                <meta property="og:image" content="/avatar/Roxo.png" />
                <meta property="og:description" content="Olá eu sou o Alpha Bot, com um ótimo sistema de RPG para divertir a todos e um sistemas de rank para deixar todos ativos e competitivos para o 1° lugar!" />
            </Head>
            <head>
                <link rel="stylesheet" href="/css/dashboard-my/animations.css" />
                <link rel="stylesheet" href="/css/dashboard-my/dashboard-my.css" />
                <link rel="stylesheet" href="/css/dashboard-my/resizable.css" />
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
                            <p id="noUserMsg" />
                        </div>

                        <div id="userContents">
                            <div id="userHeader">
                                <p>
                                    <img id="userAvatar" className="image" /><br />
                                    <a id="userName" />
                                </p>
                            </div>
                            <h3 style={{ marginBottom: '5px', color: '#892be200' }} id="costAlert">{props.language == 'pt' ? 'A troca de cor custa 1000 diamantes' : 'Color change costs 1000 diamonds'}</h3>
                            <div id="userProps">
                                <p className="dashboardContentSeparation">
                                    <p>{props.language == 'pt' ? 'Sobremim' : 'Aboutme'}: <textarea className="userPropsInputs" id="aboutme-box" maxLength="150" /></p>
                                    <p id="color">{props.language == 'pt' ? 'Cor' : 'Color'}: 
                                        <p id="color-info">
                                            <input type="color" className="userPropsInputs" id="color-box" maxLength="20" />
                                            <button id="color-button">Reset</button>
                                        </p>
                                    </p>
                                    <p>{props.language == 'pt' ? 'Banco' : 'Bank'}: <alpha-bold id="bank-info" /></p>
                                    <p>{props.language == 'pt' ? 'Bolso' : 'Pocket'}: <alpha-bold id="diamonds-info" /></p>
                                    <p>AlphaCoins: <alpha-bold id="alphaCoin-info" /></p>
                                    <p>{props.language == 'pt' ? 'Pedras Mágicas' : 'Magicstones'}: <alpha-bold id="magicstones-info" /></p>                                
                                    <p>{props.language == 'pt' ? 'Votos' : 'Votes'}: <alpha-bold id="votes-info" /></p>
                                    <p>{props.language == 'pt' ? 'Comandos usados' : 'Used commands'}: <alpha-bold id="counter-info" /></p>
                                    <p id="marry">{props.language == 'pt' ? 'Casado(a) com' : 'Married with'}: 
                                        <alpha-bold id="marry-info">
                                            <img className="image" id="marry-info-img" src="https://cdn.discordapp.com/embed/avatars/1.png" />
                                            <span id="marry-info-name" />
                                        </alpha-bold>
                                    </p>
                                </p>
                            </div>
                            <div><button id="save-button">{props.language == 'pt' ? 'Salvar' : 'Save'}</button></div>
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
            languageChangeLink: '/dashboard/my',
            language: 'pt'
        },
        revalidate: 1800
    }
}

export default page