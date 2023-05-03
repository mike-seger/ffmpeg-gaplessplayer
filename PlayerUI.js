export default class PlayerUI {
    constructor(playerEngine) {
        this.playerEngine = playerEngine

        this.playButton = document.getElementById('play')
        this.pauseButton = document.getElementById('pause')
        this.previousButton = document.getElementById('previous')
        this.nextButton = document.getElementById('next')
        this.progressSlider = document.getElementById('progress')
        this.progressTime = document.getElementById('progress-time')
        this.totalTime = document.getElementById('total-time')
        this.trackName = document.getElementById('track-name')

        this.playButton.addEventListener('click', () => this.playerEngine.play())
        this.pauseButton.addEventListener('click', () => this.playerEngine.pause())
        this.previousButton.addEventListener('click', () => this.playerEngine.previous())
        this.nextButton.addEventListener('click', () => this.playerEngine.next())
        this.progressSlider.addEventListener('input', () => this.playerEngine.seek(parseFloat(this.progressSlider.value)))

        this.previousTrackIndex = -1

        this.updateUI()
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    updateUI() {
        const duration = this.playerEngine.getDuration()
        if(duration > 0) {
            const currentTime = this.playerEngine.getCurrentTime()
        
            // Add this condition to check if the current track is the last track
            if (currentTime >= duration && this.playerEngine.currentTrackIndex === this.playerEngine.playlist.length - 1) {
                // Uncomment the line below to restart the playlist from the beginning
                this.playerEngine.next()
            
                // Uncomment the line below to stop playback after the last track
                // this.playerEngine.pause()
                //return
            }
        
            const progressPercentage = (currentTime / duration) * 100
            this.progressSlider.value = progressPercentage
        
            this.progressTime.textContent = this.formatTime(currentTime)

            if(this.previousTrackIndex != this.playerEngine.currentTrackIndex) {
                this.totalTime.textContent = this.formatTime(duration)
                this.trackName.textContent = this.playerEngine.getCurrentTrackName()
                console.log(this.trackName.textContent)
                this.previousTrackIndex = this.playerEngine.currentTrackIndex
            }
        }
        requestAnimationFrame(() => this.updateUI())
      }
}
