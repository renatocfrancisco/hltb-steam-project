import { HowLongToBeatService } from 'howlongtobeat'
const hltbService = new HowLongToBeatService()
import { steamWebApi, steamStoreApi } from './axios.js'

let appIds = []

steamWebApi.getOwnedGames().then(async result => {
  const games = result.data.response.games
  console.log('game;time')

  await Promise.all(
    games.map(async game => {
      await hltbService.search(game.name).then(async result => {
        if (result[0].gameplayMain === 0) {
          result[0].gameplayMain = 'less than an hour or not registered'
        }
        const name = game.name
        const time = result[0].gameplayMain
        console.log(`${name};${time}`)
      }).catch(_err => {})
      appIds.push(game.appid)
    })
  )

}).catch(_err => {})
