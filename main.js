const hltb = require('howlongtobeat')
const hltbService = new hltb.HowLongToBeatService()
const { steamWebApi, steamStoreApi } = require('./axios.js')

steamWebApi.getOwnedGames().then(async result => {
  const games = result.data.response.games
  console.log('game;time;release_date')
  games.forEach(async game => {
    await hltbService.search(game.name).then(async result => {
      if (result[0].gameplayMain === 0) {
        result[0].gameplayMain = 'less than an hour or not registered'
      }
      const name = game.name
      const time = result[0].gameplayMain

      const releaseDate = await steamStoreApi.getGameDetails(game.appid).then(result => {
        return result.data[game.appid].data.release_date.date
      }).catch(_err => {
        return 'error'
      })

      console.log(name + ';' + time + ';' + releaseDate)
    }).catch(_err => {})
  })
}).catch(_err => {})
