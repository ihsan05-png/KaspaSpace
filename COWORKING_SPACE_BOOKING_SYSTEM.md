# Sistem Booking Coworking Space - Time-Based Inventory Management

## Overview
Sistem ini mengelola booking berbasis waktu untuk produk Coworking Space dengan automatic stock recovery setelah durasi booking berakhir.

## Kategori Produk

### 1. Private Office
- **Total**: 6 ruangan (SHARED across all variants)
- **Kapasitas**: 4 pax (small/regular), 6 pax, 8 pax
- **Durasi**: 1 month, 6 months, 1 year
- **Total Varian**: 12 paket (3 kapasitas × 3 durasi, plus 4 pax small size)
- **Stock Management**: Shared inventory - semua varian menggunakan pool 6 ruangan yang sama
- **Auto Recovery**: Stok kembali setelah masa sewa berakhir
- **⚠️ PENTING**: 
  - Customer bebas memilih kapasitas dan durasi apapun selama masih ada ruangan
  - Contoh: 2 ruangan (4 pax) + 2 ruangan (6 pax) + 2 ruangan (8 pax) = 6 ruangan terpakai (FULL)
  - Bukan per-variant stock, tapi shared pool 6 ruangan untuk semua kapasitas

### 2. Meeting Room
**Satu ruangan dengan 8 meja kerja** (jam operasional 08:00 - 17:00 WIB)

#### a) Share Desk
- Sewa per meja (1-8 meja)
- Durasi minimal: 1 jam, maksimal: 9 jam (full day)
- Jam operasional: 08:00 - 17:00 WIB
- Stock: 8 meja tersedia
- **Auto Recovery**: Stok meja kembali setelah durasi sewa selesai

#### b) Private Room
- Sewa seluruh ruangan (semua 8 meja)
- Durasi minimal: 1 jam, maksimal: 9 jam (full day 08:00-17:00)
- Jam operasional: 08:00 - 17:00 WIB
- Stock: 1 ruangan
- **Auto Recovery**: Stok ruangan kembali setelah durasi sewa selesai
- **⚠️ PENTING**: Jika Private Room dipesan, Share Desk otomatis full (tidak tersedia)

---

## Logika Backend Time-Based Booking

### 1. Struktur Data Booking

```php
// Table: bookings
[
    'id' => 1,
    'order_id' => 123,
    'product_id' => 5,
    'variant_id' => 12,
    'product_type' => 'share_desk', // private_office, share_desk, private_room
    'quantity' => 2, // jumlah ruangan/meja yang disewa
    'booking_date' => '2026-01-20',
    'start_time' => '09:00:00',
    'end_time' => '11:00:00', // dihitung otomatis dari durasi variant
    'duration_hours' => 2,
    'status' => 'active', // active, completed, cancelled
    'created_at' => '2026-01-20 08:00:00',
]
```

### 2. Perhitungan Ketersediaan Real-Time

#### Fungsi: `checkAvailability($productType, $variantId, $date, $time, $quantity)`

