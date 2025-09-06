let hls, video;

function login() {
  const token = document.getElementById("tokenInput").value.trim();
  if (!token) {
    alert("Token tidak boleh kosong!");
    return;
  }
  localStorage.setItem("token", token);
  window.location.href = "watch.html";
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
    hls.on(Hls.Events.FRAG_LOADED, () => {
      document.getElementById("preloader").style.display = "none";
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = src;
    video.addEventListener("loadedmetadata", () => video.play());
    video.oncanplay = () => {
      document.getElementById("preloader").style.display = "none";
    };
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("video")) {
    initPlayer();
  }
});
