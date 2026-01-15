# Cara Memasang/Menggunakan Diskon

## Untuk Customer (Frontend)

### 1. Proses Checkout
Ketika customer melakukan checkout, mereka akan melihat form kode diskon di **Ringkasan Pesanan** (sebelah kanan).

### 2. Memasukkan Kode Diskon
1. Pada bagian "Punya Kode Diskon?", masukkan kode diskon (contoh: `DISCOUNT50K`)
2. Klik tombol **"Pakai"**
3. Sistem akan memvalidasi kode diskon secara otomatis

### 3. Validasi Diskon
Sistem akan mengecek:
- ✅ Apakah kode diskon ada
- ✅ Apakah diskon masih aktif
- ✅ Apakah sudah kadaluarsa
- ✅ Apakah sudah mencapai batas penggunaan
- ✅ Apakah subtotal memenuhi minimum pembelian

### 4. Jika Valid
- ✅ Diskon akan diterapkan
- ✅ Muncul badge hijau dengan nama diskon dan jumlah potongan
- ✅ Total akan otomatis berkurang
- ✅ Muncul informasi "Hemat Rp XXX!"

### 5. Jika Tidak Valid
- ❌ Muncul pesan error
- ❌ Contoh: "Kode diskon tidak ditemukan", "Minimum pembelian Rp 500.000", dll

### 6. Menghapus Diskon
- Klik ikon **X** pada badge hijau diskon
- Diskon akan dihapus dan total kembali normal

### 7. Selesaikan Pesanan
- Klik **"Selesaikan Pesanan"**
- Diskon akan tersimpan di order
- Usage count diskon akan bertambah

---

## Untuk Admin

### 1. Membuat Diskon

**Akses:** Admin Panel → Diskon → Tambah Diskon

**Form yang harus diisi:**

#### A. Diskon Persentase
```
Kode Diskon: WELCOME10
Nama: Diskon Welcome 10%
Tipe: Persentase
Nilai: 10
Minimum Pembelian: 100000 (opsional)
Maksimal Diskon: 50000 (opsional)
Status: ✓ Aktif
```

**Hasil:**
- Subtotal Rp 200.000 → Diskon Rp 20.000
- Subtotal Rp 1.000.000 → Diskon Rp 50.000 (maksimal)

#### B. Diskon Nominal
```
Kode Diskon: PROMO50K
Nama: Potongan 50 Ribu
Tipe: Nominal
Nilai: 50000
Minimum Pembelian: 200000
Status: ✓ Aktif
```

**Hasil:**
- Subtotal Rp 250.000 → Diskon Rp 50.000
- Subtotal Rp 150.000 → Tidak valid (belum memenuhi minimum)

### 2. Mengelola Diskon

#### Mengaktifkan/Menonaktifkan
- Klik icon ✓ (hijau) untuk menonaktifkan
- Klik icon ✗ (abu-abu) untuk mengaktifkan

#### Mengedit Diskon
- Klik icon pensil
- Edit informasi diskon
- Klik **"Update Diskon"**

#### Menghapus Diskon
- Klik icon tempat sampah
- Konfirmasi penghapusan
- Diskon akan dihapus permanen

### 3. Monitoring Diskon

Di halaman Index, Anda bisa melihat:
- **Penggunaan**: Berapa kali diskon sudah dipakai
- **Status**: Aktif, Tidak Aktif, Kadaluarsa, atau Batas Tercapai
- **Periode**: Tanggal mulai dan berakhir

---

## Contoh Penggunaan di Customer

### Scenario 1: Belanja Rp 300.000 dengan DISCOUNT50K

1. Customer add to cart produk senilai Rp 300.000
2. Klik **Checkout**
3. Isi data customer (nama, email, no. HP)
4. Di bagian "Punya Kode Diskon?", masukkan: `DISCOUNT50K`
5. Klik **"Pakai"**
6. ✅ Muncul badge hijau: "DISCOUNT50K - Potongan 50 Ribu"
7. Total berubah dari Rp 300.000 menjadi **Rp 250.000**
8. Muncul teks: "Hemat Rp 50.000!"
9. Klik **"Selesaikan Pesanan"**
10. Order berhasil dengan diskon tersimpan

### Scenario 2: Kode Diskon Tidak Valid

1. Customer masukkan kode: `INVALID123`
2. Klik **"Pakai"**
3. ❌ Muncul error: "Kode diskon tidak ditemukan"
4. Diskon tidak diterapkan

### Scenario 3: Minimum Pembelian Tidak Terpenuhi

