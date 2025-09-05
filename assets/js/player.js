/**
 * Video Player Module
 * Handles HLS video streaming using Video.js
 */

class StreamPlayer {
    constructor() {
        this.player = null;
        this.streamUrl = 'https://stream.wproject.web.id/hls/stream/index.m3u8';
        this.isInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.retryDelay = 5000; // 5 seconds
    }

    /**
     * Initialize the video player
     */
    async initializePlayer() {
        if (this.isInitialized) {
            return;
        }

        try {
            // Wait for Video.js to be available
            if (typeof videojs === 'undefined') {
                throw new Error('Video.js not loaded');
            }

            // Initialize Video.js player
            this.player = videojs('video-player', {
                fluid: true,
                responsive: true,
                controls: true,
                preload: 'auto',
                autoplay: true,
                muted: true, // Start muted to allow autoplay
                playbackRates: [0.5, 1, 1.25, 1.5, 2],
                html5: {
                    vhs: {
                        overrideNative: true,
                        enableLowInitialPlaylist: true,
                        smoothQualityChange: true,
                        useBandwidthFromLocalStorage: true
                    }
                },
                techOrder: ['html5'],
                sources: [{
                    src: this.streamUrl,
                    type: 'application/x-mpegURL'
                }]
            });

            // Set up event listeners
            this.setupEventListeners();

            this.isInitialized = true;
            console.log('Video player initialized successfully');

        } catch (error) {
            console.error('Failed to initialize video player:', error);
            this.showStreamError();
        }
    }

    /**
     * Set up video player event listeners
     */
    setupEventListeners() {
        if (!this.player) return;

        // Player ready
        this.player.ready(() => {
            console.log('Player is ready');
            this.hideStreamError();
            
            // Try to unmute after user interaction
            this.setupUnmuteOnInteraction();
        });

        // Loading start
        this.player.on('loadstart', () => {
            console.log('Stream loading started');
            this.updateStreamStatus('connecting');
        });

        // Can play
        this.player.on('canplay', () => {
            console.log('Stream can play');
            this.updateStreamStatus('live');
            this.hideStreamError();
            this.retryCount = 0; // Reset retry count on success
        });

        // Playing
        this.player.on('playing', () => {
            console.log('Stream is playing');
            this.updateStreamStatus('live');
            this.hideStreamError();
        });

        // Waiting/buffering
        this.player.on('waiting', () => {
            console.log('Stream is buffering');
            this.updateStreamStatus('buffering');
        });

        // Error handling
        this.player.on('error', (error) => {
            console.error('Player error:', error);
            this.handleStreamError();
        });

        // Ended (shouldn't happen for live streams)
        this.player.on('ended', () => {
            console.log('Stream ended');
            this.updateStreamStatus('offline');
            this.showStreamError();
        });

        // Volume change
        this.player.on('volumechange', () => {
            const volume = this.player.volume();
            const muted = this.player.muted();
            console.log(`Volume: ${volume}, Muted: ${muted}`);
        });

        // Quality change (if available)
        this.player.on('resolutionchange', () => {
            const currentResolution = this.player.currentResolution();
            console.log('Resolution changed:', currentResolution);
            this.updateStreamQuality(currentResolution);
        });
    }

    /**
     * Set up unmute on user interaction
     */
    setupUnmuteOnInteraction() {
        const unmuteOnInteraction = () => {
            if (this.player && this.player.muted()) {
                this.player.muted(false);
                console.log('Player unmuted after user interaction');
            }
            
            // Remove listeners after first interaction
            document.removeEventListener('click', unmuteOnInteraction);
            document.removeEventListener('keydown', unmuteOnInteraction);
            document.removeEventListener('touchstart', unmuteOnInteraction);
        };

        document.addEventListener('click', unmuteOnInteraction);
        document.addEventListener('keydown', unmuteOnInteraction);
        document.addEventListener('touchstart', unmuteOnInteraction);
    }