```php
function checkAvailabilityPrivateOffice($date, $startDate, $endDate, $quantity = 1) {
    // Untuk Private Office, hitung TOTAL ruangan yang terpakai dari SEMUA varian
    // Tidak peduli varian apa (Bronze/Platinum/Gold/Diamond), semua pakai pool yang sama
    
    $bookedRooms = Booking::where('product_type', 'private_office')
        ->where('status', 'active')
        ->where(function($query) use ($startDate, $endDate) {
            $query->whereBetween('booking_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate])
                  ->orWhere(function($q) use ($startDate, $endDate) {
                      $q->where('booking_date', '<=', $startDate)
                        ->where('end_date', '>=', $endDate);
                  });
        })
        ->sum('quantity'); // Total ruangan terpakai dari semua varian
    
    $maxRooms = 6; // Total ruangan Private Office
    $availableRooms = $maxRooms - $bookedRooms;
    
    return $availableRooms >= $quantity;
}

function checkAvailability($productType, $date, $startTime, $duration, $quantity = 1) {
    $endTime = Carbon::parse($startTime)->addHours($duration);
    
    // Hitung stok yang sudah terpakai untuk waktu ini
    $bookedStock = Booking::where('product_type', $productType)
        ->where('booking_date', $date)
        ->where('status', 'active')
        ->where(function($query) use ($startTime, $endTime) {
            $query->whereBetween('start_time', [$startTime, $endTime])
                  ->orWhereBetween('end_time', [$startTime, $endTime])
                  ->orWhere(function($q) use ($startTime, $endTime) {
                      $q->where('start_time', '<=', $startTime)
                        ->where('end_time', '>=', $endTime);
                  });
        })
        ->sum('quantity');
    
    // Dapatkan stok maksimal
    $maxStock = $this->getMaxStock($productType);
    
    // Stok tersedia = stok maksimal - stok terpakai
    $availableStock = $maxStock - $bookedStock;
    
    return $availableStock >= $quantity;
}

function getMaxStock($productType) {
    switch($productType) {
        case 'private_office':
            return 6; // 6 ruangan
        case 'share_desk':
            return 8; // 8 meja
        case 'private_room':
            return 1; // 1 ruangan
        default:
            return 0;
    }
}
```

### 3. Logika Khusus Meeting Room (Share Desk & Private Room)

```php
function checkMeetingRoomAvailability($productType, $date, $startTime, $duration, $quantity) {
    // Jika yang dicek adalah Private Room
    if ($productType === 'private_room') {
        // Cek apakah ada booking Share Desk di waktu yang sama
        $shareDeskBooked = Booking::where('product_type', 'share_desk')
            ->where('booking_date', $date)
            ->where('status', 'active')
            ->where(function($query) use ($startTime, $duration) {
                // ... overlap time check
            })
            ->exists();
        
        if ($shareDeskBooked) {
            return false; // Ada meja yang sudah dipesan
        }
        
        // Cek apakah ada booking Private Room lain
        $privateRoomBooked = Booking::where('product_type', 'private_room')
            ->where('booking_date', $date)
            ->where('status', 'active')
            ->where(function($query) use ($startTime, $duration) {
                // ... overlap time check
            })
            ->exists();
        
        return !$privateRoomBooked;
    }
    
    // Jika yang dicek adalah Share Desk
    if ($productType === 'share_desk') {
        // Cek apakah ada Private Room booking di waktu yang sama
        $privateRoomBooked = Booking::where('product_type', 'private_room')
            ->where('booking_date', $date)
            ->where('status', 'active')
            ->where(function($query) use ($startTime, $duration) {
                // ... overlap time check
            })
            ->exists();
        
        if ($privateRoomBooked) {
            return false; // Ruangan sudah full booking Private Room
        }
        
        // Hitung meja Share Desk yang sudah terpakai
        $bookedDesks = Booking::where('product_type', 'share_desk')
            ->where('booking_date', $date)
            ->where('status', 'active')
            ->where(function($query) use ($startTime, $duration) {
                // ... overlap time check
            })
            ->sum('quantity');
        
        $availableDesks = 8 - $bookedDesks;
        
        return $availableDesks >= $quantity;
    }
}
```

### 4. Automatic Stock Recovery

#### Opsi A: Cron Job (Direkomendasikan untuk Private Office)
```php
// app/Console/Commands/CompleteExpiredBookings.php
public function handle() {
    $now = Carbon::now();
    
    // Untuk Private Office (monthly bookings)
    Booking::where('product_type', 'private_office')
        ->where('status', 'active')
        ->where('end_date', '<', $now)
        ->update(['status' => 'completed']);
    
    // Untuk Meeting Room (hourly bookings)
    Booking::whereIn('product_type', ['share_desk', 'private_room'])
        ->where('status', 'active')
        ->where(function($query) use ($now) {
            $query->where('booking_date', '<', $now->toDateString())
                  ->orWhere(function($q) use ($now) {
                      $q->where('booking_date', '=', $now->toDateString())
                        ->where('end_time', '<', $now->toTimeString());
                  });
        })
        ->update(['status' => 'completed']);
    
    $this->info('Expired bookings have been completed.');
}

// Kernel.php - Jalankan setiap 5 menit
$schedule->command('bookings:complete-expired')->everyFiveMinutes();
```

