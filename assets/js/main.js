/**
 * Main Application Controller
 * Coordinates all modules and handles the main application flow
 */

class StreamingApp {
    constructor() {
        this.currentToken = null;
        this.deviceFingerprint = null;
        this.isAuthenticated = false;
        this.retryAttempts = 0;
        this.maxRetryAttempts = 3;
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Streaming App...');

        try {
            // Show loading screen
            this.showLoadingScreen();

            // Initialize device fingerprint
            await this.initializeFingerprint();

            // Set up event listeners
            this.setupEventListeners();

            // Hide loading screen and show token input
            this.hideLoadingScreen();
            this.showTokenScreen();

            console.log('Streaming App initialized successfully');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Initialize device fingerprint
     */
    async initializeFingerprint() {
        try {
            this.deviceFingerprint = await window.deviceFingerprint.getFingerprint();
            console.log('Device fingerprint generated:', this.deviceFingerprint);
        } catch (error) {
            console.error('Failed to generate device fingerprint:', error);
            // Use a fallback fingerprint
            this.deviceFingerprint = 'fallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Token form submission
        const tokenInput = document.getElementById('token-input');
        const submitButton = document.getElementById('submit-token');

        if (tokenInput && submitButton) {
            // Submit on button click
            submitButton.addEventListener('click', () => {
                this.handleTokenSubmission();
            });

            // Submit on Enter key
            tokenInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleTokenSubmission();
                }
            });

            // Clear error message when typing
            tokenInput.addEventListener('input', () => {
                this.hideError();
            });
        }

        // Retry stream button (set up in player.js, but we can add additional handling here)
        const retryButton = document.getElementById('retry-stream');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                console.log('Manual stream retry requested');
            });
        }

        // Page visibility change (pause/resume stream when tab is hidden/visible)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Window beforeunload (cleanup)
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    /**
     * Handle token form submission
     */
    async handleTokenSubmission() {
        const tokenInput = document.getElementById('token-input');
        const submitButton = document.getElementById('submit-token');

        if (!tokenInput || !submitButton) return;

        const token = tokenInput.value.trim();

        // Validate input
        if (!token) {
            this.showError('Please enter a valid token');
            return;
        }

        if (token.length < 8) {
            this.showError('Token appears to be too short');
            return;
        }

        // Disable form during submission
        submitButton.disabled = true;
        submitButton.textContent = 'Validating...';
        tokenInput.disabled = true;

        try {
            // Validate token with backend
            const result = await window.apiClient.validateToken(token, this.deviceFingerprint);

            if (result.status === 'success') {
                // Token is valid, proceed to stream
                this.currentToken = token;
                this.isAuthenticated = true;
                await this.showStreamInterface();
            } else {
                // Token validation failed
                const errorMessage = window.apiClient.getErrorMessage(result);
                this.showError(errorMessage);

                // Check if we should allow retry
                if (window.apiClient.isRetryableError(result) && this.retryAttempts < this.maxRetryAttempts) {
                    this.retryAttempts++;
                    setTimeout(() => {
                        this.handleTokenSubmission();
                    }, 2000);
                    return;
                }
            }

        } catch (error) {
            console.error('Token validation error:', error);
            this.showError('An unexpected error occurred. Please try again.');
        } finally {
            // Re-enable form
            submitButton.disabled = false;
            submitButton.textContent = 'Access Stream';
            tokenInput.disabled = false;
            this.retryAttempts = 0;
        }
    }

    /**
     * Show the streaming interface
     */
    async showStreamInterface() {
        try {
            // Hide token screen
            this.hideTokenScreen();

            // Show main screen
            this.showMainScreen();

            // Initialize video player
            await window.streamPlayer.initializePlayer();

            // Start periodic viewer count updates (mock)
            this.startViewerCountUpdates();

            console.log('Stream interface loaded successfully');

        } catch (error) {
            console.error('Failed to load stream interface:', error);
            this.showError('Failed to load stream. Please try again.');
        }
    }

    /**
     * Handle page visibility changes
     */
    handleVisibilityChange() {
        if (!this.isAuthenticated || !window.streamPlayer.getPlayer()) return;

        if (document.hidden) {
            // Page is hidden, pause stream to save bandwidth
            console.log('Page hidden, pausing stream');
            if (window.streamPlayer.isPlaying()) {
                window.streamPlayer.getPlayer().pause();
            }
        } else {
            // Page is visible, resume stream
            console.log('Page visible, resuming stream');
            window.streamPlayer.getPlayer().play();
        }
    }

    /**
     * Start periodic viewer count updates (mock implementation)
     */
    startViewerCountUpdates() {
        // Mock viewer count that fluctuates
        let baseViewers = Math.floor(Math.random() * 100) + 50;
        
        setInterval(() => {
            const variation = Math.floor(Math.random() * 10) - 5; // -5 to +5
            const currentViewers = Math.max(1, baseViewers + variation);
            window.streamPlayer.updateViewerCount(currentViewers);
            baseViewers = currentViewers;
        }, 30000); // Update every 30 seconds

        // Initial update
        window.streamPlayer.updateViewerCount(baseViewers);
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    /**
     * Show token input screen
     */
    showTokenScreen() {
        const tokenScreen = document.getElementById('token-screen');
        if (tokenScreen) {
            tokenScreen.classList.remove('hidden');
        }
    }

    /**
     * Hide token input screen
     */
    hideTokenScreen() {
        const tokenScreen = document.getElementById('token-screen');
        if (tokenScreen) {
            tokenScreen.classList.add('hidden');
        }
    }

    /**
     * Show main streaming screen
     */
    showMainScreen() {
        const mainScreen = document.getElementById('main-screen');
        if (mainScreen) {
            mainScreen.classList.remove('hidden');
        }
    }

    /**
     * Hide main streaming screen
     */
    hideMainScreen() {
        const mainScreen = document.getElementById('main-screen');
        if (mainScreen) {
            mainScreen.classList.add('hidden');
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    /**
     * Hide error message
     */
    hideError() {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (window.streamPlayer) {
            window.streamPlayer.destroy();
        }

        if (window.securityManager) {
            window.securityManager.destroy();
        }
    }

    /**
     * Get application state
     */
    getState() {
        return {
            isAuthenticated: this.isAuthenticated,
            currentToken: this.currentToken ? '***' + this.currentToken.slice(-4) : null,
            deviceFingerprint: this.deviceFingerprint ? this.deviceFingerprint.slice(0, 8) + '...' : null
        };
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing application...');
    
    // Create global app instance
    window.streamingApp = new StreamingApp();
    
    // Initialize the app
    await window.streamingApp.init();
});

// Handle errors globally
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Expose app state for debugging (in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.getAppState = () => {
        return window.streamingApp ? window.streamingApp.getState() : null;
    };
}

