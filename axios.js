require('dotenv').config()
const axios = require('axios')

const steamWebApi = axios.create({
  baseURL: 'https://api.steampowered.com/'
})

const keySteamId = `?key=${process.env.STEAM_WEB_API_KEY}&steamid=${process.env.STEAM_USER_ID}`

steamWebApi.getOwnedGames = function () {
  return this.get(`IPlayerService/GetOwnedGames/v1/${keySteamId}&include_appinfo=true`)
}

module.exports = steamWebApi
