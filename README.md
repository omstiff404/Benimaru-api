# Benimaru API v2.5.1

REST API downloader + profile media (video sampul + musik).

## Profile media (manual file)

### Video sampul
Letakkan di `public/`:

```
public/cover.mp4
```

(alternatif: `cover.webm`, `cover.mov`)

### Musik — otomatis
Taruh file audio di:

```
public/music/
```

Nama file **bebas / acak**. Server scan folder itu otomatis — **tidak perlu** edit `playlist.json`.

Contoh:
```
public/music/xyz.mp3
public/music/lagu-random.ogg
public/music/a1.mp3
```

Endpoint: `GET /api/playlist`

### Avatar
Ganti `public/avatar.jpg`

## Local

```bash
npm install
node server.js
```

## AM Account

```
GET /api/amprem?email=
GET /api/amverif?email=&link=
```

Key di `config.js` → `AM_API_KEY`
