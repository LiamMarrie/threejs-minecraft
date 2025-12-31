/**
 *
 * TODO:
 * 1. add ui interaction sfx
 * 2. walking sfx with appropriate for the dif block types
 * 3. block placing and mining
 */

const musicTracks = [
  {
    file: "../public/music/C418  - Sweden - Minecraft Volume Alpha.mp3",
    name: "Sweden",
  },
  {
    file: "../public/music/C418 - Haggstrom - Minecraft Volume Alpha.mp3",
    name: "Haggstrom",
  },
  {
    file: "../public/music/C418 - Minecraft - Minecraft Volume Alpha.mp3",
    name: "Minecraft",
  },
  {
    file: "../public/music/C418 - Subwoofer Lullaby - Minecraft Volume Alpha.mp3",
    name: "Subwoofer",
  },
];

class AudioManager {
  constructor() {
    this.currentTrack = null;
    this.audioElement = null;
    this.isPlaying = false;
    this.volume = 0.7;
    this.initialize();
  }

  initialize() {
    // audio element
    this.audioElement = new Audio();
    this.audioElement.volume = this.volume;

    // check for when song is about to end
    this.audioElement.addEventListener("ended", () => {
      this.playRandomTrack();
    });
  }

  /**
   * play random track
   */
  playRandomTrack() {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * musicTracks.length);
    } while (
      musicTracks.length > 1 &&
      this.currentTrack &&
      musicTracks[randomIndex].file === this.currentTrack.file
    );

    this.currentTrack = musicTracks[randomIndex];

    // set and play track
    this.audioElement.src = this.currentTrack.file;
    this.audioElement.load();

    // setting a slight delay before moving to next track
    setTimeout(() => {
      if (this.isPlaying) {
        this.audioElement.play().catch((error) => {
          console.warn("Audio playback error:", error);
          // if song fails to play try again
          setTimeout(() => this.playRandomTrack(), 2000);
        });
      }
    }, 2000);

    console.log(`Now playing: ${this.currentTrack.name}`);
  }

  startMusic() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.playRandomTrack();
    }
  }

  /**
   * stop playing music
   */
  stopMusic() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.audioElement.pause();
    }
  }

  /**
   * music playback
   */
  toggleMusic() {
    if (this.isPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isPlaying;
  }

  /**
   * set music volume
   * @param {number} volume - Volume 0 - 1
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.audioElement.volume = this.volume;
  }
}

// export
const audioManager = new AudioManager();
export default audioManager;
