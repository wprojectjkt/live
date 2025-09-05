const API_URL = "https://bot.wproject.web.id";

function validateToken() {
  const token = document.getElementById("tokenInput").value.trim();
  const statusEl = document.getElementById("status");

  if (!token) {
    statusEl.innerText = "⚠️ Token tidak boleh kosong.";
    return;
  }

  statusEl.innerText = "🔄 Memvalidasi token...";

  fetch(`${API_URL}/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        statusEl.innerText = "✅ Token valid, masuk...";
        window.location.href = `watch.html?token=${token}`;
      } else {
        statusEl.innerText = "❌ Token tidak valid!";
      }
    })
    .catch(() => {
      statusEl.innerText = "⚠️ Gagal koneksi API.";
    });
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

function initPlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  fetch(`${API_URL}/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        const video = document.getElementById("videoPlayer");
        const hlsUrl = "https://stream.wproject.web.id/hls/teststream.m3u8";

        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = hlsUrl;
        }
      } else {
        alert("Token tidak valid, silakan login kembali.");
        window.location.href = "index.html";
      }
    })
    .catch(() => {
      alert("⚠️ Error koneksi API.");
      window.location.href = "index.html";
    });
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;

  const chatBox = document.getElementById("chatBox");
  const p = document.createElement("p");
  p.innerText = `Anda: ${msg}`;
  chatBox.appendChild(p);
  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
}

if (document.getElementById("videoPlayer")) {
  window.onload = initPlayer;
}
