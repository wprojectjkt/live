const API_URL = "https://bot.wproject.web.id";
const STREAM_URL = "https://stream.wproject.web.id/hls/teststream.m3u8";

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token") || localStorage.getItem("wproject_token");

const statusEl = document.getElementById("statusMsg");

if (!token) {
  window.location.href = "index.html";
}

function validate() {
  fetch(`${API_URL}/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        initPlayer();
      } else {
        statusEl.innerText = `❌ ${data.message || "Token invalid"}`;
        setTimeout(() => window.location.href = "index.html", 2000);
      }
    })
    .catch(() => {
      statusEl.innerText = "⚠️ Gagal koneksi API";
    });
}

function initPlayer() {
  const video = document.getElementById("videoPlayer");
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(STREAM_URL);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = STREAM_URL;
  }
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  const formData = new FormData();
  formData.append("token", token);
  fetch(`${API_URL}/logout`, { method: "POST", body: formData })
    .then(() => {
      localStorage.removeItem("wproject_token");
      window.location.href = "index.html";
    });
});

validate();
