const UA = 'Mozilla/5.0 (compatible; BenimaruAPI/2.5)';

/* ===== Sumber lokal Bahasa Indonesia ===== */
const KUTIPAN_ID = [
  { isi: 'Hidup adalah perjuangan. Jangan menyerah sebelum mencoba.', penulis: 'Anonim' },
  { isi: 'Kesuksesan adalah hasil dari kegagalan yang tidak pernah berhenti mencoba.', penulis: 'Anonim' },
  { isi: 'Jangan takut gagal, takutlah tidak mencoba.', penulis: 'Anonim' },
  { isi: 'Ilmu tanpa amal bagai pohon tanpa buah.', penulis: 'Anonim' },
  { isi: 'Waktu adalah uang. Jangan sia-siakan.', penulis: 'Anonim' },
  { isi: 'Berbuat baiklah, maka kebaikan akan kembali padamu.', penulis: 'Anonim' },
  { isi: 'Orang bijak belajar dari kesalahan orang lain.', penulis: 'Anonim' },
  { isi: 'Kesabaran adalah kunci dari segala keberhasilan.', penulis: 'Anonim' },
  { isi: 'Jangan bandingkan prosesmu dengan orang lain.', penulis: 'Anonim' },
  { isi: 'Mimpi besar dimulai dari langkah kecil hari ini.', penulis: 'Anonim' },
  { isi: 'Gagal itu biasa, menyerah itu pilihan.', penulis: 'Anonim' },
  { isi: 'Belajarlah dari masa lalu, hiduplah untuk masa depan.', penulis: 'Anonim' },
  { isi: 'Kebahagiaan sejati datang dari dalam diri.', penulis: 'Anonim' },
  { isi: 'Jujur adalah mata uang yang berlaku di mana saja.', penulis: 'Anonim' },
  { isi: 'Siapa yang menanam, dia yang menuai.', penulis: 'Peribahasa' },
  { isi: 'Air beriak tanda tak dalam.', penulis: 'Peribahasa' },
  { isi: 'Sambil menyelam minum air.', penulis: 'Peribahasa' },
  { isi: 'Berat sama dipikul, ringan sama dijinjing.', penulis: 'Peribahasa' },
  { isi: 'Dimana ada kemauan, di situ ada jalan.', penulis: 'Peribahasa' },
  { isi: 'Tak ada gading yang tak retak.', penulis: 'Peribahasa' },
];

const LELUCON_ID = [
  'Kalo dipotong malah tambah tinggi, apa itu? Celana.',
  'Apa bedanya kamu sama kalender? Kalender ada masa depannya.',
  'Kenapa motor berhenti di depan rumah sakit? Karena kehabisan bensin, bukan nyawa.',
  'Tukang parkir bilang: parkir di sini, pak. Eh motornya malah dibawa pulang.',
  'Ibu-ibu di warung: es tehnya panas ya? Penjual: iya bu, biar seger pas dingin.',
  'Kenapa laptop sering hang? Karena dia juga butuh istirahat.',
  'Apa makanan favorit hantu? Kue cubit... soalnya ditakut-takutin.',
  'Kenapa ayam menyeberang jalan? Supaya sampai di seberang.',
  'Dokter: Anda kurang vitamin. Pasien: Ya iyalah dok, kan mahal.',
  'Pacar bilang: aku butuh ruang. Aku kasih dia Google Drive.',
  'Motivasi hari ini: kalau masih diselimuti masalah, berarti kamu manusia. Kalau diselimuti wijen, berarti onde-onde.',
  'Gula-gula apa yang bukan gula? Gula aren\'t.',
  'Barusan mau masak, pancinya jalan sendiri. Ternyata Panji Petualang.',
  'Kenapa programmer suka gelap? Karena light mode bikin mata sakit... katanya.',
  'Apa bedanya error sama mantan? Error masih bisa di-fix.',
];

const SARAN_ID = [
  'Minum air yang cukup hari ini.',
  'Istirahat sejenak, jangan memaksakan diri.',
  'Selesaikan satu tugas kecil sekarang juga.',
  'Hubungi teman yang sudah lama tidak dihubungi.',
  'Bersihkan meja kerjamu biar pikiran lebih lega.',
  'Jalan kaki 10 menit di luar.',
  'Catat 3 hal yang kamu syukuri hari ini.',
  'Jangan menunda pekerjaan yang bisa dikerjakan 5 menit.',
  'Tidur lebih awal malam ini.',
  'Belajar satu hal baru, meski kecil.',
];

