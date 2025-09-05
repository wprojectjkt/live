const API_URL = "https://bot.wproject.web.id"; // API VPS kamu
const STREAM_URL = "https://stream.wproject.web.id/hls/teststream.m3u8";

// ========== Login ==========
async function validateToken() {
  const token = document.getElementById("tokenInput").value.trim();
  const statusEl = document.getElementById("status");

  if (!token) {
    statusEl.innerText = "⚠️ Token tidak boleh kosong";
    return;
  }

  statusEl.innerText = "🔄 Memvalidasi token...";

  try {
    const res = await fetch(`${API_URL}/validate?token=${token}`, {
      method: "GET",
      headers: { "User-Agent": navigator.userAgent },
    });
    const data = await res.json();

    if (data.valid) {
      localStorage.setItem("token", token);
      window.location.href = "watch.html";
    } else {
      statusEl.innerText = "❌ " + (data.message || "Token tidak valid");
    }
  } catch (err) {
    statusEl.innerText = "⚠️ Gagal koneksi API";
  }
}

// ========== Player ==========
async function validateAndPlay(token) {
  const statusEl = document.getElementById("status");
  try {
    const res = await fetch(`${API_URL}/validate?token=${token}`, {
      method: "GET",
      headers: { "User-Agent": navigator.userAgent },
    });
    const data = await res.json();

    if (data.valid) {
      const video = document.getElementById("video");
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(STREAM_URL);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = STREAM_URL;
      }
      statusEl.innerText = "✅ Streaming dimulai";
    } else {
      statusEl.innerText = "❌ " + (data.message || "Token tidak valid");
      localStorage.removeItem("token");
      setTimeout(() => (window.location.href = "index.html"), 2000);
    }
  } catch (err) {
    statusEl.innerText = "⚠️ Gagal memuat streaming";
  }
}

// ========== Logout ==========
async function logout() {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    await fetch(`${API_URL}/logout?token=${token}`, { method: "POST" });
  } catch {}
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// ========== Security ==========
document.onkeydown = function (e) {
  if (
    e.keyCode === 123 || // F12
    (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I/J
    (e.ctrlKey && e.keyCode === 85) // Ctrl+U
  ) {
    return false;
  }
};
