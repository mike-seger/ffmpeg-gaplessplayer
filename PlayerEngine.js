export default class PlayerEngine {
	constructor(playlist = []) {
		this.playlist = playlist
		this.audioContext = new AudioContext()
		this.startTime = null
		this.currentBufferSource = null
		this.currentTrackIndex = 0
		this.currentBuffer = null
		this.loadingNext = false
		this.nextBuffer = null
	}

	async loadBuffer(url, callback) {
		try {
			const response = await fetch(url)
			const data = await response.arrayBuffer()
			this.audioContext.decodeAudioData(data, (buffer) => {
				callback(buffer)
			}, (error) => {
				console.error("Error decoding audio file:", error)
			});
		} catch (error) {
			console.error("Error loading audio file:", error)
		}
	}
		
	async isFlacSupported() {
		const audio = new Audio()
		const support = await audio.canPlayType("audio/flac")
		return support !== ""
	}	

	playBuffer(buffer) {
		if (this.currentBufferSource) {
			this.currentBufferSource.stop()
		}

		this.currentBuffer = buffer
		this.currentBufferSource = this.audioContext.createBufferSource()
		this.currentBufferSource.buffer = this.currentBuffer
		this.currentBufferSource.connect(this.audioContext.destination)

		this.startTime = this.audioContext.currentTime
		this.currentBufferSource.start(this.startTime)
		this.preloadNextTrack()
	}

	preloadNextTrack() {
		const nextIndex = (this.currentTrackIndex + this.playlist.length + 1) % this.playlist.length
		if (nextIndex < this.playlist.length) {
			if(this.loadingNext) return;
			this.nextBuffer = null
			this.loadBuffer(this.playlist[nextIndex], (buffer) => {
				this.nextBuffer = buffer
				console.log("NT1: "+nextIndex)
			})
		} else {
			this.nextBuffer = null
			console.log("NT2: "+nextIndex)
		}
	}

	play() {
		if (!this.currentBufferSource) {
			this.loadBuffer(this.playlist[this.currentTrackIndex], (buffer) => {
				this.playBuffer(buffer)
			})
		} else {
			this.audioContext.resume()
		}
	}

	pause() {
		if (this.currentBufferSource) {
			this.audioContext.suspend()
		}
	}

	moverToOffset(offset) {
		if (this.currentBufferSource) {
			this.currentBufferSource.stop();
			this.currentTrackIndex = 
				(this.currentTrackIndex + this.playlist.length + offset) % this.playlist.length
			if (offset === 1 && this.nextBuffer) {
				this.playBuffer(this.nextBuffer)
				this.preloadNextTrack()
			} else if(!this.loadingNext) {
				this.loadBuffer(this.playlist[this.currentTrackIndex], (buffer) => {
					this.playBuffer(buffer)
				})
			}
		}
	}

	next() { this.moverToOffset(1) }

	previous() { this.moverToOffset(-1) }

	seek(progress) {
		if (this.currentBufferSource && this.currentBuffer) {
			const seekTime = (progress / 100) * this.currentBuffer.duration

			this.startTime = this.audioContext.currentTime - seekTime

			// Remove the onended event listener
			this.currentBufferSource.onended = null

			this.currentBufferSource.stop()
			this.currentBufferSource = this.audioContext.createBufferSource()
			this.currentBufferSource.buffer = this.currentBuffer
			this.currentBufferSource.connect(this.audioContext.destination)
			this.currentBufferSource.start(this.audioContext.currentTime, seekTime)

			// Reattach the onended event listener
			this.currentBufferSource.onended = () => {
				console.log("track ended: ")
				this.next()
			}
		}
	}

	getCurrentTrackName() {
		return this.playlist[this.currentTrackIndex]
			.replace(/.* - [0-9][0-9]\. /, '')
			.replace(/\.(m4a|mp3|flac)$/, "")
	}

	getCurrentTime() {
		return (this.currentBuffer && this.startTime !== null)?
			this.audioContext.currentTime - this.startTime: 0
	}

	getDuration() {
		return this.currentBuffer?this.currentBuffer.duration:0
	}
}

	