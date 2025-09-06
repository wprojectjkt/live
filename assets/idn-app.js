let hls, video;

function hidePreloader() {
  document.getElementById("preloader").style.display = "none";
}

function initPlayer() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const src = "https://stream.wproject.web.id/hls/teststream.m3u8";
  video = document.getElementById("video");

  document.getElementById("preloader").style.display = "flex";

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    hls.on(Hls.Events.FRAG_LOADED, () => hidePreloader());
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = src;
    video.addEventListener("loadedmetadata", () => video.play());
    video.oncanplay = hidePreloader;
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    video.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

document.addEventListener("DOMContentLoaded", initPlayer);
