document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("video");
  const statusEl = document.getElementById("status");
  const popup = document.getElementById("popup");
  const popupMsg = document.getElementById("popupMessage");
  const popupClose = document.getElementById("popupClose");

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    popupMsg.textContent = "❌ Token tidak ditemukan!";
    popup.classList.remove("hidden");
    video.style.display = "none";
    return;
  }

  // Buat deviceID unik (lebih kuat daripada user agent)
  async function getDeviceId() {
    const msg = navigator.userAgent + navigator.language + screen.width + screen.height + screen.colorDepth;
    const enc = new TextEncoder().encode(msg);
    const hashBuffer = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  getDeviceId().then(deviceId => {
    // Validasi ke backend bot
    fetch(`https://bot.wproject.web.id/api/check_token?token=${token}&device=${deviceId}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          popupMsg.textContent = "✅ Token valid, membuka stream...";
          popupClose.onclick = () => popup.classList.add("hidden");
          startStream(token);
        } else {
          popupMsg.textContent = "❌ Token tidak valid / sudah dipakai!";
          video.style.display = "none";
        }
      });
  });

  function startStream(token) {
    const streamUrl = `https://stream.wproject.web.id/hls/stream.m3u8?token=${token}`;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
        statusEl.textContent = "✅ Live connected.";
      });
      hls.on(Hls.Events.ERROR, function () {
        statusEl.textContent = "⚠️ Stream tidak tersedia / token salah.";
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", function () {
        video.play();
        statusEl.textContent = "✅ Live connected.";
      });
    } else {
      statusEl.textContent = "❌ Browser tidak mendukung HLS.";
    }
  }
});
