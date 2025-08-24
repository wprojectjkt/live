const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

const wsChat = new WebSocket("wss://bot.wproject.web.id/chat");

wsChat.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  const div = document.createElement("div");
  div.className = "p-1";
  div.textContent = `${msg.user}: ${msg.text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
};

sendBtn.onclick = () => {
  if (chatInput.value.trim()) {
    wsChat.send(JSON.stringify({ text: chatInput.value }));
    chatInput.value = "";
  }
};
