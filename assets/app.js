let hls, video;

function showSpinner(show) {
  const spinner = document.getElementById("spinner");
  if (spinner) spinner.style.display = show ? "flex" : "none";
}

// Default: Adaptive (master playlist)
function initPlayer() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

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
    video.addEventListener("loadedmetadata", () => video.play());
    video.oncanplay = () => showSpinner(false);
  }
}

// Manual quality override
function changeQuality(q) {
  const base = "https://stream.wproject.web.id/hls/teststream";
  const src = (q === "auto") ? `${base}.m3u8` : `${base}_${q}p.m3u8`;

  if (!video) video = document.getElementById("video");

  showSpinner(true);

  if (Hls.isSupported()) {
    if (hls) hls.destroy();
    hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });

    hls.on(Hls.Events.FRAG_LOADED, () => {
      showSpinner(false);
    });
  } else {
    video.src = src;
    video.oncanplay = () => showSpinner(false);
  }
}

// Logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// Run init only if watch.html
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("video")) {
    initPlayer();
  }
});
