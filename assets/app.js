let hls, video;

function showSpinner(show) {
  const spinner = document.getElementById("spinner");
  spinner.style.display = show ? "flex" : "none";
}

function initPlayer() {
  const token = localStorage.getItem("token");

  // Cek token
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const src = "https://stream.wproject.web.id/hls/teststream.m3u8";
  video = document.getElementById("video");

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

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", initPlayer);
