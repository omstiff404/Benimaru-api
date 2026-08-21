/**
 * Konfigurasi Benimaru API
 * Edit file ini — tidak pakai .env
 *
 * Jangan commit password asli ke repo publik.
 */
export default {
  // Aiven PostgreSQL connection string
  DATABASE_URL:
    'postgres://avnadmin:AVNS_ns8a8dGSWbcI7mPYckc@bot-wa-omstiff404.j.aivencloud.com:22175/defaultdb?sslmode=require,

  // Password login halaman /admin
  ADMIN_PASSWORD: 'admin123',

  // Secret untuk tanda tangan token admin (acak, panjang)
  JWT_SECRET: 'b3n1m4ru_xK9$mQ2!pL7vR4wZ8nY1',

  // Key AM Prem / Verif (opsional)
  AM_API_KEY: 'RS-9J^q$1gF',

  // Port local server
  PORT: 3000,
};
