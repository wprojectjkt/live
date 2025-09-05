const API_URL = "https://bot.wproject.web.id/validate";

function initShowroomPlayer() {
  const token = localStorage.getItem("token");
  const statusEl = document.getElementById("status");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  statusEl.innerText = "🔄 Validasi token...";

  fetch(`${API_URL}?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (!data.valid) {
        localStorage.removeItem("token");
        statusEl.innerText = "❌ Token invalid.";
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

      // plugin resolusi
      player.httpSourceSelector();
      player.updateSrc([
        {
          src: "https://stream.wproject.web.id/hls/teststream.m3u8",
          type: "application/x-mpegURL"
        }
      ]);

      statusEl.innerText = "▶️ Streaming siap.";
    })
    .catch(() => {
      statusEl.innerText = "⚠️ Error koneksi API.";
    });
}
