# Kaspa-Space
Website / aplikasi berbasis Laravel + React untuk manajemen coworking space.

---

## Deskripsi

**Kaspa-Space** adalah platform pemesanan dan manajemen layanan ruang kerja bersama (coworking space) berbasis web. Website ini memungkinkan pengguna untuk:

- **Menjelajahi dan Memesan Ruang Kerja** — Browse berbagai kategori ruang kerja seperti coworking space, meeting room, private office, dan fasilitas lainnya
- **Sistem Pembayaran Terintegrasi** — Pembayaran online melalui Midtrans, QRIS, transfer bank, dan tunai
- **Manajemen Jadwal & Booking** — Sistem penjadwalan real-time dengan antrian email, toleransi waktu, dan timer pembayaran
- **Invoice Otomatis** — Invoice dengan breakdown PPN 11%, status dinamis (Terbayar / Menunggu / Dibatalkan / Refund), dan stamp visual
- **Sistem Diskon & Promosi** — Kode diskon dengan filter produk/user spesifik
- **Berita & Blog** — Modul news dan blog lengkap dengan halaman publik dan admin CRUD
- **Dashboard Admin** — Panel administrasi lengkap: produk, pesanan, kategori, statistik, monitoring ruangan, dan ulasan
- **Manajemen User** — Profil user, riwayat pesanan, dan kontrol akses berbasis role

### Tech Stack

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

## Instalasi

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

```env
APP_NAME=KaspaSpace
APP_URL=http://localhost:8000
APP_ENV=local
APP_KEY=        # diisi otomatis oleh key:generate

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kaspa_space
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database   # wajib untuk email notifikasi

MAIL_MAILER=smtp            # ubah dari 'log' jika ingin kirim email nyata
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS="noreply@kaspaspace.com"
MAIL_FROM_NAME="${APP_NAME}"

MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
VITE_MIDTRANS_CLIENT_KEY="${MIDTRANS_CLIENT_KEY}"
```

### 4. Generate application key
```bash
php artisan key:generate
```

### 5. Migrasi dan seed database
```bash
php artisan migrate
php artisan db:seed
```

> Alternatif: restore dari file SQL yang tersedia (`kaspa_space (1).sql`) via phpMyAdmin atau CLI:
> ```bash
> mysql -u root -p kaspa_space < "kaspa_space (1).sql"
> ```

### 6. Link storage publik
```bash
php artisan storage:link
```

### 7. Install dependensi frontend & build aset
```bash
npm install
npm run dev       # development (watch mode)
# atau:
npm run build     # production build
```

### 8. Jalankan server lokal
```bash
php artisan serve
```

### 9. Jalankan queue worker (untuk email notifikasi)
```bash
php artisan queue:work
```

> Queue worker perlu berjalan di terminal terpisah agar notifikasi email booking terkirim. Di produksi, gunakan Supervisor untuk menjaga queue worker tetap berjalan.

Buka browser ke `http://localhost:8000`

---

## Akun Default (Setelah `db:seed`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@kaspaspace.com` | `admin123` |
| Admin | `kaspaspace@gmail.com` | `kaspaspace` |
| Admin | `administrator@kaspaspace.com` | `password` |

> **Penting:** Ganti semua password default sebelum deploy ke produksi.

---

## URL Penting

| Halaman | URL |
|---|---|
| Landing Page | `/` |
| Login | `/login` |
| Register | `/register` |
| Produk / Browse | `/products` |
| Checkout | `/checkout` |
| Riwayat Order (User) | `/orders` |
| Profil User | `/profile` |
| Admin Dashboard | `/admin/dashboard` |
| Admin - Pesanan | `/admin/orders` |
| Admin - Produk | `/admin/products` |
| Admin - Statistik | `/admin/statistics` |
| Admin - Room Monitor | `/admin/room-monitoring` |
| Admin - Diskon | `/admin/discounts` |
| Admin - News/Blog | `/admin/news` |
| Admin - Pengaturan | `/admin/payment-settings` |
| Berita Publik | `/news` |
| Blog Publik | `/blogs` |
| Jadwal Ruangan | `/jadwal-ruangan` |

