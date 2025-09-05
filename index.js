function pasteToken() {
  navigator.clipboard.readText().then(text => {
    document.getElementById("tokenInput").value = text.trim();
  }).catch(() => {
    alert("Tidak bisa paste otomatis, silakan tempel manual.");
  });
}

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
        localStorage.setItem("token", token);
        window.location.href = "watch.html";
      } else {
        statusEl.innerText = "❌ " + (data.message || "Token tidak valid!");
      }
    })
    .catch(() => {
      statusEl.innerText = "⚠️ Gagal koneksi API.";
    });
}