#### Opsi B: Real-Time Check (Untuk Share Desk & Private Room)
```php
// Cek status booking secara real-time saat query availability
function getActiveBookings($productType, $date, $startTime, $endTime) {
    $now = Carbon::now();
    
    return Booking::where('product_type', $productType)
        ->where('booking_date', $date)
        ->where('status', 'active')
        ->where(function($query) use ($now) {
            // Auto-complete jika sudah lewat waktu
            $query->where(function($q) use ($now) {
                $q->where('booking_date', '>', $now->toDateString())
                  ->orWhere(function($q2) use ($now) {
                      $q2->where('booking_date', '=', $now->toDateString())
                         ->where('end_time', '>', $now->toTimeString());
                  });
            });
        })
        ->where(function($query) use ($startTime, $endTime) {
            // Time overlap check
        })
        ->get();
}
```

### 5. Contoh Flow Booking Share Desk

```php
// Customer checkout Share Desk untuk 2 meja, 2 jam (10:00 - 12:00)
public function processBooking(Request $request) {
    $productType = 'share_desk';
    $quantity = 2; // 2 meja
    $date = '2026-01-20';
    $startTime = '10:00:00';
    $duration = 2; // 2 jam
    $endTime = '12:00:00';
    
    // 0. Validasi jam operasional (08:00 - 17:00 WIB)
    $start = Carbon::parse($startTime);
    $end = Carbon::parse($endTime);
    $openingTime = Carbon::parse('08:00:00');
    $closingTime = Carbon::parse('17:00:00');
    
    if ($start->lessThan($openingTime) || $end->greaterThan($closingTime)) {
        return response()->json([
            'error' => 'Booking harus dalam jam operasional 08:00 - 17:00 WIB'
        ], 400);
    }
    
    // 1. Cek availability
    if (!$this->checkMeetingRoomAvailability($productType, $date, $startTime, $duration, $quantity)) {
        return response()->json(['error' => 'Not available'], 400);
    }
    
    // 2. Buat booking
    $booking = Booking::create([
        'order_id' => $order->id,
        'product_type' => $productType,
        'quantity' => $quantity,
        'booking_date' => $date,
        'start_time' => $startTime,
        'end_time' => $endTime,
        'duration_hours' => $duration,
        'status' => 'active',
    ]);
    
    // 3. Stok akan otomatis kembali setelah jam 12:00
    // (handled by cron job atau real-time check)
    
    return response()->json(['success' => true, 'booking' => $booking]);
}
```

---

## Timeline Recovery Examples

### Private Office - Shared Inventory
**Skenario 1: Mixed Capacity**
- Booking 1: 4 pax 1 month, 2 ruangan (2026-01-20 s/d 2026-02-20)
- Booking 2: 6 pax 6 months, 2 ruangan (2026-01-25 s/d 2026-07-25)
- Booking 3: 8 pax 1 year, 2 ruangan (2026-02-01 s/d 2027-02-01)
- **Stock Timeline**:
  - 2026-01-20: 6 → 4 ruangan (4 pax -2)
  - 2026-01-25: 4 → 2 ruangan (6 pax -2)
  - 2026-02-01: 2 → 0 ruangan (8 pax -2) **FULL**
  - 2026-02-20: 0 → 2 ruangan (4 pax +2)
  - 2026-07-25: 2 → 4 ruangan (6 pax +2)
  - 2027-02-01: 4 → 6 ruangan (8 pax +2) **AVAILABLE**

**Skenario 2: Same Capacity, Different Duration**
- 4 pax 1 month: 3 ruangan → Booking selesai setelah 1 bulan → +3 ruangan
- 4 pax 6 months: 2 ruangan → Booking selesai setelah 6 bulan → +2 ruangan
- 4 pax 1 year: 1 ruangan → Booking selesai setelah 1 tahun → +1 ruangan

