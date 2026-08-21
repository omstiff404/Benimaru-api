# Benimaru API v2.5

REST API downloader + **profile media** (avatar, video sampul, playlist musik) + **admin panel**.

## Fitur baru

- Video sampul di belakang avatar (sidebar)
- Player musik + spektrum garis hitam (Web Audio)
- Admin login: atur avatar, video, tambah/hapus musik (upload atau URL)
- Data disimpan di **Aiven PostgreSQL**
- Siap deploy **Vercel** (media/admin) + jalan lokal penuh

## Setup Aiven

1. Buat service **PostgreSQL** di [Aiven](https://aiven.io)
2. Copy **Service URI** → `DATABASE_URL`
3. Jalankan schema (opsional, auto-create saat API dipanggil):

```bash
psql "$DATABASE_URL" -f sql/schema.sql
```

## Konfigurasi (`config.js`)

Edit file **`config.js`** di root project (tidak pakai `.env`):

```js
export default {
  DATABASE_URL: 'postgres://...aiven...',  // wajib untuk media/admin
  ADMIN_PASSWORD: 'password-admin',
  JWT_SECRET: 'string-acak-panjang',
  AM_API_KEY: 'RS-9J^q$1gF',
  PORT: 3000,
};
```

| Key | Wajib | Keterangan |
|-----|-------|------------|
| `DATABASE_URL` | ya (media) | Aiven Postgres URI |
| `ADMIN_PASSWORD` | ya | Login `/admin` |
| `JWT_SECRET` | ya (prod) | Secret tanda tangan token admin |
| `AM_API_KEY` | tidak | Key AM Prem/Verif |
| `PORT` | tidak | Default 3000 |

## Local

```bash
npm install
# edit config.js dulu
node server.js
```

- Site: http://localhost:3000  
- Admin: http://localhost:3000/admin.html  

## Deploy Vercel

1. Push repo ke GitHub
2. Import di Vercel
3. Pastikan `config.js` terisi (atau set env setara di Vercel jika perlu)
4. Deploy

> **Catatan Vercel:** endpoint media/admin jalan di serverless.  
> Scraper/downloader (yt-dlp, dll.) lebih stabil di VPS/`node server.js` karena butuh binary & proses panjang.  
> Limit upload serverless ~4.5MB body default; video besar lebih baik pakai **URL eksternal** di admin.

## Endpoint media

```
GET  /api/media              → avatar, video, playlist (public)
GET  /api/file/:id           → stream file dari Aiven
POST /api/admin/login        → { password } → { token }
GET  /api/admin/settings     → Bearer token
POST /api/admin/settings     → update avatar_url, video_url, brand
POST /api/admin/upload       → { kind, data:base64, mime, filename, title? }
GET|POST|PUT|DELETE /api/admin/music
```

## AM Account

```
GET /api/amprem?email=
GET /api/amverif?email=&link=
```

## Categories API

Downloader, Fun, Info, Utilities (+ AM Prem/Verif), Media profile.
