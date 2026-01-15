# 🚀 PANDUAN SETUP MIDTRANS - LANGKAH DEMI LANGKAH

## ✅ Step 1: Sudah Selesai ✓
File .env sudah dibuat dan dikonfigurasi!

## 📝 Step 2: Dapatkan Kredensial Midtrans

### A. Daftar/Login Midtrans (GRATIS)
1. Buka browser, kunjungi: **https://dashboard.midtrans.com/register**
2. Isi form registrasi atau login jika sudah punya akun
3. Verifikasi email Anda

### B. Dapatkan Sandbox Keys (untuk Testing)
1. Setelah login, Anda akan masuk ke Dashboard
2. Klik menu **Settings** (icon ⚙️) di sidebar kiri
3. Pilih **Access Keys**
4. Anda akan melihat 2 environment:
   - **Sandbox** (untuk testing) ← Gunakan ini dulu
   - **Production** (untuk live/real transactions)

5. Di bagian **Sandbox**, copy:
   - **Server Key Sandbox**: `SB-Mid-server-xxxxxxxxxx`
   - **Client Key Sandbox**: `SB-Mid-client-xxxxxxxxxx`

### C. Update File .env
Buka file `.env` dan ganti kredensial:

```env
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxx   ← Paste Server Key Anda
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxx   ← Paste Client Key Anda
```

**⚠️ PENTING:** Jangan share keys ini ke publik!

---

## 📡 Step 3: Setup Webhook Notification URL

### Mengapa Perlu Webhook?
Webhook memungkinkan Midtrans memberitahu sistem Anda secara otomatis saat pembayaran berhasil/gagal.

### Setup Webhook (Untuk Development/Local):
**Karena Anda sedang development di localhost, Midtrans tidak bisa reach localhost Anda.**

**Pilihan 1: Pakai ngrok (Recommended untuk testing)**
1. Download ngrok: https://ngrok.com/download
2. Extract dan jalankan:
   ```bash
   ngrok http 8000
   ```
3. Copy URL yang diberikan (contoh: `https://abc123.ngrok.io`)
4. Di Midtrans Dashboard:
   - Settings → Configuration
   - **Notification URL**: `https://abc123.ngrok.io/midtrans/notification`
   - **Finish Redirect URL**: `https://abc123.ngrok.io/checkout/success/{order_id}`
   - **Error Redirect URL**: `https://abc123.ngrok.io/checkout/success/{order_id}`
   - Save

**Pilihan 2: Skip webhook untuk sementara**
- Untuk testing awal, Anda bisa skip webhook
- Status akan tetap update via frontend polling (check setiap 5 detik)
- Tapi ini tidak reliable untuk production

**Untuk Production Nanti:**
```
Notification URL: https://yourdomain.com/midtrans/notification
```

---

## 🔨 Step 4: Install Dependencies & Build

### A. Install PHP Dependencies (jika belum)
```bash
composer install
```

### B. Install & Build Frontend
```bash
npm install
npm run build
```

**ATAU untuk development mode:**
```bash
npm run dev
```
(Biarkan terminal ini running)

---

## 🧪 Step 5: Testing Pembayaran

### A. Start Laravel Server
Buka terminal baru dan jalankan:
```bash
php artisan serve
```

Aplikasi akan running di: `http://127.0.0.1:8000`

### B. Test Flow Pembayaran

1. **Buka browser**: `http://127.0.0.1:8000`

2. **Tambah produk ke cart**
   - Pilih produk
   - Pilih variant
   - Add to cart

3. **Checkout**
   - Klik "Lanjutkan ke Pembayaran"
   - Pilih metode pembayaran: **Midtrans**
   - Isi form customer
   - Klik "Selesaikan Pesanan"

4. **Halaman Payment**
   - Klik "Bayar Sekarang dengan Midtrans"
   - Popup Midtrans Snap akan muncul

5. **Testing dengan Card**
   Gunakan test card berikut:

   **✅ SUCCESS (Pembayaran Berhasil):**
   ```
   Card Number: 4811 1111 1111 1114
   CVV: 123
   Exp Date: 01/25 (atau bulan/tahun di masa depan)
   ```

   **❌ DENIED (Pembayaran Gagal):**
   ```
   Card Number: 4911 1111 1111 1114
   CVV: 123
   Exp Date: 01/25
   ```

   **⏳ CHALLENGE (Butuh OTP/3DS):**
   ```
   Card Number: 4911 1111 1111 1113
   CVV: 123
   Exp Date: 01/25
   OTP: 112233
   ```

6. **Hasil**
   - Jika berhasil: Status otomatis berubah jadi "Sudah Dibayar" ✓
   - Frontend akan auto-refresh dan menampilkan konfirmasi
   - Order status berubah dari "pending" → "confirmed"

---

## 🐛 Troubleshooting

### Snap popup tidak muncul?
**Solusi:**
1. Cek Console Browser (F12) untuk error
2. Pastikan `VITE_MIDTRANS_CLIENT_KEY` sudah ada di `.env`
3. Rebuild frontend: `npm run build`
4. Hard refresh browser: `Ctrl + Shift + R`

### Error "Gagal membuat token pembayaran"?
**Solusi:**
1. Cek apakah `MIDTRANS_SERVER_KEY` benar
2. Pastikan format: `SB-Mid-server-xxxxxxxxxx`
3. Cek log: `storage/logs/laravel.log`

### Status tidak update otomatis?
**Kemungkinan:**
1. **Webhook belum setup** → Pakai ngrok atau tunggu production
2. **Frontend polling tetap jalan** → Status akan update dalam 5 detik
3. Cek Network tab di browser untuk request ke `/midtrans/check-status/`

---

## 📊 Monitoring & Logs

### Cek Transaction di Midtrans Dashboard
1. Login ke Dashboard Midtrans
2. Menu **Transactions** → **All Transactions**
3. Lihat semua transaksi testing Anda

### Cek Log Laravel
```bash
tail -f storage/logs/laravel.log
```

Anda akan melihat:
- Midtrans Notification logs
- Order status updates
- Error messages (jika ada)

---

## 🎯 Production Checklist

Sebelum deploy ke production:

- [ ] Ganti ke **Production Keys** di Midtrans Dashboard
- [ ] Update `.env`:
  ```env
  MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxx  (tanpa SB-)
  MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxx  (tanpa SB-)
  MIDTRANS_IS_PRODUCTION=true
  ```
- [ ] Setup Notification URL ke domain production
- [ ] Test sekali lagi dengan Production mode
- [ ] Setup HTTPS/SSL (wajib untuk production)
- [ ] Backup database sebelum go-live

---

## 📞 Butuh Bantuan?

- **Midtrans Docs**: https://docs.midtrans.com
- **Midtrans Support**: support@midtrans.com
- **Midtrans Sandbox Test Cards**: https://docs.midtrans.com/en/technical-reference/sandbox-test

---

## ✨ Fitur yang Sudah Ready

✅ Midtrans Snap Integration
✅ Auto-sync payment status via webhook
✅ Frontend auto-check status (polling setiap 5 detik)
✅ Real-time UI update
✅ Support semua payment methods Midtrans:
   - Credit Card
   - Debit Card
   - GoPay
   - QRIS
   - Bank Transfer
   - Alfamart/Indomaret
   - Akulaku
   - Kredivo
   - dll.

---

**🚀 Selamat! Setup Midtrans sudah selesai!**
**Silakan test pembayaran Anda sekarang.**
