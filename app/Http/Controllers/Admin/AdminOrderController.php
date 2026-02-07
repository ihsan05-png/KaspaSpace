<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProductVariant;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class AdminOrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('items.product', 'items.productVariant')
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'customer_email' => $order->customer_email,
                    'customer_phone' => $order->customer_phone,
                    'total' => (float) $order->total,
                    'payment_method' => $order->payment_method,
                    'payment_status' => $order->payment_status,
                    'status' => $order->status,
                    'payment_proof' => $order->payment_proof ? Storage::url($order->payment_proof) : null,
                    'notes' => $order->notes,
                    'created_at' => $order->created_at->toIso8601String(),
                    'paid_at' => $order->paid_at ? $order->paid_at->toIso8601String() : null,
                    'items' => $order->items->map(function ($item) {
                        $productImage = null;
                        if ($item->product && $item->product->images && count($item->product->images) > 0) {
                            $img = $item->product->images[0];
                            $productImage = str_starts_with($img, 'http') ? $img : Storage::url($img);
                        }
                        return [
                            'id' => $item->id,
                            'product_name' => $item->product_name,
                            'variant_name' => $item->variant_name,
                            'quantity' => $item->quantity,
                            'price' => (float) $item->price,
                            'subtotal' => (float) $item->subtotal,
                            'product_image' => $productImage,
                            'booking_start_at' => $item->booking_start_at?->toIso8601String(),
                            'booking_end_at' => $item->booking_end_at?->toIso8601String(),
                        ];
                    })->toArray(),
                ];
            })
            ->values()
            ->toArray();
        
        return Inertia::render('admin/Orders/Index', [
            'orders' => $orders
        ]);
    }

    public function show(Order $order)
    {
        $order->load('items.product', 'items.productVariant');
        
        return Inertia::render('admin/Orders/Show', [
            'order' => $order
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:unpaid,paid,cancelled'
        ]);

        $updateData = ['payment_status' => $validated['payment_status']];

        // Jika diubah jadi paid, set paid_at dan kurangi stok
        if ($validated['payment_status'] === 'paid' && $order->payment_status !== 'paid') {
            $updateData['paid_at'] = now();

            // Reduce stock and set booking times for each order item
            DB::transaction(function () use ($order) {
                $order->load('items.productVariant', 'items.product');

                foreach ($order->items as $item) {
                    if ($item->variant_id && !$item->stock_reduced) {
                        $variant = $item->productVariant;
                        $isBookingProduct = $item->product &&
                            in_array($item->product->product_type, ['share_desk', 'private_room', 'private_office', 'virtual_office']);

                        if ($isBookingProduct) {
                            // Booking products: booking times already set during checkout. Just flag it.
                            $item->update(['stock_reduced' => true]);
                        } elseif ($variant) {
                            // Non-booking products: use global stock
                            $variant->decrementStock($item->quantity);

                            $bookingStart = now();
                            $bookingEnd = null;
                            if ($variant->duration_hours && is_numeric($variant->duration_hours)) {
                                $bookingEnd = $bookingStart->copy()->addHours((float) $variant->duration_hours);
                            }

                            $item->update([
                                'booking_start_at' => $bookingStart,
                                'booking_end_at' => $bookingEnd,
                                'stock_reduced' => true,
                            ]);
                        }
                    }
                }
            });
        }

        // Jika cancelled, set status juga ke cancelled
        if ($validated['payment_status'] === 'cancelled') {
            $updateData['status'] = 'cancelled';

            // Jika stok sudah dikurangi (sebelumnya paid), kembalikan stok
            if ($order->payment_status === 'paid') {
                DB::transaction(function () use ($order) {
                    $order->load('items.productVariant', 'items.product');

                    foreach ($order->items as $item) {
                        if ($item->stock_reduced && !$item->stock_restored) {
                            $isBookingProduct = $item->product &&
                                in_array($item->product->product_type, ['share_desk', 'private_room', 'private_office', 'virtual_office']);

                            if ($isBookingProduct) {
                                // Booking products: just flip flag, no global stock to restore
                                $item->update(['stock_restored' => true]);
                            } elseif ($item->variant_id && $item->productVariant) {
                                // Non-booking products: restore global stock
                                $item->productVariant->incrementStock($item->quantity);
                                $item->update(['stock_restored' => true]);
                            }
                        }
                    }
                });
            }
        }

        $order->update($updateData);

        return back()->with('success', 'Status pembayaran berhasil diupdate');
    }

    /**
     * Halaman verifikasi pembayaran
     */
    public function payments()
    {
        $orders = Order::whereIn('payment_method', ['qris', 'bank_transfer', 'cash'])
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'customer_email' => $order->customer_email,
                    'total' => $order->total,
                    'payment_method' => $order->payment_method,
                    'payment_status' => $order->payment_status,
                    'payment_proof' => $order->payment_proof ? Storage::url($order->payment_proof) : null,
                    'created_at' => $order->created_at,
                    'paid_at' => $order->paid_at,
                ];
            })
            ->values()
            ->toArray();


        
        return Inertia::render('admin/Payments/Index', [
            'orders' => $orders
        ]);
    }

    /**
     * Verifikasi pembayaran
     */
    public function verifyPayment(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:verified,rejected'
        ]);

        // Jika verified, kurangi stok
        if ($validated['status'] === 'verified' && $order->payment_status !== 'paid' && $order->payment_status !== 'verified') {
            DB::transaction(function () use ($order) {
                $order->load('items.productVariant', 'items.product');

                foreach ($order->items as $item) {
                    if ($item->variant_id && !$item->stock_reduced) {
                        $variant = $item->productVariant;
                        $isBookingProduct = $item->product &&
                            in_array($item->product->product_type, ['share_desk', 'private_room', 'private_office', 'virtual_office']);

                        if ($isBookingProduct) {
                            // Booking products: booking times already set during checkout. Just flag it.
                            $item->update(['stock_reduced' => true]);
                        } elseif ($variant) {
                            // Non-booking products: use global stock
                            $variant->decrementStock($item->quantity);

                            $bookingStart = now();
                            $bookingEnd = null;
                            if ($variant->duration_hours && is_numeric($variant->duration_hours)) {
                                $bookingEnd = $bookingStart->copy()->addHours((float) $variant->duration_hours);
                            }

                            $item->update([
                                'booking_start_at' => $bookingStart,
                                'booking_end_at' => $bookingEnd,
                                'stock_reduced' => true,
                            ]);
                        }
                    }
                }
            });
        }

        $order->update([
            'payment_status' => $validated['status'],
            'paid_at' => $validated['status'] === 'verified' ? ($order->paid_at ?? now()) : null,
        ]);

        return back()->with('success', 'Status pembayaran berhasil diupdate');
    }

    /**
     * Send invoice via email
     */
    public function sendInvoice(Order $order)
    {
        $order->load('items');

        // Build invoice HTML (forPdf=false uses cid:logo)
        $invoiceHtml = $this->buildInvoiceHtml($order, false);
        $logoPath = public_path('images/kaspa-space-logo.png');

        try {
            \Illuminate\Support\Facades\Mail::send([], [], function ($message) use ($order, $invoiceHtml, $logoPath) {
                $message->to($order->customer_email, $order->customer_name)
                    ->subject('Invoice Pesanan #' . $order->order_number . ' - Kaspa Space')
                    ->html($invoiceHtml);

                // Embed logo as inline CID attachment
                if (file_exists($logoPath)) {
                    $message->getSymfonyMessage()->embedFromPath($logoPath, 'logo', 'image/png');
                }
            });

            return response()->json(['message' => 'Invoice berhasil dikirim ke ' . $order->customer_email]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengirim email: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Download invoice as PDF
     */
    public function downloadInvoice(Order $order)
    {
        $order->load('items');

        // Build invoice HTML for PDF (DomPDF compatible)
        $invoiceHtml = $this->buildInvoiceHtml($order, true);

        // Generate PDF using Laravel-DomPDF facade
        $pdf = Pdf::loadHTML($invoiceHtml);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOption('isRemoteEnabled', true);

        return $pdf->download('Invoice-' . $order->order_number . '.pdf');
    }

    /**
     * Build invoice HTML (for email and PDF)
     * @param bool $forPdf - if true, use local logo path and DomPDF-compatible CSS
     */
    private function buildInvoiceHtml(Order $order, bool $forPdf = false): string
    {
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

        // Logo: base64 for PDF, CID for email
        $logoPath = public_path('images/kaspa-space-logo.png');
        if ($forPdf) {
            $logoData = base64_encode(file_get_contents($logoPath));
            $logoSrc = 'data:image/png;base64,' . $logoData;
        } else {
            $logoSrc = 'cid:logo';
        }

        $phoneHtml = $order->customer_phone ? "<p style='margin: 5px 0;'><strong>Telepon:</strong> {$order->customer_phone}</p>" : "";

        return "
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
                .total-section { text-align: right; margin-bottom: 30px; }
                .total-box { border-top: 2px solid #3b82f6; padding-top: 10px; display: inline-block; }
                .footer { text-align: center; border-top: 1px solid #eee; padding-top: 20px; color: #666; font-size: 12px; }
                @media print { body { padding: 20px; } }
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

            <div class='total-section'>
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
    }
}