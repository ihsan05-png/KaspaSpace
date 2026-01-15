# Konfigurasi Midtrans Payment Gateway

## Setup Midtrans

### 1. Dapatkan Kredensial Midtrans
1. Daftar di [Midtrans](https://midtrans.com)
2. Login ke Dashboard Midtrans
3. Pilih **Settings** → **Access Keys**
4. Copy **Server Key** dan **Client Key** (gunakan Sandbox untuk testing)

### 2. Update File .env
Tambahkan konfigurasi Midtrans ke file `.env`:

```env
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true

VITE_MIDTRANS_CLIENT_KEY="${MIDTRANS_CLIENT_KEY}"
```

**Note:** Untuk production, ubah `MIDTRANS_IS_PRODUCTION=true` dan gunakan Production keys

### 3. Setup Webhook Notification URL
1. Buka Dashboard Midtrans
2. Pilih **Settings** → **Configuration**
3. Set **Notification URL** menjadi:
   ```
   https://your-domain.com/midtrans/notification
   ```
4. Save configuration

### 4. Rebuild Frontend Assets
Setelah menambahkan `VITE_MIDTRANS_CLIENT_KEY`, rebuild assets:

```bash
npm run build
```

Atau untuk development:
```bash
npm run dev
```

## Fitur Auto-Sync Payment

### Webhook Handler
- **URL:** `/midtrans/notification` (POST)
- **Handler:** `MidtransController@notification`
- Webhook ini akan otomatis:
  - Update `payment_status` order
  - Update `status` order
  - Log semua notifikasi untuk debugging

### Status Mapping
| Midtrans Status | Payment Status | Order Status |
|----------------|----------------|--------------|
| settlement     | paid           | confirmed    |
| capture (fraud: accept) | paid | confirmed |
| pending        | pending        | pending      |
| deny/cancel/expire | failed      | cancelled    |

### Auto Status Check
Frontend akan otomatis:
- Check payment status setiap 5 detik saat di halaman payment
- Update UI secara realtime ketika status berubah
- Reload page otomatis setelah pembayaran berhasil

## Testing

### Sandbox Test Cards
Gunakan kartu test berikut di Sandbox Midtrans:

**Success:**
- Card: 4811 1111 1111 1114
- CVV: 123
- Exp: 01/25

**Challenge by FDS:**
- Card: 4911 1111 1111 1113

**Denied:**
- Card: 4911 1111 1111 1114

### Testing Flow
1. Pilih metode pembayaran **Midtrans**
2. Isi form checkout
3. Klik "Bayar Sekarang dengan Midtrans"
4. Popup Midtrans Snap akan muncul
5. Pilih metode pembayaran (Credit Card, GoPay, dll)
6. Complete pembayaran
7. Status akan otomatis terupdate

## Troubleshooting

### Snap popup tidak muncul
- Pastikan `VITE_MIDTRANS_CLIENT_KEY` sudah di set di `.env`
- Rebuild frontend assets: `npm run build`
- Clear browser cache

### Status tidak terupdate otomatis
- Cek apakah Notification URL sudah di set di Midtrans Dashboard
- Cek log: `storage/logs/laravel.log`
- Pastikan webhook URL accessible dari internet (untuk production)

### Error "Gagal membuat token pembayaran"
- Cek apakah `MIDTRANS_SERVER_KEY` benar
- Pastikan Midtrans package terinstall: `composer require midtrans/midtrans-php`
- Cek log untuk detail error

## API Endpoints

### Create Snap Token
```
POST /midtrans/create-snap-token/{order}
Response: { "snap_token": "xxx", "order_id": 123 }
```

### Check Payment Status
```
GET /midtrans/check-status/{order}
Response: { "order_id": 123, "payment_status": "paid", "status": "confirmed" }
```

### Webhook Notification
```
POST /midtrans/notification
(Called by Midtrans automatically)
```

## Production Checklist
- [ ] Update ke Production Server Key & Client Key
- [ ] Set `MIDTRANS_IS_PRODUCTION=true`
- [ ] Set Notification URL di Midtrans Dashboard
- [ ] Test semua payment methods
- [ ] Monitor logs untuk error
- [ ] Setup proper SSL/HTTPS
