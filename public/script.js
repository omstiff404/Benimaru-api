/* ===== Benimaru API — Real Frontend Logic ===== */

const API_BASE = window.location.origin; // same origin when served by Node

const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const burger = document.getElementById('burger');
const closeSidebar = document.getElementById('closeSidebar');
const pageTitle = document.getElementById('pageTitle');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

// Sidebar
function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeSidebarFn() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}
burger?.addEventListener('click', openSidebar);
closeSidebar?.addEventListener('click', closeSidebarFn);
overlay?.addEventListener('click', closeSidebarFn);

// Navigation (skip external links like admin.html)
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    const target = item.dataset.page;
    if (!target) return; // Admin Login dll — navigasi normal
    e.preventDefault();
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(target)?.classList.add('active');
    const titles = { home: 'Beranda', api: 'REST API', support: 'Dukungan' };
    pageTitle.textContent = titles[target] || 'Home';
    if (window.innerWidth < 1024) closeSidebarFn();
    history.replaceState(null, '', `#${target}`);
  });
});

function handleHash() {
  const hash = location.hash.replace('#', '') || 'home';
  const nav = document.querySelector(`.nav-item[data-page="${hash}"]`);
  if (nav) nav.click();
}
window.addEventListener('hashchange', handleHash);
handleHash();

// Accordion
document.querySelectorAll('.category-header').forEach(header => {
  header.addEventListener('click', () => {
    header.closest('.api-category')?.classList.toggle('open');
  });
});

document.querySelectorAll('.endpoint-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    toggle.closest('.endpoint-item')?.classList.toggle('open');
  });
});

// Live stats
function updateStats() {
  const el = document.getElementById('latency');
  if (el) el.textContent = `~${80 + Math.floor(Math.random() * 90)}ms`;
  const check = document.getElementById('lastCheck');
  if (check) check.textContent = 'Just now';
  const req = document.getElementById('totalReq');
  if (req) {
    let val = parseInt(req.textContent.replace(/,/g, '')) || 12847;
    val += Math.floor(Math.random() * 4);
    req.textContent = val.toLocaleString();
  }
}
setInterval(updateStats, 9000);

// Health check on load
fetch(`${API_BASE}/api/health`)
  .then(r => r.json())
  .then(d => {
    if (d.status) {
      document.querySelectorAll('.status-dot, .badge.online').forEach(el => {
        el.style.opacity = '1';
      });
    }
  })
  .catch(() => {});

// ===== REAL DOWNLOAD HANDLER (event delegation) =====
const NO_INPUT = new Set([
  'quote','quotes','joke','fact','activity','advice','dadjoke','chuck','insult',
  'affirmation','yesno','animequote','dog','cat','fox','duck','coffee','waifu',
  'randomuser','uuid','timestamp',
]);
const TEXT_INPUT = new Set([
  'pokemon','github','crypto','country','universities','dictionary','dict',
  'npm','weather','cuaca','ip','whois','base64','qr','password','hash','color',
  'morse','mock','reverse','count','lorem','numberfact','agify','genderize',
  'nationalize','shorten','shortlink','screenshot','ssweb','amprem',
]);

