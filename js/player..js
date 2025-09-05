class StreamPlayer {
    constructor() {
        this.video = document.getElementById('videoPlayer');
        this.streamStatus = document.getElementById('streamStatus');
        this.hls = null;
    }
    
    initPlayer(streamUrl) {
        if (Hls.isSupported()) {
            this.hls = new Hls();
            this.hls.loadSource(streamUrl);
            this.hls.attachMedia(this.video);
            
            this.hls.on(Hls.Events.MANIFEST_PARSED, function() {
                this.video.play();
                this.updateStatus('Terhubung');
            }.bind(this));
            
            this.hls.on(Hls.Events.ERROR, function(event, data) {
                if (data.fatal) {
                    this.updateStatus('Error: ' + data.details);
                }
            }.bind(this));
            
        } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
            this.video.src = streamUrl;
            this.video.addEventListener('loadedmetadata', function() {
                this.video.play();
                this.updateStatus('Terhubung');
            }.bind(this));
        }
    }
    
    updateStatus(status) {
        this.streamStatus.textContent = status;
    }
    
    destroy() {
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
        this.video.src = '';
        this.updateStatus('Terputus');
    }
}