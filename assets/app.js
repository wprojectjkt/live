let hls, video;

function initPlayer(src) {
  video = document.getElementById("video");

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = src;
  }
}

function changeQuality(q) {
  const base = "https://stream.wproject.web.id/hls/teststream";
  const src = `${base}_${q}p.m3u8`;

  if (hls) {
    hls.destroy();
    hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(video);
  } else {
    video.src = src;
  }
}
