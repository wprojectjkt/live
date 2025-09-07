const API_URL = "https://bot.wproject.web.id/api";
let hls, video;

function getFingerprint() {
  return btoa(navigator.userAgent + screen.width + "x" + screen.height);
}

function submitToken() {
  const token = document.getElementById("tokenInput").value.trim();
  if (!token) return alert("Token kosong!");
  localStorage.setItem("wproject_token", token);
  localStorage.setItem("wproject_device", getFingerprint());
  window.location.href = "watch.html";
}

async function validateToken() {
  const token = localStorage.getItem("wproject_token");
  const device = localStorage.getItem("wproject_device");

  if (!token || !device) {
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, device })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.msg);

    // ✅ Default adaptive (auto)
    initPlayer("auto");
  } catch (err) {
    alert("Akses ditolak: " + err.message);
    localStorage.clear();
    window.location.href = "index.html";
  }
}

function showSpinner(show) {
  const spinner = document.getElementById("spinner");
  if (!spinner) return;
  spinner.style.display = show ? "flex" : "none";
}

// === INIT PLAYER ===
function initPlayer(quality = "auto") {
  const base = "https://stream.wproject.web.id/hls/teststream_master";
  const src = (quality === "auto") ? `${base}.m3u8` : `${base}_${quality}p.m3u8`;

  video = document.getElementById("video");
  showSpinner(true);

  if (Hls.isSupported()) {
    if (hls) hls.destroy();
    hls = new Hls({
      maxBufferLength: 10,        // buffer 10 detik
      liveSyncDuration: 5,        // sinkronisasi live lebih halus
      enableWorker: true,         // lebih ringan di browser
      lowLatencyMode: true        // kalau server support LL-HLS
    });
    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });

    hls.on(Hls.Events.FRAG_LOADED, () => {
      showSpinner(false);
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS error:", data);
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = src;
    video.addEventListener("loadedmetadata", () => video.play());
    video.oncanplay = () => showSpinner(false);
  }
}

// === CHANGE QUALITY MANUAL ===
function changeQuality(q) {
  initPlayer(q);
}

// === LOGOUT ===
async function logout() {
  const token = localStorage.getItem("wproject_token");
  await fetch(`${API_URL}/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  });
  localStorage.clear();
  window.location.href = "index.html";
}

// === Proteksi klik kanan & DevTools ===
document.addEventListener("contextmenu", e => e.preventDefault());
document.onkeydown = function(e) {
  if (
    e.keyCode == 123 || // F12
    (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || // Ctrl+Shift+I/J
    (e.ctrlKey && e.keyCode == 85) // Ctrl+U
  ) {
    return false;
  }
};

// === Kalau halaman watch → validasi token dulu ===
if (window.location.pathname.includes("watch.html")) {
  validateToken();
}
