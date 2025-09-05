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
        localStorage.setItem("token", token);
        window.location.href = `watch.html?token=${token}`;
      } else {
        statusEl.innerText = "❌ " + (data.message || "Token tidak valid!");
      }
    })
    .catch(err => {
      statusEl.innerText = "⚠️ Gagal koneksi API.";
    });
}

function validateAndPlay(token) {
  const statusEl = document.getElementById("status");
  const video = document.getElementById("videoPlayer");

  fetch(`${API_URL}/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        statusEl.innerText = "✅ Token valid, memutar stream...";
        const streamUrl = "https://stream.wproject.web.id/hls/teststream.m3u8";
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        }
      } else {
        statusEl.innerText = "❌ " + (data.message || "Token tidak valid!");
        setTimeout(() => { window.location.href = "index.html"; }, 2000);
      }
    })
    .catch(err => {
      statusEl.innerText = "⚠️ Error koneksi API.";
    });
}

async function logout() {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    await fetch(`${API_URL}/logout?token=${token}`, { method: "POST" });
  } catch {}
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
