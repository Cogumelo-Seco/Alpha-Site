import React, { useEffect } from 'react';
import Link from 'next/link'
import Head from "next/head"
import createGame from '../public/js/404/Game.js';
import createListener from '../public/js/404/Listener.js';
import renderGame from '../public/js/404/RenderGame/index.js';


function Err() {

    useEffect(() => {
        document.getElementById('gameButton').onclick = () => {
            const canvas = document.getElementById('gameCanvas')        
            const Listener = createListener();
            const game = createGame(Listener, canvas);
            document.getElementById('gameContent').style.display = 'block'

            game.loading({ Listener })
            Listener.state.game = game
            //game.start()

            renderGame(game, Listener);
        }
    })

    return (
        <html lang="pt-BR">
            <head>
                <meta property="theme-color" content="rgb(92, 0, 92)" />
                <title>404 | Página não encontrada</title>

                <link rel="stylesheet" href="/css/_404/animations.css" />
                <link rel="stylesheet" href="/css/_404/404.css" />
            </head>
            <body id="body">
                <section>
                    <div id="content">
                        <div id="description">Page not found</div>
                        <div id="number">404</div>
                        <a className="button" href="/">Home</a>
                        <a className="button" id="gameButton">Game</a>

                        <div id="gameContent">
                            <div id="gameHUD">
                                <span id="playerScore">POINTS 100</span>
                            </div>
                            <canvas id="gameCanvas" />
                        </div>

                        <div id="mobileButtonsContaner">
                            <button className="mobileButtons" id="mobileButtonUp" />
                            <div className="mobileButtonsSeparator" />
                            <button className="mobileButtons" id="mobileButtonLeft" />
                            <button className="mobileButtons" id="mobileButtonDown" />
                            <button className="mobileButtons" id="mobileButtonRight" />
                        </div>
                    </div>
                </section>
            </body>
        </html>
    )
}

export default Err;