1. Customer belanja Rp 150.000
2. Masukkan kode: `PROMO50K` (min. Rp 200.000)
3. Klik **"Pakai"**
4. ❌ Muncul error: "Minimum pembelian Rp 200.000"
5. Diskon tidak diterapkan

---

## Data yang Tersimpan di Order

Ketika order berhasil dibuat dengan diskon, data berikut tersimpan:

```php
[
    'order_number' => 'ORD-ABC123',
    'customer_name' => 'John Doe',
    'customer_email' => 'john@example.com',
    'subtotal' => 300000,
    'discount_id' => 1,
    'discount_code' => 'DISCOUNT50K',
    'discount_amount' => 50000,
    'total' => 250000,  // subtotal - discount_amount
    'status' => 'pending',
]
```

---

## Tips untuk Admin

### 1. Strategi Diskon yang Efektif

**A. Welcome Discount**
```
Kode: WELCOME10
Tipe: Persentase (10%)
Max Diskon: Rp 50.000
Batas: 100 penggunaan
```
→ Untuk customer baru

**B. Flash Sale**
```
Kode: FLASHSALE50
Tipe: Persentase (50%)
Max Diskon: Rp 300.000
Periode: 1 hari saja
Batas: 50 penggunaan
```
→ Untuk urgency dan FOMO

**C. Minimum Purchase**
```
Kode: BUY500K
Tipe: Nominal (Rp 100.000)
Min Pembelian: Rp 500.000
```
→ Untuk meningkatkan average order value

**D. Holiday Special**
```
Kode: NEWYEAR2026
Tipe: Persentase (20%)
Periode: 31 Des - 2 Jan
```
→ Untuk seasonal promotion

### 2. Best Practices

✅ **DO:**
- Gunakan kode yang mudah diingat dan relate dengan promo
- Set maksimal diskon untuk diskon persentase
- Monitor usage count untuk evaluasi
- Gunakan periode untuk limited time offer
- Set minimum pembelian untuk meningkatkan revenue

❌ **DON'T:**
- Jangan buat diskon terlalu besar tanpa max_discount
- Jangan lupa set end_date untuk promo temporary
- Jangan duplikat kode diskon (harus unique)
- Jangan lupa nonaktifkan diskon yang sudah tidak berlaku

---

## Troubleshooting

### Problem: "Kode diskon tidak ditemukan"
**Solusi:**
- Cek spelling kode diskon
- Pastikan diskon sudah dibuat di admin panel
- Pastikan kode persis sama (case-sensitive)

### Problem: "Kode diskon tidak valid"
**Solusi:**
- Cek status is_active di admin
- Cek tanggal end_date
- Cek usage_limit dan usage_count
- Cek minimum pembelian

### Problem: Diskon tidak mengurangi total
**Solusi:**
- Pastikan klik tombol "Pakai" terlebih dahulu
- Refresh halaman jika perlu
- Cek browser console untuk error

### Problem: Order tersimpan tanpa diskon
**Solusi:**
- Pastikan badge hijau muncul sebelum submit
- Pastikan discount_code terisi di formData
- Cek backend logs untuk validasi error

---

## API Endpoint

### Validasi Diskon
```javascript
POST /validate-discount

Request:
{
  "code": "DISCOUNT50K",
  "subtotal": 300000
}

Response (Success):
{
  "valid": true,
  "discount": {
    "id": 1,
    "code": "DISCOUNT50K",
    "name": "Potongan 50 Ribu",
    "type": "fixed",
    "value": 50000,
    "amount": 50000,
    "formatted_amount": "Rp 50.000"
  },
  "message": "Kode diskon berhasil diterapkan"
}

Response (Error):
{
  "valid": false,
  "message": "Kode diskon tidak ditemukan"
}
```

---

## Summary

**Sistem diskon sudah:**
✅ Terintegrasi di halaman checkout
✅ Real-time validation via API
✅ Support diskon persentase dan nominal
✅ Auto-apply saat customer input kode
✅ Tersimpan di order dengan lengkap
✅ Auto-increment usage count
✅ Validasi minimum pembelian
✅ Validasi tanggal aktif
✅ Validasi batas penggunaan

**Customer tinggal:**
1. Checkout seperti biasa
2. Masukkan kode diskon
3. Klik "Pakai"
4. Lihat total berkurang
5. Selesaikan pesanan

**Admin tinggal:**
1. Buat diskon di admin panel
2. Share kode diskon ke customer
3. Monitor penggunaan
4. Evaluasi efektivitas