document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn-download');
  if (!btn) return;
  e.preventDefault();

  const platform = (btn.dataset.platform || 'aio').toLowerCase();
  const card = btn.closest('.endpoint-item') || btn.closest('.endpoint-detail') || btn.parentElement;
  const input = card?.querySelector?.('.url-input:not(.am-link)');
  const select = card?.querySelector?.('.type-select');
  const resultBox = card?.querySelector?.('.result-box');
  const raw = (input?.value || '').trim();

  // AM Verif: butuh email + link
  if (platform === 'amverif' || platform === 'amverify') {
    const emailEl = card?.querySelector?.('.am-email') || card?.querySelector?.('input[type="email"]');
    const linkEl = card?.querySelector?.('.am-link') || card?.querySelector?.('input[type="url"]');
    const email = (emailEl?.value || '').trim();
    const link = (linkEl?.value || '').trim();
    if (!email) {
      showResult(resultBox, { status: false, error: 'Isi email terlebih dahulu.' });
      return;
    }
    if (!link) {
      showResult(resultBox, { status: false, error: 'Isi link verifikasi terlebih dahulu.' });
      return;
    }
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Memproses...';
    try {
      const params = new URLSearchParams({ email, link });
      const apiUrl = API_BASE + '/api/amverif?' + params.toString();
      const res = await fetch(apiUrl);
      let data;
      try { data = await res.json(); }
      catch { data = { status: false, error: 'Server mengembalikan respon non-JSON (status ' + res.status + ')' }; }
      showResult(resultBox, data);
    } catch (err) {
      showResult(resultBox, {
        status: false,
        error: 'Gagal menghubungi server. Pastikan node server.js sudah berjalan di port yang sama.',
      });
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
    return;
  }

  // AM Prem: email saja
  if (platform === 'amprem') {
    if (!raw) {
      showResult(resultBox, { status: false, error: 'Isi email terlebih dahulu.' });
      return;
    }
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Memproses...';
    try {
      const params = new URLSearchParams({ email: raw });
      const apiUrl = API_BASE + '/api/amprem?' + params.toString();
      const res = await fetch(apiUrl);
      let data;
      try { data = await res.json(); }
      catch { data = { status: false, error: 'Server mengembalikan respon non-JSON (status ' + res.status + ')' }; }
      showResult(resultBox, data);
    } catch (err) {
      showResult(resultBox, {
        status: false,
        error: 'Gagal menghubungi server. Pastikan node server.js sudah berjalan di port yang sama.',
      });
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
    return;
  }

  // Require input only when needed
  if (!NO_INPUT.has(platform) && !raw) {
    showResult(resultBox, { status: false, error: 'Silakan isi parameter terlebih dahulu.' });
    return;
  }

  // Strict URL only for downloaders
  if (!NO_INPUT.has(platform) && !TEXT_INPUT.has(platform) && raw) {
    try { new URL(raw); }
    catch {
      showResult(resultBox, { status: false, error: 'Format URL tidak valid. Contoh: https://...' });
      return;
    }
  }

  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Memproses...';

  try {
    let apiUrl = API_BASE + '/api/download/' + encodeURIComponent(platform);
    const params = new URLSearchParams();
    if (raw) params.set('url', raw);
    if (select?.value) params.set('type', select.value);
    const qs = params.toString();
    if (qs) apiUrl += '?' + qs;

    const res = await fetch(apiUrl);
    let data;
    try {
      data = await res.json();
    } catch {
      data = { status: false, error: 'Server mengembalikan respon non-JSON (status ' + res.status + ')' };
    }
    showResult(resultBox, data);
  } catch (err) {
    showResult(resultBox, {
      status: false,
      error: 'Gagal menghubungi server. Pastikan node server.js sudah berjalan di port yang sama.',
    });
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
});

function showResult(box, data) {
  if (!box) return;
  box.classList.add('show');

  // Fail only when status is explicitly false
  if (!data || data.status === false) {
    const msg = (data && (data.error || data.message)) || 'Error tidak diketahui';
    box.innerHTML =
      '<div class="result-content error">' +
      escapeHtml(JSON.stringify({ status: false, error: String(msg) }, null, 2)) +
      '</div>';
    return;
  }

  let mediaHTML = '';
  let linksHTML = '';
  const imgUrl =
    data.gambar || data.image || data.foto || data.bendera ||
    (data.download && data.download.image) ||
    data.sprite || data.picture || data.flag || data.avatar || null;

  if (imgUrl && typeof imgUrl === 'string' && /^https?:\/\//i.test(imgUrl)) {
    mediaHTML =
      '<div style="margin:10px 0">' +
      '<img src="' + escapeAttr(imgUrl) + '" alt="preview" ' +
      'style="max-width:100%;max-height:220px;border:2.5px solid #000;border-radius:8px;box-shadow:3px 3px 0 #000"/>' +
      '</div>';
  }

  if (data.download && typeof data.download === 'object') {
    linksHTML = '<div class="download-links">';
    for (const [key, value] of Object.entries(data.download)) {
      if (!value || typeof value !== 'string' || !/^https?:\/\//i.test(value)) continue;
      const label = key.replace(/_/g, ' ').toUpperCase();
      const proxyUrl = API_BASE + '/api/proxy-download?url=' + encodeURIComponent(value);
      linksHTML +=
        '<a href="' + escapeAttr(proxyUrl) + '" class="dl-btn" download>' +
        label + '</a>';
    }
    if (data.download.image) {
      linksHTML +=
        '<a href="' + escapeAttr(data.download.image) + '" class="dl-btn" target="_blank" rel="noopener">BUKA GAMBAR</a>';
    }
    linksHTML += '</div>';
  } else if (imgUrl) {
    linksHTML =
      '<div class="download-links">' +
      '<a href="' + escapeAttr(imgUrl) + '" class="dl-btn" target="_blank" rel="noopener">BUKA GAMBAR</a>' +
      '</div>';
  }

  const pretty = escapeHtml(JSON.stringify(data, null, 2));
  box.innerHTML =
    mediaHTML +
    '<div class="result-content success">' + pretty + '</div>' +
    linksHTML;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

document.getElementById('themeBtn')?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

/* ===== Profile media: video cover + music + black spectrum ===== */
(function initProfileMedia() {
  const audio = document.getElementById('musicAudio');
  const canvas = document.getElementById('spectrum');
  const video = document.getElementById('profileVideo');
  const avatar = document.getElementById('profileAvatar');
  const titleEl = document.getElementById('musicTitle');
  const artistEl = document.getElementById('musicArtist');
  const playBtn = document.getElementById('musicPlay');
  if (!audio || !canvas) return;

  let playlist = [];
  let index = 0;
  let audioCtx = null;
  let analyser = null;
  let sourceNode = null;
  let raf = 0;
  const ctx = canvas.getContext('2d');

  function drawIdle() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, w, h);
    const bars = 32;
    const gap = 2;
    const bw = (w - gap * (bars + 1)) / bars;
    ctx.fillStyle = '#000';
    for (let i = 0; i < bars; i++) {
      const bh = 4 + Math.sin(i * 0.4) * 3;
      ctx.fillRect(gap + i * (bw + gap), h - bh - 4, bw, bh);
    }
  }

  function drawSpectrum() {
    if (!analyser) {
      drawIdle();
      return;
    }
    const w = canvas.width;
    const h = canvas.height;
    const buf = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(buf);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, w, h);
    const bars = 32;
    const gap = 2;
    const bw = (w - gap * (bars + 1)) / bars;
    const step = Math.floor(buf.length / bars);
    ctx.fillStyle = '#000';
    for (let i = 0; i < bars; i++) {
      const v = buf[i * step] / 255;
      const bh = Math.max(3, v * (h - 8));
      ctx.fillRect(gap + i * (bw + gap), h - bh - 2, bw, bh);
    }
    raf = requestAnimationFrame(drawSpectrum);
  }

  function ensureAudioGraph() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;
    sourceNode = audioCtx.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  function loadTrack(i) {
    if (!playlist.length) {
      titleEl.textContent = 'Tidak ada lagu';
      artistEl.textContent = '—';
      audio.removeAttribute('src');
      drawIdle();
      return;
    }
    index = ((i % playlist.length) + playlist.length) % playlist.length;
    const t = playlist[index];
    titleEl.textContent = t.title || 'Untitled';
    artistEl.textContent = t.artist || '—';
    audio.src = t.url;
  }

  async function play() {
    if (!playlist.length) return;
    try {
      ensureAudioGraph();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      await audio.play();
      playBtn.textContent = '⏸';
      cancelAnimationFrame(raf);
      drawSpectrum();
    } catch (e) {
      console.warn('play failed', e);
    }
  }

  function pause() {
    audio.pause();
    playBtn.textContent = '▶';
    cancelAnimationFrame(raf);
    drawIdle();
  }

  playBtn?.addEventListener('click', () => {
    if (audio.paused) play();
    else pause();
  });
  document.getElementById('musicPrev')?.addEventListener('click', () => {
    loadTrack(index - 1);
    play();
  });
  document.getElementById('musicNext')?.addEventListener('click', () => {
    loadTrack(index + 1);
    play();
  });
  audio.addEventListener('ended', () => {
    loadTrack(index + 1);
    play();
  });

  drawIdle();

  // Video sampul: public/cover.mp4
  if (video) {
    const candidates = ['/cover.mp4', '/cover.webm', '/cover.mov'];
    let vi = 0;
    const profile = document.querySelector('.sidebar-profile');
    const tryVideo = () => {
      if (vi >= candidates.length) {
        video.classList.remove('has-src');
        video.removeAttribute('src');
        profile && profile.classList.remove('has-video');
        return;
      }
      const src = candidates[vi++];
      video.onerror = function () { tryVideo(); };
      video.onloadeddata = function () {
        video.classList.add('has-src');
        if (profile) profile.classList.add('has-video');
        video.muted = true;
        video.playsInline = true;
        video.play().catch(function () {});
      };
      video.setAttribute('src', src);
      video.load();
    };
    tryVideo();
  }

  // Playlist: edit public/playlist.json — file audio di public/music/ (nama bebas)
  fetch(API_BASE + '/api/playlist')
    .then((r) => (r.ok ? r.json() : []))
    .then((list) => {
      playlist = (Array.isArray(list) ? list : []).map((t) => ({
        title: t.title || t.file || 'Track',
        artist: t.artist || '',
        url: t.url || t.file || '',
      })).filter((t) => t.url);
      if (playlist.length) loadTrack(0);
    })
    .catch(() => {});
})();
