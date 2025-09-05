const API_URL = "https://bot.wproject.web.id";

document.getElementById("loginBtn").addEventListener("click", validateToken);
document.getElementById("pasteBtn").addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById("tokenInput").value = text.trim();
  } catch (err) {
    alert("Clipboard tidak bisa diakses. Tempel manual (tap & tahan).");
  }
});

function validateToken() {
  const token = document.getElementById("tokenInput").value.trim();
  const statusEl = document.getElementById("statusMsg");
  if (!token) {
    statusEl.innerText = "⚠️ Token tidak boleh kosong";
    return;
  }

  statusEl.innerText = "🔄 Memvalidasi...";
  fetch(`${API_URL}/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        localStorage.setItem("wproject_token", token);
        window.location.href = `watch.html?token=${token}`;
      } else {
        statusEl.innerText = `❌ ${data.message || "Token tidak valid"}`;
      }
    })
    .catch(() => {
      statusEl.innerText = "⚠️ Gagal koneksi API";
    });
}
