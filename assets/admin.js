const API_URL = "https://bot.wproject.web.id/api";
let adminToken = localStorage.getItem("wproject_admin");

// ===== Login =====
async function loginAdmin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) return alert("Isi username dan password!");

  try {
    const res = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.msg || "Login gagal");

    localStorage.setItem("wproject_admin", data.token);
    adminToken = data.token;
    initDashboard();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// ===== Dashboard Init =====
function initDashboard() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("logoutBtn").style.display = "inline-block";
  loadTokens();
  loadAdmins();
}

// ===== Token Management =====
async function loadTokens() {
  const res = await fetch(`${API_URL}/tokens`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const data = await res.json();

  const tbody = document.querySelector("#tokenTable tbody");
  tbody.innerHTML = "";
  data.tokens.forEach(t => {
    const row = `<tr>
      <td>${t.token}</td>
      <td>${t.active ? "✅ Aktif" : "❌ Tidak aktif"}</td>
      <td>${t.device || "-"}</td>
      <td><button onclick="deleteToken('${t.token}')">Hapus</button></td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

async function generateTokens() {
  const count = document.getElementById("tokenCount").value;
  await fetch(`${API_URL}/tokens/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ count })
  });
  loadTokens();
}

async function deleteToken(token) {
  await fetch(`${API_URL}/tokens/${token}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  loadTokens();
}

async function resetTokens() {
  if (!confirm("Yakin reset semua token?")) return;
  await fetch(`${API_URL}/tokens/reset`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  loadTokens();
}

// ===== Admin Management =====
async function loadAdmins() {
  const res = await fetch(`${API_URL}/admins`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const data = await res.json();

  const tbody = document.querySelector("#adminTable tbody");
  tbody.innerHTML = "";
  data.admins.forEach(a => {
    const row = `<tr>
      <td>${a}</td>
      <td><button onclick="removeAdmin('${a}')">Hapus</button></td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

async function addAdmin() {
  const newAdmin = document.getElementById("newAdmin").value.trim();
  const newPass = document.getElementById("newAdminPass").value.trim();
  if (!newAdmin || !newPass) return alert("Isi username dan password!");

  await fetch(`${API_URL}/admins/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ username: newAdmin, password: newPass })
  });
  loadAdmins();
}

async function removeAdmin(user) {
  await fetch(`${API_URL}/admins/${user}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  loadAdmins();
}

// ===== Logout =====
function logoutAdmin() {
  localStorage.removeItem("wproject_admin");
  window.location.reload();
}

// Auto-login jika sudah ada token
if (adminToken) initDashboard();
