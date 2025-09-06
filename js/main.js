document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const tokenModal = new bootstrap.Modal(document.getElementById('tokenModal'));
    const tokenInput = document.getElementById('tokenInput');
    const verifyTokenBtn = document.getElementById('verifyTokenBtn');
    const tokenError = document.getElementById('tokenError');
    const mainContainer = document.querySelector('.main-container');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshStreamBtn = document.getElementById('refreshStreamBtn');
    const qualityOptions = document.querySelectorAll('.quality-option');
    const qualityDropdown = document.getElementById('qualityDropdown');
    const downloadCard = document.getElementById('downloadCard');
    const downloadLink = document.getElementById('downloadLink');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const notificationToast = new bootstrap.Toast(document.getElementById('notificationToast'));
    const toastMessage = document.getElementById('toastMessage');
    
    // Initialize video player
    const player = videojs('videoPlayer', {
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        html5: {
            hls: {
                withCredentials: true
            }
        }
    });
    
    // Generate or get device ID
let deviceId = localStorage.getItem('deviceId');
if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem('deviceId', deviceId);
    console.log('New device ID generated and stored:', deviceId);
} else {
    console.log('Using existing device ID:', deviceId);
}
    
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('accessToken');
    
    // Show token modal if no token found
    if (!savedToken) {
        tokenModal.show();
    } else {
        // Verify saved token
        useToken(savedToken, deviceId)
            .then(response => {
                if (response.valid) {
                    tokenModal.hide();
                    mainContainer.classList.remove('d-none');
                    showToast('Token berhasil diverifikasi', 'success');
                } else {
                    localStorage.removeItem('accessToken');
                    tokenModal.show();
                }
            })
            .catch(error => {
                console.error('Error verifying saved token:', error);
                localStorage.removeItem('accessToken');
                tokenModal.show();
            });
    }
    
    // Verify token button click
    verifyTokenBtn.addEventListener('click', function() {
        const token = tokenInput.value.trim();
        if (token) {
            verifyTokenBtn.disabled = true;
            verifyTokenBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Memverifikasi...';
            
            // Reset error message
            tokenError.classList.add('d-none');
            
            // Use token (which includes validation)
            useToken(token, deviceId)
                .then(response => {
                    console.log('Response from useToken:', response);
                    
                    if (response.valid) {
                        // Save token to localStorage
                        localStorage.setItem('accessToken', token);
                        
                        // Hide modal and show main content
                        tokenModal.hide();
                        mainContainer.classList.remove('d-none');
                        showToast('Token berhasil diverifikasi', 'success');
                    } else {
                        // Show error message
                        tokenError.classList.remove('d-none');
                        tokenError.textContent = response.message || 'Token tidak valid atau sudah digunakan di perangkat lain';
                        tokenInput.value = '';
                    }
                })
                .catch(error => {
    console.error('Error:', error);
    
    // Show error message
    tokenError.classList.remove('d-none');
    
    if (error.message.includes('Server returned status:')) {
        const status = error.message.split(': ')[1];
        
        switch(status) {
            case '400':
                tokenError.textContent = 'Token tidak valid atau sudah digunakan di perangkat lain.';
                break;
            case '404':
                tokenError.textContent = 'Endpoint tidak ditemukan. Silakan hubungi admin.';
                break;
            case '500':
                tokenError.textContent = 'Server mengalami masalah internal. Silakan coba lagi nanti.';
                break;
            default:
                tokenError.textContent = `Server mengembalikan error (${status}). Silakan coba lagi.`;
        }
    } else if (error.message.includes('Network error')) {
        tokenError.textContent = 'Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda atau coba lagi nanti.';
    } else if (error.message.includes('timeout')) {
        tokenError.textContent = 'Request timeout. Server tidak merespon. Silakan coba lagi.';
    } else if (error.message.includes('Error parsing')) {
        tokenError.textContent = 'Error memproses respons server. Silakan coba lagi.';
    } else {
        tokenError.textContent = error.message || 'Terjadi kesalahan saat verifikasi token. Silakan coba lagi.';
    }
    
    tokenInput.value = '';
})
        }
    });
    

