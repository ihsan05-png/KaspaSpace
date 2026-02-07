import React from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { ShieldCheckIcon, EyeIcon, LockClosedIcon, ServerIcon, UserIcon, DocumentTextIcon, GlobeAltIcon, TrashIcon, PhoneIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const Privacy = () => {
    const sections = [
        {
            icon: DocumentTextIcon,
            title: "1. Pendahuluan",
            content: [
                "Kebijakan Privasi ini menjelaskan bagaimana Kaspa Space mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.",
                "Kami berkomitmen untuk melindungi privasi Anda dan memastikan bahwa data pribadi Anda diproses secara aman.",
                "Kebijakan ini berlaku untuk semua layanan yang disediakan oleh Kaspa Space, baik secara online maupun offline.",
                "Dengan menggunakan layanan kami, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini."
            ]
        },
        {
            icon: UserIcon,
            title: "2. Informasi yang Kami Kumpulkan",
            content: [
                "Informasi identitas: nama lengkap, alamat email, nomor telepon, dan foto profil.",
                "Informasi transaksi: riwayat pemesanan, metode pembayaran, dan preferensi layanan.",
                "Informasi teknis: alamat IP, jenis browser, perangkat yang digunakan, dan data log akses.",
                "Informasi lokasi: data lokasi saat Anda menggunakan layanan berbasis lokasi kami.",
                "Informasi komunikasi: pesan, email, dan feedback yang Anda kirimkan kepada kami."
            ]
        },
        {
            icon: EyeIcon,
            title: "3. Penggunaan Informasi",
            content: [
                "Memproses dan mengelola reservasi serta transaksi pembayaran Anda.",
                "Mengirimkan konfirmasi, pengingat, dan informasi penting terkait layanan.",
                "Meningkatkan kualitas layanan dan pengalaman pengguna.",
                "Mengirimkan informasi promosi, penawaran khusus, dan newsletter (dengan persetujuan Anda).",
                "Mencegah penipuan dan menjaga keamanan platform kami.",
                "Memenuhi kewajiban hukum dan regulasi yang berlaku."
            ]
        },
        {
            icon: ServerIcon,
            title: "4. Penyimpanan dan Keamanan Data",
            content: [
                "Data Anda disimpan di server yang aman dengan enkripsi standar industri.",
                "Kami menerapkan langkah-langkah keamanan fisik, elektronik, dan prosedural untuk melindungi data Anda.",
                "Akses ke data pribadi dibatasi hanya untuk karyawan yang membutuhkan akses tersebut.",
                "Data akan disimpan selama diperlukan untuk tujuan yang dijelaskan dalam kebijakan ini.",
                "Kami secara berkala meninjau dan memperbarui praktik keamanan kami."
            ]
        },
        {
            icon: GlobeAltIcon,
            title: "5. Pembagian Informasi dengan Pihak Ketiga",
            content: [
                "Penyedia layanan pembayaran untuk memproses transaksi Anda dengan aman.",
                "Mitra bisnis yang membantu kami menyediakan layanan (dengan perjanjian kerahasiaan).",
                "Otoritas hukum jika diwajibkan oleh hukum atau untuk melindungi hak kami.",
                "Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran.",
                "Transfer data ke luar negeri akan dilakukan dengan perlindungan yang memadai."
            ]
        },
        {
            icon: LockClosedIcon,
            title: "6. Hak Anda",
            content: [
                "Hak akses: Anda dapat meminta salinan data pribadi yang kami miliki tentang Anda.",
                "Hak koreksi: Anda dapat meminta perbaikan data yang tidak akurat atau tidak lengkap.",
                "Hak penghapusan: Anda dapat meminta penghapusan data pribadi Anda dalam kondisi tertentu.",
                "Hak pembatasan: Anda dapat meminta pembatasan pemrosesan data Anda.",
                "Hak portabilitas: Anda dapat meminta transfer data Anda ke penyedia layanan lain.",
                "Hak keberatan: Anda dapat menolak pemrosesan data untuk tujuan pemasaran langsung."
            ]
        },
        {
            icon: TrashIcon,
            title: "7. Cookies dan Teknologi Pelacakan",
            content: [
                "Kami menggunakan cookies untuk meningkatkan pengalaman browsing Anda.",
                "Cookies esensial diperlukan untuk fungsi dasar website.",
                "Cookies analitik membantu kami memahami bagaimana pengunjung menggunakan website.",
                "Cookies pemasaran digunakan untuk menampilkan iklan yang relevan.",
                "Anda dapat mengelola preferensi cookies melalui pengaturan browser Anda."
            ]
        },
        {
            icon: PhoneIcon,
            title: "8. Kontak dan Pengaduan",
            content: [
                "Untuk pertanyaan tentang kebijakan privasi, hubungi kami di hello@kaspaspace.com.",
                "Permintaan terkait hak data pribadi akan diproses dalam waktu 30 hari kerja.",
                "Jika Anda tidak puas dengan respons kami, Anda dapat mengajukan keluhan ke otoritas perlindungan data.",
                "Kami berkomitmen untuk menyelesaikan setiap keluhan privasi dengan adil dan transparan."
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
                            <ShieldCheckIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Kebijakan Privasi
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Kami menghargai privasi Anda. Pelajari bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.
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
                            Kaspa Space ("kami", "kita", atau "milik kami") mengoperasikan website dan layanan coworking space.
                            Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan,
                            dan melindungi informasi pribadi Anda ketika Anda menggunakan layanan kami.
                            Kami berkomitmen untuk mematuhi peraturan perlindungan data yang berlaku di Indonesia.
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

                    {/* Newsletter Info Box */}
                    <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Tentang Newsletter</h3>
                                <p className="text-gray-700">
                                    Jika Anda berlangganan newsletter kami, kami akan mengirimkan informasi tentang promo,
                                    penawaran menarik, dan update terbaru. Anda dapat berhenti berlangganan kapan saja
                                    dengan mengklik tautan "unsubscribe" di bagian bawah email kami atau menghubungi kami langsung.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Agreement Box */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Persetujuan Anda</h3>
                                <p className="text-gray-700">
                                    Dengan menggunakan layanan Kaspa Space, Anda menyetujui pengumpulan dan penggunaan
                                    informasi sesuai dengan Kebijakan Privasi ini. Jika Anda tidak menyetujui kebijakan ini,
                                    mohon untuk tidak menggunakan layanan kami. Kami dapat memperbarui kebijakan ini dari
                                    waktu ke waktu, dan perubahan akan berlaku segera setelah dipublikasikan di halaman ini.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, silakan hubungi kami di{' '}
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

export default Privacy;