---

## Role & Akses

| Role | Akses |
|---|---|
| `user` | Booking, checkout, riwayat order, profil, ulasan |
| `admin` | Semua fitur admin panel + manajemen seluruh data |
| `resepsionis` | Verifikasi pembayaran manual, monitoring ruangan, jadwal |

Role diassign via seeder atau diubah langsung di tabel `users` kolom `role`.

---

## Struktur Folder Utama

```
KaspaSpace/
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/          # Controller admin panel
│   │   └── ...             # Controller user-facing
│   └── Models/
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   └── js/
│       ├── Layouts/         # AdminLayout, AuthLayout, dll
│       └── Pages/
│           ├── admin/       # Halaman admin (React)
│           ├── Orders/      # Halaman order & payment user
│           ├── Products/    # Halaman produk
│           └── ...
├── routes/
│   └── web.php
├── public/
└── storage/
    └── app/public/          # Gambar produk, news, QR, dsb
```

---

## Konfigurasi Midtrans

1. Daftar akun di [https://midtrans.com](https://midtrans.com)
2. Ambil **Server Key** dan **Client Key** dari dashboard Midtrans
3. Isi di `.env`:
   ```env
   MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
   MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
   MIDTRANS_IS_PRODUCTION=false
   VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
   ```
4. Set URL notifikasi di dashboard Midtrans ke: `https://yourdomain.com/midtrans/notification`

Lihat panduan lengkap: [MIDTRANS_SETUP.md](MIDTRANS_SETUP.md)

---

## Catatan Penting

- Pastikan `.env` **tidak** dikomit ke repositori (sudah ada di `.gitignore`)
- Folder `storage/` dan `bootstrap/cache/` harus memiliki hak akses tulis
- `php artisan storage:link` wajib dijalankan agar gambar produk/news bisa diakses publik
- Queue worker (`php artisan queue:work`) harus berjalan agar notifikasi email booking terkirim
- Data order lama (sebelum fitur PPN) memiliki `tax = 0` — invoice tetap tampil namun PPN Rp 0

---

## Deployment ke Produksi

```bash
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan db:seed --force
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

Pastikan:
- Hak akses folder `storage` dan `bootstrap/cache` sesuai konfigurasi web server (Nginx/Apache)
- Queue worker dikelola Supervisor agar tetap berjalan
- `MIDTRANS_IS_PRODUCTION=true` dan keys sudah diganti ke production keys
- `APP_ENV=production` dan `APP_DEBUG=false`

Contoh konfigurasi Supervisor untuk queue worker:
```ini
[program:kaspaspace-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/html/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/kaspaspace-worker.log
```

---

## Testing

```bash
php artisan test
# atau:
vendor/bin/phpunit
```

---

## Status Pengembangan

### Fitur yang Sudah Selesai

**Core & Auth**
- Autentikasi user (login, register, logout) — UI redesign terbaru
- Role-based access: user, admin, resepsionis
- Middleware per role dengan redirect yang sesuai
- Profil user: edit nama, email, telepon, password
- Persetujuan syarat & ketentuan serta kebijakan privasi saat registrasi

**Produk & Booking**
- CRUD produk dan kategori di admin
- Sistem booking ruangan (share desk, private room, meeting room, private office)
- Antrian email notifikasi booking
- Toleransi waktu dan timer pembayaran otomatis
- Pembatalan otomatis pesanan yang melewati batas waktu
- Room monitoring real-time di admin
- Cek ketersediaan ruangan sebelum checkout

**Pembayaran & Invoice**
- Integrasi Midtrans (QRIS, virtual account, kartu kredit)
- Pembayaran manual: QRIS image, transfer bank, tunai
- Upload bukti pembayaran oleh user
- Verifikasi pembayaran oleh admin
- PPN 11% dihitung otomatis saat checkout (tax-exclusive, disimpan ke database)
- Invoice halaman dengan tema admin (gradient biru, Plus Jakarta Sans)
- Stamp visual pada invoice sesuai status: TERBAYAR / DIBATALKAN / REFUND
- Status invoice dinamis dari database: Terbayar, Menunggu, Dibatalkan, Refund
- Breakdown harga di invoice: Subtotal → Diskon → DPP → PPN 11% → Total
- Breakdown PPN di halaman checkout sebelum bayar
- Download invoice sebagai PDF

**Diskon**
- Kode diskon dengan nilai nominal atau persentase
- Filter diskon per produk spesifik
- Filter diskon per user spesifik (visibility control)
- Validasi kode diskon via AJAX di checkout

**Admin Panel**
- Dashboard dengan statistik: total pesanan, pengguna, pendapatan, produk aktif
- Manajemen pesanan: filter, update status, verifikasi pembayaran, hapus
- Manajemen produk, kategori, ruangan
- Manajemen user (CRUD)
- Halaman statistik lengkap (grafik pendapatan, okupansi, metode pembayaran)
- Monitoring ruangan real-time
- Manajemen ulasan produk
- Pengaturan pembayaran (QRIS image, info bank)

**News & Blog**
- CRUD news dan blog di admin panel (`/admin/news`)
- Halaman publik: daftar news (`/news`), daftar blog (`/blogs`)
- Halaman detail artikel dengan related news (`/news/{slug}`, `/blogs/{slug}`)
- Auto-generate slug dari judul
- Kontrol publish/unpublish
- Tampilan di landing page (section "News and Blogs")

**UI/UX**
- Landing page dengan hero images, section layanan, testimoni, news
- Tema admin konsisten: biru `#005bbf`, gradient navy→biru, Plus Jakarta Sans
- Navbar dinamis dengan dropdown user menu
- Footer lengkap dengan informasi kontak
- Halaman kontak, media, food & beverage, workspace, jasa profesional
- Cart drawer dan modal produk

---

### Kekurangan / Hal yang Belum Selesai

1. **`ProductController::category()` belum ada** — Route `/products/{category:slug}` sudah terdaftar dan mengarah ke `ProductController::category()`, tapi method tersebut belum dibuat. Akses ke URL ini akan menghasilkan error 500. Logika filter per kategori sudah ada di `WorkSpaceController` dan bisa dijadikan referensi untuk membuat method ini.
2. **Gambar-gambar** — Banyak gambar produk, hero, dan konten yang belum diisi / masih placeholder. Jalankan `php artisan storage:link` dan upload gambar via admin panel.
3. **Tombol yang belum terhubung** — Beberapa tombol di landing page dan halaman publik masih belum mengarah ke route yang benar (terutama di section workspace, jasa profesional, dan food & beverage).
4. **Redirect resepsionis** — Role resepsionis sudah memiliki middleware dan bisa mengakses admin panel, namun belum ada halaman landing/redirect khusus setelah login. Saat ini resepsionis langsung diarahkan ke dashboard yang sama dengan admin.
5. **Order lama tanpa PPN** — Invoice order lama menampilkan PPN Rp 0 karena dibuat sebelum fitur PPN ditambahkan. Ini adalah expected behavior, bukan bug.
6. **Queue monitoring** — Belum ada UI di admin panel untuk melihat status antrian email yang gagal terkirim. Saat ini harus dicek manual via `php artisan queue:failed`.

---

## Referensi

- [Laravel Docs](https://laravel.com/docs)
- [Inertia.js](https://inertiajs.com)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Midtrans Docs](https://docs.midtrans.com)
- [MIDTRANS_SETUP.md](MIDTRANS_SETUP.md) — Panduan setup Midtrans lengkap
- [DISCOUNT_SYSTEM.md](DISCOUNT_SYSTEM.md) — Dokumentasi sistem diskon

---

## Lisensi

Project ini dilisensikan di bawah lisensi MIT.
