function validateToken() {
  const token = document.getElementById("tokenInput").value.trim();
  if (!token) {
    document.getElementById("status").innerText = "Token tidak boleh kosong.";
    return;
  }

  fetch(`https://bot.wproject.web.id/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        window.location.href = `watch.html?token=${token}`;
      } else {
        document.getElementById("status").innerText = "❌ Token invalid!";
      }
    })
    .catch(err => {
      document.getElementById("status").innerText = "⚠️ Error koneksi.";
    });
}
