const security = {
    // Disable right click
    disableRightClick: function() {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        
        document.addEventListener('selectstart', function(e) {
            e.preventDefault();
            return false;
        });
        
        document.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
    },
    
    // Disable developer tools and shortcuts
    checkKey: function(e) {
        // F12
        if (e.keyCode === 123) {
            return false;
        }
        
        // Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            return false;
        }
        
        // Ctrl+Shift+J
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            return false;
        }
        
        // Ctrl+U
        if (e.ctrlKey && e.keyCode === 85) {
            return false;
        }
        
        // Ctrl+S
        if (e.ctrlKey && e.keyCode === 83) {
            return false;
        }
        
        // Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
            return false;
        }
        
        return true;
    },
    
    // Detect devtools
    detectDevTools: function() {
        const devtools = {
            open: false,
            orientation: null
        };
        
        const threshold = 160;
        
        setInterval(function() {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    document.body.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #000; color: white; font-size: 2rem;">Developer Tools Terdeteksi!</div>';
                }
            } else {
                devtools.open = false;
            }
        }, 500);
    },
    
    // Initialize security
    init: function() {
        this.disableRightClick();
        this.detectDevTools();
    }
};

// Initialize security when page loads
document.addEventListener('DOMContentLoaded', function() {
    security.init();
});