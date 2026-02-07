import React from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { ShieldCheckIcon, DocumentTextIcon, ScaleIcon, UserGroupIcon, CreditCardIcon, ClockIcon, ExclamationTriangleIcon, PhoneIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const Terms = () => {
    const sections = [
        {
            icon: DocumentTextIcon,
            title: "1. Ketentuan Umum",
            content: [
                "Dengan menggunakan layanan Kaspa Space, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini.",
                "Kaspa Space berhak mengubah syarat dan ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya.",
                "Pengguna diwajibkan untuk membaca dan memahami syarat dan ketentuan ini sebelum menggunakan layanan kami.",
                "Ketentuan ini berlaku untuk semua layanan yang disediakan oleh Kaspa Space termasuk coworking space, meeting room, dan layanan profesional lainnya."
            ]
        },
        {
            icon: UserGroupIcon,
            title: "2. Kewajiban Pengguna",
            content: [
                "Pengguna wajib menjaga kebersihan dan kerapihan area kerja yang digunakan.",
                "Dilarang melakukan aktivitas yang mengganggu kenyamanan pengguna lain.",
                "Pengguna bertanggung jawab atas keamanan barang-barang pribadi mereka.",
                "Pengguna wajib mematuhi peraturan yang berlaku di area Kaspa Space.",
                "Dilarang membawa makanan atau minuman yang berbau menyengat ke area kerja bersama."
            ]
        },
        {
            icon: CreditCardIcon,
            title: "3. Pembayaran dan Pengembalian Dana",
            content: [
                "Semua pembayaran harus dilakukan sesuai dengan metode pembayaran yang tersedia.",
                "Pembayaran dianggap sah setelah dikonfirmasi oleh sistem atau admin Kaspa Space.",
                "Pembatalan reservasi yang dilakukan kurang dari 24 jam sebelum waktu penggunaan tidak akan mendapat pengembalian dana.",
                "Pengembalian dana untuk pembatalan yang memenuhi syarat akan diproses dalam waktu 3-7 hari kerja.",
                "Kaspa Space berhak menolak transaksi yang dicurigai melanggar ketentuan yang berlaku."
            ]
        },
        {
            icon: ClockIcon,
            title: "4. Reservasi dan Penggunaan",
            content: [
                "Reservasi berlaku sesuai dengan durasi yang dipilih saat pemesanan.",
                "Pengguna diharapkan hadir tepat waktu sesuai jadwal reservasi.",
                "Keterlambatan lebih dari 30 menit tanpa konfirmasi dapat mengakibatkan pembatalan reservasi.",
                "Perpanjangan waktu penggunaan dapat dilakukan dengan menghubungi admin, tergantung ketersediaan.",
                "Kaspa Space berhak membatalkan reservasi jika terjadi keadaan darurat atau force majeure."
            ]
        },
        {
            icon: ScaleIcon,
            title: "5. Hak Kekayaan Intelektual",
            content: [
                "Seluruh konten, logo, dan materi di website Kaspa Space dilindungi hak cipta.",
                "Pengguna tidak diperkenankan menyalin, mendistribusikan, atau menggunakan konten tanpa izin tertulis.",
                "Nama 'Kaspa Space' dan logo terkait adalah merek dagang terdaftar.",
                "Pelanggaran hak kekayaan intelektual dapat ditindak sesuai hukum yang berlaku."
            ]
        },
        {
            icon: ExclamationTriangleIcon,
            title: "6. Batasan Tanggung Jawab",
            content: [
                "Kaspa Space tidak bertanggung jawab atas kehilangan atau kerusakan barang pribadi pengguna.",
                "Kaspa Space tidak bertanggung jawab atas gangguan layanan yang disebabkan oleh faktor di luar kendali kami.",
                "Pengguna menggunakan fasilitas dan layanan Kaspa Space dengan risiko sendiri.",
                "Kaspa Space berhak menolak atau menghentikan layanan kepada pengguna yang melanggar ketentuan."
            ]
        },
        {
            icon: ShieldCheckIcon,
            title: "7. Keamanan",
            content: [
                "Kaspa Space menyediakan sistem keamanan dasar di area kerja.",
                "Pengguna wajib menjaga kerahasiaan data login dan akses mereka.",
                "Segala aktivitas mencurigakan harus segera dilaporkan kepada manajemen.",
                "Kaspa Space berhak melakukan pemeriksaan keamanan jika diperlukan."
            ]
        },
        {
            icon: PhoneIcon,
            title: "8. Kontak dan Penyelesaian Sengketa",
            content: [
                "Segala pertanyaan atau keluhan dapat disampaikan melalui email hello@kaspaspace.com.",
                "Penyelesaian sengketa akan dilakukan secara musyawarah mufakat.",
                "Jika tidak tercapai kesepakatan, sengketa akan diselesaikan sesuai hukum yang berlaku di Indonesia.",
                "Pengadilan yang berwenang adalah Pengadilan Negeri Surakarta."
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
            <Navbar />

            {/* Floating Back Button */}
            <a
                href="/checkout"
                className="fixed bottom-6 left-6 z-50 inline-flex items-center gap-2 bg-white text-blue-600 px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all font-semibold border border-blue-100"
            >
                <ArrowLeftIcon className="w-5 h-5" />
                Kembali ke Checkout
            </a>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <DocumentTextIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Syarat & Ketentuan
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Harap baca dengan seksama syarat dan ketentuan berikut sebelum menggunakan layanan Kaspa Space.
                    </p>
                    <p className="text-sm text-blue-200 mt-4">
                        Terakhir diperbarui: 26 Januari 2025
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Introduction */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <p className="text-gray-700 leading-relaxed">
                            Selamat datang di Kaspa Space. Dokumen ini mengatur hubungan hukum antara Anda sebagai pengguna
                            dan Kaspa Space sebagai penyedia layanan coworking space dan layanan profesional terkait.
                            Dengan mengakses atau menggunakan layanan kami, Anda dianggap telah membaca, memahami,
                            dan menyetujui seluruh syarat dan ketentuan yang tercantum di bawah ini.
                        </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-6">
                        {sections.map((section, index) => {
                            const Icon = section.icon;
                            return (
                                <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {section.title}
                                        </h2>
                                    </div>
                                    <ul className="space-y-3">
                                        {section.content.map((item, itemIndex) => (
                                            <li key={itemIndex} className="flex items-start gap-3">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                                <span className="text-gray-700">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>

                    {/* Agreement Box */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Persetujuan</h3>
                                <p className="text-gray-700">
                                    Dengan menggunakan layanan Kaspa Space, Anda menyatakan bahwa Anda telah membaca,
                                    memahami, dan setuju untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak
                                    menyetujui salah satu atau seluruh ketentuan ini, mohon untuk tidak menggunakan layanan kami.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Jika Anda memiliki pertanyaan mengenai syarat dan ketentuan ini, silakan hubungi kami di{' '}
                            <a href="mailto:hello@kaspaspace.com" className="text-blue-600 hover:underline font-medium">
                                hello@kaspaspace.com
                            </a>
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Terms;
