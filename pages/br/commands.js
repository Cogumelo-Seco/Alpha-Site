import React, { useEffect } from 'react';
import cookies from 'next-cookies';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import Head from "next/head";

const functions = (type, ...props) => require(`../../public/js/${type}.js`).default(props)

function page(props) {
    let cookiesProps = require('../../lib/data').cookies
    let cookie = cookies(cookiesProps)

    const router = useRouter()
    require('../../lib/data').page = (props.language == 'pt' ? '/br' : '/en')+`/commands`

    useEffect(() => {
        const socket = io(props.serv, {
            withCredentials: true,
        })

        function loadState(user) {
            functions('setUser', user, router)
        }
        functions('getUser', cookie, socket, loadState, router)

        const controlPanel = document.getElementById('controlPanel');
        const controlPanelButtons = document.getElementsByClassName('controlPanel-buttons');
        const title = document.getElementById('title');
        const listElemet = document.getElementById('content');
        const searchInput = document.getElementById('searchInput');

        controlPanel.innerHTML = ''
        listElemet.innerHTML = ''
        let list = {}
        let currentCategory = null

        if (props.list.error != undefined) {
            title.innerText = `ERROR: ${props.list.error}`
        } else {
            list['All'] = []

            for (let categoryName in props.list) list[categoryName] = props.list[categoryName]

            for (let category in props.list) {                
                if (category != 'All') for (let command in props.list[category]) list['All'].push(props.list[category][command])
            }

            for (let categoryName in list) {
                const category = document.createElement('p');
                category.className = "controlPanel-buttons"
                category.id = categoryName
                category.innerHTML = `
                    <a class="categoryName">${props.language == 'pt' ? translate(categoryName) : categoryName}</a>
                    <a class="categoryAmount">${list[categoryName].length}</a>
                `
                category.addEventListener('click', (event) => {
                    tableConstruction(category.id)
                    //tableConstruction((event.path.filter(e => e.id))[0].id)
                })
                controlPanel.appendChild(category)
                if (listElemet.innerHTML == '') tableConstruction(category.id)
            }
        } 

        document.addEventListener('keyup', () => {
            tableConstruction(document.getElementById(currentCategory).id)
        })

        function tableConstruction(ElementId) {
            let Element = document.getElementById(ElementId)
            for (let Element of controlPanelButtons) Element.style.backgroundColor = 'transparent'
            Element.style.backgroundColor = '#b27bf290'

            let json = list[Element.id]

            listElemet.innerHTML = ''
            currentCategory = Element.id
            searchInput.placeholder = props.language == 'pt' ? `Procurar em ${translate(currentCategory)}` : `Search in ${currentCategory}`
            //title.innerHTML = props.language == 'pt' ? translate(Element.id) : Element.id

            for (let i in json) {
                let command = document.createElement('div');
                let commandOpenInfos = document.createElement('a');
                commandOpenInfos.className = 'commandOpenInfos down'
                commandOpenInfos.id = `commandOpenInfos-${json[i].name}`
                commandOpenInfos.innerHTML = `
                    <svg width="20" height="10">
                        <polygon fill="currentColor" points="0,-2 10,10 20,-2" style="fill: transparent; stroke: white; stroke-width: 2" />
                    </svg>
                `
                command.appendChild(commandOpenInfos)
                command.className = 'command'
                command.innerHTML += `
                    <p class="commandName" >${json[i].name}</p>
                    <p class="commandDescription" >${props.language == 'pt' ? json[i].pt : json[i].en}</p>
                    <div id="commandInfos-${json[i].name}" class="commandInfos">
                        <div class="commandInfosSynonyms">
                            <span class="commandInfosInfoName">${props.language == 'pt' ? 'Sinônimos' : 'Synonyms'}:</span>
                            <span class="commandInfosInfoDescription"><alpha-bold class="synonyms">${json[i].synonyms.split(',').join('</alpha-bold>, <alpha-bold>')}</alpha-bold></span>
                        </div>
                        ${(props.language == 'pt' ? json[i].howToUsePT : json[i].howToUseEN) ?
                            `<div class="commandInfosHowToUse">
                                <span class="commandInfosInfoName">${props.language == 'pt' ? 'Como usar' : 'How to use'}:</span>
                                <span class="commandInfosInfoDescription"><alpha-bold>${json[i].name} ${props.language == 'pt' ? json[i].howToUsePT.replace(/[<]/g, '&lt').replace(/[>]/g, '&gt') : json[i].howToUseEN.replace(/[<]/g, '&lt').replace(/[>]/g, '&gt')}</alpha-bold></span>
                            </div>                            

                            <div class="commandInfosInformation">
                                <span class="commandInfosInfoName">${props.language == 'pt' ? 'Informações' : 'Information'}:</span>
                                <span class="commandInfosInfoDescription"><alpha-bold>${props.language == 'pt' ? '&lt; &gt;</alpha-bold> - Obrigatório<br />&emsp;<alpha-bold>[ ]</alpha-bold> - Opcional' : '&lt; &gt;</alpha-bold> - Required<br />&emsp;<alpha-bold>[ ]</alpha-bold> - Optional'}
                                </span>
                            </div>
                            
                            <span class="commandInfosAlert">${props.language == 'pt' ? 'Remova os caracteres <> [] para executar os comandos!' : 'Remove the characters <> [] to run the commands'}</span>`
                        : ''}
                        ${json[i].usageExample ? 
                            `<img class="commandExempleImage" src="${json[i].usageExample}" />`
                        : ''}
                    </div>
                `

                let commandExempleImage = command.getElementsByClassName('commandExempleImage')[0]
                if (commandExempleImage) commandExempleImage.addEventListener('click', () => zoomImage(commandExempleImage.src))

                if (json[i].pt.toLowerCase().includes(searchInput.value.toLowerCase()) || json[i].synonyms.includes(searchInput.value.toLowerCase())) {
                    listElemet.appendChild(command)

                    commandOpenInfos = document.getElementById(`commandOpenInfos-${json[i].name}`)
                    if (commandOpenInfos) commandOpenInfos.addEventListener('click', () => {
                        let commandInfos = document.getElementById(`commandInfos-${json[i].name}`)
                        if (commandInfos.style.display == 'block') {
                            commandInfos.style.display = 'none'
                            commandOpenInfos.className = 'commandOpenInfos down'
                        } else {
                            const ElementsCommandInfos = document.getElementsByClassName('commandInfos');
                            const ElementsCommandOpenInfos = document.getElementsByClassName('up');
                            for (let Element of ElementsCommandInfos) Element.style.display = 'none'
                            for (let Element of ElementsCommandOpenInfos) Element.className = 'commandOpenInfos down'
                            commandInfos.style.display = 'block'
                            commandOpenInfos.className = 'commandOpenInfos up'
                        }
                    })
                }
            }
        }

        function translate(text) {
            return text
                .replace('Economy', 'Economia')
                .replace('Fun', 'Diversão')
                .replace('General', 'Geral')
                .replace('Moderation', 'Moderação')
                .replace('Utils', 'Úteis')
                .replace('All', 'Todos')
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
                <title>Alpha Site | {props.language == 'pt' ? 'Comandos' : 'Commands'}</title>

                <meta property="theme-color" content="#010101" />
                <meta property="og:title" content="Alpha Bot" />
                <meta property="og:site_name" content="Alpha Site" />
                <meta property="og:url" content="https://alpha-site.vercel.app/br/commands" />                
                <meta property="og:image" content="/avatar/Roxo.png" />
                <meta property="og:description" content="Olá eu sou o Alpha Bot, com um ótimo sistema de RPG para divertir a todos e um sistemas de rank para deixar todos ativos e competitivos para o 1° lugar!" />
            </Head>
            <head>
                <link rel="stylesheet" href="/css/commands/animations.css" />
                <link rel="stylesheet" href="/css/commands/commands.css" />
                <link rel="stylesheet" href="/css/commands/resizable.css" />            
            </head>
            <body>
                <section>
                    <div id="controlPanel" />
                    <div id="contentContaner">
                        <input id="searchInput" maxLength="100" />
                        <h1 id="title" />
                        <nav id="content" />
                    </div>
                </section>
            </body>
        </html>
    )
}

export async function getStaticProps() {
    let botInvite = process.env.botInvite
    let serv = process.env.SERVER
    let secretApi = process.env.SECRET_API;
    
    let body = { error: null }
    try {
        body = await fetch(secretApi+'/commands').catch((err) => { 
            return {
                error: err.type
            }
        })
        if (body && body.error == undefined) body = await body.json()
    } catch (err) {
        body = { error: err }
    }

    return {
        props: {
            list: body || { error: null },
            serv,
            botInvite,
            languageChangeLink: '/commands',
            language: 'pt'
        },
        revalidate: 30
    }
}

export default page