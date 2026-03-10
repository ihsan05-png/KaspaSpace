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
                'subtotal' => $order->subtotal,
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
                    ];
                }),
            ],
            'storeName' => config('app.name', 'Toko Kita'),
            'storeAddress' => 'Jl. Bisnis No. 456, Jakarta',
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
            $variantName = $item->variant_name ? "<br><small style='color: #3b82f6;'>{$item->variant_name}</small>" : '';
            $bookingInfo = '';
            if ($item->booking_start_at && $item->booking_end_at) {
                $dateStr = $item->booking_start_at->translatedFormat('j M Y');
                $startTime = $item->booking_start_at->format('H:i');
                $endTime = $item->booking_end_at->format('H:i');
                $bookingInfo = "<br><small style='color: #059669;'>{$dateStr}, {$startTime} - {$endTime}</small>";
            }
            $itemsHtml .= "
                <tr>
                    <td style='padding: 12px; border-bottom: 1px solid #eee;'>{$item->product_name}{$variantName}{$bookingInfo}</td>
                    <td style='padding: 12px; border-bottom: 1px solid #eee; text-align: center;'>{$item->quantity}</td>
                    <td style='padding: 12px; border-bottom: 1px solid #eee; text-align: right;'>Rp" . number_format($item->price, 0, ',', '.') . "</td>
                    <td style='padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;'>Rp" . number_format($item->subtotal, 0, ',', '.') . "</td>
                </tr>
            ";
        }

        $logoPath = public_path('images/kaspa-space-logo.png');
        $logoData = base64_encode(file_get_contents($logoPath));
        $logoSrc = 'data:image/png;base64,' . $logoData;
        $phoneHtml = $order->customer_phone ? "<p style='margin: 5px 0;'><strong>Telepon:</strong> {$order->customer_phone}</p>" : "";

        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Invoice {$order->order_number}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
                .info-table { width: 100%; margin-bottom: 30px; }
                .info-table td { vertical-align: top; width: 50%; padding: 0 10px; }
                .info-table h3 { color: #3b82f6; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; }
                .info-table p { margin: 5px 0; font-size: 14px; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                .items-table th { background: #3b82f6; color: white; padding: 12px; font-size: 14px; }
                .items-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
                .footer { text-align: center; border-top: 1px solid #eee; padding-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class='invoice-header'>
                <img src='{$logoSrc}' alt='Kaspa Space' style='height: 100px;' />
            </div>
            <table class='info-table'>
                <tr>
                    <td>
                        <h3>Informasi Pesanan</h3>
                        <p><strong>No. Invoice:</strong> {$order->order_number}</p>
                        <p><strong>Tanggal:</strong> {$order->created_at->format('d M Y, H:i')}</p>
                        <p><strong>Metode Pembayaran:</strong> {$paymentMethod}</p>
                        <p><strong>Status:</strong> {$paymentStatus}</p>
                    </td>
                    <td>
                        <h3>Informasi Pelanggan</h3>
                        <p><strong>Nama:</strong> {$order->customer_name}</p>
                        <p><strong>Email:</strong> {$order->customer_email}</p>
                        {$phoneHtml}
                    </td>
                </tr>
            </table>
            <table class='items-table'>
                <thead>
                    <tr>
                        <th style='text-align: left;'>Produk</th>
                        <th style='text-align: center;'>Qty</th>
                        <th style='text-align: right;'>Harga</th>
                        <th style='text-align: right;'>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {$itemsHtml}
                </tbody>
            </table>
            <div style='text-align: right; margin-bottom: 30px;'>
                <table style='margin-left: auto;'>
                    <tr>
                        <td style='border-top: 2px solid #3b82f6; padding-top: 10px;'>
                            <span style='font-size: 18px; font-weight: bold;'>TOTAL: </span>
                            <span style='font-size: 20px; font-weight: bold; color: #3b82f6;'>Rp" . number_format($order->total, 0, ',', '.') . "</span>
                        </td>
                    </tr>
                </table>
            </div>
            <div class='footer'>
                <p>Terima kasih telah berbelanja di Kaspa Space</p>
                <p style='font-size: 12px; color: #999; margin-top: 5px;'>Invoice ini dibuat secara otomatis dan sah tanpa tanda tangan</p>
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