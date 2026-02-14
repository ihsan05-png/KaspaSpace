<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Agreement;

class AgreementSeeder extends Seeder
{
    public function run(): void
    {
        Agreement::updateOrCreate(
            ['type' => 'terms'],
            [
                'title' => 'Syarat & Ketentuan',
                'content' => [
                    ['title' => '1. Penerimaan Syarat', 'items' => ['Dengan mengakses dan menggunakan layanan kami, Anda menyetujui untuk terikat oleh Syarat & Ketentuan ini. Jika Anda tidak setuju dengan syarat ini, mohon untuk tidak menggunakan layanan kami.']],
                    ['title' => '2. Penggunaan Layanan', 'items' => ['Anda setuju untuk menggunakan layanan kami hanya untuk tujuan yang sah dan sesuai dengan hukum yang berlaku. Anda tidak diperkenankan untuk:', 'Menggunakan layanan untuk tujuan ilegal atau tidak sah', 'Melanggar hak kekayaan intelektual pihak lain', 'Mengganggu kenyamanan pengguna lain di area coworking space']],
                    ['title' => '3. Reservasi dan Pembayaran', 'items' => ['Reservasi berlaku sesuai dengan durasi yang dipilih saat pemesanan.', 'Semua pembayaran harus dilakukan sesuai dengan metode pembayaran yang tersedia.', 'Pembatalan reservasi yang dilakukan kurang dari 24 jam sebelum waktu penggunaan tidak akan mendapat pengembalian dana.', 'Pengembalian dana untuk pembatalan yang memenuhi syarat akan diproses dalam waktu 3-7 hari kerja.']],
                    ['title' => '4. Kewajiban Pengguna', 'items' => ['Pengguna wajib menjaga kebersihan dan kerapihan area kerja yang digunakan.', 'Pengguna bertanggung jawab atas keamanan barang-barang pribadi mereka.', 'Pengguna wajib mematuhi peraturan yang berlaku di area Kaspa Space.', 'Keterlambatan lebih dari 30 menit tanpa konfirmasi dapat mengakibatkan pembatalan reservasi.']],
                    ['title' => '5. Batasan Tanggung Jawab', 'items' => ['Kaspa Space tidak bertanggung jawab atas kehilangan atau kerusakan barang pribadi pengguna.', 'Kaspa Space tidak bertanggung jawab atas gangguan layanan yang disebabkan oleh faktor di luar kendali kami.', 'Kaspa Space berhak menolak atau menghentikan layanan kepada pengguna yang melanggar ketentuan.']],
                    ['title' => '6. Kontak', 'items' => ['Segala pertanyaan atau keluhan dapat disampaikan melalui email hello@kaspaspace.com.', 'Penyelesaian sengketa akan dilakukan secara musyawarah mufakat.']],
                ],
                'is_active' => true,
            ]
        );

        Agreement::updateOrCreate(
            ['type' => 'privacy'],
            [
                'title' => 'Kebijakan Privasi',
                'content' => [
                    ['title' => '1. Pendahuluan', 'items' => ['Kebijakan Privasi ini menjelaskan bagaimana Kaspa Space mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.', 'Kami berkomitmen untuk melindungi privasi Anda dan memastikan bahwa data pribadi Anda diproses secara aman.']],
                    ['title' => '2. Informasi yang Kami Kumpulkan', 'items' => ['Informasi identitas: nama lengkap, alamat email, nomor telepon.', 'Informasi transaksi: riwayat pemesanan, metode pembayaran, dan preferensi layanan.', 'Informasi teknis: alamat IP, jenis browser, perangkat yang digunakan.']],
                    ['title' => '3. Penggunaan Informasi', 'items' => ['Memproses dan mengelola reservasi serta transaksi pembayaran Anda.', 'Mengirimkan konfirmasi, pengingat, dan informasi penting terkait layanan.', 'Meningkatkan kualitas layanan dan pengalaman pengguna.', 'Mengirimkan informasi promosi dan newsletter (dengan persetujuan Anda).']],
                    ['title' => '4. Keamanan Data', 'items' => ['Data Anda disimpan di server yang aman dengan enkripsi standar industri.', 'Akses ke data pribadi dibatasi hanya untuk karyawan yang membutuhkan.', 'Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga.']],
                    ['title' => '5. Hak Anda', 'items' => ['Hak akses: Anda dapat meminta salinan data pribadi yang kami miliki.', 'Hak koreksi: Anda dapat meminta perbaikan data yang tidak akurat.', 'Hak penghapusan: Anda dapat meminta penghapusan data pribadi Anda.', 'Hak keberatan: Anda dapat menolak pemrosesan data untuk tujuan pemasaran.']],
                    ['title' => '6. Kontak', 'items' => ['Untuk pertanyaan tentang kebijakan privasi, hubungi kami di hello@kaspaspace.com.', 'Permintaan terkait hak data pribadi akan diproses dalam waktu 30 hari kerja.']],
                ],
                'is_active' => true,
            ]
        );
    }
}
