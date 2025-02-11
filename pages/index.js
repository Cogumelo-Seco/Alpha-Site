import { useEffect } from 'react';
import cookies from 'next-cookies';
import { useRouter } from 'next/router';
import Head from "next/head"

const load = () => {
    let cookiesProps = require('../lib/data').cookies
    let cookie = cookies(cookiesProps)

    const router = useRouter()
    useEffect(async () => {
        const textRedirecting = document.getElementById('text-redirecting')
        function addDot() {
            textRedirecting.innerText += '.'
            if (textRedirecting.innerText.length >= 20) textRedirecting.innerText = 'Redirecionando..'
        }
        setInterval(addDot, 500)
        addDot()
        router.push(cookie && cookie.language == 'en' ? '/en' : cookie && cookie.language == 'es' ? '/es' : 'br')
    })
    return (
        <html lang="pt-BR">
            <head>
                <title>Redirecionando...</title>

                <meta property="theme-color" content="#010101" />
                <meta property="og:title" content="Alpha Bot" />
                <meta property="og:site_name" content="Alpha Site" />
                <meta property="og:url" content="https://alpha-site.vercel.app/" />                
                <meta property="og:image" content="/avatar/Roxo.png" />
                <meta property="og:description" content="Olá eu sou o Alpha Bot, um bot com sistemas de rank para deixar todos ativos e competitivos para o 1° lugar" />
            </head>
            <style>{`
                header, footer {
                    display: none
                }
            `}</style>
            <body id="main">
                <h2 id="text-redirecting" style={{
                    position: 'absolute', 
                    right: '50%',
                    bottom: '50%',
                    fontSize: '20px',
                    transform: 'translateX(50%) translateY(50%)',
                }}>Redirecionando..</h2>
            </body>
        </html>
    )
}

export default load