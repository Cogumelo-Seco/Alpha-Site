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
                    <a class="categoryName">${props.language == 'pt' ? translate(categoryName, 'pt') : props.language == 'es' ? translate(categoryName, 'es') : categoryName}</a>
                    <a class="categoryAmount">${list[categoryName]?.length}</a>
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
            searchInput.placeholder = props.language == 'pt' ? `Procurar em ${translate(currentCategory, 'pt')}` : props.language == 'es' ? `Buscar en ${translate(currentCategory, 'es')}` : `Search in ${currentCategory}`

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
                            <span class="commandInfosInfoName">${props.language == 'pt' ? 'Sinônimos' : props.language == 'es' ? 'Sinónimos' : 'Synonyms'}:</span>
                            <span class="commandInfosInfoDescription"><alpha-bold class="synonyms">${json[i].synonyms.split(',').join('</alpha-bold>, <alpha-bold>')}</alpha-bold></span>
                        </div>
                        ${(props.language == 'pt' ? json[i].howToUsePT : json[i].howToUseEN) ?
                            `<div class="commandInfosHowToUse">
                                <span class="commandInfosInfoName">${props.language == 'pt' ? 'Como usar' : props.language == 'es' ? 'Como usar' : 'How to use'}:</span>
                                <span class="commandInfosInfoDescription"><alpha-bold>${json[i].name} ${props.language == 'pt' ? json[i].howToUsePT.replace(/[<]/g, '&lt').replace(/[>]/g, '&gt') : json[i].howToUseEN.replace(/[<]/g, '&lt').replace(/[>]/g, '&gt')}</alpha-bold></span>
                            </div>                            

                            <div class="commandInfosInformation">
                                <span class="commandInfosInfoName">${props.language == 'pt' ? 'Informações' : props.language == 'es' ? 'Información' : 'Information'}:</span>
                                <span class="commandInfosInfoDescription"><alpha-bold>${props.language == 'pt' ? '&lt; &gt;</alpha-bold> - Obrigatório<br />&emsp;<alpha-bold>[ ]</alpha-bold> - Opcional' : props.language == 'es' ? '&lt; &gt;</alpha-bold> - Obligatorio<br />&emsp;<alpha-bold>[ ]</alpha-bold> - Opcional' : '&lt; &gt;</alpha-bold> - Required<br />&emsp;<alpha-bold>[ ]</alpha-bold> - Optional'}
                                </span>
                            </div>
                            
                            <span class="commandInfosAlert">${props.language == 'pt' ? 'Remova os caracteres <> [] para executar os comandos!' : props.language == 'es' ? '¡Elimine los caracteres <> [] para ejecutar los comandos!' : 'Remove the characters <> [] to run the commands'}</span>`
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

        function translate(text, lang) {
            return lang == 'pt' ? 
                text
                    .replace('Economy', 'Economia')
                    .replace('Fun', 'Diversão')
                    .replace('General', 'Geral')
                    .replace('Info', 'Informação')
                    .replace('Moderation', 'Moderação')
                    .replace('Utils', 'Úteis')
                    .replace('All', 'Todos')
                :
                text
                    .replace('Economy', 'Economía')
                    .replace('Fun', 'Divertido')
                    .replace('General', 'General')
                    .replace('Info', 'Información')
                    .replace('Moderation', 'Moderación')
                    .replace('Utils', 'Útil')
                    .replace('All', 'Todo')
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
                <meta property="og:description" content="Hola soy Alpha Bot, no tengo nada que decir. ¡Buen día!" />
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
    /*let secretApi = process.env.SECRET_API;
    
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
    }*/
    let list = {
      "Economy": [
        {
          "name": "banco",
          "pt": "Veja o seu saldo no banco ou o de alguém",
          "en": "See your bank balance or someone else's",
          "synonyms": "banco,bank,bal",
          "howToUsePT": "[usuário/id de usuário]",
          "howToUseEN": "[user/userID]",
          "usageExample": null
        },
        {
          "name": "caça-niquel",
          "pt": "Aposte no Caça-Níquel do Alpha",
          "en": "Bet on the Alpha slot machine",
          "synonyms": "slotmachine,slot,caçaniquel,cacaniquel,caça-niquel,caca-niquel",
          "howToUsePT": "<quantidade>",
          "howToUseEN": "<amount>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985575509293412402/unknown.png"
        },
        {
          "name": "coinflip",
          "pt": "Aposte diamantes num cara ou coroa com alguém",
          "en": "Bet diamonds on a heads or tails with someone",
          "synonyms": "coinflip,bet,apostar",
          "howToUsePT": "<usuário/id de usuário> <quantidade>",
          "howToUseEN": "<user/userID> <amount>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985576206076358706/unknown.png"
        },
        {
          "name": "crime",
          "pt": "Faça um assalto e pode conseguir entre 0A$ 1500A$",
          "en": "Make a robbery and you can get between 0A$ to 1500A$",
          "synonyms": "assaltar,assault,crime",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "daily",
          "pt": "Trabalhe e consiga entre 0 a 500 diamantes",
          "en": "Work and get between 0 to 500 diamonds",
          "synonyms": "trabalhar,daily,work",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "dep",
          "pt": "Deposite seus diamantes no banco",
          "en": "Deposit your diamonds in the bank",
          "synonyms": "dep,depositar",
          "howToUsePT": "<quantidade>",
          "howToUseEN": "<amount>",
          "usageExample": null
        },
        {
          "name": "extrair",
          "pt": "Retire diamantes do banco",
          "en": "Remove diamonds from the bank",
          "synonyms": "extrair,extract",
          "howToUsePT": "<quantidade>",
          "howToUseEN": "<amount>",
          "usageExample": null
        },
        {
          "name": "magicstone",
          "pt": "Pule o tempo para usar os comandos daily e assault",
          "en": "Skip the time to use the daily and assault",
          "synonyms": "magicstone,advance,magicstones,pedramagica",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "trocar",
          "pt": "Troque seu AlphaCoin por diamantes (a quantidade será dividida em 2)",
          "en": "Exchange your AlphaCoin for diamonds (the amount will be divided into 2)",
          "synonyms": "trocar,change",
          "howToUsePT": "<quantidade>",
          "howToUseEN": "<amount>",
          "usageExample": null
        }
      ],
      "Fun": [
        {
          "name": "abraçar",
          "pt": "De um abraço em um pessoa",
          "en": "From a hug to a person",
          "synonyms": "hug,abraço,abraco",
          "howToUsePT": "<usuário/id de usuário>",
          "howToUseEN": "<user/userID>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985576725377327174/unknown.png"
        },
        {
          "name": "beijar",
          "pt": "De um beijo em um pessoa",
          "en": "Kiss a person",
          "synonyms": "kiss,baijar",
          "howToUsePT": "<usuário/id de usuário>",
          "howToUseEN": "<user/userID>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985577142928691210/unknown.png"
        },
        {
          "name": "cachorro",
          "pt": "Envia a imagem de um cachorro",
          "en": "Send the image of a dog",
          "synonyms": "dog,cachorro",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "consolo",
          "pt": "Console um pessoa",
          "en": "Comfort a people",
          "synonyms": "comfort,consolo",
          "howToUsePT": "<usuário/id de usuário>",
          "howToUseEN": "<user/userID>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985577489806000169/unknown.png"
        },
        {
          "name": "gato",
          "pt": "Envia a imagem de um gato",
          "en": "Send the image of a cat",
          "synonyms": "cat,gato,gatinho",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "invert",
          "pt": "Inverta as cores de uma imagem",
          "en": "Invert the colors of an image",
          "synonyms": "invert,inverter",
          "howToUsePT": "<usuário/id de usuário/imagem>",
          "howToUseEN": "<user/userID/image>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985577854010003466/unknown.png"
        },
        {
          "name": "lgbt",
          "pt": "Adicione um filtro com uma bandeira LGBT em uma imagem",
          "en": "Add a filter with an LGBT flag to an image",
          "synonyms": "gay,lgbt,lgbtq",
          "howToUsePT": "<categoria> [usuário/id de usuário/imagem(link)]",
          "howToUseEN": "<category> [<user/userID/image(link)]",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985578080254951524/unknown.png"
        },
        {
          "name": "lixo",
          "pt": "Crie um meme falando que algo é lixo",
          "en": "Create a meme saying something is garbage",
          "synonyms": "lixo,trash",
          "howToUsePT": "<usuário/id de usuário/imagem>",
          "howToUseEN": "<user/userID/image>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985952388168945684/unknown.png"
        },
        {
          "name": "metadinha",
          "pt": "Junte avatares para ver a metadinha",
          "en": "Gather avatars",
          "synonyms": "metadinha",
          "howToUsePT": "<usuário 1> <usuário 2> [usuário 3] [usuário 4]",
          "howToUseEN": "<user 1> <user 2> [user 3] [user 4]",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/975558105377157130/unknown.png"
        },
        {
          "name": "panda",
          "pt": "Envia a imagem de um panda",
          "en": "Send the image of a panda",
          "synonyms": "panda",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "pedra-papel-tesoura",
          "pt": "Jogue pedra, papel e tesoura com o bot",
          "en": "Play rock, paper, scissors with the bot",
          "synonyms": "rockpaperscissors,pedrapapeltesoura,jokenpo,jankenpon,pedra-papel-tesoura,ppt,rps,rock-paper-scissors",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/1202839961901203476/image.png"
        },
        {
          "name": "pikachu",
          "pt": "Envia a imagem do pikachu",
          "en": "Send the pikachu image",
          "synonyms": "pikachu",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "pinguim",
          "pt": "Envia a imagem de um pinguim",
          "en": "Send the image of a penguin",
          "synonyms": "penguin,pingu,pinguim,pinguin",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "procurar",
          "pt": "Procure um GIF no giphy",
          "en": "Look for a GIF on giphy",
          "synonyms": "search,search,procurar,find",
          "howToUsePT": "<o que procurar>",
          "howToUseEN": "<what to look for>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985578415128182784/unknown.png"
        },
        {
          "name": "pássaro",
          "pt": "Envia a imagem de um pássaro",
          "en": "Send the image of a bird",
          "synonyms": "bird,pássaro,passaro,passarinho",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "raposa",
          "pt": "Envia a imagem de uma raposa",
          "en": "Send the image of a fox",
          "synonyms": "fox,raposa",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "rato",
          "pt": "Envia a imagem de um rato",
          "en": "Send the image of a mouse",
          "synonyms": "rat,rato,ratinho,mouse",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "redpanda",
          "pt": "Envia a imagem de um panda vermelho",
          "en": "Send the image of a red panda",
          "synonyms": "redpanda,pandavermelho",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "rir",
          "pt": "Mostre que está rindo",
          "en": "Show that you are laughing",
          "synonyms": "laughing,rir,rindo",
          "howToUsePT": "[usuário/id de usuário]",
          "howToUseEN": "[user/userID]",
          "usageExample": null
        },
        {
          "name": "roll",
          "pt": "Role um dado",
          "en": "Roll a die",
          "synonyms": "rolar,dice,dado,roll",
          "howToUsePT": "<número>",
          "howToUseEN": "<number>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/984955409376903270/unknown.png"
        },
        {
          "name": "ship",
          "pt": "Veja se um casal daria certo ou não!",
          "en": "See if a couple would do well or not!",
          "synonyms": "ship,shippar",
          "howToUsePT": "<usuário/id de usuário/mensagem> [usuário/id de usuário/mensagem]",
          "howToUseEN": "<user/userID/message> [usuário/id de usuário/mensagem]",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985579968622887003/unknown.png"
        },
        {
          "name": "tapa",
          "pt": "De um tapa em um pessoa",
          "en": "Slap people",
          "synonyms": "tapa,slap",
          "howToUsePT": "<usuário/id de usuário>",
          "howToUseEN": "<user/userID>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985580183039918182/unknown.png"
        },
        {
          "name": "tic-tac-toe",
          "pt": "Jogue o velho jogo da velha!!",
          "en": "Play the old game",
          "synonyms": "hash,jogodavelha,hashgame,velha,tic-tac-toe",
          "howToUsePT": "<usuário/id de usuário>",
          "howToUseEN": "<user/userID>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985580456898596894/unknown.png"
        },
        {
          "name": "triggered",
          "pt": "Crie uma imagem de alguém irritado",
          "en": "Create an image of someone triggered",
          "synonyms": "triggered,irritado",
          "howToUsePT": "<usuário/id de usuário/imagem>",
          "howToUseEN": "<user/userID/image>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985580808649719869/unknown.png"
        },
        {
          "name": "wasted",
          "pt": "Adicione um filtro com a legenda WASTED do GTA V",
          "en": "Add a filter with the caption WASTED from GTA V",
          "synonyms": "wasted",
          "howToUsePT": "<usuário/id de usuário/imagem> [mensagem]",
          "howToUseEN": "<user/userID/image> [message]",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985581408137396244/unknown.png"
        }
      ],
      "General": [
        {
          "name": "8ball",
          "pt": "Faça uma pergunta para o bot e ele lhe responderá",
          "en": "Ask the bot a question and he will answer you",
          "synonyms": "pergunta,8ball",
          "howToUsePT": "<uma pergunta/escolha separada por '|'>",
          "howToUseEN": "<a question/choice separated by '|'>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985581983289729094/unknown.png"
        },
        {
          "name": "calc",
          "pt": "Faz um calculo",
          "en": "Mathematical bot?",
          "synonyms": "calc,math",
          "howToUsePT": "[conta matemática]",
          "howToUseEN": "[math count]",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985582229566685234/unknown.png"
        },
        {
          "name": "casar",
          "pt": "Case-se com alguém",
          "en": "Marry someone",
          "synonyms": "marry,casar",
          "howToUsePT": "<usuário/id de usuário>",
          "howToUseEN": "<user/userID>",
          "usageExample": null
        },
        {
          "name": "divorcio",
          "pt": "Divorciar-se de alguém",
          "en": "Divorcing someone",
          "synonyms": "divórcio,divorce,divorcio",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "emoji",
          "pt": "Envia um emoji em forma de imagem",
          "en": "Send an emoji as an image",
          "synonyms": "emoji",
          "howToUsePT": "<emoji/id de emoji/nome de emoji>",
          "howToUseEN": "<emoji/emoji id/emoji name>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985582475608723546/unknown.png"
        },
        {
          "name": "ping",
          "pt": "Envia informações de latência",
          "en": "Send latency information",
          "synonyms": "ping",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        }
      ],
      "Info": [
        {
          "name": "avatar",
          "pt": "Enviar a imagem do seu avatar ou de alguém",
          "en": "Send your avatar or someone else's image",
          "synonyms": "avatar",
          "howToUsePT": "[usuário/id de usuário]",
          "howToUseEN": "[user/userID]",
          "usageExample": null
        },
        {
          "name": "badges",
          "pt": "Envia informações sobre os badges do Discord e especiais do Alpha",
          "en": "Sends information about Discord badges and Alpha specials",
          "synonyms": "badges,badgesinfo,emblemas",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "botinfo",
          "pt": "Envia informações do bot",
          "en": "Send bot information",
          "synonyms": "botinfo,bi",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "channelinfo",
          "pt": "Envia informações sobre um canal",
          "en": "Send information about an channel",
          "synonyms": "channelinfo,canalinfo,ci",
          "howToUsePT": "<canal/id de canal>",
          "howToUseEN": "<channel/channel id>",
          "usageExample": null
        },
        {
          "name": "clima",
          "pt": "Obtenha informações de clima sobre determinada cidade",
          "en": "Get weather information for a specific city",
          "synonyms": "weather,clima",
          "howToUsePT": "[nome da cidade]",
          "howToUseEN": "[name of the city]",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985582749861683261/unknown.png"
        },
        {
          "name": "emojiinfo",
          "pt": "Envia informações sobre um emoji",
          "en": "Send information about an emoji",
          "synonyms": "emojiinfo,ei",
          "howToUsePT": "<emoji/id de emoji/nome de emoji>",
          "howToUseEN": "<emoji/emoji id/emoji name>",
          "usageExample": null
        },
        {
          "name": "perfil",
          "pt": "Envia o seu perfil ou de alguém",
          "en": "Send your profile or someone else's",
          "synonyms": "perfil,profile",
          "howToUsePT": "[usuário/id de usuário]",
          "howToUseEN": "[user/userID]",
          "usageExample": null
        },
        {
          "name": "rank",
          "pt": "Exibe o seu rank ou o de alguém",
          "en": "Displays your or someone's rank",
          "synonyms": "rank,xp",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "roleinfo",
          "pt": "Exibe informações sobre um cargo",
          "en": "Displays information about a role",
          "synonyms": "roleinfo,cargoinfo,ri",
          "howToUsePT": "<cargo/id de cargo>",
          "howToUseEN": "<role/role id>",
          "usageExample": null
        },
        {
          "name": "serverinfo",
          "pt": "Envia informações sobre o servidor",
          "en": "Sends information about the server",
          "synonyms": "serverinfo,guildinfo,si",
          "howToUsePT": "[id de servidor]",
          "howToUseEN": "[server id]",
          "usageExample": null
        },
        {
          "name": "sobremim",
          "pt": "Altera o sobremim do seu perfil",
          "en": "Change your profile about me",
          "synonyms": "sobremim,aboutme",
          "howToUsePT": "<mensagem>",
          "howToUseEN": "<message>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985583077776568330/unknown.png"
        },
        {
          "name": "top",
          "pt": "Exibe os top ranks do Alpha",
          "en": "Displays Alpha Ranks",
          "synonyms": "top",
          "howToUsePT": "<rank> [número da categoria]",
          "howToUseEN": "<rank> [category number]",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985583556988387508/unknown.png"
        },
        {
          "name": "userinfo",
          "pt": "Envia informações sobre o seu usuário ou de alguém",
          "en": "Sends information about you or someone else",
          "synonyms": "userinfo,ui",
          "howToUsePT": "[usuário/id de usuário]",
          "howToUseEN": "[user/userID]",
          "usageExample": null
        }
      ],
      "Minecraft": [
        {
          "name": "mcachievement",
          "pt": "Cria uma conquista personalizada",
          "en": "Create a custom achievement",
          "synonyms": "mcachievement,minecraftachievement,mcadvancement,mcprogresso,mcconquista",
          "howToUsePT": "<mensagem>",
          "howToUseEN": "<message>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/984944849574842398/unknown.png"
        },
        {
          "name": "mcavatar",
          "pt": "Mostra a imagem frontal da cabeça de uma skin de Minecraft",
          "en": "Shows the front image of the head of a Minecraft skin",
          "synonyms": "mcavatar,minecraftavatar",
          "howToUsePT": "<nome de um usuário minecraft>",
          "howToUseEN": "<name of a minecraft user>",
          "usageExample": null
        },
        {
          "name": "mcbody",
          "pt": "Mostra a imagem do corpo de uma skin de Minecraft",
          "en": "Shows the body image of a Minecraft skin",
          "synonyms": "mcbody,minecraftbody,mccorpo,minecraftcorpo",
          "howToUsePT": "<nome de um usuário minecraft>",
          "howToUseEN": "<name of a minecraft user>",
          "usageExample": null
        },
        {
          "name": "mchead",
          "pt": "Mostra a imagem da cabeça de uma skin de Minecraft",
          "en": "Shows the head image of a Minecraft skin",
          "synonyms": "mchead,minecrafthead",
          "howToUsePT": "<nome de um usuário minecraft>",
          "howToUseEN": "<name of a minecraft user>",
          "usageExample": null
        },
        {
          "name": "mcinfo",
          "pt": "Mostra as informações de um servidor Minecraft",
          "en": "Displays information from a Minecraft server",
          "synonyms": "mcinfo,minecraftinfo",
          "howToUsePT": "<ip de um servidor minecraft>",
          "howToUseEN": "<ip of a minecraft server>",
          "usageExample": null
        },
        {
          "name": "mcplayer",
          "pt": "Mostra a imagem frontal do corpo de uma skin de Minecraft",
          "en": "Shows the front image of the body of a Minecraft skin",
          "synonyms": "mcplayer,minecraftplayer,mcjogador,minecraftjogador",
          "howToUsePT": "<nome de um usuário minecraft>",
          "howToUseEN": "<name of a minecraft user>",
          "usageExample": null
        },
        {
          "name": "mcskin",
          "pt": "Mostra a imagem de uma skin de Minecraft",
          "en": "Shows the image of a Minecraft skin",
          "synonyms": "mcskin,minecraftskin",
          "howToUsePT": "<nome de um usuário minecraft>",
          "howToUseEN": "<name of a minecraft user>",
          "usageExample": null
        },
        {
          "name": "mcuuid",
          "pt": "Mostra o UUID de um jogador de Minecraft",
          "en": "Shows the UUID of a Minecraft player",
          "synonyms": "mcuuid,minecraftuuid",
          "howToUsePT": "<nome de um usuário minecraft>",
          "howToUseEN": "<name of a minecraft user>",
          "usageExample": null
        }
      ],
      "Moderation": [
        {
          "name": "ban",
          "pt": "Bane uma pessoa do servidor",
          "en": "Ban a person from the server",
          "synonyms": "ban",
          "howToUsePT": "<usuário/id de usuário> [razão]",
          "howToUseEN": "<user/userID> [reason]",
          "usageExample": null
        },
        {
          "name": "baninfo",
          "pt": "Veja o banimento do usuário",
          "en": "Check out the user's ban information",
          "synonyms": "baninfo,checkban,infoban",
          "howToUsePT": "<usuário/id de usuário>",
          "howToUseEN": "<user/userID>",
          "usageExample": null
        },
        {
          "name": "clear",
          "pt": "Limpa determinada quantia de mensagens do chat",
          "en": "Clears a certain amount of chat messages",
          "synonyms": "limpar,clear",
          "howToUsePT": "<número de mensagens>",
          "howToUseEN": "<number of messages>",
          "usageExample": null
        },
        {
          "name": "kick",
          "pt": "Expulsa alguém do servidor",
          "en": "Kicks someone off the server",
          "synonyms": "kick",
          "howToUsePT": "<usuário/id de usuário> [razão]",
          "howToUseEN": "<user/userID> [reason]",
          "usageExample": null
        },
        {
          "name": "mute",
          "pt": "Muta uma pessoa no servidor, por Timeout",
          "en": "Mute a person on the server, by Timeout",
          "synonyms": "mute,timeout",
          "howToUsePT": "<usuário/id de usuário> <tempo> [razão]",
          "howToUseEN": "<user/userID> <time> [reason]",
          "usageExample": null
        },
        {
          "name": "slowmode",
          "pt": "Altera o modo lento do canal",
          "en": "Changes the channel's slow mode",
          "synonyms": "slow,slowmode",
          "howToUsePT": "<tempo>",
          "howToUseEN": "<time>",
          "usageExample": null
        },
        {
          "name": "unban",
          "pt": "Retira o banimento de alguém do servidor",
          "en": "Remove someone's ban from the server",
          "synonyms": "unban",
          "howToUsePT": "<usuário/id de usuário>",
          "howToUseEN": "<user/userID>",
          "usageExample": null
        },
        {
          "name": "unmute",
          "pt": "Retira o silenciamento de alguém do servidor",
          "en": "Unmute someone from the server",
          "synonyms": "unmute,untimeout",
          "howToUsePT": "<usuário/id de usuário>",
          "howToUseEN": "<user/userID>",
          "usageExample": null
        }
      ],
      "Roblox": [
        {
          "name": "rbgame",
          "pt": "Mostra informações de um jogo roblox",
          "en": "Show info for a roblox game",
          "synonyms": "rbgame,robloxgame",
          "howToUsePT": "<nome de um jogo roblox>",
          "howToUseEN": "<name of a roblox game>",
          "usageExample": null
        },
        {
          "name": "rbuser",
          "pt": "Mostra informações de um usuário roblox",
          "en": "Show information of a roblox user",
          "synonyms": "rbuser,robloxuser",
          "howToUsePT": "<nome de um jogador roblox>",
          "howToUseEN": "<name of a roblox player>",
          "usageExample": null
        }
      ],
      "RPG": [
        {
          "name": "dungeon",
          "pt": "Entre em uma dungeon e destrua monstros e torne-se forte!",
          "en": "Enter a dungeon and destroy monsters and become strong!",
          "synonyms": "dungeon,masmorra",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985341789680594964/unknown.png"
        },
        {
          "name": "inventário",
          "pt": "Veja o que você tem em seu inventário ou o de outra pessoa",
          "en": "See what you have in your inventory or someone else's",
          "synonyms": "inventário,inventory,inv",
          "howToUsePT": "[usuário/id de usuário]",
          "howToUseEN": "[user/userID]",
          "usageExample": null
        },
        {
          "name": "status",
          "pt": "Veja suas informações no RPG, ou o de outra pessoa",
          "en": "See your information in RPG, or someone else's",
          "synonyms": "status",
          "howToUsePT": "[usuário/id de usuário]",
          "howToUseEN": "[user/userID]",
          "usageExample": null
        },
        {
          "name": "vila",
          "pt": "Visite a vila para comprar itens e descansar",
          "en": "Visit the village to buy items and rest",
          "synonyms": "village,vila",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985560580624642128/unknown.png"
        }
      ],
      "Utils": [
        {
          "name": "addemoji",
          "pt": "Adicione um emoji no servidor",
          "en": "Add an emoji on the server",
          "synonyms": "addemoji,adcemoji,adicionaremoji",
          "howToUsePT": "<imagem> [nome do emoji]",
          "howToUseEN": "<image> [emoji name]",
          "usageExample": null
        },
        {
          "name": "binary",
          "pt": "Converta um código binario em uma mensagem ou uma mensagem em código binario",
          "en": "Convert a binary code to a message or a message to binary code",
          "synonyms": "binary,binário,binario",
          "howToUsePT": "<codificar/decodificar> <mensagem/código binario>",
          "howToUseEN": "<encode/decode> <message/binary code>",
          "usageExample": null
        },
        {
          "name": "cor",
          "pt": "Mude a cor do seu perfil, userinfo, banco, avatar, rank...",
          "en": "Change the color of your profile, userinfo, bank, avatar, rank...",
          "synonyms": "cor,color",
          "howToUsePT": "<cor>",
          "howToUseEN": "<color>",
          "usageExample": null
        },
        {
          "name": "deluser",
          "pt": "Limpa todos os dados do usuário",
          "en": "Clear all user data",
          "synonyms": "deluser,cleardata,limpardados",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "help",
          "pt": "Envia informações sobre um comando",
          "en": "Send information about a command",
          "synonyms": "help,ajuda,cmd",
          "howToUsePT": "<comando>",
          "howToUseEN": "<command>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985584026368741406/unknown.png"
        },
        {
          "name": "language",
          "pt": "Altere a linguagem do bot",
          "en": "Change the bot language",
          "synonyms": "language,linguagem,lang",
          "howToUsePT": "<linguagem>",
          "howToUseEN": "<language>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985583300838064128/unknown.png"
        },
        {
          "name": "link",
          "pt": "Obtenha links relacionados a mim",
          "en": "Get links related to me",
          "synonyms": "convite,invite,vote,support,website,votar,link,links",
          "howToUsePT": null,
          "howToUseEN": null,
          "usageExample": null
        },
        {
          "name": "moeda",
          "pt": "Saiba a cotação de uma moeda",
          "en": "Find out a currency quote",
          "synonyms": "money,moeda",
          "howToUsePT": "<moéda1> <moéda2>",
          "howToUseEN": "<currency1> <currency2>",
          "usageExample": "https://cdn.discordapp.com/attachments/912493391927988236/985584296842629180/unknown.png"
        }
      ]
    }

    return {
        props: {
            list,
            serv,
            botInvite,
            languageChangeLink: '/commands',
            language: 'es'
        },
        revalidate: 30
    }
}

export default page