    /**
     * Handle stream errors
     */
    handleStreamError() {
        console.error('Stream error occurred');
        this.updateStreamStatus('error');
        
        if (this.retryCount < this.maxRetries) {
            console.log(`Retrying stream connection (${this.retryCount + 1}/${this.maxRetries})`);
            setTimeout(() => {
                this.retryStream();
            }, this.retryDelay);
        } else {
            console.error('Max retries reached, showing error screen');
            this.showStreamError();
        }
    }

    /**
     * Retry stream connection
     */
    retryStream() {
        if (!this.player) return;

        this.retryCount++;
        console.log(`Retrying stream connection (attempt ${this.retryCount})`);

        try {
            // Reset the source
            this.player.src({
                src: this.streamUrl,
                type: 'application/x-mpegURL'
            });

            // Try to load and play
            this.player.load();
            this.player.play();

        } catch (error) {
            console.error('Retry failed:', error);
            this.handleStreamError();
        }
    }

    /**
     * Update stream status indicator
     */
    updateStreamStatus(status) {
        const indicator = document.getElementById('stream-indicator');
        const statusText = indicator?.querySelector('.status-text');
        const statusDot = indicator?.querySelector('.status-dot');

        if (!indicator || !statusText || !statusDot) return;

        // Remove existing status classes
        indicator.classList.remove('live', 'connecting', 'buffering', 'error', 'offline');
        
        switch (status) {
            case 'live':
                indicator.classList.add('live');
                statusText.textContent = 'LIVE';
                statusDot.style.background = '#ef4444';
                break;
            case 'connecting':
                indicator.classList.add('connecting');
                statusText.textContent = 'CONNECTING';
                statusDot.style.background = '#f59e0b';
                break;
            case 'buffering':
                indicator.classList.add('buffering');
                statusText.textContent = 'BUFFERING';
                statusDot.style.background = '#f59e0b';
                break;
            case 'error':
                indicator.classList.add('error');
                statusText.textContent = 'ERROR';
                statusDot.style.background = '#ef4444';
                break;
            case 'offline':
                indicator.classList.add('offline');
                statusText.textContent = 'OFFLINE';
                statusDot.style.background = '#6b7280';
                break;
        }
    }

    /**
     * Update stream quality display
     */
    updateStreamQuality(quality) {
        const qualityElement = document.getElementById('stream-quality');
        if (qualityElement && quality) {
            qualityElement.textContent = quality.label || 'Auto';
        }
    }

    /**
     * Show stream error overlay
     */
    showStreamError() {
        const errorOverlay = document.getElementById('stream-error');
        if (errorOverlay) {
            errorOverlay.classList.remove('hidden');
        }

        // Set up retry button
        const retryButton = document.getElementById('retry-stream');
        if (retryButton) {
            retryButton.onclick = () => {
                this.hideStreamError();
                this.retryCount = 0; // Reset retry count
                this.retryStream();
            };
        }
    }

    /**
     * Hide stream error overlay
     */
    hideStreamError() {
        const errorOverlay = document.getElementById('stream-error');
        if (errorOverlay) {
            errorOverlay.classList.add('hidden');
        }
    }

    /**
     * Update viewer count (mock implementation)
     */
    updateViewerCount(count) {
        const viewerElement = document.getElementById('viewer-count');
        if (viewerElement) {
            viewerElement.textContent = `${count} viewer${count !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Destroy the player
     */
    destroy() {
        if (this.player) {
            this.player.dispose();
            this.player = null;
            this.isInitialized = false;
        }
    }

    /**
     * Get player instance
     */
    getPlayer() {
        return this.player;
    }

    /**
     * Check if player is playing
     */
    isPlaying() {
        return this.player && !this.player.paused();
    }

    /**
     * Get current time
     */
    getCurrentTime() {
        return this.player ? this.player.currentTime() : 0;
    }

    /**
     * Get duration (for live streams, this might not be meaningful)
     */
    getDuration() {
        return this.player ? this.player.duration() : 0;
    }
}

// Create global player instance
window.streamPlayer = new StreamPlayer();

