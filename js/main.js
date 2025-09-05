let streamPlayer = null;
let currentToken = null;
let deviceFingerprint = null;

// Generate device fingerprint
function generateDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125,1,62,20);
    ctx.fillStyle = "#069";
    ctx.fillText("device fingerprint", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("device fingerprint", 4, 17);
    
    const fingerprint = canvas.toDataURL();
    return btoa(fingerprint).substring(0, 32);
}

// Validate token with backend
async function validateToken() {
    const tokenInput = document.getElementById('tokenInput');
    const token = tokenInput.value.trim();
    
    if (!token) {
        showError('Silakan masukkan token akses');
        return;
    }
    
    deviceFingerprint = generateDeviceFingerprint();
    
    try {
        const response = await fetch(`https://bot.wproject.web.id/validate-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                device_id: deviceFingerprint
            })
        });
        
        const data = await response.json();
        
        if (data.valid) {
            currentToken = token;
            showStream();
            startStream();
        } else {
            showError(data.message || 'Token tidak valid atau sudah digunakan di device lain');
        }
    } catch (error) {
        showError('Gagal terhubung ke server validasi');
        console.error('Validation error:', error);
    }
}

// Show stream player
function showStream() {
    document.getElementById('mainContent').style.display = 'block';
    document.querySelector('.token-input').style.display = 'none';
    document.querySelector('header h1').style.display = 'none';
}

// Start streaming
function startStream() {
    if (!streamPlayer) {
        streamPlayer = new StreamPlayer();
    }
    
    const streamUrl = 'https://stream.wproject.web.id/hls/stream/index.m3u8';
    streamPlayer.initPlayer(streamUrl);
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Check token validity periodically
setInterval(async () => {
    if (currentToken && deviceFingerprint) {
        try {
            const response = await fetch(`https://bot.wproject.web.id/check-token-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: currentToken,
                    device_id: deviceFingerprint
                })
            });
            
            const data = await response.json();
            
            if (!data.valid) {
                // Token invalid, redirect to login
                location.reload();
            }
        } catch (error) {
            console.error('Token check error:', error);
        }
    }
}, 30000); // Check every 30 seconds

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (currentToken && deviceFingerprint) {
        // Notify backend that user is leaving
        navigator.sendBeacon(`https://bot.wproject.web.id/user-disconnected`, JSON.stringify({
            token: currentToken,
            device_id: deviceFingerprint
        }));
    }
});