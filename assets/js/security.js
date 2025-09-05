/**
 * Security Module
 * Implements client-side security measures to deter unauthorized access
 * Note: These measures are for deterrence only and can be bypassed by determined users
 */

class SecurityManager {
    constructor() {
        this.devToolsDetected = false;
        this.warningShown = false;
        this.checkInterval = null;
        this.init();
    }

    init() {
        this.disableRightClick();
        this.disableKeyboardShortcuts();
        this.startDevToolsDetection();
        this.disableTextSelection();
        this.preventImageSaving();
    }

    /**
     * Disable right-click context menu
     */
    disableRightClick() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });

        // Also disable on images specifically
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                return false;
            }
        });
    }

    /**
     * Disable common keyboard shortcuts used for developer tools
     */
    disableKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Disable F12 (Developer Tools)
            if (e.key === 'F12') {
                e.preventDefault();
                this.showWarning();
                return false;
            }

            // Disable Ctrl+Shift+I (Developer Tools)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                this.showWarning();
                return false;
            }

            // Disable Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                this.showWarning();
                return false;
            }

            // Disable Ctrl+Shift+C (Element Inspector)
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.showWarning();
                return false;
            }

            // Disable Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                this.showWarning();
                return false;
            }

            // Disable Ctrl+S (Save Page)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                return false;
            }

            // Disable Ctrl+A (Select All)
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                return false;
            }

            // Disable Ctrl+P (Print)
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                return false;
            }
        });
    }

    /**
     * Detect if developer tools are open
     * Uses multiple detection methods for better coverage
     */
    startDevToolsDetection() {
        // Method 1: Window size detection
        this.checkInterval = setInterval(() => {
            this.checkWindowSize();
            this.checkConsoleDebugger();
            this.checkPerformanceTiming();
        }, 1000);

        // Method 2: Console detection
        this.setupConsoleDetection();

        // Method 3: Debugger detection
        this.setupDebuggerDetection();
    }

    checkWindowSize() {
        const threshold = 160;
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;

        if (widthDiff > threshold || heightDiff > threshold) {
            if (!this.devToolsDetected) {
                this.devToolsDetected = true;
                this.showWarning();
            }
        } else {
            this.devToolsDetected = false;
        }
    }

    checkConsoleDebugger() {
        const start = performance.now();
        debugger;
        const end = performance.now();

        if (end - start > 100) {
            if (!this.devToolsDetected) {
                this.devToolsDetected = true;
                this.showWarning();
            }
        }
    }

    checkPerformanceTiming() {
        // Check if performance timing indicates dev tools
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            
            // Unusually long load times might indicate dev tools interference
            if (loadTime > 10000 && !this.warningShown) {
                // This is a weak indicator, so we'll be less aggressive
                console.warn('Unusual performance detected');
            }
        }
    }

    setupConsoleDetection() {
        // Override console methods to detect usage
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        console.log = (...args) => {
            this.showWarning();
            return originalLog.apply(console, args);
        };

        console.warn = (...args) => {
            this.showWarning();
            return originalWarn.apply(console, args);
        };

        console.error = (...args) => {
            this.showWarning();
            return originalError.apply(console, args);
        };
    }

    setupDebuggerDetection() {
        // Periodic debugger checks
        setInterval(() => {
            const start = Date.now();
            debugger;
            const end = Date.now();
            
            if (end - start > 100) {
                this.showWarning();
            }
        }, 3000);
    }

    /**
     * Disable text selection
     */
    disableTextSelection() {
        document.onselectstart = () => false;
        document.onmousedown = () => false;
    }

    /**
     * Prevent image saving and dragging
     */
    preventImageSaving() {
        document.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });

        // Prevent image context menu
        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
                e.preventDefault();
                return false;
            }
        });
    }

    /**
     * Show warning screen when unauthorized access is detected
     */
    showWarning() {
        if (this.warningShown) return;
        
        this.warningShown = true;
        const warningScreen = document.getElementById('warning-screen');
        const mainScreen = document.getElementById('main-screen');
        const tokenScreen = document.getElementById('token-screen');

        if (warningScreen) {
            warningScreen.classList.remove('hidden');
        }

        if (mainScreen) {
            mainScreen.classList.add('hidden');
        }

        if (tokenScreen) {
            tokenScreen.classList.add('hidden');
        }

        // Blur the page content
        document.body.style.filter = 'blur(5px)';
        document.body.style.pointerEvents = 'none';

        // Clear any intervals
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        // Log the security event (in a real application, this might be sent to a server)
        console.warn('Security violation detected at:', new Date().toISOString());
    }

    /**
     * Reset security state (used when page is refreshed)
     */
    reset() {
        this.devToolsDetected = false;
        this.warningShown = false;
        document.body.style.filter = '';
        document.body.style.pointerEvents = '';
    }

    /**
     * Cleanup method
     */
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// Initialize security manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.securityManager = new SecurityManager();
});

// Additional protection: Clear console periodically
setInterval(() => {
    if (typeof console.clear === 'function') {
        console.clear();
    }
}, 5000);

// Prevent common inspection techniques
(function() {
    'use strict';
    
    // Anti-debugging techniques
    setInterval(function() {
        const start = new Date().getTime();
        debugger;
        const end = new Date().getTime();
        
        if (end - start > 100) {
            window.location.reload();
        }
    }, 4000);

    // Prevent iframe embedding
    if (window.top !== window.self) {
        window.top.location = window.self.location;
    }

    // Basic obfuscation of sensitive functions
    const _0x1a2b = ['log', 'warn', 'error', 'debug', 'trace'];
    _0x1a2b.forEach(method => {
        console[method] = function() {};
    });
})();

