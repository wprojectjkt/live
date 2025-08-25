const API_BASE = "https://bot.wproject.web.id/api";
const STREAM_URL = "https://stream.wproject.web.id/hls/live.m3u8"; // ganti sesuai setup
const DEVICE_ID = btoa(navigator.userAgent + navigator.language + screen.width + "x" + screen.height);

function validateToken() {
  const input = document.getElementById("tokenInput").value.trim();
  const status = document.getElementById("status");

  if (!input.includes("?token=")) {
    status.innerText = "❌ Token link tidak valid";
    return;
  }

  const token = input.split("?token=")[1];

  fetch(`${API_BASE}/validate/${token}/${DEVICE_ID}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === "valid") {
        document.getElementById("overlay").classList.add("hidden");
        document.getElementById("playerContainer").classList.remove("hidden");
        initPlayer(STREAM_URL);
      } else {
        status.innerText = "❌ " + data.message;
      }
    })
    .catch(err => {
      status.innerText = "⚠️ Error koneksi API";
      console.error(err);
    });
}

function initPlayer(url) {
  const video = document.getElementById("video");
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
  }
}

// --- Dummy Realtime Viewer Counter ---
let viewers = 0;
setInterval(() => {
  viewers = Math.floor(Math.random() * 100); // nanti diganti backend asli
  document.getElementById("viewerCount").innerText = `👥 ${viewers} penonton`;
}, 3000);

// --- Dummy Chat ---
function sendMessage() {
  const input = document.getElementById("chatInput");
  const messages = document.getElementById("messages");
  if (input.value.trim() !== "") {
    const msg = document.createElement("div");
    msg.textContent = "🧑 Kamu: " + input.value;
    messages.appendChild(msg);
    input.value = "";
  }
}
