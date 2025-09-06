const API_URL = "https://bot.wproject.web.id/api";

// Device fingerprint (simple)
function getFingerprint() {
  return btoa(navigator.userAgent + screen.width + "x" + screen.height);
}

// Submit token dari index
function submitToken() {
  const token = document.getElementById("tokenInput").value.trim();
  if (!token) return alert("Token kosong!");

  localStorage.setItem("wproject_token", token);
  localStorage.setItem("wproject_device", getFingerprint());
  window.location.href = "watch.html";
}

// Validasi token di watch.html
async function validateToken() {
  const token = localStorage.getItem("wproject_token");
  const device = localStorage.getItem("wproject_device");

  if (!token || !device) {
    alert("Token tidak ditemukan, silakan login ulang.");
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

    // Jika valid → load video
    initPlayer("https://stream.wproject.web.id/hls/teststream.m3u8");

  } catch (err) {
    alert("Akses ditolak: " + err.message);
    localStorage.clear();
    window.location.href = "index.html";
  }
}

// Init player HLS
function initPlayer(src) {
  const video = document.getElementById("video");

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = src;
  }
}

// Logout
async function logout() {
  const token = localStorage.getItem("wproject_token");
  await fetch(`${API_URL}/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  });

  localStorage.clear();
  alert("Logout berhasil");
  window.location.href = "index.html";
}

// Proteksi
document.addEventListener("contextmenu", e => e.preventDefault());
document.onkeydown = function(e) {
  if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73)) {
    return false;
  }
};

// Auto run validate jika di watch.html
if (window.location.pathname.includes("watch.html")) {
  validateToken();
}
