const API_URL = "https://bot.wproject.web.id";

function validateToken() {
  const token = document.getElementById("tokenInput").value.trim();
  const status = document.getElementById("status");

  if (!token) {
    status.innerText = "⚠️ Token kosong";
    return;
  }

  status.innerText = "🔄 Memvalidasi...";

  fetch(`${API_URL}/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        window.location.href = `watch.html?token=${token}`;
      } else {
        status.innerText = "❌ Token salah";
      }
    })
    .catch(() => status.innerText = "⚠️ API Error");
}
