const hltb = require('howlongtobeat')
const hltbService = new hltb.HowLongToBeatService()
const axiosWebApi = require('./axios.js')

axiosWebApi.getOwnedGames().then(async result => {
  const games = result.data.response.games
  console.log('game;time')
  games.forEach(async game => {
    await hltbService.search(game.name).then(result => {
      if (result[0].gameplayMain === 0) {
        result[0].gameplayMain = 'less than an hour or not registered'
      }
      console.log(result[0].name + ';' + result[0].gameplayMain)
    }).catch(_err => {})
  })
}).catch(_err => {})
