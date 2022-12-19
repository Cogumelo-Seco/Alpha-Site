import React, { useEffect } from 'react';
import cookies from 'next-cookies';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import Head from "next/head";

const functions = (type, ...props) => require(`../../public/js/${type}.js`).default(props)

function pt(props) {
    let cookiesProps = require('../../lib/data').cookies
    let cookie = cookies(cookiesProps)

    require('../../lib/data').page = (props.language == 'pt' ? '/br' : '/en')
    const router = useRouter()

    useEffect(() => {
        const socket = io(props.serv, {
            withCredentials: true,
        })

        function loadState(user) {
            functions('setUser', user, router)
        }
        functions('getUser', cookie, socket, loadState, router)
    })

    return (
        <html lang="pt-BR">
            <Head>
                <title>Alpha Site</title>

                <meta property="theme-color" content="#010101" />
                <meta property="og:title" content="Alpha Bot" />
                <meta property="og:site_name" content="Alpha Site" />
                <meta property="og:url" content="https://alpha-site.vercel.app/br/links" />                
                <meta property="og:image" content="/avatar/Roxo.png" />
                <meta property="og:description" content="Olá eu sou o Alpha Bot, com um ótimo sistema de RPG para divertir a todos e um sistemas de rank para deixar todos ativos e competitivos para o 1° lugar!" />
            </Head>
            <head>
                <link rel="stylesheet" href="/css/links/animations.css" />
                <link rel="stylesheet" href="/css/links/links.css" />
                <link rel="stylesheet" href="/css/links/resizable.css" />
            </head>
            <body>
                <section>
                    <div>
                        <div className="links" onClick={() => open('https://cogu-fnf.vercel.app')}>
                            <img src="/imgs/links/fnf.png" />
                            <p>{props.language == 'pt' ? 'CoguFNF' : 'CoguFNF'}</p>
                        </div>
                        <div className="links" onClick={() => open('https://cogu-pacman.vercel.app')}>
                            <img src="/imgs/links/pac-man.png" />
                            <p>Pac-Man</p>
                        </div>
                        <div className="links" onClick={() => open('https://cogu-game-snake.vercel.app')}>
                            <img src="/imgs/links/snake.png" />
                            <p>{props.language == 'pt' ? 'Jogo multiplayer: 100 Nome' : 'Multiplayer game: 100 Nome'}</p>
                        </div>
                        <div className="links" onClick={() => open('https://infinite-run.vercel.app')} >
                            <img src="/imgs/links/infinite-run.png" />
                            <p>{props.language == 'pt' ? 'Beta do 1º jogo do meu criador no navegador: Infinite Run' : 'Beta: Infinite Run'}</p>
                        </div>
                        <div className="links" onClick={() => open('https://cogu-fogo-do-doom.vercel.app/')} >
                            <img src="/imgs/links/fire-of-doom.png" />
                            <p>{props.language == 'pt' ? 'Fogo dinamicamente criado por JavaScript' : 'Fire dynamically created by JavaScript'}</p>
                        </div>
                        <div className="links" onClick={() => open('https://gamejolt.com/@Cogumelo_Seco')}>
                            <img src="https://m.gjcdn.net/user-avatar/200/4684396-ll-yhvjtsnr-v4.webp" />
                            <p>{props.language == 'pt' ? 'GameJolt do meu criador' : 'GameJolt from my creator'}</p>
                        </div>
                    </div>
                </section>
            </body>
        </html>
    )
}

export async function getStaticProps(a) {
    let botInvite = process.env.botInvite
    let serv = process.env.SERVER

    return {
        props: {
            serv,
            botInvite,
            languageChangeLink: '/links',
            language: 'pt'
        },
        revalidate: 1800
    }
}

export default pt