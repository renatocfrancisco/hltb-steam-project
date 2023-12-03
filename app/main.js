// bare electron app
const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron')
const path = require('path')
const url = require('url')
const { HowLongToBeatService } = require('howlongtobeat')
const hltbService = new HowLongToBeatService()

let win

function createWindow () {
    win = new BrowserWindow({
        width: 1050,
        height: 800,
        center: true,
        maximizable: true,
        autoHideMenuBar: true,
        webPreferences: {
            // preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
    if (win === null) createWindow()
})

ipcMain.on('getGameLength', async (event, game) => {
    try {
        if(game.gameplayMain){
            event.reply('gameLengthResult', game)
            return
        }

        let results = await hltbService.search(game.name);
        if (results[0]){
            try {
                if(game.id && game.img_icon_url){
                    let gameIcon = `https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/${game.id}/${game.img_icon_url}.jpg`
                    results[0].image = gameIcon
                } else {
                    results[0].image = './img/steamitem.jpg'
                }
                results[0].id = game.id
            } catch (error) {}
            event.reply('gameLengthResult', results[0]);
        }
    } catch (error) {
        console.error('Error getting game length: ', error)
        //event.reply('gameLengthResult', null, error);
    }
});
