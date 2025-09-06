document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const token = document.getElementById("tokenInput").value.trim();
  if (token) {
    localStorage.setItem("token", token);
    window.location.href = "watch.html";
  }
});
