# Kaspa-Space
Website / aplikasi berbasis Laravel + React untuk manajemen coworking space.

---

## 📋 Deskripsi

**Kaspa-Space** adalah platform pemesanan dan manajemen layanan ruang kerja bersama (coworking space) berbasis web. Website ini memungkinkan pengguna untuk:

- 🏢 **Menjelajahi dan Memesan Ruang Kerja** — Browse berbagai kategori ruang kerja seperti coworking space, meeting room, private office, dan fasilitas lainnya
- 💳 **Sistem Pembayaran Terintegrasi** — Pembayaran online melalui Midtrans, QRIS, transfer bank, dan tunai
- 📅 **Manajemen Jadwal & Booking** — Sistem penjadwalan real-time dengan antrian email, toleransi waktu, dan timer pembayaran
- 🧾 **Invoice Otomatis** — Invoice dengan breakdown PPN 11%, status dinamis (Terbayar / Menunggu / Dibatalkan / Refund), dan stamp visual
- 🎯 **Sistem Diskon & Promosi** — Kode diskon dengan filter produk/user spesifik
- 📰 **Berita & Blog** — Modul news dan blog lengkap dengan halaman publik dan admin CRUD
- 📊 **Dashboard Admin** — Panel administrasi lengkap: produk, pesanan, kategori, statistik, monitoring ruangan, dan ulasan
- 👤 **Manajemen User** — Profil user, riwayat pesanan, dan kontrol akses berbasis role

### 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 11 (PHP 8.x) |
| Frontend | React 18 + Inertia.js |
| Styling | Tailwind CSS v3 + inline styles |
| Build Tool | Vite |
| Database | MySQL |
| Payment Gateway | Midtrans |
| Icons | Heroicons, Lucide React |
| Font | Plus Jakarta Sans, Inter |

---

## 🚀 Instalasi

### 1. Clone repositori
```bash
git clone https://github.com/ihsan05-png/KaspaSpace.git
cd KaspaSpace
```

### 2. Install dependensi PHP
```bash
composer install
```

### 3. Salin dan konfigurasi environment
```bash
cp .env.example .env
```

Atur variabel di `.env`:
- `APP_NAME`, `APP_URL`, `APP_ENV`, `APP_KEY`
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`
- Konfigurasi mail untuk notifikasi email booking

### 4. Generate application key
```bash
php artisan key:generate
```

### 5. Migrasi database
```bash
php artisan migrate

# Atau restore dari file SQL yang tersedia:
# kaspa_space(1).sql
```

### 6. Install dependensi frontend & build aset
```bash
npm install
npm run dev       # development (watch)
npm run build     # production
```

### 7. Jalankan server lokal
```bash
php artisan serve
```

Buka browser ke `http://localhost:8000`

---

## ✅ Catatan Penting

- Pastikan `.env` **tidak** dikomit ke repositori
- Folder `storage/` dan `bootstrap/cache/` harus memiliki hak akses tulis
- Jalankan `php artisan storage:link` untuk mengaktifkan public storage (gambar produk, news, dsb)
- Untuk notifikasi email booking berjalan, pastikan konfigurasi mail di `.env` sudah diatur
- Data order lama (sebelum fitur PPN) memiliki `tax = 0` — invoice tetap tampil namun PPN Rp 0

---

## 🔧 Deployment ke Produksi

