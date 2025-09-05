/**
 * Device Fingerprinting Module
 * Generates a unique device fingerprint for single-device token enforcement
 */

class DeviceFingerprint {
    constructor() {
        this.fingerprint = null;
        this.fpPromise = null;
    }

    /**
     * Initialize FingerprintJS and generate device fingerprint
     * @returns {Promise<string>} Device fingerprint hash
     */
    async generateFingerprint() {
        if (this.fingerprint) {
            return this.fingerprint;
        }

        if (this.fpPromise) {
            return this.fpPromise;
        }

        this.fpPromise = this._createFingerprint();
        this.fingerprint = await this.fpPromise;
        return this.fingerprint;
    }

    /**
     * Create device fingerprint using multiple methods
     * @private
     */
    async _createFingerprint() {
        try {
            // Method 1: Use FingerprintJS if available
            if (typeof FingerprintJS !== 'undefined') {
                const fp = await FingerprintJS.load();
                const result = await fp.get();
                return result.visitorId;
            }

            // Method 2: Fallback to custom fingerprinting
            return this._generateCustomFingerprint();
        } catch (error) {
            console.warn('FingerprintJS failed, using fallback method:', error);
            return this._generateCustomFingerprint();
        }
    }

    /**
     * Generate custom device fingerprint using browser characteristics
     * @private
     */
    _generateCustomFingerprint() {
        const components = [];

        // Screen information
        components.push(screen.width);
        components.push(screen.height);
        components.push(screen.colorDepth);
        components.push(screen.pixelDepth);

        // Browser information
        components.push(navigator.userAgent);
        components.push(navigator.language);
        components.push(navigator.languages ? navigator.languages.join(',') : '');
        components.push(navigator.platform);
        components.push(navigator.cookieEnabled);
        components.push(navigator.doNotTrack || '');

        // Timezone
        components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
        components.push(new Date().getTimezoneOffset());

        // Hardware information
        components.push(navigator.hardwareConcurrency || 0);
        components.push(navigator.deviceMemory || 0);

        // WebGL information
        const webglInfo = this._getWebGLInfo();
        components.push(webglInfo.vendor);
        components.push(webglInfo.renderer);

        // Canvas fingerprint
        components.push(this._getCanvasFingerprint());

        // Audio context fingerprint
        components.push(this._getAudioFingerprint());

        // Local storage test
        components.push(this._getStorageFingerprint());

        // Combine all components and create hash
        const fingerprint = components.join('|');
        return this._hashString(fingerprint);
    }

    /**
     * Get WebGL information for fingerprinting
     * @private
     */
    _getWebGLInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                return { vendor: '', renderer: '' };
            }

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            return {
                vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : '',
                renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : ''
            };
        } catch (e) {
            return { vendor: '', renderer: '' };
        }
    }

    /**
     * Generate canvas fingerprint
     * @private
     */
    _getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = 200;
            canvas.height = 50;
            
            // Draw text with different styles
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Device Fingerprint', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Device Fingerprint', 4, 17);

            // Draw some shapes
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgb(255,0,255)';
            ctx.beginPath();
            ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgb(0,255,255)';
            ctx.beginPath();
            ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            return canvas.toDataURL();
        } catch (e) {
            return '';
        }
    }

    /**
     * Generate audio context fingerprint
     * @private
     */
    _getAudioFingerprint() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();
            const gainNode = audioContext.createGain();
            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

            oscillator.type = 'triangle';
            oscillator.frequency.value = 10000;

            gainNode.gain.value = 0;

            oscillator.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start();

            const fingerprint = analyser.frequencyBinCount.toString();
            
            oscillator.stop();
            audioContext.close();

            return fingerprint;
        } catch (e) {
            return '';
        }
    }

    /**
     * Test local storage capabilities
     * @private
     */
    _getStorageFingerprint() {
        try {
            const testKey = '_fp_test';
            const testValue = 'test';
            
            // Test localStorage
            let localStorageSupport = false;
            try {
                localStorage.setItem(testKey, testValue);
                localStorageSupport = localStorage.getItem(testKey) === testValue;
                localStorage.removeItem(testKey);
            } catch (e) {
                localStorageSupport = false;
            }

            // Test sessionStorage
            let sessionStorageSupport = false;
            try {
                sessionStorage.setItem(testKey, testValue);
                sessionStorageSupport = sessionStorage.getItem(testKey) === testValue;
                sessionStorage.removeItem(testKey);
            } catch (e) {
                sessionStorageSupport = false;
            }

            // Test indexedDB
            const indexedDBSupport = !!window.indexedDB;

            return `${localStorageSupport}|${sessionStorageSupport}|${indexedDBSupport}`;
        } catch (e) {
            return '';
        }
    }

    /**
     * Create a simple hash from string
     * @private
     */
    _hashString(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(36);
    }

    /**
     * Get stored fingerprint from localStorage (if available)
     */
    getStoredFingerprint() {
        try {
            return localStorage.getItem('device_fingerprint');
        } catch (e) {
            return null;
        }
    }

    /**
     * Store fingerprint in localStorage (if available)
     */
    storeFingerprint(fingerprint) {
        try {
            localStorage.setItem('device_fingerprint', fingerprint);
        } catch (e) {
            // localStorage not available, fingerprint will be regenerated each time
        }
    }

    /**
     * Get or generate device fingerprint
     * @returns {Promise<string>}
     */
    async getFingerprint() {
        // Try to get stored fingerprint first
        const stored = this.getStoredFingerprint();
        if (stored) {
            this.fingerprint = stored;
            return stored;
        }

        // Generate new fingerprint
        const fingerprint = await this.generateFingerprint();
        
        // Store for future use
        this.storeFingerprint(fingerprint);
        
        return fingerprint;
    }
}

// Create global instance
window.deviceFingerprint = new DeviceFingerprint();

