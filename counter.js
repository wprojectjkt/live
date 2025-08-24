const viewerCountEl = document.getElementById("viewerCount");
const wsCounter = new WebSocket("wss://bot.wproject.web.id/counter");

wsCounter.onmessage = (event) => {
  const count = JSON.parse(event.data).viewers;
  viewerCountEl.textContent = `👥 Penonton: ${count}`;
};