### Share Desk (3 meja, 2 jam)
- Booking: 2026-01-20 10:00 (dalam jam operasional 08:00-17:00)
- End Time: 2026-01-20 12:00
- **Stock Recovery**: 2026-01-20 12:00:00 → Stok +3 meja

### Private Room (4 jam)
- Booking: 2026-01-20 09:00 (dalam jam operasional 08:00-17:00)
- End Time: 2026-01-20 13:00
- **Stock Recovery**: 2026-01-20 13:00:00 → Stok +1 ruangan (8 meja Share Desk kembali tersedia)

### Private Room (Full Day - 9 jam)
- Booking: 2026-01-20 08:00
- End Time: 2026-01-20 17:00
- **Stock Recovery**: 2026-01-20 17:00:00 → Stok +1 ruangan

---

## Database Tables Needed

### 1. product_variants
```sql
ALTER TABLE product_variants ADD COLUMN duration_type ENUM('hourly', 'monthly') DEFAULT 'hourly';
ALTER TABLE product_variants ADD COLUMN duration_value INT DEFAULT 1;
```

### 2. bookings (New Table)
```sql
CREATE TABLE bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    variant_id BIGINT UNSIGNED NOT NULL,
    product_type VARCHAR(50) NOT NULL, -- private_office, share_desk, private_room
    quantity INT NOT NULL DEFAULT 1,
    booking_date DATE NOT NULL,
    start_time TIME NULL, -- untuk hourly bookings
    end_time TIME NULL, -- untuk hourly bookings
    end_date DATE NULL, -- untuk monthly bookings
    duration_hours INT NULL,
    duration_months INT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_type_date (product_type, booking_date),
    INDEX idx_status (status),
    INDEX idx_end_time (booking_date, end_time)
);
```

---

## Frontend Calendar/Booking Interface

### Requirements:
1. **Date Picker**: Pilih tanggal booking
2. **Time Selector**: Pilih waktu mulai (08:00 - 17:00 untuk Meeting Room)
3. **Duration Dropdown**: Pilih durasi berdasarkan variant (1-9 jam)
4. **Validation**: Pastikan end_time tidak melebihi 17:00 WIB
5. **Quantity Selector**: 
   - Private Office: 1-6 ruangan
   - Share Desk: 1-8 meja
   - Private Room: 1 ruangan (fixed)
6. **Real-time Availability Check**: 
   - Tampilkan stok tersedia saat user memilih waktu
   - Update otomatis jika waktu/tanggal berubah
   - Block waktu di luar jam operasional (sebelum 08:00 atau setelah 17:00)

---

## Testing Scenarios

1. ✅ **Private Office - Shared Inventory**: 
   - Book 4 pax 1 month (2 ruangan) → Stok: 4 tersisa
   - Book 6 pax 6 months (2 ruangan) → Stok: 2 tersisa  
   - Book 8 pax 1 year (2 ruangan) → Stok: 0 (FULL)
   - Setelah 4 pax selesai (1 bulan) → Stok: 2 ruangan kembali
2. ✅ Book Share Desk 2 meja untuk 2 jam → Stok berkurang 2 → Setelah 2 jam stok +2
3. ✅ Book Private Room 4 jam → Share Desk full (0 tersedia) → Setelah 4 jam Share Desk kembali 8
4. ✅ Share Desk sudah 6 meja terpakai → Private Room tidak bisa dipesan (karena tidak bisa dapat 8 meja penuh)
5. ✅ Multiple bookings di waktu berbeda tidak saling mengganggu

---

## Implementation Priority

1. **Phase 1**: Database schema & migration
2. **Phase 2**: Backend availability check logic
3. **Phase 3**: Booking creation & validation
4. **Phase 4**: Auto-recovery cron job
5. **Phase 5**: Frontend booking calendar interface
6. **Phase 6**: Testing & edge cases handling

---

**Catatan**: Sistem ini memerlukan pemahaman mendalam tentang time-based inventory management dan overlap detection. Pastikan untuk testing ekstensif untuk menghindari double booking.
