import PlayerEngine from './PlayerEngine.js'
import PlayerUI from './PlayerUI.js'

const playlist = [
  'tracks/alpha - space dream - 01. das licht - traumwelten.m4a',
  'tracks/alpha - space dream - 02. vectrex - meteor (armageddon club mix).m4a',
  'tracks/alpha - space dream - 03. jupiter prime - gate to heaven.m4a',
  'tracks/alpha - space dream - 04. armin - communication.m4a',
]

const playerEngine = new PlayerEngine(playlist)
const playerUI = new PlayerUI(playerEngine)