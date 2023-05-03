export default class PlayerEngine {
    constructor(playlist = []) {
      this.playlist = playlist
      this.audioContext = new AudioContext()
      this.startTime = null
      this.currentBufferSource = null
      this.currentTrackIndex = 0
      this.currentBuffer = null
      this.nextBuffer = null
    }
  
    async loadBuffer(url, callback) {
      const { createFFmpeg, fetchFile } = FFmpeg
      const ffmpeg = createFFmpeg({ log: false })
      await ffmpeg.load()
  
      const response = await fetch(url)
      const data = await response.arrayBuffer()
  
      ffmpeg.FS('writeFile', 'input.m4a', new Uint8Array(data))
  
      await ffmpeg.run('-i', 'input.m4a', '-f', 's16le', '-acodec', 'pcm_s16le', '-ar', '44100', 'output.pcm')
      const output = ffmpeg.FS('readFile', 'output.pcm')
  
      const audioData = new Int16Array(output.buffer)
      const numberOfChannels = 2
      const sampleRate = 44100
      const length = audioData.length / numberOfChannels
  
      const audioBuffer = this.audioContext.createBuffer(numberOfChannels, length, sampleRate)
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel)
        for (let i = 0; i < length; i++) {
          channelData[i] = audioData[i * numberOfChannels + channel] / 32768
        }
      }
  
      callback(audioBuffer)
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

    //   this.currentBufferSource.onended = () => {
    //     if (this.nextBuffer) {
    //       this.playBuffer(this.nextBuffer)
    //       this.currentTrackIndex++
    //       this.preloadNextTrack()
    //     }
    //   }
    }
  
    preloadNextTrack() {
      const nextIndex = (this.currentTrackIndex + this.playlist.length + 1) % this.playlist.length

      if (nextIndex < this.playlist.length) {
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
            this.currentBufferSource.stop()
            const nextIndex = (this.currentTrackIndex + this.playlist.length + offset) % this.playlist.length
            if(offset != 1 || nextIndex == 0)
                this.loadBuffer(this.playlist[nextIndex], (buffer) => {
                    this.playBuffer(buffer)
                    this.currentTrackIndex = nextIndex
                    console.log("NI1: "+this.currentTrackIndex)
                })
            else {
                this.playBuffer(this.nextBuffer)
                this.currentTrackIndex = nextIndex
                console.log("NI2: "+this.currentTrackIndex)
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
        if (this.currentBuffer && this.startTime !== null) {
            return this.audioContext.currentTime - this.startTime
        }
        return 0
    }

    getDuration() {
        if (this.currentBuffer) {
            return this.currentBuffer.duration
        }
        return 0
    }
}

  