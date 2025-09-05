const API_URL = "https://bot.wproject.web.id";
const HLS_URL = "https://stream.wproject.web.id/hls/teststream.m3u8";

function startPlayer() {
  const video = document.getElementById("videoPlayer");

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(HLS_URL);
    hls.attachMedia(video);

    // Setelah manifest dimuat
    hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
      buildQualitySelector(hls, data.levels);
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = HLS_URL;
  }
}

function buildQualitySelector(hls, levels) {
  const controlBar = document.querySelector(".custom-controls");

  if (!levels || levels.length <= 1) return;

  const select = document.createElement("select");
  select.className = "quality-selector";

  // Auto option
  const autoOption = document.createElement("option");
  autoOption.value = -1;
  autoOption.text = "Auto";
  select.appendChild(autoOption);

  levels.forEach((lvl, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = `${lvl.height}p`;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => {
    const value = parseInt(select.value);
    if (value === -1) {
      hls.currentLevel = -1; // auto
    } else {
      hls.currentLevel = value;
    }
  });

  controlBar.appendChild(select);
}

function initPlayer() {
  const token = new URLSearchParams(window.location.search).get("token");
  if (!token) return logout();

  fetch(`${API_URL}/validate?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (!data.valid) return logout();
      startPlayer();
    })
    .catch(() => { alert("API Error"); logout(); });
}

window.onload = initPlayer;
