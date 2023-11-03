// bare electron app
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const { HowLongToBeatService } = require('howlongtobeat')
const hltbService = new HowLongToBeatService()

let win

function createWindow () {
    win = new BrowserWindow({ 
        width: 800,
        height: 600,
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
        const results = await hltbService.search(game.name);
        event.reply('gameLengthResult', results);   
    } catch (error) {
        event.reply('gameLengthResult', null, error);
    }
});
