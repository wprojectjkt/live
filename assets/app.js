// Security: disable right click & F12
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("keydown", e => {
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

  statusEl.innerText = "🔄 Memvalidasi token...";

  fetch(`https://bot.wproject.web.id/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        statusEl.innerText = "✅ Token valid, masuk...";
        window.location.href = `watch.html?token=${token}`;
      } else {
        statusEl.innerText = "❌ Token tidak valid!";
      }
    })
    .catch(err => {
      statusEl.innerText = "⚠️ Gagal koneksi API: " + err.message;
    });
}

function initPlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const statusEl = document.getElementById("status");

  if (!token) {
    statusEl.innerText = "❌ Token tidak ditemukan.";
    return;
  }

  // Validasi ulang token
  fetch(`https://bot.wproject.web.id/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (!data.valid) {
        statusEl.innerText = "❌ Token invalid / sudah dipakai.";
        return;
      }

      // Load HLS stream
      const video = document.getElementById("video");
      const streamUrl = "https://stream.wproject.web.id/hls/teststream_720/index.m3u8"; // ganti dinamis

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      }

      statusEl.innerText = "▶️ Streaming dimulai...";
    })
    .catch(err => {
      statusEl.innerText = "⚠️ Error API: " + err.message;
    });
}
let hls;
const baseStream = "https://stream.wproject.web.id/hls/";

function initPlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const statusEl = document.getElementById("status");

  if (!token) {
    statusEl.innerText = "❌ Token tidak ditemukan.";
    return;
  }

  // Validasi token ke API
  fetch(`https://bot.wproject.web.id/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (!data.valid) {
        statusEl.innerText = "❌ Token invalid / sudah dipakai.";
        return;
      }
      // Load default 720p
      loadStream("720");
      statusEl.innerText = "▶️ Streaming dimulai...";
    })
    .catch(err => {
      statusEl.innerText = "⚠️ Error API: " + err.message;
    });
}

function loadStream(quality) {
  const video = document.getElementById("video");
  const streamUrl = `${baseStream}teststream_${quality}/index.m3u8`;

  if (Hls.isSupported()) {
    if (hls) hls.destroy();
    hls = new Hls();
    hls.loadSource(streamUrl);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = streamUrl;
  }

  document.getElementById("quality").innerText = quality + "p";
}

function changeQuality(q) {
  loadStream(q);
}

function copyLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  alert("Link disalin ke clipboard!");
}