const AFIRMASI_ID = [
  'Aku mampu menyelesaikan tantangan hari ini.',
  'Aku terus berkembang setiap hari.',
  'Aku pantas mendapatkan hal-hal baik.',
  'Aku fokus fokus dan produktif.',
  'Aku bersyukur atas apa yang aku miliki.',
  'Aku tenang menghadapi masalah.',
  'Aku berani mencoba hal baru.',
  'Aku cukup dan berharga.',
];

const FAKTA_ID = [
  'Indonesia punya lebih dari 17.000 pulau.',
  'Bahasa Indonesia diresmikan pada 28 Oktober 1928.',
  'Gunung tertinggi di Indonesia adalah Puncak Jaya (Carstensz).',
  'Komodo hanya ada di Indonesia.',
  'Borobudur adalah candi Buddha terbesar di dunia.',
  'Indonesia dilalui garis khatulistiwa.',
  'Raja Ampat memiliki keanekaragaman laut tertinggi di dunia.',
  'Batik ditetapkan UNESCO sebagai warisan budaya dunia.',
  'Garuda Pancasila adalah lambang negara Indonesia.',
  'Mata uang Indonesia adalah Rupiah (IDR).',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}



async function getJson(url, timeout = 12000) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function getText(url, timeout = 12000) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.text();
}

export async function toolQuote() {
  try {
    const d = await getJson('https://candaan-api.vercel.app/api/text/random');
    // candaan is joke; try local quotes primarily
  } catch {}
  const q = pick(KUTIPAN_ID);
  return { status: true, fitur: 'kutipan', isi: q.isi, penulis: q.penulis, sumber: 'Indonesia' };
}

export async function toolJoke() {
  try {
    const d = await getJson('https://candaan-api.vercel.app/api/text/random');
    const teks = typeof d.data === 'string' ? d.data : null;
    if (teks) return { status: true, fitur: 'lelucon', teks, sumber: 'candaan-api (Indonesia)' };
  } catch {}
  return { status: true, fitur: 'lelucon', teks: pick(LELUCON_ID), sumber: 'lokal (Indonesia)' };
}

export async function toolFact() {
  const list = [
    'Indonesia punya lebih dari 17.000 pulau.',
    'Bahasa Indonesia berasal dari bahasa Melayu.',
    'Komodo hanya hidup alami di Indonesia.',
    'Gunung tertinggi di Indonesia adalah Puncak Jaya (Cartenz).',
    'Borobudur adalah candi Buddha terbesar di dunia.',
    'Indonesia dilalui garis khatulistiwa.',
    'Raja Ampat punya keanekaragaman terumbu karang sangat tinggi.',
    'Batik ditetapkan UNESCO sebagai Warisan Budaya Takbenda.',
    'Jakarta dulu bernama Batavia pada masa kolonial.',
    'Indonesia adalah negara kepulauan terbesar di dunia.',
    'Angklung berasal dari Jawa Barat.',
    'Danau Toba adalah danau vulkanik terbesar di Asia Tenggara.',
    'Burung Cenderawasih banyak ditemukan di Papua.',
    'Indonesia punya 6 agama yang diakui secara resmi.',
    'Pulau Jawa adalah pulau terpadat di Indonesia.',
    'Rendang berasal dari Minangkabau, Sumatra Barat.',
    'Indonesia merdeka pada 17 Agustus 1945.',
    'Bahasa daerah di Indonesia lebih dari 700.',
    'Orangutan hanya ada di Sumatra dan Kalimantan.',
    'Bhinneka Tunggal Ika berarti berbeda-beda tetapi tetap satu.',
  ];
  const teks = list[Math.floor(Math.random() * list.length)];
  return { status: true, fitur: 'fakta', teks };
}

export async function toolActivity() {
  const list = [
    'Bersihkan meja atau kamar sebentar.',
    'Minum air putih satu gelas.',
    'Jalan kaki 10 menit di luar.',
    'Tulis 3 hal yang kamu syukuri hari ini.',
    'Baca 5 halaman buku.',
    'Hubungi teman lama via chat.',
    'Coba masak sesuatu yang sederhana.',
    'Rapikan file di laptop.',
    'Stretches 5 menit.',
    'Dengarkan satu lagu favorit tanpa gangguan.',
    'Buat to-do list untuk besok.',
    'Pelajari satu shortcut keyboard baru.',
  ];
  return { status: true, fitur: 'aktivitas', aktivitas: pick(list), sumber: 'Indonesia' };
}

