<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PaymentSettingsController extends Controller
{
    /**
     * Halaman pengaturan pembayaran
     */
    public function index()
    {
        $settings = PaymentSetting::first();

        if (!$settings) {
            $settings = PaymentSetting::create([
                'bank_name'      => 'Bank BCA',
                'account_number' => '1234567890',
                'account_name'   => 'PT Toko Kita',
                'open_time'      => '08:00',
                'close_time'     => '17:00',
            ]);
        }

        return Inertia::render('admin/PaymentSettings', [
            'settings' => [
                'qris_image'     => $settings->qris_image ? Storage::url($settings->qris_image) : null,
                'bank_name'      => $settings->bank_name,
                'account_number' => $settings->account_number,
                'account_name'   => $settings->account_name,
                'open_time'      => $settings->open_time  ?? '08:00',
                'close_time'     => $settings->close_time ?? '17:00',
            ]
        ]);
    }

    /**
     * Update QR Code QRIS
     */
    public function updateQris(Request $request)
    {
        $request->validate([
            'qris_image' => 'required|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        try {
            $settings = PaymentSetting::first();

            if (!$settings) {
                $settings = PaymentSetting::create([]);
            }

            if ($settings->qris_image) {
                Storage::disk('public')->delete($settings->qris_image);
            }

            $path = $request->file('qris_image')->store('qris', 'public');
            $settings->update(['qris_image' => $path]);

            return back()->with('success', 'QR Code QRIS berhasil diupdate');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal mengupload QR Code: ' . $e->getMessage()]);
        }
    }

    /**
     * Update pengaturan bank
     */
    public function updateBank(Request $request)
    {
        $validated = $request->validate([
            'bank_name'      => 'required|string|max:100',
            'account_number' => 'required|string|max:50',
            'account_name'   => 'required|string|max:100',
        ]);

        try {
            $settings = PaymentSetting::firstOrNew([]);
            $settings->fill($validated)->save();

            return back()->with('success', 'Pengaturan bank berhasil diupdate');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menyimpan pengaturan: ' . $e->getMessage()]);
        }
    }

    /**
     * Update jam operasional
     */
    public function updateOperationalHours(Request $request)
    {
        $validated = $request->validate([
            'open_time'  => ['required', 'regex:/^\d{2}:\d{2}$/'],
            'close_time' => ['required', 'regex:/^\d{2}:\d{2}$/', function ($attr, $value, $fail) use ($request) {
                if ($value <= $request->open_time) {
                    $fail('Jam tutup harus setelah jam buka.');
                }
            }],
        ]);

        try {
            $settings = PaymentSetting::firstOrNew([]);
            $settings->fill($validated)->save();

            return back()->with('success', 'Jam operasional berhasil diupdate');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menyimpan: ' . $e->getMessage()]);
        }
    }
}
