import PlayerEngine from './PlayerEngine.js'
import PlayerUI from './PlayerUI.js'

const playlist = [
	'tracks/alpha - space dream - 01. das licht - traumwelten.flac',
	'tracks/alpha - space dream - 02. vectrex - meteor (armageddon club mix).flac',
	'tracks/alpha - space dream - 03. jupiter prime - gate to heaven.flac',
	'tracks/alpha - space dream - 04. armin - communication.flac',
]

const playerEngine = new PlayerEngine(playlist);
console.log("FLAC supported: "+await playerEngine.isFlacSupported()) 
const playerUI = new PlayerUI(playerEngine)