const STREAM_URL = "https://stream.wproject.web.id/hls/teststream.m3u8";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

function initPlayer() {
  const video = document.getElementById("videoPlayer");
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(STREAM_URL);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
      const levels = hls.levels;
      if (levels.length > 1) {
        const select = document.createElement("select");
        select.id = "qualitySelect";
        levels.forEach((lvl, i) => {
          const opt = document.createElement("option");
          opt.value = i;
          opt.text = `${lvl.height}p`;
          select.appendChild(opt);
        });
        select.addEventListener("change", function () {
          hls.currentLevel = parseInt(this.value);
        });
        document.querySelector(".player-container").appendChild(select);
      }
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = STREAM_URL;
  }
}

function logout() {
  fetch("https://bot.wproject.web.id/logout?token=" + token, { method: "POST" })
    .then(() => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    })
    .catch(() => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
}

window.onload = initPlayer;
