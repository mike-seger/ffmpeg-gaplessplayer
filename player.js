const playlist = [
  'tracks/alpha - space dream - 01. das licht - traumwelten.m4a',
  'tracks/alpha - space dream - 02. vectrex - meteor (armageddon club mix).m4a',
  'tracks/alpha - space dream - 03. jupiter prime - gate to heaven.m4a',
]

const audioContext = new AudioContext()
let startTime = null;
let currentBufferSource = null
let currentTrackIndex = 0
let currentBuffer = null
let nextBuffer = null 

function formatTime(milliseconds) {
  const seconds = milliseconds / 1000
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

async function loadBuffer(url, callback) {
  const { createFFmpeg, fetchFile } = FFmpeg;
  const ffmpeg = createFFmpeg({ log: false });
  await ffmpeg.load();

  const response = await fetch(url);
  const data = await response.arrayBuffer();

  ffmpeg.FS('writeFile', 'input.m4a', new Uint8Array(data));

  await ffmpeg.run('-i', 'input.m4a', '-f', 's16le', '-acodec', 'pcm_s16le', '-ar', '44100', 'output.pcm');
  const output = ffmpeg.FS('readFile', 'output.pcm');

  const audioData = new Int16Array(output.buffer);
  const numberOfChannels = 2;
  const sampleRate = 44100;
  const length = audioData.length / numberOfChannels;

  const audioBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      channelData[i] = audioData[i * numberOfChannels + channel] / 32768;
    }
  }

  callback(audioBuffer);
}

function playBuffer(buffer) {
  if (currentBufferSource) {
    currentBufferSource.stop()
  }

  currentBuffer = buffer
  currentBufferSource = audioContext.createBufferSource()
  currentBufferSource.buffer = currentBuffer
  currentBufferSource.connect(audioContext.destination)

  startTime = audioContext.currentTime;
  currentBufferSource.start(startTime);
 //currentBufferSource.start()
  updateProgress()

  console.log(currentTrackIndex)
  currentTrackIndex = currentTrackIndex % playlist.length
  if (currentTrackIndex < 0) currentTrackIndex = 0
  trackName.textContent = playlist[currentTrackIndex]
    .replace(/.* - [0-9][0-9]\. /, '')
    .replace(/\.(m4a|mp3|flac)$/, "")

  currentBufferSource.onended = () => {
    if (nextBuffer) {
      playBuffer(nextBuffer)
      currentTrackIndex++
      preloadNextTrack()
    }
  };
}

function preloadNextTrack() {
  if (currentTrackIndex + 1 < playlist.length) {
    loadBuffer(playlist[currentTrackIndex + 1], (buffer) => {
      nextBuffer = buffer
    });
  } else {
    nextBuffer = null
  }
}

const playButton = document.getElementById('play')
const pauseButton = document.getElementById('pause')
const previousButton = document.getElementById('previous')
const nextButton = document.getElementById('next')
const progressSlider = document.getElementById('progress')
const progressTime = document.getElementById('progress-time')
const totalTime = document.getElementById('total-time')
const trackName = document.getElementById('track-name')

playButton.addEventListener('click', () => {
  if (!currentBufferSource) {
    loadBuffer(playlist[currentTrackIndex], (buffer) => {
      playBuffer(buffer);
      preloadNextTrack();
    });
  } else {
    audioContext.resume();
    updateProgress();
  }
});

pauseButton.addEventListener('click', () => {
  if (currentBufferSource) {
    audioContext.suspend();
  }
});

nextButton.addEventListener('click', () => {
  if (currentBufferSource) {
    currentBufferSource.stop();
    currentTrackIndex++;
    currentTrackIndex %= playlist.length;
    playBuffer(nextBuffer);
    preloadNextTrack();
  }
});

previousButton.addEventListener('click', () => {
  if (currentBufferSource) {
    currentBufferSource.stop();
    currentTrackIndex = (currentTrackIndex + playlist.length - 1) % playlist.length;
    loadBuffer(playlist[currentTrackIndex], (buffer) => {
      playBuffer(buffer);
      preloadNextTrack();
    });
  }
});

function updateProgress() {
  if (!currentBuffer || !currentBufferSource || startTime === null) return;
  const currentTime = audioContext.currentTime - startTime;
  const duration = currentBuffer.duration;

  if (currentTime >= duration) {
    return;
  }

  const progressPercentage = (currentTime / duration) * 100;
  progressSlider.value = progressPercentage;

  const currentHours = Math.floor(currentTime / 3600);
  const currentMinutes = Math.floor((currentTime % 3600) / 60);
  const currentSeconds = Math.floor(currentTime % 60);
  const durationHours = Math.floor(duration / 3600);
  const durationMinutes = Math.floor((duration % 3600) / 60);
  const durationSeconds = Math.floor(duration % 60);

  progressTime.textContent = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')}`;
  totalTime.textContent = `${durationHours.toString().padStart(2, '0')}:${durationMinutes.toString().padStart(2, '0')}:${durationSeconds.toString().padStart(2, '0')}`;

  if (audioContext.state === 'running') {
    requestAnimationFrame(updateProgress);
  }
}

progressSlider.addEventListener('input', () => {
  if (currentBufferSource && currentBuffer) {
    const progress = parseFloat(progressSlider.value);
    const seekTime = (progress / 100) * currentBuffer.duration;

    startTime = audioContext.currentTime - seekTime;
    
    // Remove the onended event listener
    currentBufferSource.onended = null;
    
    currentBufferSource.stop();
    currentBufferSource = audioContext.createBufferSource();
    currentBufferSource.buffer = currentBuffer;
    currentBufferSource.connect(audioContext.destination);
    currentBufferSource.start(audioContext.currentTime, seekTime);

    // Reattach the onended event listener
    currentBufferSource.onended = () => {
      if (nextBuffer) {
        playBuffer(nextBuffer);
        currentTrackIndex++;
        preloadNextTrack();
      }
    };
  }
});
