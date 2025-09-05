// API base URL
const API_BASE = "https://bot.wproject.web.id";

// Paste button
document.addEventListener("DOMContentLoaded", () => {
  const pasteBtn = document.getElementById("pasteBtn");
  if (pasteBtn) {
    pasteBtn.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        document.getElementById("tokenInput").value = text.trim();
      } catch (err) {
        alert("Clipboard tidak bisa diakses. Coba tempel manual.");
      }
    });
  }
});

// Validate token
function validateToken() {
  const token = document.getElementById("tokenInput").value.trim();
  const statusEl = document.getElementById("status");

  if (!token) {
    statusEl.innerText = "⚠️ Token tidak boleh kosong.";
    return;
  }

  statusEl.innerText = "🔄 Memvalidasi token...";

  fetch(`${API_BASE}/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        statusEl.innerText = "✅ Token valid, masuk...";
        localStorage.setItem("authToken", token);
        window.location.href = `watch.html?token=${token}`;
      } else {
        statusEl.innerText = "❌ " + (data.message || "Token tidak valid!");
      }
    })
    .catch(err => {
      statusEl.innerText = "⚠️ Gagal koneksi API.";
    });
}

// Watch page
if (window.location.pathname.includes("watch.html")) {
  const token = new URLSearchParams(window.location.search).get("token");
  const statusEl = document.getElementById("status");
  const video = document.getElementById("videoPlayer");

  if (!token) {
    statusEl.innerText = "⚠️ Token hilang, silakan login ulang.";
  } else {
    fetch(`${API_BASE}/validate?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          initPlayer();
        } else {
          statusEl.innerText = "❌ " + (data.message || "Token tidak valid!");
        }
      });
  }

  function initPlayer() {
    const STREAM_URL = "https://stream.wproject.web.id/hls/teststream.m3u8";
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(STREAM_URL);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        const levels = hls.levels;
        if (levels && levels.length > 1) {
          const select = document.createElement("select");
          levels.forEach((lvl, i) => {
            const opt = document.createElement("option");
            opt.value = i;
            opt.text = `${lvl.height}p`;
            select.appendChild(opt);
          });
          select.addEventListener("change", function () {
            hls.currentLevel = parseInt(this.value);
          });
          document.querySelector(".player-container").appendChild(select);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = STREAM_URL;
    }
  }
}

// Logout
function logout() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Token tidak ditemukan.");
    return;
  }
  fetch(`${API_BASE}/logout?token=${token}`, { method: "POST" })
    .then(res => res.json())
    .then(data => {
      alert("✅ Logout berhasil");
      localStorage.removeItem("authToken");
      window.location.href = "index.html";
    })
    .catch(err => {
      alert("⚠️ Gagal logout.");
    });
}

// Security: block devtools
document.onkeydown = function(e) {
  if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74))) {
    return false;
  }
};
