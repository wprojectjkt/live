/**
 * Security Module - Disabled for Testing
 * This version disables security measures for integration testing
 */

class SecurityManager {
    constructor() {
        console.log('Security Manager initialized in TEST MODE - all protections disabled');
    }

    init() {
        // All security measures disabled for testing
        console.log('Security measures disabled for testing');
    }

    showWarning() {
        // Do nothing - warnings disabled for testing
        console.log('Security warning suppressed for testing');
    }

    reset() {
        // Do nothing
    }

    destroy() {
        // Do nothing
    }
}

// Initialize security manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.securityManager = new SecurityManager();
});

console.log('Security module loaded in TEST MODE');

