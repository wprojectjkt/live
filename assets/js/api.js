/**
 * API Communication Module
 * Handles communication with the Telegram bot backend for token validation
 */

class APIClient {
    constructor() {
        // Use the configured backend URL
        this.baseURL = 'https://bot.wproject.web.id';
        this.timeout = 10000; // 10 seconds timeout
        
        // Configure axios defaults
        if (typeof axios !== 'undefined') {
            axios.defaults.timeout = this.timeout;
            axios.defaults.headers.common['Content-Type'] = 'application/json';
        }
    }

    /**
     * Validate token with the backend
     * @param {string} token - Access token to validate
     * @param {string} deviceFingerprint - Device fingerprint for single-device enforcement
     * @returns {Promise<Object>} API response
     */
    async validateToken(token, deviceFingerprint) {
        try {
            const payload = {
                token: token.trim(),
                device_fingerprint: deviceFingerprint
            };

            console.log('Validating token with backend...');
            
            const response = await this._makeRequest('POST', '/validate_token', payload);
            
            console.log('Token validation response:', response.data);
            return response.data;
            
        } catch (error) {
            console.error('Token validation failed:', error);
            
            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                return {
                    status: 'error',
                    message: error.response.data?.message || 'Server error occurred',
                    reason: error.response.data?.reason || 'server_error',
                    statusCode: error.response.status
                };
            } else if (error.request) {
                // Network error
                return {
                    status: 'error',
                    message: 'Unable to connect to server. Please check your internet connection.',
                    reason: 'network_error'
                };
            } else {
                // Other error
                return {
                    status: 'error',
                    message: 'An unexpected error occurred',
                    reason: 'unknown_error'
                };
            }
        }
    }

    /**
     * Revoke a specific token
     * @param {string} token - Token to revoke
     * @returns {Promise<Object>} API response
     */
    async revokeToken(token) {
        try {
            const payload = {
                token: token.trim()
            };

            const response = await this._makeRequest('POST', '/revoke_token', payload);
            return response.data;
            
        } catch (error) {
            console.error('Token revocation failed:', error);
            return {
                status: 'error',
                message: 'Failed to revoke token',
                reason: 'revocation_error'
            };
        }
    }

    /**
     * Make HTTP request using axios or fetch as fallback
     * @private
     */
    async _makeRequest(method, endpoint, data = null) {
        const url = `${this.baseURL}${endpoint}`;
        
        // Try axios first
        if (typeof axios !== 'undefined') {
            return await axios({
                method: method,
                url: url,
                data: data,
                timeout: this.timeout,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        
        // Fallback to fetch
        return await this._fetchRequest(method, url, data);
    }

    /**
     * Fallback fetch implementation
     * @private
     */
    async _fetchRequest(method, url, data) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(`HTTP ${response.status}`);
            error.response = {
                status: response.status,
                data: errorData
            };
            throw error;
        }

        return {
            data: await response.json(),
            status: response.status
        };
    }

    /**
     * Test connection to the backend
     * @returns {Promise<boolean>} True if connection is successful
     */
    async testConnection() {
        try {
            // Try to make a simple request to test connectivity
            const response = await this._makeRequest('GET', '/');
            return true;
        } catch (error) {
            console.warn('Backend connection test failed:', error);
            return false;
        }
    }

    /**
     * Get error message for display to user
     * @param {Object} errorResponse - Error response from API
     * @returns {string} User-friendly error message
     */
    getErrorMessage(errorResponse) {
        if (!errorResponse || errorResponse.status === 'success') {
            return '';
        }

        const reason = errorResponse.reason;
        const message = errorResponse.message;

        switch (reason) {
            case 'token_not_found':
                return 'Invalid token. Please check your token and try again.';
            
            case 'token_already_in_use':
                return 'This token is already being used on another device. Each token can only be used on one device at a time.';
            
            case 'device_mismatch':
                return 'Token is registered to a different device. Please use the device that originally validated this token.';
            
            case 'token_expired':
                return 'This token has expired. Please request a new token from the Telegram bot.';
            
            case 'missing_fields':
                return 'Invalid request format. Please refresh the page and try again.';
            
            case 'network_error':
                return 'Unable to connect to the server. Please check your internet connection and try again.';
            
            case 'server_error':
                return 'Server error occurred. Please try again in a few moments.';
            
            default:
                return message || 'An error occurred. Please try again.';
        }
    }

    /**
     * Check if error is retryable
     * @param {Object} errorResponse - Error response from API
     * @returns {boolean} True if the error might be resolved by retrying
     */
    isRetryableError(errorResponse) {
        if (!errorResponse || errorResponse.status === 'success') {
            return false;
        }

        const retryableReasons = [
            'network_error',
            'server_error',
            'timeout'
        ];

        return retryableReasons.includes(errorResponse.reason);
    }
}

// Create global API client instance
window.apiClient = new APIClient();

