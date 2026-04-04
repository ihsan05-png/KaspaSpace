import { Link, usePage } from '@inertiajs/react';
import loginBg from '../../images/login.jpg';
import kaspaLogo from '../../images/logo.png';

export default function GuestLayout({ children }) {
    const { url } = usePage();
    const isRegister = url?.startsWith('/register');

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background blur ambient */}
            <div
                className="absolute inset-0 bg-cover bg-center scale-110"
                style={{ backgroundImage: `url(${loginBg})`, filter: 'blur(20px) brightness(0.35)' }}
            />

            {/* Tombol Kembali */}
            <Link
                href="/"
                className="absolute top-5 left-5 z-20 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali
            </Link>

            {isRegister ? (
                /* ===== Register: foto kanan, form kiri, card lebih lebar ===== */
                <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex h-[520px]">
                    {/* Form kiri */}
                    <div className="flex-1 flex flex-col justify-center px-9 py-7 bg-gray-50">
                        <Link href="/" className="flex justify-center mb-4">
                            <img src={kaspaLogo} alt="Kaspa Space" className="h-10 object-contain" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 mb-0.5">Buat Akun</h1>
                        <p className="text-sm text-gray-500 mb-3">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="text-blue-600 hover:underline font-medium">Masuk di sini</Link>
                        </p>
                        {children}
                        <p className="text-xs text-gray-400 mt-3">© {new Date().getFullYear()} Kaspa Space. Semua hak dilindungi.</p>
                    </div>
                    {/* Foto kanan */}
                    <div
                        className="hidden md:block w-[38%] flex-shrink-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${loginBg})` }}
                    />
                </div>
            ) : (
                /* ===== Login: card split foto + form ===== */
                <div className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex h-[520px]">
                    {/* Foto kiri */}
                    <div
                        className="hidden md:block w-[42%] flex-shrink-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${loginBg})` }}
                    />
                    {/* Form kanan */}
                    <div className="flex-1 flex flex-col justify-center px-10 py-10 bg-gray-50">
                        <Link href="/" className="flex justify-center mb-8">
                            <img src={kaspaLogo} alt="Kaspa Space" className="h-12 object-contain" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Masuk</h1>
                        <p className="text-sm text-gray-500 mb-7">
                            Belum punya akun?{' '}
                            <Link href="/register" className="text-blue-600 hover:underline font-medium">Daftar</Link>
                        </p>
                        {children}
                        <p className="text-xs text-gray-400 mt-8">© {new Date().getFullYear()} Kaspa Space. Semua hak dilindungi.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