export async function toolPokemon(name) {
  const id = (name || 'pikachu').toLowerCase().trim();
  try {
    const d = await getJson('https://pokeapi.co/api/v2/pokemon/' + encodeURIComponent(id));
    return {
      status: true, fitur: 'pokemon',
      nama: d.name, id: d.id, tinggi: d.height, berat: d.weight,
      tipe: (d.types || []).map((t) => t.type.name),
      gambar: d.sprites?.other?.['official-artwork']?.front_default || d.sprites?.front_default,
      image: d.sprites?.other?.['official-artwork']?.front_default || d.sprites?.front_default,
    };
  } catch {
    return { status: false, fitur: 'pokemon', error: 'Pokemon tidak ditemukan. Coba: pikachu, charizard, mewtwo' };
  }
}

export async function toolGithub(user) {
  const u = (user || '').replace(/^@/, '').trim();
  if (!u) return { status: false, error: 'Username wajib diisi' };
  try {
    const res = await fetch('https://api.github.com/users/' + encodeURIComponent(u), {
      headers: { 'User-Agent': 'BenimaruAPI', Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await res.json();
    return {
      status: true, fitur: 'github',
      username: d.login, nama: d.name, bio: d.bio,
      repo_publik: d.public_repos, pengikut: d.followers, mengikuti: d.following,
      avatar: d.avatar_url, url: d.html_url, lokasi: d.location,
      image: d.avatar_url,
    };
  } catch (e) {
    return {
      status: true, fitur: 'github', username: u,
      url: 'https://github.com/' + u,
      catatan: 'Data terbatas (rate limit): ' + e.message,
    };
  }
}

export async function toolCrypto(coin) {
  const c = (coin || 'bitcoin').toLowerCase().trim().replace(/\s+/g, '-');
  try {
    const d = await getJson(
      'https://api.coingecko.com/api/v3/simple/price?ids=' +
        encodeURIComponent(c) +
        '&vs_currencies=usd,idr&include_24hr_change=true'
    );
    if (!d[c]) throw new Error('tidak ditemukan');
    return {
      status: true, fitur: 'kripto', koin: c,
      usd: d[c].usd, idr: d[c].idr, perubahan_24j: d[c].usd_24h_change,
    };
  } catch {
    try {
      const list = await getJson('https://api.coingecko.com/api/v3/search?query=' + encodeURIComponent(c));
      const hit = list.coins?.[0];
      if (!hit) return { status: false, error: 'Koin tidak ditemukan. Coba: bitcoin, ethereum, solana' };
      const d2 = await getJson(
        'https://api.coingecko.com/api/v3/simple/price?ids=' + hit.id + '&vs_currencies=usd,idr'
      );
      return {
        status: true, fitur: 'kripto', koin: hit.id, simbol: hit.symbol,
        usd: d2[hit.id]?.usd, idr: d2[hit.id]?.idr,
      };
    } catch (e) {
      return { status: false, error: 'Gagal ambil harga: ' + e.message };
    }
  }
}

export async function toolDog() {
  try {
    const d = await getJson('https://dog.ceo/api/breeds/image/random');
    return { status: true, fitur: 'anjing', gambar: d.message, image: d.message };
  } catch (e) {
    return { status: false, fitur: 'anjing', error: 'Gagal: ' + e.message };
  }
}

export async function toolCat() {
  try {
    const d = await getJson('https://api.thecatapi.com/v1/images/search');
    const url = d[0]?.url;
    return { status: true, fitur: 'kucing', gambar: url, image: url };
  } catch (e) {
    return { status: false, fitur: 'kucing', error: 'Gagal: ' + e.message };
  }
}

export async function toolWaifu() {
  const sources = [
    'https://nekos.life/api/v2/img/neko',
    'https://nekos.life/api/v2/img/waifu',
    'https://api.waifu.pics/sfw/waifu',
    'https://api.waifu.im/search?is_nsfw=false',
  ];
  for (const src of sources) {
    try {
      const d = await getJson(src, 10000);
      let image = null;
      if (d.url) image = d.url;
      else if (d.images?.[0]?.url) image = d.images[0].url;
      else if (d.results?.[0]?.url) image = d.results[0].url;
      if (image) return { status: true, fitur: 'waifu', gambar: image, image };
    } catch {}
  }
  return { status: false, fitur: 'waifu', error: 'Gagal mengambil gambar waifu. Coba lagi nanti.' };
}

export async function toolIp(q) {
  const target = (q || '').replace(/^https?:\/\//, '').split('/')[0];
  if (!target) return { status: false, error: 'IP atau domain wajib diisi' };
  try {
    const data = await getJson(
      'http://ip-api.com/json/' +
        encodeURIComponent(target) +
        '?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query'
    );
    if (data.status === 'fail') return { status: false, error: data.message };
    return {
      status: true, fitur: 'ip',
      ip: data.query, negara: data.country, kota: data.city,
      wilayah: data.regionName, isp: data.isp, zona_waktu: data.timezone,
      lat: data.lat, lon: data.lon,
    };
  } catch (e) {
    return { status: false, error: e.message };
  }
}

export async function toolScreenshot(url) {
  if (!url) return { status: false, error: 'URL wajib diisi' };
  const img = 'https://image.thum.io/get/width/1280/crop/900/' + encodeURIComponent(url);
  return { status: true, fitur: 'screenshot', url, gambar: img, download: { image: img } };
}

export async function toolBase64(text, mode = 'encode') {
  if (!text) return { status: false, error: 'Teks wajib diisi' };
  if (mode === 'decode') {
    try {
      return { status: true, fitur: 'base64', mode: 'decode', hasil: Buffer.from(text, 'base64').toString('utf8') };
    } catch {
      return { status: false, error: 'Base64 tidak valid' };
    }
  }
  return { status: true, fitur: 'base64', mode: 'encode', hasil: Buffer.from(text, 'utf8').toString('base64') };
}

export async function toolRandomUser() {
  try {
    const d = await getJson('https://randomuser.me/api/');
    const u = d.results?.[0];
    return {
      status: true, fitur: 'pengguna_acak',
      nama: (u?.name?.first || '') + ' ' + (u?.name?.last || ''),
      email: u?.email, telepon: u?.phone,
      negara: u?.location?.country, kota: u?.location?.city,
      foto: u?.picture?.large, image: u?.picture?.large,
    };
  } catch (e) {
    return { status: false, error: e.message };
  }
}

export async function toolAdvice() {
  const list = [
    'Mulai dari yang kecil, konsisten lebih penting dari sempurna.',
    'Jangan takut bertanya — lebih baik tanya daripada salah arah.',
    'Istirahat juga produktif; otak butuh jeda.',
    'Simpan backup sebelum eksperimen besar.',
    'Baca error message-nya, seringkali sudah kasih petunjuk.',
    'Belajar sedikit setiap hari lebih ampuh daripada ngebut seminggu lalu hilang.',
    'Tolak toxic hustle — kesehatan mental itu aset.',
    'Dokumentasikan kerjaanmu; dirimu di masa depan akan berterima kasih.',
    'Jangan bandingkan prosesmu dengan highlight orang lain.',
    'Kalau stuck, jelaskan masalahnya ke orang lain — sering ketemu solusinya sendiri.',
  ];
  return { status: true, fitur: 'saran', saran: list[Math.floor(Math.random() * list.length)] };
}

export async function toolNumberFact(n) {
  const num = n || String(Math.floor(Math.random() * 100));
  try {
    const t = await getText('http://numbersapi.com/' + encodeURIComponent(num) + '/trivia');
    return { status: true, fitur: 'fakta_angka', angka: num, teks: t, catatan: 'Sumber EN' };
  } catch {
    return { status: true, fitur: 'fakta_angka', angka: num, teks: num + ' adalah sebuah angka.' };
  }
}

export async function toolCountry(name) {
  const q = (name || 'indonesia').trim();
  try {
    const arr = await getJson(
      'https://restcountries.com/v3.1/name/' + encodeURIComponent(q) + '?fields=name,capital,region,population,flags,currencies,languages'
    );
    const c = arr[0];
    return {
      status: true, fitur: 'negara',
      nama: c?.name?.common, resmi: c?.name?.official,
      ibu_kota: c?.capital?.[0], wilayah: c?.region,
      populasi: c?.population, bendera: c?.flags?.png || c?.flags?.svg,
      mata_uang: c?.currencies, bahasa: c?.languages,
      image: c?.flags?.png,
    };
  } catch {
    return { status: false, error: 'Negara tidak ditemukan' };
  }
}

export async function toolUniversities(country) {
  const c = (country || 'Indonesia').trim();
  try {
    const arr = await getJson('http://universities.hipolabs.com/search?country=' + encodeURIComponent(c));
    const list = (arr || []).slice(0, 15).map((u) => ({
      nama: u.name, web: u.web_pages?.[0], domain: u.domains?.[0],
    }));
    return { status: true, fitur: 'universitas', negara: c, jumlah: list.length, data: list };
  } catch (e) {
    return { status: false, error: e.message };
  }
}

export async function toolAgify(name) {
  const n = (name || 'budi').trim();
  try {
    const d = await getJson('https://api.agify.io/?name=' + encodeURIComponent(n));
    return { status: true, fitur: 'prediksi_umur', nama: d.name, umur: d.age, sampel: d.count };
  } catch (e) {
    return { status: false, error: e.message };
  }
}

export async function toolGenderize(name) {
  const n = (name || 'budi').trim();
  try {
    const d = await getJson('https://api.genderize.io/?name=' + encodeURIComponent(n));
    const g = d.gender === 'male' ? 'laki-laki' : d.gender === 'female' ? 'perempuan' : d.gender;
    return { status: true, fitur: 'prediksi_gender', nama: d.name, gender: g, probabilitas: d.probability };
  } catch (e) {
    return { status: false, error: e.message };
  }
}

export async function toolNationalize(name) {
  const n = (name || 'budi').trim();
  try {
    const d = await getJson('https://api.nationalize.io/?name=' + encodeURIComponent(n));
    return {
      status: true, fitur: 'prediksi_negara', nama: d.name,
      negara: (d.country || []).slice(0, 5).map((c) => ({
        kode: c.country_id, probabilitas: c.probability,
      })),
    };
  } catch (e) {
    return { status: false, error: e.message };
  }
}

export async function toolDictionary(word) {
  const w = (word || 'hello').trim();
  try {
    const arr = await getJson('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w));
    const e = arr[0];
    const meanings = (e?.meanings || []).slice(0, 3).map((m) => ({
      kelas_kata: m.partOfSpeech,
      definisi: m.definitions?.[0]?.definition,
      contoh: m.definitions?.[0]?.example,
    }));
    return { status: true, fitur: 'kamus', kata: e?.word, fonetik: e?.phonetic, arti: meanings, catatan: 'Kamus EN' };
  } catch {
    return { status: false, error: 'Kata tidak ditemukan' };
  }
}

export async function toolQr(text) {
  const t = text || 'https://localhost:3000';
  const img = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(t);
  return { status: true, fitur: 'qr', teks: t, gambar: img, download: { image: img } };
}

export async function toolUuid() {
  return { status: true, fitur: 'uuid', uuid: crypto.randomUUID() };
}

export async function toolPassword(len) {
  const n = Math.min(64, Math.max(8, parseInt(len, 10) || 16));
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let out = '';
  const buf = crypto.getRandomValues(new Uint8Array(n));
  for (let i = 0; i < n; i++) out += chars[buf[i] % chars.length];
  return { status: true, fitur: 'password', panjang: n, password: out };
}

export async function toolHash(text) {
  if (!text) return { status: false, error: 'Teks wajib diisi' };
  const data = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  const hash = [...new Uint8Array(hashBuf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return { status: true, fitur: 'hash', algoritma: 'SHA-256', input: text, hash };
}

export async function toolLorem(count) {
  const n = Math.min(10, Math.max(1, parseInt(count, 10) || 2));
  try {
    const d = await getJson('https://baconipsum.com/api/?type=all-meat&paras=' + n + '&format=json');
    return { status: true, fitur: 'lorem', paragraf: d };
  } catch {
    return { status: true, fitur: 'lorem', paragraf: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit.'] };
  }
}

export async function toolAnimeQuote() {
  const list = [
    { kutipan: 'Aku tidak suka rasa sakit, jadi aku memutuskan untuk tidak menyakiti orang lain.', anime: 'One Piece', karakter: 'Luffy' },
    { kutipan: 'Kerja keras mengalahkan bakat ketika bakat tidak bekerja keras.', anime: 'Naruto', karakter: 'Rock Lee' },
    { kutipan: 'Jika kau tidak mengambil risiko, kau tidak bisa menciptakan masa depan.', anime: 'Attack on Titan', karakter: 'Eren' },
    { kutipan: 'Orang yang tidak bisa melindungi hal berharganya, tidak pantas disebut sejati.', anime: 'Naruto', karakter: 'Kakashi' },
    { kutipan: 'Jangan menyerah. Saat kau ingin menyerah, itulah saatnya terus maju.', anime: 'Fairy Tail', karakter: 'Natsu' },
  ];
  const q = pick(list);
  return { status: true, fitur: 'kutipan_anime', ...q, sumber: 'Indonesia (terjemahan)' };
}

export async function toolYesNo() {
  try {
    const d = await getJson('https://yesno.wtf/api');
    const j = d.answer === 'yes' ? 'ya' : d.answer === 'no' ? 'tidak' : d.answer;
    return { status: true, fitur: 'ya_tidak', jawaban: j, gambar: d.image, image: d.image };
  } catch {
    return { status: true, fitur: 'ya_tidak', jawaban: Math.random() > 0.5 ? 'ya' : 'tidak' };
  }
}

export async function toolFox() {
  try {
    const d = await getJson('https://randomfox.ca/floof/');
    return { status: true, fitur: 'rubah', gambar: d.image, image: d.image };
  } catch (e) {
    return { status: false, fitur: 'rubah', error: e.message };
  }
}

export async function toolDuck() {
  try {
    const d = await getJson('https://random-d.uk/api/random');
    const url = d.url || d.message;
    return { status: true, fitur: 'bebek', gambar: url, image: url };
  } catch (e) {
    return { status: false, fitur: 'bebek', error: e.message };
  }
}

export async function toolCoffee() {
  try {
    const d = await getJson('https://coffee.alexflipnote.dev/random.json');
    return { status: true, fitur: 'kopi', gambar: d.file, image: d.file };
  } catch {
    return { status: true, fitur: 'kopi', gambar: 'https://coffee.alexflipnote.dev/random', image: 'https://coffee.alexflipnote.dev/random' };
  }
}

export async function toolChuck() {
  const list = [
    'Chuck Norris tidak debug — bug yang takut padanya.',
    'Saat Chuck Norris push ke GitHub, main yang merge ke dia.',
    'Chuck Norris tidak butuh Stack Overflow.',
    'Firewall tidak memblokir Chuck Norris.',
    'Chuck Norris menyelesaikan infinite loop tepat waktu.',
    'Null pointer exception menghindari Chuck Norris.',
  ];
  return { status: true, fitur: 'chuck', lelucon: pick(list), sumber: 'Indonesia' };
}

export async function toolDadJoke() {
  try {
    const d = await getJson('https://candaan-api.vercel.app/api/text/random');
    const teks = typeof d.data === 'string' ? d.data : null;
    if (teks) return { status: true, fitur: 'lelucon_ayah', teks, sumber: 'candaan-api (Indonesia)' };
  } catch {}
  return { status: true, fitur: 'lelucon_ayah', teks: pick(LELUCON_ID), sumber: 'lokal (Indonesia)' };
}

export async function toolInsult() {
  const list = [
    'Kode kamu seolah ditulis saat mata setengah terpejam.',
    'Variable-mu lebih random daripada generator UUID.',
    'Commit message-mu lebih misterius dari episode final anime.',
    'Indentasi kamu bikin parser ingin resign.',
    'API-mu kadang hidup, kadang libur tanpa izin.',
    'Naming variable-mu butuh penerjemah profesional.',
  ];
  return { status: true, fitur: 'sindiran', teks: list[Math.floor(Math.random() * list.length)], catatan: 'Hanya untuk hiburan' };
}

export async function toolAffirmation() {
  const list = [
    'Kamu mampu menyelesaikan tantangan hari ini.',
    'Setiap langkah kecil tetap maju.',
    'Kesalahan adalah guru, bukan musuh.',
    'Kamu layak istirahat dan tetap berharga.',
    'Prosesmu valid, meski belum sempurna.',
    'Hari ini bisa lebih baik dari kemarin.',
    'Kamu tidak sendirian dalam belajar.',
    'Keberanian dimulai dari mencoba lagi.',
  ];
  return { status: true, fitur: 'afirmasi', teks: list[Math.floor(Math.random() * list.length)] };
}

export async function toolWeather(city) {
  const q = (city || 'Jakarta').trim();
  try {
    const d = await getJson('https://wttr.in/' + encodeURIComponent(q) + '?format=j1', 15000);
    const cur = d.current_condition?.[0];
    const area = d.nearest_area?.[0];
    return {
      status: true, fitur: 'cuaca',
      lokasi: area?.areaName?.[0]?.value || q,
      negara: area?.country?.[0]?.value,
      suhu_c: cur?.temp_C, terasa_c: cur?.FeelsLikeC,
      kelembapan: cur?.humidity, deskripsi: cur?.weatherDesc?.[0]?.value,
      angin_kmj: cur?.windspeedKmph,
    };
  } catch (e) {
    return { status: false, fitur: 'cuaca', error: 'Cuaca tidak tersedia: ' + e.message };
  }
}

export async function toolNpm(pkg) {
  const name = (pkg || 'express').trim();
  try {
    const d = await getJson('https://registry.npmjs.org/' + encodeURIComponent(name));
    const latest = d['dist-tags']?.latest;
    const ver = d.versions?.[latest] || {};
    return {
      status: true, fitur: 'npm',
      nama: d.name, deskripsi: d.description, versi_terbaru: latest,
      lisensi: ver.license || d.license, homepage: d.homepage,
    };
  } catch (e) {
    return { status: false, fitur: 'npm', error: e.message };
  }
}

export async function toolShorten(url) {
  if (!url) return { status: false, error: 'URL wajib diisi' };
  try {
    const res = await fetch('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url), {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10000),
    });
    const short = await res.text();
    if (!short.startsWith('http')) throw new Error(short);
    return { status: true, fitur: 'perpendek', asli: url, pendek: short };
  } catch (e) {
    return { status: false, fitur: 'perpendek', error: e.message };
  }
}

export async function toolWhois(domain) {
  const d = (domain || '').replace(/^https?:\/\//, '').split('/')[0];
  if (!d) return { status: false, error: 'Domain wajib diisi' };
  try {
    const ip = await getJson('https://dns.google/resolve?name=' + encodeURIComponent(d) + '&type=A');
    return {
      status: true, fitur: 'dns', domain: d,
      dns: (ip.Answer || []).map((a) => ({ tipe: a.type, data: a.data })),
      catatan: 'Lookup DNS (bukan whois lengkap)',
    };
  } catch (e) {
    return { status: false, fitur: 'dns', error: e.message };
  }
}

export async function toolColor(hex) {
  let h = (hex || '').replace('#', '').trim();
  if (!h) {
    h = [...crypto.getRandomValues(new Uint8Array(3))].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  if (!/^[0-9a-fA-F]{3,8}$/.test(h)) return { status: false, error: 'Hex tidak valid' };
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return {
    status: true, fitur: 'warna',
    hex: '#' + h.slice(0, 6), rgb: { r, g, b }, rgb_string: `rgb(${r},${g},${b})`,
  };
}

export async function toolTimestamp() {
  const now = Date.now();
  const d = new Date(now);
  return {
    status: true, fitur: 'timestamp',
    unix_ms: now, unix: Math.floor(now / 1000),
    iso: d.toISOString(), utc: d.toUTCString(),
  };
}

export async function toolMorse(text, mode = 'encode') {
  const map = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
    I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
    Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
    Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    ' ': '/',
  };
  const inv = Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
  const t = (text || 'SOS').toUpperCase();
  if (mode === 'decode') {
    const hasil = t.split(/\s+/).map((c) => inv[c] || '?').join('').replace(/\//g, ' ');
    return { status: true, fitur: 'morse', mode: 'decode', input: text, hasil };
  }
  const hasil = [...t].map((c) => map[c] || '').filter(Boolean).join(' ');
  return { status: true, fitur: 'morse', mode: 'encode', input: text, hasil };
}

export async function toolMock(text) {
  const t = text || 'halo';
  let out = '';
  for (let i = 0; i < t.length; i++) out += i % 2 ? t[i].toUpperCase() : t[i].toLowerCase();
  return { status: true, fitur: 'mock', input: text, hasil: out };
}

export async function toolReverse(text) {
  const t = text || '';
  return { status: true, fitur: 'balik', input: t, hasil: [...t].reverse().join('') };
}

export async function toolCount(text) {
  const t = text || '';
  const words = t.trim() ? t.trim().split(/\s+/).length : 0;
  return {
    status: true, fitur: 'hitung',
    karakter: t.length, tanpa_spasi: t.replace(/\s/g, '').length,
    kata: words, baris: t ? t.split(/\n/).length : 0,
  };
}

export async function toolBored() {
  return toolActivity();
}
