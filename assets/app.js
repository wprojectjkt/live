// Blokir klik kanan & DevTools
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("keydown", function (e) {
  if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key))) {
    e.preventDefault();
  }
});

function validateToken() {
  const token = document.getElementById("tokenInput").value.trim();
  const statusEl = document.getElementById("status");

  if (!token) {
    statusEl.innerText = "⚠️ Token tidak boleh kosong.";
    return;
  }

  statusEl.innerText = "🔄 Memvalidasi...";

  fetch(`https://bot.wproject.web.id/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        localStorage.setItem("token", token);
        window.location.href = "watch.html";
      } else {
        statusEl.innerText = "❌ " + (data.message || "Token tidak valid!");
      }
    })
    .catch(err => {
      statusEl.innerText = "⚠️ Gagal koneksi API: " + err.message;
    });
}

function initPlayer() {
  const token = localStorage.getItem("token");
  const statusEl = document.getElementById("status");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  fetch(`https://bot.wproject.web.id/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (!data.valid) {
        statusEl.innerText = "❌ " + (data.message || "Token tidak valid.");
        localStorage.removeItem("token");
        return;
      }

      // Init player
      const player = videojs("video", {
        fluid: true,
        controlBar: {
          pictureInPictureToggle: true,
          volumePanel: { inline: false }
        }
      });

      // add resolution selector plugin
      player.httpSourceSelector();
      player.src({
        src: "https://stream.wproject.web.id/hls/teststream.m3u8",
        type: "application/x-mpegURL"
      });

      statusEl.innerText = "▶️ Streaming dimulai...";
    })
    .catch(err => {
      statusEl.innerText = "⚠️ Error API: " + err.message;
    });
}


function logoutToken() {
  const token = localStorage.getItem("token");
  if (!token) return;
  fetch(`https://bot.wproject.web.id/logout?token=${token}`, { method: "POST" })
    .then(() => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
}
