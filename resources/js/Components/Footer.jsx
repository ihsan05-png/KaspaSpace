import React, { useState } from 'react';
import { Instagram, Youtube, Facebook, Phone, Mail } from 'lucide-react';
import axios from 'axios';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribeStatus, setSubscribeStatus] = useState(null); // 'success' | 'error' | null
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setIsSubscribing(true);
        setSubscribeStatus(null);
        try {
            await axios.post('/newsletter/subscribe', { email });
            setSubscribeStatus('success');
            setEmail('');
        } catch {
            setSubscribeStatus('error');
        } finally {
            setIsSubscribing(false);
        }
    };

    return (
        <footer style={{
            background: 'linear-gradient(135deg, #1a3b8c 0%, #1e6cbe 60%, #29b9f1 100%)',
            color: '#fff',
            fontFamily: "'Manrope', 'Plus Jakarta Sans', Inter, sans-serif",
        }}>
            <div className="max-w-7xl mx-auto px-4 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

                    {/* Media Sosial */}
                    <div>
                        <h3 className="text-lg font-extrabold mb-5 tracking-tight">Media Sosial</h3>
                        <div className="flex gap-3">
                            {[
                                {
                                    href: 'https://instagram.com', label: 'Instagram',
                                    icon: <Instagram className="w-5 h-5" />,
                                },
                                {
                                    href: 'https://threads.net', label: 'Threads',
                                    icon: (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12.186 3.995c-2.24 0-3.879.853-4.824 2.255l1.434.956c.718-1.065 1.83-1.616 3.39-1.616 2.61 0 4.225 1.718 4.225 4.485v.29c-1.119-.502-2.44-.78-3.936-.78-3.195 0-5.45 1.529-5.45 4.395 0 2.83 2.183 4.576 5.064 4.576 2.183 0 3.987-.96 4.83-2.542.313.853.89 1.528 1.638 1.923l.747-1.41c-.782-.43-1.23-1.244-1.23-2.434V9.915c0-3.81-2.29-5.92-5.888-5.92zm-3.302 10.395c0-1.492 1.21-2.613 3.588-2.613 1.334 0 2.613.257 3.642.73v1.119c0 2.363-1.648 4.062-4.062 4.062-1.743 0-3.168-.96-3.168-2.298z"/>
                                        </svg>
                                    ),
                                },
                                {
                                    href: 'https://facebook.com', label: 'Facebook',
                                    icon: <Facebook className="w-5 h-5" />,
                                },
                                {
                                    href: 'https://youtube.com', label: 'YouTube',
                                    icon: <Youtube className="w-5 h-5" />,
                                },
                            ].map(({ href, label, icon }) => (
                                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                                    aria-label={label}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                                    style={{ background: 'rgba(255,255,255,0.15)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                                    {icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Anggota Asosiasi */}
                    <div>
                        <h3 className="text-lg font-extrabold mb-5 tracking-tight">Anggota Asosiasi</h3>
                        <div className="inline-block rounded-xl p-4"
                            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}>
                            <div className="text-center">
                                <div className="text-base font-bold mb-0.5">Coworking</div>
                                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>INDONESIA</div>
                            </div>
                        </div>
                    </div>

                    {/* Temukan Kami */}
                    <div>
                        <h3 className="text-lg font-extrabold mb-5 tracking-tight">Temukan Kami</h3>
                        <div className="space-y-3">
                            {[
                                { href: 'tel:+62895363501632', icon: <Phone className="w-4 h-4 flex-shrink-0" />, text: '+62 8953-6350-1632' },
                                { href: 'mailto:cs@kaspapspace.com', icon: <Mail className="w-4 h-4 flex-shrink-0" />, text: 'cs@kaspapspace.com' },
                            ].map(({ href, icon, text }) => (
                                <a key={href} href={href}
                                    className="flex items-center gap-2 text-sm transition-colors"
                                    style={{ color: 'rgba(255,255,255,0.85)' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}>
                                    {icon}{text}
                                </a>
                            ))}
                            <a href="/media"
                                className="inline-block text-sm underline underline-offset-2 transition-colors"
                                style={{ color: 'rgba(255,255,255,0.85)' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}>
                                Galeri Kaspa Space
                            </a>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-extrabold mb-2 tracking-tight">#KenalLebihDekat</h3>
                        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
                            Dapatkan info terupdate
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Masukkan alamat email Anda"
                                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                                style={{
                                    color: '#191c1e',
                                    background: '#fff',
                                    fontFamily: "'Manrope', 'Plus Jakarta Sans', Inter, sans-serif",
                                    border: '1.5px solid rgba(255,255,255,0.4)',
                                }}
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSubscribing}
                                className="w-full px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all duration-200 disabled:opacity-60"
                                style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.4)' }}
                                onMouseEnter={e => !isSubscribing && (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}>
                                {isSubscribing ? 'Memproses...' : 'Berlangganan'}
                            </button>
                        </form>
                        {subscribeStatus === 'success' && (
                            <p className="text-sm mt-2" style={{ color: 'rgba(180,255,200,0.95)' }}>
                                Terima kasih! Email Anda sudah terdaftar.
                            </p>
                        )}
                        {subscribeStatus === 'error' && (
                            <p className="text-sm mt-2" style={{ color: 'rgba(255,180,180,0.95)' }}>
                                Gagal berlangganan. Coba lagi nanti.
                            </p>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            © 2024-2025 Kaspa Space. All Rights Reserved
                        </p>
                        <div className="flex gap-6 text-sm">
                            {[
                                { href: '/privacy', label: 'Kebijakan Privasi' },
                                { href: '/terms', label: 'Syarat dan Ketentuan' },
                            ].map(({ href, label }) => (
                                <a key={label} href={href}
                                    className="transition-colors"
                                    style={{ color: 'rgba(255,255,255,0.7)' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                                    {label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/62895363501632"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 z-50"
                style={{ background: '#25d366' }}
                aria-label="WhatsApp"
                onMouseEnter={e => e.currentTarget.style.background = '#1ebe5d'}
                onMouseLeave={e => e.currentTarget.style.background = '#25d366'}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
            </a>
        </footer>
    );
};

export default Footer;
