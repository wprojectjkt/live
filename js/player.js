const API_URL = "https://bot.wproject.web.id";
const HLS_URL = "https://stream.wproject.web.id/hls/teststream.m3u8";

function startPlayer() {
  const video = document.getElementById("videoPlayer");
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(HLS_URL);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = HLS_URL;
  }
}

function initPlayer() {
  const token = new URLSearchParams(window.location.search).get("token");
  if (!token) return logout();

  fetch(`${API_URL}/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (!data.valid) return logout();
      startPlayer();
    })
    .catch(() => { alert("API Error"); logout(); });
}

window.onload = initPlayer;
