import { Link, usePage } from '@inertiajs/react';
import authBg from '../../images/workspace-hero.jpg';
import kaspaLogo from '../../images/logo.png';

export default function GuestLayout({ children }) {
    const { url } = usePage();
    const isRegister = url?.startsWith('/register');

    return (
        <div className="min-h-screen flex items-center justify-center p-4 lg:p-8"
            style={{ backgroundColor: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>

            {/* Tombol Kembali */}
            <Link
                href="/"
                className="fixed top-5 left-5 z-30 flex items-center gap-1.5 text-sm font-medium transition px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.92)', color: '#414754', border: '1px solid rgba(193,198,214,0.4)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali
            </Link>

            {/* Card */}
            <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row overflow-hidden"
                style={{
                    background: '#fff',
                    borderRadius: '1.5rem',
                    boxShadow: '0 8px 40px rgba(25,28,29,0.10)',
                    border: '1px solid rgba(193,198,214,0.2)',
                }}>

                {/* Panel Kiri — Foto */}
                <div className="hidden lg:block lg:w-1/2 relative" style={{ minHeight: '680px' }}>
                    <img
                        src={authBg}
                        alt="Kaspa Space"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Overlay ringan */}
                    <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to bottom, rgba(0,91,191,0.18) 0%, rgba(0,0,0,0.10) 50%, rgba(0,0,0,0.45) 100%)' }} />

                    {/* Logo di atas */}
                    <div className="absolute top-8 left-8 z-10">
                        <img src={kaspaLogo} alt="Kaspa Space" className="h-9 object-contain"
                            style={{ filter: 'brightness(0) invert(1)', opacity: 0.92 }} />
                    </div>

                    {/* Teks bawah */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 p-10 pb-12">
                        <h2 className="font-extrabold leading-tight mb-3 text-white"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2.1rem' }}>
                            {isRegister ? 'Ruang Kerja\nTerbaik untuk Anda' : 'Selamat\nDatang Kembali'}
                        </h2>
                        <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.975rem', maxWidth: '18rem' }}>
                            {isRegister
                                ? 'Bergabung dengan Kaspa Space dan akses ruang kerja modern untuk profesional.'
                                : 'Masuk dan nikmati layanan coworking space serta virtual office terbaik kami.'}
                        </p>
                    </div>
                </div>

                {/* Panel Kanan — Form */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white px-8 sm:px-12 lg:px-14 py-12">
                    {/* Logo (mobile & desktop) */}
                    <Link href="/" className="flex justify-center lg:justify-start mb-8">
                        <img src={kaspaLogo} alt="Kaspa Space" className="h-14 object-contain" />
                    </Link>

                    {/* Heading */}
                    <h1 className="font-bold tracking-tight mb-2"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', color: '#191c1d' }}>
                        {isRegister ? 'Buat Akun' : 'Masuk'}
                    </h1>
                    <p className="mb-8" style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                        {isRegister ? (
                            <>Sudah punya akun?{' '}
                                <Link href="/login" className="font-semibold hover:underline" style={{ color: '#005bbf' }}>Masuk di sini</Link>.
                            </>
                        ) : (
                            <>Belum punya akun?{' '}
                                <Link href="/register" className="font-semibold hover:underline" style={{ color: '#005bbf' }}>Daftar</Link>.
                            </>
                        )}
                    </p>

                    {/* Form (children) */}
                    {children}

                    <p className="text-xs mt-8" style={{ color: '#9aa0b4' }}>
                        © {new Date().getFullYear()} Kaspa Space. Semua hak dilindungi.
                    </p>
                </div>
            </div>
        </div>
    );
}
