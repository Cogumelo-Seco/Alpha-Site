import Router from 'next/router'
import Head from 'next/head';
import NProgress from 'nprogress';
import Link from 'next/link';
import { CookiesProvider } from "react-cookie";
Router.events.on('routeChangeStart', (url) => {
    NProgress.start()
})
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

function langButtonClick() {
    const selectLangBox = document.getElementById('selectLangBox')

    if (selectLangBox.style.display == 'flex') {
        selectLangBox.style.display = 'none'
    } else {
        selectLangBox.style.display = 'flex'
    }
}

function openCloseMobileHeader(open) {
    if (open) {
        document.getElementById('mobile-header').style.display = 'inline-block'
        document.getElementById('ofuscation').style.display = 'inline-block'
    } else {
        document.getElementById('mobile-header').style.display = 'none'
        document.getElementById('ofuscation').style.display = 'none'
    }
}

function App({ Component, pageProps }) {
    return (
        <>
            <Head>
                <link rel="shortcut icon" href="/imgs/Cogu-avatar/Default.png" />
                <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#5bbad5" />
            </Head>
            <head>
                <link rel="stylesheet" href="/css/colors.css" />
                <link rel="stylesheet" href="/css/fonts.css" />
                <link rel="stylesheet" href="/css/reset.css" />

                <link rel="stylesheet" type="text/css" href="/css/nprogress.css" />
                <link rel="stylesheet" href="/css/globalAnimations.css" />
                <link rel="stylesheet" href="/css/global.css" />

                <link rel="stylesheet" href="/css/_header/animations.css" />
                <link rel="stylesheet" href="/css/_header/header.css" />
                <link rel="stylesheet" href="/css/_header/resizable.css" />

                <link rel="stylesheet" href="/css/_footer/footer.css" />
            </head>
            <nav>
                <style jsx>{`
                    a {
                        margin: 0 10px 0 0;
                    }
                `}</style>
            </nav>

            <div id="zoom" className="zoom" onClick={(e) => e.target.id == 'zoom' ? e.target.classList.toggle('open') : null}>
                <div id="zoomContent">
                    <img id="zoomImage" src="http://localhost:3000/imgs/avatar/Default.png" />
                    <a id="openOriginal" target="_blank">{pageProps.language == 'pt' ? 'Abrir Original' : 'Open original'}</a>
                </div>
            </div>
            
            <header>
                <ul>
                    <li id="alpha-image">
                        <Link href={pageProps.language == 'pt' ? '/br' : '/en'}>
                            <img src="/imgs/avatar/Default.png" />
                        </Link>
                    </li>

                    <li className="header-buttons">
                        <a href="https://discord.gg/33Zsrg5dTc" target="_blank">{pageProps.language == 'pt' ? 'Suporte' : 'Support'}</a>
                    </li>
                    <li className="header-buttons">
                        <Link href={(pageProps.language == 'pt' ? '/br' : '/en')+'/commands'}>{pageProps.language == 'pt' ? 'Comandos' : 'Commands'}</Link>
                    </li>
                    <li className="header-buttons">
                        <a href={pageProps.botInvite} target="_blank">{pageProps.language == 'pt' ? 'Adicionar' : 'Add'}</a>
                    </li>
                    <li className="header-buttons">
                        <a href={(pageProps.language == 'pt' ? '/br' : '/en')+'/links'}>Links</a>
                    </li>

                    <div id="language">
                        <img id="lang-image" src="/imgs/language-icon.png" onClick={langButtonClick} />

                        <ul id="selectLangBox">
                            <Link href={'/br'+pageProps.languageChangeLink} >
                                <li id="languagePT">
                                    <img className="languageFlag" id="languagePTFlag" src="/imgs/brazil-flag.svg" />
                                    PT-BR
                                </li>
                            </Link>
                            <Link href={'/en'+pageProps.languageChangeLink} >
                                <li id="languageEN">
                                    <img className="languageFlag" id="languageENFlag" src="/imgs/united-states-flag.svg" />
                                    EN
                                </li>
                            </Link>
                        </ul>
                    </div>

                    <li className="open-close-button">
                        <img src="/imgs/bars.png" onClick={() => openCloseMobileHeader(true)} />
                    </li>

                </ul>

                <div id="ofuscation" onClick={() => openCloseMobileHeader(false)}/>
                <div id="mobile-header">
                    <li className="open-close-button">
                        <img src="/imgs/x.png" onClick={() => openCloseMobileHeader(false)} />
                    </li>              

                    <li className="header-buttons">
                        <a href="https://discord.gg/33Zsrg5dTc" target="_blank">{pageProps.language == 'pt' ? 'Suporte' : 'Support'}</a>
                    </li>
                    <li className="header-buttons" onClick={() => openCloseMobileHeader(false)}>
                        <Link href={(pageProps.language == 'pt' ? '/br' : '/en')+'/commands'}>{pageProps.language == 'pt' ? 'Comandos' : 'Commands'}</Link>
                    </li>
                    <li className="header-buttons" onClick={() => openCloseMobileHeader(false)}>
                        <Link href={(pageProps.language == 'pt' ? '/br' : '/en')+'/dashboard'}>Dashboard</Link>
                    </li>
                    <li className="header-buttons">
                        <a href={pageProps.botInvite} target="_blank">{pageProps.language == 'pt' ? 'Adicionar' : 'Add'}</a>
                    </li>
                    <li className="header-buttons" onClick={() => openCloseMobileHeader(false)}>
                        <a href={(pageProps.language == 'pt' ? '/br' : '/en')+'/links'}>Links</a>
                    </li>
                </div>
            </header>

            <CookiesProvider>
                <Component {...pageProps} />
            </CookiesProvider>

            <footer>
                <p onClick={() => open('https://github.com/Cogumelo-Seco')} >{pageProps.language == 'pt' ? 'Feito por Cogu 💜' : 'Made by Cogu 💜'}</p>
            </footer>
        </>
    )
}

export default App