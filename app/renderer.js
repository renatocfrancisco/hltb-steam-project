const { ipcRenderer } = require('electron')
const { steamWebApi, steamStatic } = require('../axios.js')
const fs = require('fs');

let search = document.getElementById('search')
let sort = document.getElementById('sort')
let order = document.getElementById('order')
let random = document.getElementById('randomBtn')
let searchgame = document.getElementById('searchgame')
const apiKey = document.getElementById('apikey').value
const steamId = document.getElementById('steamid').value

function cleanGamesSection() {
    let div = document.getElementById('games')
    // remove all children except first one
    while (div.childElementCount > 1) {
        div.removeChild(div.lastChild)
    }
}

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
    let folder = './app/data/'
    let files = ['games.json', 'ignored.json', 'completed.json']

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    files.forEach(file => {
        if (!fs.existsSync(folder + file)) {
            fs.writeFileSync(folder + file, JSON.stringify([]));
        }
    })
}

function saveGameIntoJson(game){
    createGamesJsonFile();

    // get json file
    let gamesFile = './app/data/games.json'
    let games = fs.readFileSync(gamesFile);
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
        fs.writeFileSync(gamesFile, JSON.stringify(games));
    } else {
        // overwrite game with new data
        games.forEach(g => {
            if(g.name == game.name){
                g = game;
            }
        });

        fs.writeFileSync(gamesFile, JSON.stringify(games));
    }
}

// when window is loaded
window.onload = function() {
    createGamesJsonFile();

    // get json file
    let gamesFile = './app/data/games.json'
    let games = fs.readFileSync(gamesFile);
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
        icon.src = game.image ? game.image : './img/steamitem.jpg'
        icon.className = 'col-1'
        icon.id = 'icon'
        row.appendChild(icon)

        let values = [game.name, game.gameplayMain, game.gameplayMainExtra, game.gameplayCompletionist]
        values.forEach(value => {
            let col = document.createElement('div')
            col.className = game.name === value ? 'col-4' : 'col-1'
            if(game.name === value){
                col.id = 'gameName'
            }
            col.innerText = value
            row.appendChild(col)
        })

        let actionsDiv = document.createElement('div')
        actionsDiv.className = 'col-4'
        actionsDiv.id = 'actions'
        let extraBtns = [['Completed', 'completed'], ['Ignore it', 'ignore']]
        extraBtns.forEach(btn => {
            let extraBtn = document.createElement('button')
            extraBtn.innerText = btn[0]
            extraBtn.className = 'btn'
            extraBtn.id = btn[1]

            let icon = document.createElement('i')
            // add font awesome icon
            if (btn[1] === 'completed') {
                icon.className = 'fa-solid fa-check'
            } else {
                icon.className = 'fa-solid fa-ban'
            }
            extraBtn.appendChild(icon)

            extraBtn.dataset.name = game.name
            extraBtn.dataset.id = game.id
            actionsDiv.appendChild(extraBtn)
        })
        row.appendChild(actionsDiv)

        document.getElementById('games').appendChild(row)
        disableElements([sort, order, search, random], false)

        saveGameIntoJson(game)
        search.innerText = 'Refresh library'
    }
});

sort.addEventListener('click', function() {
    let games = document.getElementById('games')
    let children = games.children
    let childrenArray = Array.from(children)

    switch (sort.value) {
        case 'name':
            childrenArray = orderByName(childrenArray)
            cleanGamesSection()
            appendFilteredGames(childrenArray)
            break;
        case 'length':
            orderByLength(childrenArray)
            cleanGamesSection()
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
        games.forEach(game => {

            let simplifiedGame = {
                name: game.name,
                id: game.appid,
                img_icon_url: game.img_icon_url
            }

            ipcRenderer.send('getGameLength', simplifiedGame)
        })
    }).catch(_err => {})
})
