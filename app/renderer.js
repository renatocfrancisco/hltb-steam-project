const { ipcRenderer } = require('electron')
const { steamWebApi } = require('../axios.js')

let search = document.getElementById('search')
const apiKey = document.getElementById('apikey').value
const steamId = document.getElementById('steamid').value

search.addEventListener('click', async function() {
    console.log('event listener')
    
    await steamWebApi.getOwnedGames(apiKey, steamId).then(result => {
        let games = result.data.response.games
        games.forEach(game => {
            ['playtime_linux_forever', 'playtime_mac_forever', 'playtime_windows_forever', 'has_community_visible_stats', 'content_descriptorids'].forEach(key => {
                delete game[key]
            })
            ipcRenderer.send('getGameLength', game)
        })
    }).catch(_err => {})
})

ipcRenderer.on('gameLengthResult', (_event, results = null, error = null ) => {
    if (error){
        console.log(error);
    } else {
        let game
        if (results.length > 0) {
            game = results[0]
            console.table(game.id, game.name, game.gameplayMain)
            const row = document.createElement('div')
            row.className = 'row'

            [game.id, game.name, game.gameplayMain].forEach(value => {
                const col = document.createElement('div')
                col.className = 'col'
                col.innerText = value
                row.appendChild(col)
            })
            document.getElementById('games').appendChild(row)
        } else {
            console.log('No results found')
        }
    }
});
