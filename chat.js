const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

// Random warna username
const colors = ["text-blue-400", "text-green-400", "text-pink-400", "text-yellow-400"];
const randomColor = () => colors[Math.floor(Math.random() * colors.length)];

function addMessage(user, text, self = false) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-start space-x-2 text-sm";

  const avatar = document.createElement("div");
  avatar.className = "w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-[10px]";
  avatar.textContent = user[0].toUpperCase();

  const bubble = document.createElement("div");
  bubble.className = `px-2 py-1 rounded-lg max-w-xs leading-snug ${
    self ? "bg-blue-600" : "bg-gray-700"
  } text-white`;

  const username = document.createElement("span");
  username.className = `block text-[10px] font-bold ${randomColor()}`;
  username.textContent = user;

  const message = document.createElement("span");
  message.textContent = text;

  bubble.appendChild(username);
  bubble.appendChild(message);
  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);

  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.onclick = () => {
  if (chatInput.value.trim()) {
    addMessage("You", chatInput.value, true);
    chatInput.value = "";
  }
};

// Dummy simulasi pesan orang lain
setInterval(() => {
  const fakeUsers = ["Alice", "Bob", "Charlie", "Dewi"];
  const fakeTexts = ["Halo!", "Mantap!", "🔥🔥🔥", "Lanjut terus!"];
  const u = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
  const t = fakeTexts[Math.floor(Math.random() * fakeTexts.length)];
  addMessage(u, t);
}, 5000);
