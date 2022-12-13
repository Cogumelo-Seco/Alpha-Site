import { useEffect } from 'react';
import { useRouter } from 'next/router'
import cookies from 'next-cookies';
import Head from "next/head"
import io from 'socket.io-client';

const page = (props) => {
    let cookiesProps = require('../../lib/data').cookies
    let cookie = cookies(cookiesProps)

    const router = useRouter()

    useEffect(() => {
        let user = require('../../lib/data').user
        if (user.id) return router.push(require('../../lib/data').page)

        let socket = io(props.serv, {
            withCredentials: true,
        })

        let connect = false
        let time = 0

        const waitingText = document.getElementById('waitingText')
        function addDot() {
            if (!connect) {
                waitingText.innerText += '.'
                if (waitingText.innerText.length >= 15) waitingText.innerText = props.language == 'pt' ? 'Conectando.' : 'Connecting.'
                setTimeout(addDot, 500)
            }
        }
        addDot()

        function serverConnect() {
            let cookiesProps = require('../../lib/data').cookies
            let cookie = cookies(cookiesProps)

            connect = true
            if (waitingText) waitingText.innerText = props.language == 'pt' ? 'Esperando confirmação, talvez seu navegador bloqueie o pop-up de login' : 'Waiting for confirmation, maybe your browser blocks the login popup'
            if (!cookie.userId) window.open(props.serv+'/api/auth', "discord-auth-window", `width=400px,height=700px,top=30px,left=20pxstatus=yes,scrollbars=yes,resizable=yes`)
        }

        function serverLogin(user) {
            require('../../lib/data').user = user;
            require(`../../public/js/setUser.js`).default([ user, null ])
            require(`../../public/js/getUser.js`).default([ cookie, socket ])

            router.push(require('../../lib/data').page)
            setTimeout(() => router.push(require('../../lib/data').page), 1000)
        }
        
        socket.emit('auth')
        socket.on('connect', serverConnect)
        socket.on('login', serverLogin)

        document.getElementById('reload').addEventListener('click', () => {
            if (time <= 5) return

            connect = false
            time = 0
            waitingText.innerText = props.language == 'pt' ? 'Conectando .' : 'Connecting .'

            socket = io(props.serv, {
                withCredentials: true,
            })

            socket.emit('auth')
            socket.on('connect', serverConnect)
            socket.on('login', serverLogin)
        });

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

    return (
        <html lang="pt-BR">
            <Head>
                <title>{props.language == 'pt' ? 'Conectando .' : 'Connecting .'}...</title>

                <meta property="theme-color" content="#010101" />
                <meta property="og:title" content="Alpha Bot" />
                <meta property="og:site_name" content="Alpha Site" />
                <meta property="og:url" content="https://alpha-site.vercel.app/br/auth" />                
                <meta property="og:image" content="/avatar/Roxo.png" />
                <meta property="og:description" content="Olá eu sou o Alpha Bot, com um ótimo sistema de RPG para divertir a todos e um sistemas de rank para deixar todos ativos e competitivos para o 1° lugar!" />          
            </Head>
            <head>
                <link rel="stylesheet" href="/css/auth/auth.css" />
                <link rel="stylesheet" href="/css/auth/resizable.css" />
            </head>
            <body id="main">
                <div id="waiting">
                    <div id="waitingText">{props.language == 'pt' ? 'Conectando .' : 'Connecting .'}</div>
                    <button className="waitingButton" id="reload">{props.language == 'pt' ? 'Tentar Novamente' : 'Try again'}</button><br />
                </div>
            </body>
        </html>
    )
}

export async function getStaticProps() {
    let serv = process.env.SERVER

    let imgs = [
        (await fetch(`https://some-random-api.ml/animal/cat`).then((body) => body?.json()).catch(() => null))?.image,
        (await fetch(`https://some-random-api.ml/animal/dog`).then((body) => body?.json()).catch(() => null))?.image,
        (await fetch(`https://some-random-api.ml/animal/panda`).then((body) => body?.json()).catch(() => null))?.image,
        (await fetch(`https://some-random-api.ml/animal/fox`).then((body) => body?.json()).catch(() => null))?.image,
        (await fetch(`https://some-random-api.ml/animal/red_panda`).then((body) => body?.json()).catch(() => null))?.image,
        (await fetch(`https://some-random-api.ml/animal/koala`).then((body) => body?.json()).catch(() => null))?.image,
        (await fetch(`https://some-random-api.ml/animal/birb`).then((body) => body?.json()).catch(() => null))?.image,
        (await fetch(`https://some-random-api.ml/animal/raccoon`).then((body) => body?.json()).catch(() => null))?.image,
        (await fetch(`https://some-random-api.ml/animal/kangaroo`).then((body) => body?.json()).catch(() => null))?.image,
    ]

    return {
        props: {
            serv: serv,
            image: imgs[Math.floor(Math.random()*imgs.length-1)] || 'https://cdn.discordapp.com/attachments/792642251519426590/903775899399389234/unknown.png',
            languageChangeLink: '/auth',
            language: 'pt'
        },
        revalidate: 30
    }
}

export default page