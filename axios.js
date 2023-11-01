require('dotenv').config()
const axios = require('axios')

const steamWebApi = axios.create({
  baseURL: 'https://api.steampowered.com/'
})

const keySteamId = `?key=${process.env.STEAM_WEB_API_KEY}&steamid=${process.env.STEAM_USER_ID}`

steamWebApi.getOwnedGames = function () {
  return this.get(`IPlayerService/GetOwnedGames/v1/${keySteamId}&include_appinfo=true`)
}

const steamStoreApi = axios.create({
  baseURL: 'http://store.steampowered.com/api/'
})

steamStoreApi.getGameDetails = function (appId) {
  return this.get(`appdetails?appids=${appId}`)
}

module.exports = { steamWebApi, steamStoreApi }
