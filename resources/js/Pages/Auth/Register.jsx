import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        terms: false,
        privacy: false,
        newsletter: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showModal, setShowModal] = useState(null); // 'terms' | 'privacy' | null

    const termsContent = [
        { title: "1. Penerimaan Syarat", items: ["Dengan mengakses dan menggunakan layanan kami, Anda menyetujui untuk terikat oleh Syarat & Ketentuan ini. Jika Anda tidak setuju dengan syarat ini, mohon untuk tidak menggunakan layanan kami."] },
        { title: "2. Penggunaan Layanan", items: ["Anda setuju untuk menggunakan layanan kami hanya untuk tujuan yang sah dan sesuai dengan hukum yang berlaku. Anda tidak diperkenankan untuk:", "Menggunakan layanan untuk tujuan ilegal atau tidak sah", "Melanggar hak kekayaan intelektual pihak lain", "Mengganggu kenyamanan pengguna lain di area coworking space"] },
        { title: "3. Reservasi dan Pembayaran", items: ["Reservasi berlaku sesuai dengan durasi yang dipilih saat pemesanan.", "Semua pembayaran harus dilakukan sesuai dengan metode pembayaran yang tersedia.", "Pembatalan reservasi yang dilakukan kurang dari 24 jam sebelum waktu penggunaan tidak akan mendapat pengembalian dana.", "Pengembalian dana untuk pembatalan yang memenuhi syarat akan diproses dalam waktu 3-7 hari kerja."] },
        { title: "4. Kewajiban Pengguna", items: ["Pengguna wajib menjaga kebersihan dan kerapihan area kerja yang digunakan.", "Pengguna bertanggung jawab atas keamanan barang-barang pribadi mereka.", "Pengguna wajib mematuhi peraturan yang berlaku di area Kaspa Space.", "Keterlambatan lebih dari 30 menit tanpa konfirmasi dapat mengakibatkan pembatalan reservasi."] },
        { title: "5. Batasan Tanggung Jawab", items: ["Kaspa Space tidak bertanggung jawab atas kehilangan atau kerusakan barang pribadi pengguna.", "Kaspa Space tidak bertanggung jawab atas gangguan layanan yang disebabkan oleh faktor di luar kendali kami.", "Kaspa Space berhak menolak atau menghentikan layanan kepada pengguna yang melanggar ketentuan."] },
        { title: "6. Kontak", items: ["Segala pertanyaan atau keluhan dapat disampaikan melalui email hello@kaspaspace.com.", "Penyelesaian sengketa akan dilakukan secara musyawarah mufakat."] },
    ];

    const privacyContent = [
        { title: "1. Pendahuluan", items: ["Kebijakan Privasi ini menjelaskan bagaimana Kaspa Space mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.", "Kami berkomitmen untuk melindungi privasi Anda dan memastikan bahwa data pribadi Anda diproses secara aman."] },
        { title: "2. Informasi yang Kami Kumpulkan", items: ["Informasi identitas: nama lengkap, alamat email, nomor telepon.", "Informasi transaksi: riwayat pemesanan, metode pembayaran, dan preferensi layanan.", "Informasi teknis: alamat IP, jenis browser, perangkat yang digunakan."] },
        { title: "3. Penggunaan Informasi", items: ["Memproses dan mengelola reservasi serta transaksi pembayaran Anda.", "Mengirimkan konfirmasi, pengingat, dan informasi penting terkait layanan.", "Meningkatkan kualitas layanan dan pengalaman pengguna.", "Mengirimkan informasi promosi dan newsletter (dengan persetujuan Anda)."] },
        { title: "4. Keamanan Data", items: ["Data Anda disimpan di server yang aman dengan enkripsi standar industri.", "Akses ke data pribadi dibatasi hanya untuk karyawan yang membutuhkan.", "Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga."] },
        { title: "5. Hak Anda", items: ["Hak akses: Anda dapat meminta salinan data pribadi yang kami miliki.", "Hak koreksi: Anda dapat meminta perbaikan data yang tidak akurat.", "Hak penghapusan: Anda dapat meminta penghapusan data pribadi Anda.", "Hak keberatan: Anda dapat menolak pemrosesan data untuk tujuan pemasaran."] },
        { title: "6. Kontak", items: ["Untuk pertanyaan tentang kebijakan privasi, hubungi kami di hello@kaspaspace.com.", "Permintaan terkait hak data pribadi akan diproses dalam waktu 30 hari kerja."] },
    ];

    const allAgreementsChecked = data.terms && data.privacy && data.newsletter;

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                {/* Name & Email in row on larger screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="name" value="Nama" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="phone" value="No. Telepon" />
                        <TextInput
                            id="phone"
                            type="tel"
                            name="phone"
                            value={data.phone}
                            className="mt-1 block w-full"
                            autoComplete="tel"
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="08xxxxxxxxxx"
                            required
                        />
                        <InputError message={errors.phone} className="mt-1" />
                    </div>
                </div>

                <div className="mt-3">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* Password fields in row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    <div>
                        <InputLabel htmlFor="password" value="Password" />
                        <div className="relative mt-1">
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className="block w-full pr-10"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" />
                        <div className="relative mt-1">
                            <TextInput
                                id="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="block w-full pr-10"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>
                </div>

                {/* Compact Agreement Section */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-2">Persetujuan</p>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.terms}
                                onChange={(e) => setData('terms', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                Setuju{' '}
                                <button type="button" className="text-blue-600 hover:underline" onClick={(e) => { e.stopPropagation(); setShowModal('terms'); }}>
                                    Syarat & Ketentuan
                                </button>
                                <span className="text-red-500 ml-1">*</span>
                            </span>
                        </label>
                        {errors.terms && <p className="text-xs text-red-500 ml-6">{errors.terms}</p>}

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.privacy}
                                onChange={(e) => setData('privacy', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                Setuju{' '}
                                <button type="button" className="text-blue-600 hover:underline" onClick={(e) => { e.stopPropagation(); setShowModal('privacy'); }}>
                                    Kebijakan Privasi
                                </button>
                                <span className="text-red-500 ml-1">*</span>
                            </span>
                        </label>
                        {errors.privacy && <p className="text-xs text-red-500 ml-6">{errors.privacy}</p>}

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.newsletter}
                                onChange={(e) => setData('newsletter', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                Berlangganan newsletter & promo
                                <span className="text-red-500 ml-1">*</span>
                            </span>
                        </label>
                        {errors.newsletter && <p className="text-xs text-red-500 ml-6">{errors.newsletter}</p>}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Sudah punya akun?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing || !allAgreementsChecked}>
                        Register
                    </PrimaryButton>
                </div>
            </form>

            {/* Agreement Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(null)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {showModal === 'terms' ? 'Syarat & Ketentuan' : 'Kebijakan Privasi'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowModal(null)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {(showModal === 'terms' ? termsContent : privacyContent).map((section, idx) => (
                                <div key={idx}>
                                    <h3 className="font-bold text-gray-900 mb-2">{section.title}</h3>
                                    <ul className="space-y-2">
                                        {section.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setShowModal(null)}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </GuestLayout>
    );
}
