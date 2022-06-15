import React, { useEffect } from 'react';
import cookies from 'next-cookies';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import Head from "next/head";

const functions = (type, ...props) => require(`../../public/js/${type}.js`)(props)

function en(props) {
    let cookiesProps = require('../../lib/data').cookies
    let cookie = cookies(cookiesProps)

    require('../../lib/data').page = '/en'
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
        <html lang="en">
            <Head>
                <title>Alpha Site</title>

                <meta property="theme-color" content="#8A2BE2" />
                <meta property="og:title" content="Alpha Bot" />
                <meta property="og:site_name" content="Alpha Site" />
                <meta property="og:url" content="https://alpha-site.vercel.app/en/" />                
                <meta property="og:image" content="/avatar/Roxo.png" />
                <meta property="og:description" content="Hello, I'm Alpha Bot, with a great RPG system to amuse everyone and a ranking system to make everyone active and competitive for 1st place" />
            </Head>
            <head>
                <link rel="stylesheet" href="/css/home/animations.css" />
                <link rel="stylesheet" href="/css/home/home.css" />         
            </head>
            <body>
                <section>
                    <h1 id="title">Hi I'm Alpha Bot</h1>
                    <h3 id="description">A bot with rank systems to make everyone active and competitive for 1st place</h3>
                    <a id="add-button" href={props.botInvite} target="_blank">Add me!</a>
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
            languageChangeLink: '/',
            language: 'en'
        },
        revalidate: 1800
    }
}


export default en