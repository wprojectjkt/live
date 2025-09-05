document.addEventListener('contextmenu', e=>e.preventDefault());
document.addEventListener('keydown', e=>{ if(e.key==='F12') e.preventDefault(); if(e.ctrlKey && e.shiftKey && ['I','C','J'].includes(e.key)) e.preventDefault(); if(e.ctrlKey && ['U','S','P'].includes(e.key)) e.preventDefault(); });
function uuidv4(){ return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=> (c^crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c/4).toString(16)); }
function getQueryParam(n){const p=new URLSearchParams(location.search);return p.get(n);}
async function calcFingerprint(){ let deviceId=localStorage.getItem('wp_device_id'); if(!deviceId){deviceId=uuidv4(); localStorage.setItem('wp_device_id', deviceId);} const data=[navigator.userAgent,navigator.platform,navigator.language,screen.width+'x'+screen.height,deviceId].join('::'); const enc=new TextEncoder().encode(data); const buf=await crypto.subtle.digest('SHA-256',enc); return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join(''); }
const API_BASE='https://bot.wproject.web.id/api';
const modal=document.getElementById('modal'); const modalTitle=document.getElementById('modalTitle'); const modalMsg=document.getElementById('modalMsg'); const modalClose=document.getElementById('modalClose');
modalClose.addEventListener('click', ()=>{ modal.classList.add('hidden'); });
function showModal(title, msg){ modalTitle.textContent=title; modalMsg.textContent=msg; modal.classList.remove('hidden'); }
(async()=>{
  const token = getQueryParam('t') || localStorage.getItem('wp_token');
  const statusEl=document.getElementById('status');
  const logoutBtn=document.getElementById('logoutBtn');
  const video=document.getElementById('video');
  const qualitySel=document.getElementById('quality');
  const abrInfo=document.getElementById('abrInfo');
  if(!token){ location.href='./'; return; }
  const fingerprint=await calcFingerprint();
  let sessionKey = localStorage.getItem('wp_session_key');
  async function openSession(){
    const res=await fetch(API_BASE + '/session/open', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token, fingerprint, user_agent: navigator.userAgent })
    });
    const data = await res.json();
    if(!res.ok){ 
      // show clear message and do not attempt to play
      showModal('Akses Ditolak', data.detail || data.error || 'Token sudah dipakai di perangkat lain. Hubungi admin untuk reset.');
      statusEl.textContent = 'Akses ditolak';
      setTimeout(()=>{}, 1000);
      return false;
    }
    sessionKey = data.session_key;
    localStorage.setItem('wp_session_key', sessionKey);
    localStorage.setItem('wp_token', token);
    return data.stream_url;
  }
  async function heartbeat(){
    if(!sessionKey) return;
    try{
      await fetch(API_BASE + '/session/heartbeat', { method:'POST', headers: {'Content-Type':'application/json', 'Authorization': 'Bearer ' + sessionKey }, body: JSON.stringify({ fingerprint }) });
      statusEl.textContent = 'Terkoneksi';
    }catch(e){
      statusEl.textContent = 'Sesi ditutup';
      localStorage.removeItem('wp_session_key');
      setTimeout(()=>location.href='./', 1200);
    }
  }
  function setupHls(url){
    if(Hls.isSupported()){
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        qualitySel.innerHTML = '<option value="auto">Auto</option>';
        data.levels.forEach((lvl, idx) => {
          const height = lvl.height || (lvl.attrs && lvl.attrs.RESOLUTION ? lvl.attrs.RESOLUTION.split('x')[1] : '');
          const opt = document.createElement('option'); opt.value=String(idx); opt.textContent = (height?height+'p':'Level '+idx); qualitySel.appendChild(opt);
        });
        video.play().catch(()=>{});
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => { abrInfo.textContent = data.level === -1 ? 'Auto' : ('Level '+data.level); });
      qualitySel.addEventListener('change', ()=>{ const val=qualitySel.value; if(val==='auto') hls.currentLevel=-1; else hls.currentLevel=parseInt(val,10); });
    } else if(video.canPlayType('application/vnd.apple.mpegurl')){ video.src=url; video.addEventListener('loadedmetadata', ()=>video.play()); }
    else{ alert('Browser tidak mendukung HLS.'); }
  }
  // initialize
  const streamUrl = await openSession();
  if(!streamUrl) return;
  setupHls(streamUrl);
  statusEl.textContent='Terkoneksi';
  // heartbeat
  setInterval(heartbeat, 20000);
  // logout
  logoutBtn.addEventListener('click', async ()=>{
    try{ await fetch(API_BASE + '/session/logout', { method:'POST', headers: { 'Authorization': 'Bearer ' + sessionKey } }); }catch(e){};
    localStorage.removeItem('wp_session_key'); localStorage.removeItem('wp_token'); statusEl.textContent='Keluar'; setTimeout(()=>location.href='./', 300);
  });
})();