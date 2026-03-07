<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Waktu Booking Berakhir</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

    {{-- Header --}}
    <tr>
        <td style="background:linear-gradient(135deg,#1a3a8f 0%,#2563eb 100%);padding:40px 40px 32px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="padding-bottom:20px;">
                        <div style="display:inline-block;background:#ffffff;border-radius:16px;padding:12px 20px;line-height:0;">
                            <img src="{{ $message->embed(public_path('images/kaspa-space-logo.png')) }}"
                                 alt="Kaspa Space"
                                 height="48"
                                 style="display:block;height:48px;width:auto;">
                        </div>
                    </td>
                </tr>
                <tr>
                    <td align="center">
                        <h1 style="color:#ffffff;margin:0 0 8px;font-size:26px;font-weight:700;letter-spacing:0.5px;">
                            Waktu Booking Berakhir
                        </h1>
                        <p style="color:rgba(255,255,255,0.75);margin:0;font-size:14px;">
                            Notifikasi Otomatis dari Kaspa Space
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    {{-- Body --}}
    <tr>
        <td style="padding:36px 40px;color:#1f2937;">

            <p style="font-size:16px;margin:0 0 24px;font-weight:500;">
                Halo, <strong>{{ $item->order->customer_name }}</strong> 👋
            </p>

            {{-- Alert Box --}}
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fcd34d;border-left:4px solid #f59e0b;border-radius:10px;margin-bottom:28px;">
                <tr>
                    <td style="padding:16px 20px;">
                        <table cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="vertical-align:top;padding-right:14px;width:46px;">
                                    <div style="width:36px;height:36px;border-radius:50%;background:#fef3c7;text-align:center;line-height:36px;font-size:18px;">
                                        ⏰
                                    </div>
                                </td>
                                <td style="vertical-align:top;">
                                    <p style="margin:0 0 4px;font-weight:700;font-size:15px;color:#92400e;">
                                        Waktu Pemakaian Telah Berakhir
                                    </p>
                                    <p style="margin:0;font-size:13px;color:#b45309;line-height:1.6;">
                                        Anda masih memiliki <strong>toleransi 10 menit</strong> hingga pukul
                                        <strong>{{ $item->booking_end_at ? $item->booking_end_at->copy()->addMinutes(10)->setTimezone('Asia/Jakarta')->format('H:i') : '-' }} WIB</strong>
                                        untuk membereskan barang dan meninggalkan ruangan.
                                        Mohon pastikan ruangan dalam kondisi rapi. Terima kasih atas kerjasamanya!
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            <p style="font-size:14px;color:#6b7280;margin:0 0 16px;">
                Berikut adalah detail booking yang telah berakhir:
            </p>

            {{-- Detail Card --}}
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:28px;">

                {{-- No Pesanan --}}
                <tr>
                    <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                        <table cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="padding-right:16px;vertical-align:middle;width:46px;">
                                    <div style="width:38px;height:38px;border-radius:10px;background:#eff6ff;text-align:center;line-height:38px;font-size:17px;">
                                        📧
                                    </div>
                                </td>
                                <td>
                                    <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">No. Pesanan</p>
                                    <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#111827;">
                                        {{ $item->order->order_number }}
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                {{-- Produk --}}
                <tr>
                    <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                        <table cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="padding-right:16px;vertical-align:middle;width:46px;">
                                    <div style="width:38px;height:38px;border-radius:10px;background:#f0fdf4;text-align:center;line-height:38px;font-size:17px;">
                                        📍
                                    </div>
                                </td>
                                <td>
                                    <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Produk</p>
                                    <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#111827;">
                                        {{ $item->product_name }}
                                    </p>
                                    @if($item->variant_name)
                                    <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">
                                        {{ $item->variant_name }}
                                    </p>
                                    @endif
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                {{-- Waktu Pemakaian --}}
                <tr>
                    <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                        <table cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="padding-right:16px;vertical-align:middle;width:46px;">
                                    <div style="width:38px;height:38px;border-radius:10px;background:#faf5ff;text-align:center;line-height:38px;font-size:17px;">
                                        📅
                                    </div>
                                </td>
                                <td>
                                    <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Waktu Pemakaian</p>
                                    <p style="margin:4px 0 2px;font-size:13px;color:#374151;">
                                        <span style="color:#6b7280;margin-right:4px;">Mulai:</span>
                                        <strong>{{ $item->booking_start_at ? $item->booking_start_at->setTimezone('Asia/Jakarta')->format('d M Y, H:i').' WIB' : '-' }}</strong>
                                    </p>
                                    <p style="margin:0;font-size:13px;color:#374151;">
                                        <span style="color:#6b7280;margin-right:4px;">Selesai:</span>
                                        <strong>{{ $item->booking_end_at ? $item->booking_end_at->setTimezone('Asia/Jakarta')->format('d M Y, H:i').' WIB' : '-' }}</strong>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                {{-- Status --}}
                <tr>
                    <td style="padding:16px 20px;">
                        <table cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="padding-right:16px;vertical-align:middle;width:46px;">
                                    <div style="width:38px;height:38px;border-radius:10px;background:#fff1f2;text-align:center;line-height:38px;font-size:17px;">
                                        ⏱️
                                    </div>
                                </td>
                                <td>
                                    <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Status</p>
                                    <span style="display:inline-block;margin-top:6px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;padding:3px 12px;border-radius:20px;letter-spacing:1px;">
                                        BERAKHIR
                                    </span>
                                    @if($item->booking_end_at)
                                    <p style="margin:6px 0 0;font-size:12px;color:#b45309;line-height:1.5;">
                                        ⏳ Toleransi 10 menit berlaku hingga<br>
                                        <strong>{{ $item->booking_end_at->copy()->addMinutes(10)->setTimezone('Asia/Jakarta')->format('H:i') }} WIB</strong>
                                    </p>
                                    @endif
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

            </table>

            {{-- Thank You Box --}}
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;margin-bottom:28px;">
                <tr>
                    <td style="padding:18px 20px;">
                        <p style="margin:0 0 8px;font-size:14px;color:#0f766e;line-height:1.6;">
                            <strong>Terima kasih</strong> telah menggunakan fasilitas Kaspa Space.
                            Kami berharap pengalaman Anda menyenangkan! 🎉
                        </p>
                        <p style="margin:0;font-size:13px;color:#0d9488;line-height:1.6;">
                            Ingin memperpanjang atau melakukan booking baru? Kunjungi website kami atau
                            hubungi tim kami untuk bantuan lebih lanjut.
                        </p>
                    </td>
                </tr>
            </table>

            <p style="font-size:14px;color:#374151;margin:0;">
                Salam hangat,<br>
                <strong>Tim Kaspa Space</strong>
            </p>

        </td>
    </tr>

    {{-- Footer --}}
    <tr>
        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#3b82f6;">
                📧 info@kaspaspace.com
            </p>
            <p style="margin:0;font-size:11px;color:#94a3b8;">
                &copy; {{ date('Y') }} Kaspa Space. Semua hak dilindungi.
            </p>
            <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;">
                Email ini dikirim otomatis, mohon tidak membalas email ini.
            </p>
        </td>
    </tr>

</table>
</td></tr>
</table>

</body>
</html>
