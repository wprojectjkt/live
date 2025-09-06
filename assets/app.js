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

    changeQuality("720"); // default ke 720p
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

function changeQuality(q) {
  const base = "https://stream.wproject.web.id/hls/teststream";
  const src = `${base}_${q}p.m3u8`;

  if (!video) video = document.getElementById("video");

  showSpinner(true); // tampilkan spinner saat ganti resolusi

  if (Hls.isSupported()) {
    if (hls) hls.destroy();
    hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });

    hls.on(Hls.Events.FRAG_LOADED, () => {
      showSpinner(false); // sembunyikan spinner saat stream siap
    });
  } else {
    video.src = src;
    video.oncanplay = () => showSpinner(false);
  }
}

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

// Proteksi klik kanan & DevTools
document.addEventListener("contextmenu", e => e.preventDefault());
document.onkeydown = function(e) {
  if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73)) return false;
};

// Jika di watch.html → validasi token
if (window.location.pathname.includes("watch.html")) {
  validateToken();
}
