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
            console.log(user)
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
                <meta property="og:url" content="https://alpha-site.vercel.app/br" />                
                <meta property="og:image" content="/avatar/Roxo.png" />
                <meta property="og:description" content="Olá eu sou o Alpha Bot, com um ótimo sistema de RPG para divertir a todos e um sistemas de rank para deixar todos ativos e competitivos para o 1° lugar!" />
            </Head>
            <head>
                <link rel="stylesheet" href="/css/home/animations.css" />
                <link rel="stylesheet" href="/css/home/home.css" />         
            </head>
            <body>
                <section>
                    <h1 id="title">Olá eu sou o Alpha Bot</h1>
                    <h3 id="description">Com um ótimo sistema de RPG para divertir a todos e um sistemas de rank para deixar todos ativos e competitivos para o 1° lugar!</h3>
                    <a id="add-button" href={props.botInvite} target="_blank">Me adicione!</a>
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
            languageChangeLink: '/',
            language: 'pt'
        },
        revalidate: 1800
    }
}

export default pt