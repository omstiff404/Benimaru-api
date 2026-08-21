const API = '';
const TOKEN_KEY = 'benimaru_admin_token';

function token() {
  return localStorage.getItem(TOKEN_KEY) || '';
}
function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

function msg(el, text, ok) {
  const box = document.getElementById(el);
  if (!box) return;
  box.innerHTML = text
    ? `<div class="msg ${ok ? 'ok' : 'err'}">${text}</div>`
    : '';
}

async function api(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (token()) headers.Authorization = 'Bearer ' + token();
  if (opts.body && !(opts.body instanceof FormData) && typeof opts.body === 'object') {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(API + path, { ...opts, headers });
  const data = await res.json().catch(() => ({ status: false, error: 'Invalid JSON' }));
  if (res.status === 401) {
    setToken('');
    showLogin();
  }
  return data;
}

function showLogin() {
  document.getElementById('loginBox').style.display = 'block';
  document.getElementById('dash').style.display = 'none';
}
function showDash() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('dash').style.display = 'block';
  loadAll();
}

document.getElementById('btnLogin').onclick = async () => {
  const password = document.getElementById('password').value;
  msg('loginMsg', 'Memproses...', true);
  const data = await api('/api/admin/login', { method: 'POST', body: { password } });
  if (data.status && data.token) {
    setToken(data.token);
    msg('loginMsg', '', true);
    showDash();
  } else {
    msg('loginMsg', data.error || 'Gagal login', false);
  }
};

document.getElementById('btnLogout').onclick = () => {
  setToken('');
  showLogin();
};

document.querySelectorAll('.tabs button').forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll('.tabs button').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
  };
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function loadAll() {
  const data = await api('/api/admin/settings');
  if (!data.status) {
    msg('dashMsg', data.error || 'Gagal load', false);
    return;
  }
  const s = data.settings || {};
  document.getElementById('avPreview').src = s.avatar_url || '/avatar.jpg';
  document.getElementById('avUrl').value = s.avatar_url || '';
  document.getElementById('vidUrl').value = s.video_url || '';
  const vp = document.getElementById('vidPreview');
  if (s.video_url) {
    vp.src = s.video_url;
    vp.style.display = 'block';
  } else {
    vp.removeAttribute('src');
    vp.style.display = 'none';
  }
  document.getElementById('siteName').value = s.site_name || 'Benimaru';
  document.getElementById('siteSub').value = s.site_sub || 'API';
  renderTracks(data.music || []);
}

function renderTracks(list) {
  const el = document.getElementById('trackList');
  if (!list.length) {
    el.innerHTML = '<p style="color:var(--muted)">Belum ada lagu.</p>';
    return;
  }
  el.innerHTML = list
    .map(
      (t) => `
    <div class="track">
      <div>
        <strong>${escapeHtml(t.title)}</strong><br/>
        <small>${escapeHtml(t.artist || '')} · <code>${escapeHtml(t.url)}</code></small>
      </div>
      <button class="danger" data-del="${t.id}">Hapus</button>
    </div>`
    )
    .join('');
  el.querySelectorAll('[data-del]').forEach((btn) => {
    btn.onclick = async () => {
      if (!confirm('Hapus lagu ini?')) return;
      const r = await api('/api/admin/music', {
        method: 'DELETE',
        body: { id: Number(btn.dataset.del) },
      });
      msg('dashMsg', r.status ? 'Lagu dihapus' : r.error, r.status);
      loadAll();
    };
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.getElementById('btnAvUpload').onclick = async () => {
  const f = document.getElementById('avFile').files[0];
  if (!f) return msg('dashMsg', 'Pilih file avatar', false);
  msg('dashMsg', 'Upload avatar...', true);
  const data = await fileToBase64(f);
  const r = await api('/api/admin/upload', {
    method: 'POST',
    body: { kind: 'avatar', filename: f.name, mime: f.type, data },
  });
  msg('dashMsg', r.status ? 'Avatar tersimpan di Aiven' : r.error, r.status);
  if (r.status) loadAll();
};

document.getElementById('btnAvUrl').onclick = async () => {
  const url = document.getElementById('avUrl').value.trim();
  const r = await api('/api/admin/settings', { method: 'POST', body: { avatar_url: url } });
  msg('dashMsg', r.status ? 'URL avatar disimpan' : r.error, r.status);
  if (r.status) loadAll();
};

document.getElementById('btnVidUpload').onclick = async () => {
  const f = document.getElementById('vidFile').files[0];
  if (!f) return msg('dashMsg', 'Pilih file video', false);
  msg('dashMsg', 'Upload video (bisa lama)...', true);
  const data = await fileToBase64(f);
  const r = await api('/api/admin/upload', {
    method: 'POST',
    body: { kind: 'video', filename: f.name, mime: f.type, data },
  });
  msg('dashMsg', r.status ? 'Video tersimpan di Aiven' : r.error, r.status);
  if (r.status) loadAll();
};

document.getElementById('btnVidUrl').onclick = async () => {
  const url = document.getElementById('vidUrl').value.trim();
  const r = await api('/api/admin/settings', { method: 'POST', body: { video_url: url } });
  msg('dashMsg', r.status ? 'URL video disimpan' : r.error, r.status);
  if (r.status) loadAll();
};

document.getElementById('btnVidClear').onclick = async () => {
  const r = await api('/api/admin/settings', { method: 'POST', body: { video_url: '' } });
  msg('dashMsg', r.status ? 'Video dihapus' : r.error, r.status);
  if (r.status) loadAll();
};

document.getElementById('btnMUpload').onclick = async () => {
  const f = document.getElementById('mFile').files[0];
  if (!f) return msg('dashMsg', 'Pilih file audio', false);
  msg('dashMsg', 'Upload musik...', true);
  const data = await fileToBase64(f);
  const r = await api('/api/admin/upload', {
    method: 'POST',
    body: {
      kind: 'music',
      filename: f.name,
      mime: f.type,
      data,
      title: document.getElementById('mTitle').value || f.name,
      artist: document.getElementById('mArtist').value || '',
    },
  });
  msg('dashMsg', r.status ? 'Musik ditambahkan' : r.error, r.status);
  if (r.status) loadAll();
};

document.getElementById('btnMUrl').onclick = async () => {
  const url = document.getElementById('mUrl2').value.trim();
  if (!url) return msg('dashMsg', 'URL wajib', false);
  const r = await api('/api/admin/music', {
    method: 'POST',
    body: {
      title: document.getElementById('mTitle2').value || 'Untitled',
      artist: document.getElementById('mArtist2').value || '',
      url,
    },
  });
  msg('dashMsg', r.status ? 'Musik ditambahkan' : r.error, r.status);
  if (r.status) loadAll();
};

document.getElementById('btnBrand').onclick = async () => {
  const r = await api('/api/admin/settings', {
    method: 'POST',
    body: {
      site_name: document.getElementById('siteName').value,
      site_sub: document.getElementById('siteSub').value,
    },
  });
  msg('dashMsg', r.status ? 'Brand disimpan' : r.error, r.status);
};

if (token()) showDash();
else showLogin();
