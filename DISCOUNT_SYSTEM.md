# Sistem Diskon - Dokumentasi

## Overview
Sistem diskon mendukung dua tipe diskon:
1. **Persentase (%)** - Diskon berdasarkan persentase dari subtotal
2. **Nominal (Rp)** - Diskon dengan jumlah tetap

## Fitur Utama

### 1. Tipe Diskon
- **Persentase**: Diskon 10%, 20%, 50%, dll
- **Nominal**: Diskon Rp 50.000, Rp 100.000, dll

### 2. Pembatasan
- **Minimum Pembelian**: Set minimum pembelian untuk menggunakan diskon
- **Maksimal Diskon**: Batasi maksimal potongan untuk diskon persentase
- **Batas Penggunaan**: Batasi berapa kali diskon dapat digunakan
- **Periode Aktif**: Set tanggal mulai dan berakhir diskon

### 3. Status Diskon
- **Aktif**: Diskon dapat digunakan
- **Tidak Aktif**: Diskon tidak dapat digunakan
- **Kadaluarsa**: Sudah melewati tanggal berakhir
- **Batas Tercapai**: Sudah mencapai batas penggunaan

## Admin Panel

### Menu Diskon
Akses: Admin Panel → Diskon

### Membuat Diskon Baru

1. **Kode Diskon** (Wajib)
   - Format: UPPERCASE (otomatis)
   - Contoh: `NEWYEAR2026`, `DISCOUNT50K`, `PROMO10`
   - Harus unik

2. **Nama Diskon** (Wajib)
   - Nama yang mudah diingat
   - Contoh: "Diskon Tahun Baru 2026"

3. **Deskripsi** (Opsional)
   - Keterangan detail tentang diskon

4. **Tipe Diskon** (Wajib)
   - Pilih: Persentase (%) atau Nominal (Rp)

5. **Nilai Diskon** (Wajib)
   - Untuk Persentase: Masukkan angka 1-100 (contoh: 10 untuk 10%)
   - Untuk Nominal: Masukkan jumlah (contoh: 100000 untuk Rp 100.000)

6. **Minimum Pembelian** (Opsional)
   - Set minimum total belanja untuk menggunakan diskon
   - Contoh: Rp 500.000

7. **Maksimal Diskon** (Opsional, hanya untuk Persentase)
   - Batasi maksimal potongan
   - Contoh: Max Rp 200.000 untuk diskon 20%

8. **Batas Penggunaan** (Opsional)
   - Jumlah maksimal penggunaan diskon
   - Kosongkan untuk unlimited

9. **Tanggal Mulai & Berakhir** (Opsional)
   - Set periode aktif diskon
   - Kosongkan untuk diskon permanen

10. **Status Aktif**
    - Centang untuk mengaktifkan diskon

## Contoh Penggunaan

### Contoh 1: Diskon Persentase
```
Kode: DISCOUNT10
Nama: Diskon 10% untuk Semua Produk
Tipe: Persentase
Nilai: 10
Minimum Pembelian: Rp 200.000
Maksimal Diskon: Rp 50.000
```

**Hasil:**
- Belanja Rp 300.000 → Diskon Rp 30.000
- Belanja Rp 1.000.000 → Diskon Rp 50.000 (maksimal)
- Belanja Rp 150.000 → Tidak valid (belum memenuhi minimum)

### Contoh 2: Diskon Nominal
```
Kode: PROMO100K
Nama: Potongan 100 Ribu
Tipe: Nominal
Nilai: 100000
Minimum Pembelian: Rp 500.000
```

**Hasil:**
- Belanja Rp 600.000 → Diskon Rp 100.000
- Belanja Rp 400.000 → Tidak valid (belum memenuhi minimum)

### Contoh 3: Flash Sale
```
Kode: FLASHSALE50
Nama: Flash Sale 50%
Tipe: Persentase
Nilai: 50
Maksimal Diskon: Rp 300.000
Batas Penggunaan: 100
Tanggal Mulai: 2026-01-15 00:00
Tanggal Berakhir: 2026-01-15 23:59
```

**Hasil:**
- Hanya berlaku tanggal 15 Januari 2026
- Maksimal 100 orang pertama
- Diskon hingga Rp 300.000

## API untuk Frontend

### Validasi Diskon
**Endpoint**: `POST /validate-discount`

**Request:**
```json
{
  "code": "DISCOUNT10",
  "subtotal": 300000
}
```

**Response Success:**
```json
{
  "valid": true,
  "discount": {
    "id": 1,
    "code": "DISCOUNT10",
    "name": "Diskon 10%",
    "type": "percentage",
    "value": 10,
    "amount": 30000,
    "formatted_amount": "Rp 30.000"
  },
  "message": "Kode diskon berhasil diterapkan"
}
```

**Response Error:**
```json
{
  "valid": false,
  "message": "Kode diskon tidak ditemukan"
}
```

### Error Messages
- "Kode diskon tidak ditemukan"
- "Kode diskon tidak aktif"
- "Kode diskon sudah kadaluarsa"
- "Kode diskon sudah mencapai batas penggunaan"
- "Minimum pembelian Rp XXX"

## Integrasi dengan Order

### Database Order
Tabel `orders` sekarang memiliki kolom:
- `discount_id` - Foreign key ke tabel discounts
- `discount_code` - Kode diskon yang digunakan
- `discount_amount` - Jumlah potongan diskon

### Cara Menggunakan di Checkout

1. Customer memasukkan kode diskon
2. Validasi menggunakan API `/validate-discount`
3. Jika valid, tampilkan jumlah diskon
4. Saat membuat order, simpan:
   - `discount_id`
   - `discount_code`
   - `discount_amount`
   - `total` = `subtotal` - `discount_amount`
5. Increment `usage_count` pada diskon

## Model Methods

### Discount Model

```php
// Cek apakah diskon valid
$discount->isValid($subtotal);

// Hitung jumlah diskon
$discountAmount = $discount->calculateDiscount($subtotal);

// Increment penggunaan
$discount->incrementUsage();

// Cek status
$discount->isExpired();
$discount->isUsageLimitReached();

// Format untuk display
$discount->formatted_value; // "10%" atau "Rp 100.000"
```

## Tips

1. **Kode Diskon yang Baik**
   - Singkat dan mudah diingat
   - Gunakan huruf besar
   - Kombinasi huruf dan angka
   - Contoh: NEWYEAR2026, SALE50, WELCOME10

2. **Strategi Diskon**
   - Gunakan minimum pembelian untuk meningkatkan average order value
   - Set maksimal diskon untuk mencegah kerugian pada order besar
   - Batasi penggunaan untuk flash sale atau limited offer
   - Gunakan periode untuk seasonal promotion

3. **Monitoring**
   - Pantau `usage_count` untuk melihat popularitas diskon
   - Review diskon yang tidak terpakai
   - Analisa pengaruh diskon terhadap penjualan

## Keamanan

1. Kode diskon unik per diskon
2. Validasi server-side untuk mencegah manipulasi
3. Foreign key constraint untuk data integrity
4. Soft status (is_active) untuk temporary disable

## Troubleshooting

**Problem**: Diskon tidak bisa digunakan
- Cek status is_active
- Cek tanggal start_date dan end_date
- Cek usage_limit dan usage_count
- Cek minimum pembelian

**Problem**: Diskon terlalu besar
- Set max_discount untuk diskon persentase
- Review value untuk diskon nominal

**Problem**: Customer komplain diskon tidak valid
- Cek di admin panel apakah diskon masih aktif
- Cek periode berlaku
- Cek apakah sudah mencapai batas penggunaan
