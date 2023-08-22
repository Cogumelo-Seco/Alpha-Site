export default (ctx, canvas, state, Listener) => {
    let functions =  {
        getTextWidth: (text, font) => {
            let data = functions.textDataConvert(text)
            let width = 0
            for (let i in data) {
                if (font) ctx.font = (data[i].bold ? 'bold ' : '')+(data[i].italic ? 'italic ' : '')+font
                else ctx.font = font

                if (data[i].txt.length > 0) width += ctx.measureText(data[i].txt+' ').width
            }
            return width
        },
        textDataConvert: (text, style) => {
            let data = []
            if (text[0] != '§') data.push({ txt: text.split('§')[0], color: style || 'white', bold: false, italic: false })
            let lastStringData = {}
            text.replace(/§[a-z0-9]([^§]*)/g, (match, txt) => {
                let color = style || 'white'
                let modifierType = match.replace(txt, '')

                switch (modifierType) {
                    case '§0':
                        color = '#000000'
                        break
                    case '§1':
                        color = '#0000aa'
                        break
                    case '§2':
                        color = '#00aa00'
                        break
                    case '§3':
                        color = '#00aaaa'
                        break
                    case '§4':
                        color = '#aa0000'
                        break
                    case '§5':
                        color = '#aa00aa'
                        break
                    case '§6':
                        color = '#ffaa00'
                        break
                    case '§7':
                        color = '#aaaaaa'
                        break
                    case '§8':
                        color = '#555555'
                        break
                    case '§9':
                        color = '#5555ff'
                        break
                    case '§a':
                        color = '#55ff55'
                        break
                    case '§b':
                        color = '#55ffff'
                        break
                    case '§c':
                        color = '#ff5555'
                        break
                    case '§d':
                        color = '#ff55ff'
                        break
                    case '§e':
                        color = '#ffff55'
                        break
                    case '§f':
                        color = '#ffffff'
                        break
                    case '§g':
                        color = style || '#ffffff'
                        break
                }

                let stringData = { txt, color, bold: false, italic: false }

                if (modifierType == '§r') {
                    stringData.italic = false
                    stringData.bold = false
                    stringData.color = style || 'white'
                }
                if (modifierType == '§l') {
                    stringData.bold = true
                    stringData.color = lastStringData.color
                    stringData.italic = lastStringData.italic
                }
                if (modifierType == '§o') {
                    stringData.italic = true
                    stringData.color = lastStringData.color
                    stringData.bold = lastStringData.bold
                }

                data.push(stringData)
                lastStringData = stringData
            })
            return data
        },
        fillTextHTML: async (text, color) => {
            let data = functions.textDataConvert(text, color)
            let newText = ''
            for (let i in data) {
                newText += `<span style="color: ${data[i].color || color}; font-weight: ${data[i].bold ? 'bold' : 'normal'}; font-style: ${data[i].italic ? 'italic' : 'normal'}">${data[i].txt} </span>`
            }

            return newText
        },
        fillText: async ({ alpha, style, style2, text, x, y, add, font }, notCanvas) => {
            let data = functions.textDataConvert(text, style)

            let oldAlpha = Number(String(ctx.globalAlpha))
            ctx.globalAlpha = isNaN(Number(alpha)) ? state.alphaHUD : alpha
            for (let i in data) {
                if (font) ctx.font = (data[i].bold ? 'bold ' : '')+(data[i].italic ? 'italic ' : '')+font
                else ctx.font = font

                if (add) {
                    ctx.fillStyle = style2 || 'black'
                    ctx.fillText(data[i].txt, x+add, y+add);
                }
                ctx.fillStyle = data[i].color
                ctx.fillText(data[i].txt, x, y);

                if (data[i].txt.length > 0) x += ctx.measureText(data[i].txt+' ').width
            }
            ctx.globalAlpha = oldAlpha

            /*let data = text.split(' ')

            for (let i in data) {
                let txt = data[i]

                ctx.fillStyle = 'white'
                ctx.fillText(txt, x, y);

                x += ctx.measureText(txt+' ').width
            }
            /*let oldAlpha = Number(String(ctx.globalAlpha))
            ctx.globalAlpha = isNaN(Number(alpha)) ? state.alphaHUD : alpha
            ctx.font = font
            if (add) {
                ctx.fillStyle = style2 || 'black'
                ctx.fillText(text, x+add, y+add);
            }
            ctx.fillStyle = style || 'white'
            ctx.fillText(text, x, y);
            ctx.globalAlpha = oldAlpha*/
        }
    }

    return functions
}