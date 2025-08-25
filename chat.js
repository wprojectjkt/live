const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const pinned = document.getElementById("pinned");
const giftOverlay = document.getElementById("giftOverlay");

const colors = ["text-blue-400", "text-green-400", "text-pink-400", "text-yellow-400"];
const randomColor = () => colors[Math.floor(Math.random() * colors.length)];

function addMessage(user, text, self = false, isAdmin = false) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-start space-x-2 text-sm animate-fade-in";

  const avatar = document.createElement("div");
  avatar.className = "w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-[10px]";
  avatar.textContent = user[0].toUpperCase();

  const bubble = document.createElement("div");
  bubble.className = `px-2 py-1 rounded-lg max-w-xs leading-snug ${
    self ? "bg-blue-600" : "bg-gray-700"
  } text-white`;

  const username = document.createElement("span");
  username.className = `block text-[10px] font-bold ${isAdmin ? "text-red-400" : randomColor()}`;
  username.textContent = isAdmin ? user + " (Admin)" : user;

  const message = document.createElement("span");
  message.textContent = text;

  bubble.appendChild(username);
  bubble.appendChild(message);
  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);

  chatBox.appendChild(wrapper);
  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
}

sendBtn.onclick = () => {
  if (chatInput.value.trim()) {
    addMessage("You", chatInput.value, true);
    chatInput.value = "";
  }
};

// Gift button
document.querySelectorAll(".giftBtn").forEach(btn => {
  btn.onclick = () => {
    showGift("You", btn.textContent);
  };
});

function showGift(user, emoji) {
  const gift = document.createElement("div");
  gift.className = "absolute bottom-10 left-1/2 transform -translate-x-1/2 text-4xl animate-float-up";
  gift.textContent = emoji;
  document.body.appendChild(gift);

  setTimeout(() => gift.remove(), 2000);

  // juga tampilkan di overlay kecil
  const notif = document.createElement("div");
  notif.className = "bg-gray-800 bg-opacity-70 px-3 py-1 rounded-full text-white animate-fade-in";
  notif.textContent = `${user} mengirim ${emoji}`;
  giftOverlay.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

// Pinned message (contoh)
setTimeout(() => {
  pinned.textContent = "📢 Jangan lupa follow & share stream ini!";
  pinned.classList.remove("hidden");
}, 2000);

// Dummy chat simulasi
setInterval(() => {
  const fakeUsers = ["Alice", "Bob", "Charlie", "Dewi"];
  const fakeTexts = ["Halo!", "Mantap!", "🔥🔥🔥", "Bagus banget!", "Setuju 👍"];
  const u = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
  const t = fakeTexts[Math.floor(Math.random() * fakeTexts.length)];
  addMessage(u, t, false, Math.random() > 0.8); // 20% admin
}, 5000);
