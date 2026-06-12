<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    /**
     * Halaman pembayaran
     */
    public function showPayment(Order $order)
    {
        $order->load('items.product');

        // Ambil payment settings
        $paymentSettings = PaymentSetting::first();

        $isBookingProduct = $order->items->contains(fn($item) =>
            $item->product && in_array($item->product->product_type, ['share_desk', 'private_room'])
        );

        return Inertia::render('Orders/Payment', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'total' => $order->total,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'payment_proof' => $order->payment_proof ? Storage::url($order->payment_proof) : null,
                'created_at' => $order->created_at,
                'paid_at' => $order->paid_at,
                'is_booking_product' => $isBookingProduct,
            ],
            'qrisImage' => $paymentSettings && $paymentSettings->qris_image 
                ? Storage::url($paymentSettings->qris_image) 
                : null,
            'bankAccount' => [
                'bank_name' => $paymentSettings->bank_name ?? 'Bank BCA',
                'account_number' => $paymentSettings->account_number ?? '1234567890',
                'account_name' => $paymentSettings->account_name ?? 'PT Toko Kita',
            ]
        ]);
    }

    /**
     * Upload bukti pembayaran
     */
    public function uploadPayment(Request $request, Order $order)
    {
        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        try {
            // Hapus bukti pembayaran lama jika ada
            if ($order->payment_proof) {
                Storage::disk('public')->delete($order->payment_proof);
            }

            // Upload bukti pembayaran baru
            $path = $request->file('payment_proof')->store('payment-proofs', 'public');
            
            $order->update([
                'payment_proof' => $path,
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);

            return back()->with('success', 'Bukti pembayaran berhasil diupload');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal mengupload bukti pembayaran: ' . $e->getMessage()]);
        }
    }

    /**
     * Halaman invoice
     */
    public function invoice(Order $order)
    {
        $order->load('items');
        
        // Pastikan pembayaran sudah terverifikasi
        if ($order->payment_status !== 'verified') {
            return redirect()->route('orders.payment', $order)
                ->with('error', 'Pembayaran belum terverifikasi');
        }
        
        return Inertia::render('Orders/Invoice', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'customer_address' => $order->customer_address ?? null,
                'created_at' => $order->created_at,
                'paid_at' => $order->paid_at,
                'payment_method' => $order->payment_method,
                'status' => $order->status,
                'subtotal' => $order->subtotal,
                'discount_code' => $order->discount_code,
                'discount_amount' => $order->discount_amount ?? 0,
                'tax' => $order->tax ?? 0,
                'total' => $order->total,
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_name' => $item->product_name,
                        'variant_name' => $item->variant_name,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'subtotal' => $item->subtotal,
                        'booking_start_at' => $item->booking_start_at,
                        'booking_end_at' => $item->booking_end_at,
                    ];
                }),
                'payment_status' => $order->payment_status,
            ],
            'storeName' => config('app.name', 'Kaspa Space'),
            'storeAddress' => 'Jakarta Selatan',
            'storePhone' => '(021) 1234-5678',
        ]);
    }

    /**
     * Cancel order
     */
    public function cancel(Order $order)
    {
        try {
            // Only allow cancellation if order is unpaid and not already cancelled
            if ($order->payment_status !== 'unpaid' || $order->status === 'cancelled') {
                return response()->json([
                    'error' => 'Pesanan tidak dapat dibatalkan'
                ], 400);
            }

            $order->load('discount', 'items.product', 'items.productVariant');

            DB::transaction(function () use ($order) {
                $order->update(['status' => 'cancelled', 'payment_status' => 'cancelled']);

                // Restore booking slots / stock so the schedule is freed immediately
                foreach ($order->items as $item) {
                    if ($item->stock_reduced && !$item->stock_restored) {
                        $isBookingProduct = $item->product &&
                            in_array($item->product->product_type, ['share_desk', 'private_room', 'private_office', 'virtual_office']);

                        if ($isBookingProduct) {
                            $item->update(['stock_restored' => true]);
                        } elseif ($item->variant_id && $item->productVariant) {
                            $item->productVariant->incrementStock($item->quantity);
                            $item->update(['stock_restored' => true]);
                        }
                    }
                }
            });

            // Kembalikan usage diskon jika order menggunakan diskon
            if ($order->discount_id && $order->discount) {
                $order->discount->decrementUsage();
            }

            return response()->json([
                'message' => 'Pesanan berhasil dibatalkan',
                'order' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Gagal membatalkan pesanan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download invoice sebagai PDF (untuk user)
     */
    public function downloadInvoice(Order $order)
    {
        $order->load('items');

        $paymentMethod = match($order->payment_method) {
            'cash' => 'Tunai',
            'qris' => 'QRIS',
            'bank_transfer' => 'Transfer Bank',
            'midtrans' => 'Midtrans',
            default => $order->payment_method
        };

        $statusText = match($order->payment_status) {
            'paid', 'verified' => 'Lunas',
            'cancelled' => 'Dibatalkan',
            default => 'Menunggu Pembayaran'
        };

        $statusStyle = match($order->payment_status) {
            'paid', 'verified' => 'background: #dcfce7; color: #166534;',
            'cancelled' => 'background: #fee2e2; color: #991b1b;',
            default => 'background: #fef9c3; color: #854d0e;'
        };

        $paymentStatus = "<span style='{$statusStyle} padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;'>{$statusText}</span>";

        $itemsHtml = '';
        foreach ($order->items as $item) {
            $variantHtml  = $item->variant_name
                ? "<div class='prod-variant'>{$item->variant_name}</div>" : '';
            $bookingHtml = '';
            if ($item->booking_start_at && $item->booking_end_at) {
                $dateStr   = $item->booking_start_at->translatedFormat('j M Y');
                $startTime = $item->booking_start_at->format('H:i');
                $endTime   = $item->booking_end_at->format('H:i');
                $bookingHtml = "<div class='prod-booking'>{$dateStr}, {$startTime} - {$endTime}</div>";
            }
            $itemsHtml .= "
                <tr>
                    <td><span class='prod-name'>{$item->product_name}</span>{$variantHtml}{$bookingHtml}</td>
                    <td style='text-align:right;'>{$item->quantity}</td>
                    <td style='text-align:right;'>Rp" . number_format($item->price, 0, ',', '.') . "</td>
                    <td style='text-align:right;font-weight:700;color:#1a2e5a;'>Rp" . number_format($item->subtotal, 0, ',', '.') . "</td>
                </tr>
            ";
        }

        $logoPath = public_path('images/kaspa-space-logo.png');
        $logoSrc = '';
        if (file_exists($logoPath)) {
            $logoData = base64_encode(file_get_contents($logoPath));
            $logoSrc = 'data:image/png;base64,' . $logoData;
        }

        $navy = '#1a2e5a';
        $customerPhone = $order->customer_phone
            ? "<p style='font-size:13px;color:#6b7280;margin:0 0 4px;'>&#128222; {$order->customer_phone}</p>" : '';

        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Invoice {$order->order_number}</title>
            <style>
                * { margin:0; padding:0; box-sizing:border-box; }
                body { font-family:'Segoe UI',Arial,sans-serif; background:#eef2f7; padding:40px 20px; color:#333; }
                .card { background:#fff; max-width:720px; margin:0 auto; border-radius:12px; overflow:hidden; position:relative; }
                .header { display:flex; padding:36px 40px 28px; gap:24px; align-items:flex-start; }
                .header-left { flex:1; }
                .brand { font-size:24px; font-weight:800; color:{$navy}; letter-spacing:-0.5px; }
                .brand-sub { font-size:13px; color:#6b7280; margin-top:4px; }
                .divider-v { width:1px; background:#e5e7eb; align-self:stretch; }
                .header-right { text-align:right; min-width:190px; }
                .inv-label { font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#9ca3af; margin-bottom:6px; }
                .inv-number { font-size:16px; font-weight:800; color:{$navy}; font-family:monospace; margin-bottom:8px; letter-spacing:0.02em; }
                .inv-date { font-size:13px; color:#6b7280; }
                .info-grid { display:flex; padding:0 40px 28px; border-bottom:1px solid #f3f4f5; gap:0; }
                .info-col { flex:1; }
                .info-col.right { padding-left:24px; border-left:1px solid #f3f4f5; }
                .info-col.left { padding-right:24px; }
                .section-label { font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#9ca3af; margin-bottom:12px; }
                .customer-name { font-weight:700; font-size:15px; color:{$navy}; margin-bottom:6px; }
                .customer-detail { font-size:13px; color:#6b7280; margin-bottom:4px; }
                .order-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:13px; }
                .order-row span:first-child { color:#6b7280; }
                .order-row span:last-child { font-weight:600; color:{$navy}; }
                .badge { font-size:12px; font-weight:700; padding:3px 12px; border-radius:20px; }
                .badge-paid { background:#dcfce7; color:#166534; }
                .badge-pending { background:#fef9c3; color:#854d0e; }
                .items-section { padding:0 40px 28px; position:relative; overflow:hidden; }
                table.items { width:100%; border-collapse:collapse; }
                table.items th { background:{$navy}; color:#fff; padding:12px 14px; font-size:12px; font-weight:700; letter-spacing:0.06em; }
                table.items td { padding:13px 14px; border-bottom:1px solid #f3f4f5; font-size:14px; color:#374151; }
                table.items tr:nth-child(odd) td { background:#f9fafb; }
                .prod-name { font-weight:600; color:#111827; }
                .prod-variant { font-size:12px; color:#3b82f6; margin-top:2px; }
                .prod-booking { font-size:12px; color:#059669; margin-top:2px; }
                .total-box { display:flex; justify-content:flex-end; margin-top:20px; }
                .total-inner { background:{$navy}; border-radius:10px; padding:13px 28px; display:flex; align-items:center; gap:24px; }
                .total-label { font-size:13px; font-weight:700; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:0.06em; }
                .total-amount { font-size:20px; font-weight:800; color:#fff; }
                .watermark { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-35deg); font-size:60px; font-weight:900; color:{$navy}; opacity:0.06; letter-spacing:6px; pointer-events:none; white-space:nowrap; }
                .footer { padding:16px 40px 28px; border-top:1px solid #f3f4f5; text-align:center; }
                .footer p { font-size:12px; color:#9ca3af; font-style:italic; }
            </style>
        </head>
        <body>
        <div class='card'>
            <div class='header'>
                <div class='header-left'>
                    " . ($logoSrc ? "<img src='{$logoSrc}' style='height:32px;margin-bottom:6px;display:block;' />" : '') . "
                    <div class='brand'>Kaspa Space</div>
                    <div class='brand-sub'>Premium Coworking Hub</div>
                    <div class='brand-sub'>Jakarta Selatan</div>
                </div>
                <div class='divider-v'></div>
                <div class='header-right'>
                    <div class='inv-label'>Invoice Number</div>
                    <div class='inv-number'>{$order->order_number}</div>
                    <div class='inv-date'>Tanggal: {$order->created_at->translatedFormat('j M Y')}</div>
                </div>
            </div>

            <div class='info-grid'>
                <div class='info-col left'>
                    <div class='section-label'>Informasi Pelanggan</div>
                    <div class='customer-name'>{$order->customer_name}</div>
                    <p class='customer-detail'>&#9993; {$order->customer_email}</p>
                    {$customerPhone}
                </div>
                <div class='info-col right'>
                    <div class='section-label'>Informasi Order</div>
                    <div class='order-row'>
                        <span>Metode Pembayaran</span>
                        <span>{$paymentMethod}</span>
                    </div>
                    <div class='order-row'>
                        <span>Status</span>
                        <span class='badge " . ($statusText === 'Lunas' ? 'badge-paid' : 'badge-pending') . "'>{$statusText}</span>
                    </div>
                </div>
            </div>

            <div class='items-section'>
                <div class='watermark'>TERBAYAR</div>
                <table class='items'>
                    <thead>
                        <tr>
                            <th style='text-align:left;'>PRODUK</th>
                            <th style='text-align:right;'>QTY</th>
                            <th style='text-align:right;'>HARGA</th>
                            <th style='text-align:right;'>SUBTOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$itemsHtml}
                    </tbody>
                </table>
                <div class='total-box'>
                    <div class='total-inner'>
                        <span class='total-label'>Total</span>
                        <span class='total-amount'>Rp" . number_format($order->total, 0, ',', '.') . "</span>
                    </div>
                </div>
            </div>

            <div class='footer'>
                <p>Terima kasih telah berbelanja di Kaspa Space. Invoice ini dibuat secara otomatis dan sah tanpa tanda tangan.</p>
            </div>
        </div>
        </body>
        </html>
        ";

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOption('isRemoteEnabled', true);

        return $pdf->download('Invoice-' . $order->order_number . '.pdf');
    }

    /**
     * Check order status (API endpoint)
     */
    public function checkStatus(Order $order)
    {
        return response()->json([
            'payment_status' => $order->payment_status,
            'status' => $order->status,
            'paid_at' => $order->paid_at,
        ]);
    }
}