function testBackendConnection() {
    console.log('Testing backend connection...');
    
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = 'https://bot.wproject.web.id/health';
        
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        console.log('Backend connection test successful:', response);
                        resolve(true);
                    } catch (e) {
                        console.error('Error parsing health check response:', e);
                        resolve(false);
                    }
                } else {
                    console.error('Backend connection test failed:', xhr.status);
                    resolve(false);
                }
            }
        };
        
        xhr.onerror = function() {
            console.error('Backend connection test network error');
            resolve(false);
        };
        
        xhr.timeout = 5000; // 5 second timeout
        xhr.ontimeout = function() {
            console.error('Backend connection test timeout');
            resolve(false);
        };
        
        xhr.send();
    });
}


    // Logout button click
    logoutBtn.addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                // Release token on server
                releaseToken(token)
                    .then(() => {
                        localStorage.removeItem('accessToken');
                        tokenInput.value = '';
                        tokenError.classList.add('d-none');
                        mainContainer.classList.add('d-none');
                        tokenModal.show();
                        showToast('Anda telah berhasil logout', 'info');
                    })
                    .catch(error => {
                        console.error('Error releasing token:', error);
                        localStorage.removeItem('accessToken');
                        tokenInput.value = '';
                        tokenError.classList.add('d-none');
                        mainContainer.classList.add('d-none');
                        tokenModal.show();
                        showToast('Anda telah berhasil logout', 'info');
                    });
            }
        }
    });
    
    // Refresh stream button click
    refreshStreamBtn.addEventListener('click', function() {
        refreshStreamBtn.disabled = true;
        refreshStreamBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Memuat...';
        
        player.src({
            src: 'https://stream.wproject.web.id/hls/teststream.m3u8?' + new Date().getTime(),
            type: 'application/x-mpegURL'
        });
        
        player.play().then(() => {
            refreshStreamBtn.disabled = false;
            refreshStreamBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Refresh Stream';
            showToast('Stream berhasil diperbarui', 'success');
        }).catch(error => {
            console.error('Error refreshing stream:', error);
            refreshStreamBtn.disabled = false;
            refreshStreamBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Refresh Stream';
            showToast('Gagal memperbarui stream', 'danger');
        });
    });
    
    // Quality selection
    qualityOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const quality = this.getAttribute('data-quality');
            qualityDropdown.textContent = `Kualitas: ${this.textContent}`;
            
            // Apply quality settings
            switch(quality) {
                case 'high':
                    player.height(1080);
                    break;
                case 'medium':
                    player.height(720);
                    break;
                case 'low':
                    player.height(480);
                    break;
                default:
                    player.height('auto');
            }
            
            showToast(`Kualitas diubah ke: ${this.textContent}`, 'info');
        });
    });
    
    // Copy link button click
    copyLinkBtn.addEventListener('click', function() {
        downloadLink.select();
        document.execCommand('copy');
        showToast('Link berhasil disalin', 'success');
    });
    
    // Player event listeners
    player.on('ended', function() {
        // Show download card when stream ends
        const downloadUrl = `https://stream.wproject.web.id/downloads/teststream-${Date.now()}.mp4`;
        downloadLink.value = downloadUrl;
        downloadBtn.href = downloadUrl;
        downloadCard.classList.remove('d-none');
        showToast('Streaming telah selesai. Video siap diunduh.', 'success');
    });
    
    // Check token validity periodically
    setInterval(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Check if token is still valid
            fetch('https://bot.wproject.web.id/api/tokens/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, deviceId })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.valid) {
                    localStorage.removeItem('accessToken');
                    tokenInput.value = '';
                    tokenError.classList.remove('d-none');
                    tokenError.textContent = 'Sesi Anda telah berakhir. Silakan masukkan token kembali.';
                    mainContainer.classList.add('d-none');
                    tokenModal.show();
                    showToast('Sesi Anda telah berakhir. Silakan masukkan token kembali.', 'warning');
                }
            })
            .catch(error => {
                console.error('Error checking token validity:', error);
            });
        }
    }, 60000); // Check every minute
    
    // Functions
    function generateDeviceId() {
    const deviceId = 'device-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
    console.log('Generated device ID:', deviceId);
    return deviceId;
}
    
    function useToken(token, deviceId) {
    console.log('Using token:', token, 'for device:', deviceId);
    
    return new Promise((resolve, reject) => {
        // Create XHR request instead of fetch for better error handling
        const xhr = new XMLHttpRequest();
        const url = 'https://bot.wproject.web.id/api/tokens/use';
        
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onreadystatechange = function() {
            console.log('XHR readyState:', xhr.readyState, 'Status:', xhr.status);
            
            if (xhr.readyState === 4) { // Request is complete
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        console.log('XHR Response:', response);
                        resolve(response);
                    } catch (e) {
                        console.error('Error parsing response:', e);
                        reject(new Error('Error parsing server response'));
                    }
                } else {
                    console.error('XHR Error:', xhr.status, xhr.statusText);
                    reject(new Error(`Server returned status: ${xhr.status}`));
                }
            }
        };
        
        xhr.onerror = function() {
            console.error('XHR Network Error');
            reject(new Error('Network error - unable to connect to server'));
        };
        
        xhr.ontimeout = function() {
            console.error('XHR Timeout');
            reject(new Error('Request timeout - server did not respond'));
        };
        
        try {
            xhr.send(JSON.stringify({ token, deviceId }));
        } catch (e) {
            console.error('Error sending request:', e);
            reject(new Error('Error sending request to server'));
        }
    });
}
    
    function releaseToken(token) {
        return new Promise((resolve, reject) => {
            fetch('https://bot.wproject.web.id/api/tokens/release', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                console.error('Error releasing token:', error);
                reject(error);
            });
        });
    }
    
    function showToast(message, type = 'info') {
    toastMessage.textContent = message;
    
    // Update toast styling based on type
    const toastHeader = document.querySelector('#notificationToast .toast-header');
    toastHeader.className = 'toast-header';
    
    switch(type) {
        case 'success':
            toastHeader.classList.add('bg-success', 'text-white');
            break;
        case 'danger':
            toastHeader.classList.add('bg-danger', 'text-white');
            break;
        case 'warning':
            toastHeader.classList.add('bg-warning', 'text-dark');
            break;
        default:
            toastHeader.classList.add('bg-info', 'text-white');
    }
    
    notificationToast.show();
}
    
    // Disable right click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable developer tools
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+Shift+I (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
    });
    
    // Devtools detection
    let devtools = {open: false, orientation: null};
    const threshold = 160;
    
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            // Devtools is open
            if (!devtools.open) {
                devtools.open = true;
                // Redirect or show warning
                document.body.innerHTML = '<div class="container text-center mt-5"><h1>Developer Tools Detected</h1><p>Please close developer tools to continue using this site.</p></div>';
            }
        } else {
            // Devtools is closed
            if (devtools.open) {
                devtools.open = false;
                // Reload the page
                window.location.reload();
            }
        }
    }, 500);
});