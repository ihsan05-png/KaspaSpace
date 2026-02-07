Berikut draft `README.md` untuk repositori **Kaspa‑Space** :

---

````markdown
# Kaspa-Space  
Website / aplikasi berbasis Laravel

## 📋 Deskripsi  
**Kaspa-Space** adalah platform pemesanan dan manajemen layanan ruang kerja bersama (coworking space) berbasis web. Website ini memungkinkan pengguna untuk:

- 🏢 **Menjelajahi dan Memesan Ruang Kerja** - Browse berbagai kategori ruang kerja seperti coworking space, meeting room, dan fasilitas lainnya
- 💳 **Sistem Pembayaran Terintegrasi** - Pembayaran online melalui Midtrans dengan berbagai metode pembayaran
- 📅 **Manajemen Jadwal & Booking** - Sistem penjadwalan untuk mengatur ketersediaan ruang
- 🎯 **Sistem Diskon & Promosi** - Fitur diskon untuk pelanggan dengan berbagai jenis potongan harga
- 📰 **Berita & Informasi** - Modul berita untuk update terbaru dan pengumuman
- 📊 **Dashboard Admin** - Panel administrasi lengkap untuk mengelola produk, pesanan, kategori, dan laporan
- 🔗 **Integrasi Google Sheets** - Sinkronisasi data dengan Google Sheets untuk kemudahan pencatatan

Website ini dibangun menggunakan **Laravel 11** (PHP) sebagai backend dengan **React** + **Inertia.js** untuk frontend, styling menggunakan **Tailwind CSS**, dan build tool **Vite**. Repositori ini berisi kode backend dan frontend, konfigurasi, modul database, serta skrip produksi. Tujuannya agar pengembang selanjutnya bisa cepat memahami dan melanjutkan pengembangan.

### 🛠️ Tech Stack
- **Backend**: Laravel 11 (PHP 8.x)
- **Frontend**: React 18 + Inertia.js
- **Styling**: Tailwind CSS v3
- **Build Tool**: Vite
- **Database**: MySQL
- **Payment Gateway**: Midtrans
- **Icons**: Heroicons, Lucide React

## 🚀 Persiapan Awal dan Instalasi  
Ikuti langkah-langkah berikut untuk menjalankan project secara lokal atau dalam lingkungan development.

### 1. Clone repositori  
```bash
git clone https://github.com/ihsan05-png/KaspaSpace.git
cd KaspaSpace
```

### 2. Install dependensi PHP dengan Composer

Pastikan Anda memiliki PHP versi yang mendukung (misalnya PHP 8.x) dan Composer telah terpasang.

```bash
composer install
```

### 3. Salin file environment dan konfigurasi

Salin file `.env.example` ke `.env` dan atur konfigurasi sesuai lingkungan Anda (database, mail, dsb).

```bash
cp .env.example .env
```

Kemudian buka `.env`, dan atur variabel seperti:

* `APP_NAME`, `APP_URL`, `APP_ENV`, `APP_KEY`
* `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
* Konfigurasi lain seperti mail, storage, caching, api key (mis. Midtrans) jika digunakan.

### 4. Generate application key

```bash
php artisan key:generate
```

### 5. Migrasi database dan (opsional) seeding

Pastikan database yang ditetapkan di `.env` telah ada. Kemudian jalankan:

```bash
php artisan migrate
# Jika ada seed data tersedia:
php artisan db:seed

# File database tersedia: kaspa_space(1).sql
```

### 6. Install dependensi Front-end & Build aset

Pastikan Node.js (versi LTS) dan npm atau yarn telah terpasang.

```bash
npm install
# atau jika menggunakan yarn:
# yarn install

# Untuk development mode (watch)
npm run dev
# atau:
# yarn dev

# Untuk build production mode:
npm run build
# atau:
# yarn build
```

### 7. Jalankan server lokal

```bash
php artisan serve
```

Kemudian buka browser ke `http://localhost:8000` atau sesuai URL yang ditampilkan.

