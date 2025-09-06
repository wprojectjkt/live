let hls, video;

// Show/Hide Spinner
function showSpinner(show) {
  const spinner = document.getElementById("spinner");
  spinner.style.display = show ? "flex" : "none";
}

// Initialize player with adaptive HLS
function initPlayer() {
  const src = "https://stream.wproject.web.id/hls/teststream.m3u8";
  video = document.getElementById("video");

  showSpinner(true);

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });

    hls.on(Hls.Events.FRAG_LOADED, () => {
      showSpinner(false);
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS error:", data);
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = src;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    video.oncanplay = () => showSpinner(false);
  }
}

// Logout function
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// Auto init
document.addEventListener("DOMContentLoaded", initPlayer);
