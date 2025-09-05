const API_URL = "https://bot.wproject.web.id/validate";

function validateToken() {
  const token = document.getElementById("tokenInput").value.trim();
  const statusEl = document.getElementById("status");

  if (!token) {
    statusEl.innerText = "⚠️ Token tidak boleh kosong.";
    return;
  }

  statusEl.innerText = "🔄 Memvalidasi token...";

  fetch(`${API_URL}?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        localStorage.setItem("token", token);
        statusEl.innerText = "✅ Token valid, masuk...";
        setTimeout(() => window.location.href = "watch.html", 800);
      } else {
        statusEl.innerText = "❌ Token tidak valid.";
      }
    })
    .catch(() => {
      statusEl.innerText = "⚠️ Gagal koneksi API.";
    });
}

function initWatch() {
  const token = localStorage.getItem("token");
  const statusEl = document.getElementById("status");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  statusEl.innerText = "🔄 Memvalidasi token...";

  fetch(`${API_URL}?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (!data.valid) {
        localStorage.removeItem("token");
        statusEl.innerText = "❌ Token invalid, kembali login.";
        setTimeout(() => window.location.href = "index.html", 1500);
        return;
      }

      statusEl.innerText = "✅ Token valid. Memuat stream...";

      const player = videojs("video", {
        fluid: true,
        controlBar: {
          pictureInPictureToggle: true,
          volumePanel: { inline: false }
        }
      });

      player.src({
        src: "https://stream.wproject.web.id/hls/teststream.m3u8",
        type: "application/x-mpegURL"
      });
    })
    .catch(() => {
      statusEl.innerText = "⚠️ Error API.";
    });
}

function logoutToken() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
