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
        setTimeout(() => window.location.href = "watch.html", 700);
      } else {
        statusEl.innerText = "❌ " + (data.message || "Token tidak valid.");
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
        statusEl.innerText = "❌ " + (data.message || "Token invalid.");
        setTimeout(() => window.location.href = "index.html", 1500);
        return;
      }

      statusEl.innerText = "✅ Token valid. Memuat stream...";

      const player = videojs("video", {
        autoplay: false,
        preload: "auto",
        fluid: true,
        controlBar: {
          pictureInPictureToggle: true,
          volumePanel: { inline: false }
        }
      });

      // Plugin resolusi
      player.httpSourceSelector();

      player.src({
        src: "https://stream.wproject.web.id/hls/teststream.m3u8",
        type: "application/x-mpegURL"
      });

      player.on("error", () => {
        statusEl.innerText = "⚠️ Gagal memuat stream.";
      });

      player.on("loadedmetadata", () => {
        statusEl.innerText = "▶️ Streaming siap.";
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
