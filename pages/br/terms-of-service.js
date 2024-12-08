import { useEffect } from 'react';
import cookies from 'next-cookies';
import { useRouter } from 'next/router';
import Head from "next/head"

const load = () => {
    const router = useRouter()
    useEffect(async () => {
        
    })
    return (
        <html lang="pt-BR">
            <head>
                <meta property="theme-color" content="#010101" />
                <meta property="og:title" content="Alpha Bot" />
                <meta property="og:site_name" content="Alpha Site" />
                <meta property="og:url" content="https://alpha-site.vercel.app/" />                
                <meta property="og:image" content="/avatar/Roxo.png" />
                <meta property="og:description" content="Olá eu sou o Alpha Bot, não tenho nada a dizer. Bom dia!" />
            </head>

            <style>{`
                h1 {
                    margin: 20px auto;
                    font-size: 25px;
                }
            `}</style>

            <body id="main">
                <h1>Não existe termos ainda, TMJ</h1>
            </body>
        </html>
    )
}

export default load