const { ipcRenderer } = require('electron')
const { steamWebApi, steamStatic } = require('../axios.js')
const fs = require('fs');

let search = document.getElementById('search')
let sort = document.getElementById('sort')
let order = document.getElementById('order')
let searchgame = document.getElementById('searchgame')
const apiKey = document.getElementById('apikey').value
const steamId = document.getElementById('steamid').value

function orderByName(array) {
    array.sort(function (a, b) {
        let aText = a.children[1].innerText
        let bText = b.children[1].innerText
        if (aText < bText) {
            return -1
        }
        if (aText > bText) {
            return 1
        }
        return 0
    })

    return array
}

function orderByLength(array){
    array.sort(function (a, b) {
        let aLength = parseFloat(a.children[2].innerText)
        let bLength = parseFloat(b.children[2].innerText)

        if (sort.value === 'asc') {
            if(aLength < bLength) {
                return -1
            }
            if(aLength > bLength) {
                return 1
            }
            return 0
        } else {
            if(aLength > bLength) {
                return -1
            }
            if(aLength < bLength) {
                return 1
            }
            return 0
        }
    })

    return array
}

function appendFilteredGames(array){
    array.forEach(child => {
        games.appendChild(child)
    })
}

function disableElements(arrayElements, value = true){
    arrayElements.forEach(element => {
        element.disabled = value
    })
}

function createGamesJsonFile() {
    if (!fs.existsSync('games.json')) {
        fs.writeFileSync('games.json', JSON.stringify([]));
    }
}

function saveGameIntoJson(game){
    createGamesJsonFile();

    // get json file
    let games = fs.readFileSync('games.json');
    games = JSON.parse(games);

    // check if game already exists
    let exists = false;
    games.forEach(g => {
        if(g.name == game.name){
            exists = true;
        }
    });

    // if not, add it
    if(!exists){
        games.push(game);
        fs.writeFileSync('games.json', JSON.stringify(games));
    } else {
        // overwrite game with new data
        games.forEach(g => {
            if(g.name == game.name){
                g = game;
            }
        });

        fs.writeFileSync('games.json', JSON.stringify(games));
    }
}

// when window is loaded
window.onload = function() {
    createGamesJsonFile();

    // get json file
    let games = fs.readFileSync('games.json');
    games = JSON.parse(games);

    // add games to html
    games.forEach(game => {
        ipcRenderer.send('getGameLength', game)
    })
}

ipcRenderer.on('gameLengthResult', (_event, game = null ) => {
    if (game){
        let row = document.createElement('div')
        row.className = 'row'
        row.id = 'game'

        let icon = document.createElement('img')
        icon.src = game.image
        icon.className = game.image ? 'col-4' : './img/steamitem.jpg'
        icon.id = 'icon'
        row.appendChild(icon)

        let values = [game.name, game.gameplayMain, game.gameplayMainExtra, game.gameplayCompletionist]
        values.forEach(value => {
            let col = document.createElement('div')
            col.className = 'col'
            col.innerText = value
            row.appendChild(col)
        })

        document.getElementById('games').appendChild(row)
        disableElements([sort, order], false)

        // save game to json
        saveGameIntoJson(game)
    }
});

sort.addEventListener('click', function() {
    let games = document.getElementById('games')
    let children = games.children
    let childrenArray = Array.from(children)

    switch (sort.value) {
        case 'name':
            childrenArray = orderByName(childrenArray)
            appendFilteredGames(childrenArray)
            break;
        case 'length':
            orderByLength(childrenArray)
            appendFilteredGames(childrenArray)
            break;
        default:
            break;
    }
})

order.addEventListener('click', function() {
    let games = document.getElementById('games')
    let children = games.children
    let childrenArray = Array.from(children)

    childrenArray = childrenArray.reverse()
    appendFilteredGames(childrenArray)
})

search.addEventListener('click', async function() {

    disableElements([search])
    search.innerText = 'Searching...'

    cleanGamesSection()

    await steamWebApi.getOwnedGames().then(result => {
        let games = result.data.response.games

        // games with alphabetical order
        games = games.sort(function (a, b) {
            if (a.name < b.name) {
                return -1
            }
            if (a.name > b.name) {
                return 1
            }
            return 0
        })

        games.forEach(game => {

            let simplifiedGame = {
                name: game.name,
                id: game.appid,
                img_icon_url: game.img_icon_url
            }

            ipcRenderer.send('getGameLength', simplifiedGame)
        })
    }).catch(_err => {})

    disableElements([search], false)
    search.innerText = 'Refresh library'

    function cleanGamesSection() {
        let div = document.getElementById('games')
        // remove all children except first one
        while (div.childElementCount > 1) {
            div.removeChild(div.lastChild)
        }
    }
})
