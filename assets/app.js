const API_URL = "https://bot.wproject.web.id";

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      try {
        const res = await fetch(`${API_URL}/generate`);
        const data = await res.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
          window.location.href = "watch.html";
        }
      } catch {
        alert("Gagal generate token!");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
  }
});
