import React, { useEffect } from 'react';
import cookies from 'next-cookies';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import Head from "next/head";

const functions = (type, ...props) => require(`../../public/js/${type}.js`).default(props)

function pt(props) {
    let cookiesProps = require('../../lib/data').cookies
    let cookie = cookies(cookiesProps)

    require('../../lib/data').page = props.language == 'pt' ? '/br' : props.language == 'es' ? '/es' : '/en'
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
                <meta property="og:description" content="Hola soy Alpha Bot, no tengo nada que decir. ¡Buen día!" />
            </Head>
            <head>
                <link rel="stylesheet" href="/css/links/animations.css" />
                <link rel="stylesheet" href="/css/links/links.css" />
                <link rel="stylesheet" href="/css/links/resizable.css" />
            </head>
            <body>
                <section>
                    <div>
                    <div className="links" onClick={() => open('https://funcog.vercel.app/')}>
                            <img src="/imgs/links/fnf.png" />
                            <p>FunCog</p>
                        </div>
                        <div className="links" onClick={() => open('https://cogu-projects.vercel.app/')}>
                            <img src="/imgs/links/IA.png" />
                            <p>{props.language == 'pt' ? 'IA' : 'AI'}</p>
                        </div>
                        <div className="links" onClick={() => open('https://cogu-projects.vercel.app/pac-man')}>
                            <img src="/imgs/links/pac-man.png" />
                            <p>Pac-Man</p>
                        </div>
                        <div className="links" onClick={() => open('https://infinite-run.vercel.app')} >
                            <img src="/imgs/links/infinite-run.png" />
                            <p>Infinite Run</p>
                        </div>
                        <div className="links" onClick={() => open('https://cogu-projects.vercel.app/minesweeper')}>
                            <img src="/imgs/links/minesweeper.png" />
                            <p>Buscaminas</p>
                        </div>
                        <div className="links" onClick={() => open('https://cogu-fogo-do-doom.vercel.app/')} >
                            <img src="/imgs/links/fire-of-doom.png" />
                            <p>Fuego creado dinámicamente por JavaScript</p>
                        </div>
                        <div className="links" onClick={() => open('https://gamejolt.com/@Cogumelo_Seco')}>
                            <img src="https://m.gjcdn.net/user-avatar/200/4684396-ll-rr7epaik-v4.webp" />
                            <p>GameJolt de mi creador</p>
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
            language: 'es'
        },
        revalidate: 1800
    }
}

export default pt