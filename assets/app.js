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
      statusEl.innerText = "⚠️ Gagal koneksi API.";
    });
}
