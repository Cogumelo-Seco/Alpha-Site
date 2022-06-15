import Link from 'next/link'
import Head from "next/head"

function Err() {
    return (
        <html lang="pt-BR">
            <head>
                <meta property="theme-color" content="rgb(92, 0, 92)" />
                <title>404 | Página não encontrada</title>

                <link rel="stylesheet" href="/css/_404/animations.css" />
                <link rel="stylesheet" href="/css/_404/404.css" />
            </head>
            <body>
                <section>
                    <div id="content">
                        <div id="description">Page not found</div>
                        <div id="number">404</div>
                        <Link href="/">
                            <a id="err-main-button">Home</a>
                        </Link>
                    </div>
                </section>
            </body>
        </html>
    )
}

export default Err;