```bash
composer install --optimize-autoloader --no-dev
php artisan migrate --force
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

Pastikan hak akses folder `storage` dan `bootstrap/cache` sesuai konfigurasi web server (Nginx/Apache).

---

## 🧪 Testing

```bash
php artisan test
# atau:
vendor/bin/phpunit
```

---

## 📌 Status Pengembangan

### ✅ Fitur yang Sudah Selesai

**Core & Auth**
- ✅ Autentikasi user (login, register, logout) — UI redesign terbaru
- ✅ Role-based access: user, admin, resepsionis
- ✅ Middleware per role dengan redirect yang sesuai
- ✅ Profil user: edit nama, email, telepon, password
- ✅ Persetujuan syarat & ketentuan serta kebijakan privasi saat registrasi

**Produk & Booking**
- ✅ CRUD produk dan kategori di admin
- ✅ Sistem booking ruangan (share desk, private room, meeting room, private office)
- ✅ Antrian email notifikasi booking
- ✅ Toleransi waktu dan timer pembayaran otomatis
- ✅ Pembatalan otomatis pesanan yang melewati batas waktu
- ✅ Room monitoring real-time di admin
- ✅ Cek ketersediaan ruangan sebelum checkout

**Pembayaran & Invoice**
- ✅ Integrasi Midtrans (QRIS, virtual account, kartu kredit)
- ✅ Pembayaran manual: QRIS image, transfer bank, tunai
- ✅ Upload bukti pembayaran oleh user
- ✅ Verifikasi pembayaran oleh admin
- ✅ PPN 11% dihitung otomatis saat checkout (tax-exclusive, disimpan ke database)
- ✅ Invoice halaman dengan tema admin (gradient biru, Plus Jakarta Sans)
- ✅ Stamp visual pada invoice sesuai status: TERBAYAR / DIBATALKAN / REFUND
- ✅ Status invoice dinamis dari database: Terbayar, Menunggu, Dibatalkan, Refund
- ✅ Breakdown harga di invoice: Subtotal → Diskon → DPP → PPN 11% → Total
- ✅ Breakdown PPN di halaman checkout sebelum bayar
- ✅ Download invoice sebagai PDF

**Diskon**
- ✅ Kode diskon dengan nilai nominal atau persentase
- ✅ Filter diskon per produk spesifik
- ✅ Filter diskon per user spesifik (visibility control)
- ✅ Validasi kode diskon via AJAX di checkout

**Admin Panel**
- ✅ Dashboard dengan statistik: total pesanan, pengguna, pendapatan, produk aktif
- ✅ Manajemen pesanan: filter, update status, verifikasi pembayaran, hapus
- ✅ Manajemen produk, kategori, ruangan
- ✅ Manajemen user (CRUD)
- ✅ Halaman statistik lengkap (grafik pendapatan, okupansi, metode pembayaran)
- ✅ Monitoring ruangan real-time
- ✅ Manajemen ulasan produk
- ✅ Pengaturan pembayaran (QRIS image, info bank)

**News & Blog**
- ✅ CRUD news dan blog di admin panel (`/admin/news`)
- ✅ Halaman publik: daftar news (`/news`), daftar blog (`/blogs`)
- ✅ Halaman detail artikel dengan related news (`/news/{slug}`, `/blogs/{slug}`)
- ✅ Auto-generate slug dari judul
- ✅ Kontrol publish/unpublish
- ✅ Tampilan di landing page (section "News and Blogs")

**UI/UX**
- ✅ Landing page dengan hero images, section layanan, testimoni, news
- ✅ Tema admin konsisten: biru `#005bbf`, gradient navy→biru, Plus Jakarta Sans
- ✅ Navbar dinamis dengan dropdown user menu
- ✅ Footer lengkap dengan informasi kontak
- ✅ Halaman kontak, media, food & beverage, workspace, jasa profesional
- ✅ Cart drawer dan modal produk

---

### ⚠️ Kekurangan / Hal yang Belum Selesai

1. **Filter produk per kategori** — Halaman produk (coworking space, dsb) belum ter-filter sesuai kategori. Halaman lain bisa dikloning dari halaman coworking space.
2. **Gambar-gambar** — Banyak gambar produk, hero, dan konten yang belum diisi.
3. **Tombol yang belum terhubung** — Beberapa tombol di landing page dan halaman publik masih belum mengarah ke route yang benar.
4. **Order lama tanpa PPN** — Invoice order lama menampilkan PPN Rp 0 karena dibuat sebelum fitur PPN ditambahkan.
5. **PKP** — PPN 11% saat ini selalu dihitung untuk semua order. Jika bisnis belum berstatus PKP, perlu ditambahkan toggle on/off di pengaturan admin.

---

## 📚 Referensi

- [Laravel Docs](https://laravel.com/docs)
- [Inertia.js](https://inertiajs.com)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Midtrans Docs](https://docs.midtrans.com)

---

## 📄 Lisensi

Project ini dilisensikan di bawah lisensi MIT.
