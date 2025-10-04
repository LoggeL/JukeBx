/**
 * JukeBx Music Player
 * Handles audio playback, queue management, and player controls
 */

class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.currentTrack = null;
        this.queue = [];
        this.queueIndex = -1;
        this.isPlaying = false;
        this.shuffle = false;
        this.repeat = 'none'; // 'none', 'one', 'all'
        this.volume = 0.7;
        this.listeners = new Map();
        
        this.setupAudioEvents();
        this.audio.volume = this.volume;
    }

    setupAudioEvents() {
        this.audio.addEventListener('timeupdate', () => {
            this.emit('timeupdate', {
                currentTime: this.audio.currentTime,
                duration: this.audio.duration
            });
        });

        this.audio.addEventListener('ended', () => {
            this.handleTrackEnded();
        });

        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.emit('play', this.currentTrack);
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.emit('pause', this.currentTrack);
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.emit('error', e);
        });

        this.audio.addEventListener('loadedmetadata', () => {
            this.emit('loaded', {
                duration: this.audio.duration,
                track: this.currentTrack
            });
        });
    }

    /**
     * Event emitter
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    /**
     * Play a track
     */
    async playTrack(track, fromQueue = false) {
        try {
            this.currentTrack = track;
            
            // In mock mode, we don't have real audio files
            // For demo purposes, we'll use a silent audio or placeholder
            // In production, this would be: this.audio.src = track.audioUrl;
            
            // Mock: Create a silent audio context for demo
            this.audio.src = this.createSilentAudio(track.duration);
            
            await this.audio.play();
            
            if (!fromQueue) {
                this.emit('trackchange', track);
            }
        } catch (error) {
            console.error('Error playing track:', error);
            this.emit('error', error);
        }
    }

    /**
     * Create silent audio for demo purposes
     * In production, replace this with actual audio URLs
     */
    createSilentAudio(duration) {
        // Create a data URL for a silent audio file
        // This is just for demo - replace with real audio in production
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const sampleRate = ctx.sampleRate;
        const samples = duration * sampleRate;
        const buffer = ctx.createBuffer(1, samples, sampleRate);
        
        // Create silent audio blob
        const wav = this.audioBufferToWav(buffer);
        const blob = new Blob([wav], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
    }

    /**
     * Convert AudioBuffer to WAV format
     */
    audioBufferToWav(buffer) {
        const length = buffer.length * buffer.numberOfChannels * 2 + 44;
        const arrayBuffer = new ArrayBuffer(length);
        const view = new DataView(arrayBuffer);
        const channels = [];
        let offset = 0;
        let pos = 0;

        // WAV header
        const setUint16 = (data) => {
            view.setUint16(pos, data, true);
            pos += 2;
        };
        const setUint32 = (data) => {
            view.setUint32(pos, data, true);
            pos += 4;
        };

        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8); // file length - 8
        setUint32(0x45564157); // "WAVE"
        setUint32(0x20746d66); // "fmt " chunk
        setUint32(16); // length = 16
        setUint16(1); // PCM (uncompressed)
        setUint16(buffer.numberOfChannels);
        setUint32(buffer.sampleRate);
        setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
        setUint16(buffer.numberOfChannels * 2);
        setUint16(16);
        setUint32(0x61746164); // "data" - chunk
        setUint32(length - pos - 4);

        return arrayBuffer;
    }

    /**
     * Toggle play/pause
     */
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    /**
     * Play
     */
    play() {
        if (this.currentTrack) {
            this.audio.play();
        } else if (this.queue.length > 0) {
            this.playFromQueue(0);
        }
    }

    /**
     * Pause
     */
    pause() {
        this.audio.pause();
    }

    /**
     * Stop
     */
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    /**
     * Next track
     */
    next() {
        if (this.shuffle) {
            this.playRandom();
        } else if (this.queueIndex < this.queue.length - 1) {
            this.playFromQueue(this.queueIndex + 1);
        } else if (this.repeat === 'all') {
            this.playFromQueue(0);
        }
    }

    /**
     * Previous track
     */
    previous() {
        if (this.audio.currentTime > 3) {
            // If more than 3 seconds played, restart current track
            this.audio.currentTime = 0;
        } else if (this.queueIndex > 0) {
            this.playFromQueue(this.queueIndex - 1);
        }
    }

    /**
     * Handle track ended
     */
    handleTrackEnded() {
        if (this.repeat === 'one') {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            this.next();
        }
    }

    /**
     * Seek to position (0-1)
     */
    seek(position) {
        if (this.audio.duration) {
            this.audio.currentTime = position * this.audio.duration;
        }
    }

    /**
     * Set volume (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
        this.emit('volumechange', this.volume);
    }

    /**
     * Toggle shuffle
     */
    toggleShuffle() {
        this.shuffle = !this.shuffle;
        this.emit('shufflechange', this.shuffle);
        return this.shuffle;
    }

    /**
     * Toggle repeat
     */
    toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(this.repeat);
        this.repeat = modes[(currentIndex + 1) % modes.length];
        this.emit('repeatchange', this.repeat);
        return this.repeat;
    }

    /**
     * Set queue
     */
    setQueue(tracks, startIndex = 0) {
        this.queue = tracks;
        this.queueIndex = -1;
        this.emit('queuechange', this.queue);
        
        if (tracks.length > 0) {
            this.playFromQueue(startIndex);
        }
    }

    /**
     * Add to queue
     */
    addToQueue(track) {
        this.queue.push(track);
        this.emit('queuechange', this.queue);
    }

    /**
     * Remove from queue
     */
    removeFromQueue(index) {
        if (index === this.queueIndex) {
            this.next();
        }
        this.queue.splice(index, 1);
        if (index < this.queueIndex) {
            this.queueIndex--;
        }
        this.emit('queuechange', this.queue);
    }

    /**
     * Play from queue
     */
    playFromQueue(index) {
        if (index >= 0 && index < this.queue.length) {
            this.queueIndex = index;
            this.playTrack(this.queue[index], true);
            this.emit('queueindexchange', index);
        }
    }

    /**
     * Play random track from queue
     */
    playRandom() {
        const randomIndex = Math.floor(Math.random() * this.queue.length);
        this.playFromQueue(randomIndex);
    }

    /**
     * Clear queue
     */
    clearQueue() {
        this.queue = [];
        this.queueIndex = -1;
        this.emit('queuechange', this.queue);
    }

    /**
     * Get current time
     */
    getCurrentTime() {
        return this.audio.currentTime;
    }

    /**
     * Get duration
     */
    getDuration() {
        return this.audio.duration || 0;
    }

    /**
     * Format time in MM:SS
     */
    static formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Export singleton instance
export const player = new MusicPlayer();
