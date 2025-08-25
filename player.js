const API_BASE = "https://bot.wproject.web.id/api";
const DEVICE_ID = btoa(navigator.userAgent + navigator.language + screen.width + "x" + screen.height);

// Ambil token dari URL (?token=xxx)
const urlParams = new URLSearchParams(window.location.search);
const tokenFromURL = urlParams.get("token");

window.onload = () => {
  if (tokenFromURL) {
    // otomatis validasi tanpa harus submit
    validateToken(tokenFromURL);
  } else {
    // kalau tidak ada token di URL, tampilkan popup input manual
    document.getElementById("overlay").classList.remove("hidden");
  }
};

function validateToken(token) {
  const status = document.getElementById("status");

  fetch(`${API_BASE}/validate/${token}/${DEVICE_ID}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === "valid") {
        fetch(`${API_BASE}/current_stream`)
          .then(r => r.json())
          .then(stream => {
            if (stream.status === "online") {
              document.getElementById("overlay").classList.add("hidden");
              document.getElementById("playerContainer").classList.remove("hidden");
              initPlayer(stream.url);
            } else {
              status.innerText = "⚠️ Stream belum aktif";
              document.getElementById("overlay").classList.remove("hidden");
            }
          });
      } else {
        status.innerText = "❌ " + data.message;
        document.getElementById("overlay").classList.remove("hidden");
      }
    })
    .catch(err => {
      status.innerText = "⚠️ Error koneksi API";
      console.error(err);
    });
}

// Manual input tetap bisa dipakai fallback
function validateTokenManual() {
  const input = document.getElementById("tokenInput").value.trim();
  if (!input.includes("?token=")) {
    document.getElementById("status").innerText = "❌ Token link tidak valid";
    return;
  }
  const token = input.split("?token=")[1];
  validateToken(token);
}