## ✅ Catatan Penting

* Pastikan `.env` **tidak** dikomit ke repositori (termasuk file `.env.local`, dsb).
* Pastikan folder `storage/`, `bootstrap/cache/` memiliki hak akses tulis (writeable) untuk web server.
* Jika menggunakan layanan pembayaran atau API eksternal, pastikan kunci API dan callback URL telah diatur di `.env`.
* Jika menggunakan `Vite`/`Tailwind`, periksa konfigurasi di `vite.config.js` dan `tailwind.config.js` untuk memastikan asset path benar.
* Jika ada perubahan struktur database, jangan lupa memperbarui migrasi dan dokumen ini.

## 🧪 Testing

Untuk menjalankan unit test / feature test (jika tersedia):

```bash
php artisan test
# atau:
vendor/bin/phpunit
```

Pastikan konfigurasi testing di `.env.testing` atau variabel sesuai telah diatur.

## 🔧 Deployment Singkat

Untuk deployment ke server produksi, beberapa hal yang perlu diperhatikan:

1. Pastikan environment file `.env` produksi diatur dengan benar.
2. Jalankan `composer install --optimize-autoloader --no-dev`.
3. Jalankan `php artisan migrate --force`.
4. Jalankan `npm run build` atau `yarn build` untuk asset produksi.
5. Jalankan `php artisan config:cache`, `php artisan route:cache`, `php artisan view:cache` untuk optimasi.
6. Pastikan hak akses folder `storage` dan `bootstrap/cache` aman dan sesuai server.
7. Atur backup database secara rutin.

## 📚 Referensi & Dokumentasi

* Laravel Docs: [https://laravel.com/docs](https://laravel.com/docs)
* Tailwind CSS: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
* Vite: [https://vitejs.dev/guide/](https://vitejs.dev/guide/)

## 📝 Aturan Kontribusi

Jika Anda ingin berkontribusi:

1. Fork repositori ini.
2. Buat branch fitur dengan nama jelas (`feature/…`, `bugfix/…`).
3. Pastikan semua test lulus sebelum melakukan pull request.
4. Ikuti kode gaya (coding style) yang berlaku di project.

## 📄 Lisensi

Project ini dilisensikan di bawah lisensi MIT. (Sesuai file `LICENSE` atau sesuai pengaturan).

---

Semoga README ini membantu pengembang selanjutnya untuk cepat adaptasi dan melanjutkan pengembangan.
Jika Anda punya tambahan spesifik (contoh: modul khusus, service eksternal, webhook, dsb), saya bisa bantu lengkapi juga.

---
 
## 📌 Status Pengembangan

### Kekurangan yang Masih Ada:
1. Di dalam dashboard admin masih banyak bug seperti: statistik dalam pesanan belum terkalkulasi, belum ada action untuk verifikasi status pesanan, dan masih belum bisa membuat non kategori.
2. Halaman product seperti Coworking space belum ter filter sesua

i kategori, kemudian halaman lainya masih belum ada. bisa di kloning dari halaman product coworking space untuk halaman product lainya.
3. Tabel okupansi manual masih belum terhapus.
4. Gambar-gambar masih banyak yang belum ter input.
5. Masih banyak tombol yang belum mengarah ke route yang benar.

### Fitur yang Sudah Ditambahkan:
✅ Sistem diskon dengan pemilihan produk spesifik  
✅ Sistem diskon dengan pemilihan user spesifik (visibility control)  
✅ Integrasi Midtrans untuk pembayaran online  
✅ Auto-fill form checkout untuk user yang sudah login  
✅ Navbar dinamis dengan dropdown user menu  
✅ Route admin terpisah dengan middleware  
✅ User management (CRUD) di admin panel  
✅ User dashboard dengan riwayat pesanan dan diskon  
✅ Pembatalan otomatis pesanan >24 jam  
✅ Status cancelled untuk pesanan  
✅ Footer lengkap dengan informasi kontak  
✅ Profil user dengan edit nama, email, phone, dan password  

````
