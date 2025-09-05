const HLS_URL = "https://stream.wproject.web.id/hls/teststream.m3u8";
const token = localStorage.getItem("token");

async function validateToken() {
  if (!token) return false;
  try {
    const res = await fetch(`${API_URL}/validate?token=${token}`);
    const data = await res.json();
    return data.valid;
  } catch {
    return false;
  }
}

function startPlayer() {
  const video = document.getElementById("videoPlayer");

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(HLS_URL);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
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

  const autoOpt = document.createElement("option");
  autoOpt.value = -1;
  autoOpt.text = "Auto";
  select.appendChild(autoOpt);

  levels.forEach((lvl, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = `${lvl.height}p`;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => {
    hls.currentLevel = parseInt(select.value);
  });

  controlBar.appendChild(select);
}

window.onload = async () => {
  const valid = await validateToken();
  if (!valid) {
    alert("Token tidak valid!");
    localStorage.removeItem("token");
    window.location.href = "index.html";
    return;
  }
  startPlayer();
};
