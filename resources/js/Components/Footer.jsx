import React, { useState } from 'react';
import { Instagram, Youtube, Facebook, Phone, Mail } from 'lucide-react';

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e) => {
        e.preventDefault();
        // Handle subscription logic here
        console.log('Subscribe email:', email);
        setEmail('');
    };

    return (
        <footer className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Media Sosial */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Media Sosial</h3>
                        <div className="flex gap-4">
                            <a 
                                href="https://instagram.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a 
                                href="https://threads.net" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.186 3.995c-2.24 0-3.879.853-4.824 2.255l1.434.956c.718-1.065 1.83-1.616 3.39-1.616 2.61 0 4.225 1.718 4.225 4.485v.29c-1.119-.502-2.44-.78-3.936-.78-3.195 0-5.45 1.529-5.45 4.395 0 2.83 2.183 4.576 5.064 4.576 2.183 0 3.987-.96 4.83-2.542.313.853.89 1.528 1.638 1.923l.747-1.41c-.782-.43-1.23-1.244-1.23-2.434V9.915c0-3.81-2.29-5.92-5.888-5.92zm-3.302 10.395c0-1.492 1.21-2.613 3.588-2.613 1.334 0 2.613.257 3.642.73v1.119c0 2.363-1.648 4.062-4.062 4.062-1.743 0-3.168-.96-3.168-2.298z"/>
                                </svg>
                            </a>
                            <a 
                                href="https://facebook.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a 
                                href="https://youtube.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
                            >
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Anggota Asosiasi */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Anggota Asosiasi</h3>
                        <div className="bg-white/10 rounded-lg p-4 inline-block">
                            <div className="text-center">
                                <div className="text-lg font-semibold mb-1">Coworking</div>
                                <div className="text-sm">INDONESIA</div>
                            </div>
                        </div>
                    </div>

                    {/* Temukan Kami */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Temukan Kami</h3>
                        <div className="space-y-3">
                            <a 
                                href="tel:+62895363501632" 
                                className="flex items-center gap-2 hover:text-blue-100 transition-colors"
                            >
                                <Phone className="w-4 h-4" />
                                <span>+62 8953-6350-1632</span>
                            </a>
                            <a 
                                href="mailto:cs@kaspapspace.com" 
                                className="flex items-center gap-2 hover:text-blue-100 transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                <span>cs@kaspapspace.com</span>
                            </a>
                            <a 
                                href="/media" 
                                className="inline-block hover:text-blue-100 transition-colors underline"
                            >
                                Galeri Kaspa Space
                            </a>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">#KenalLebihDekat</h3>
                        <p className="text-sm mb-4 text-blue-100">Dapatkan info terupdate</p>
                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Masukkan alamat email Anda"
                                className="w-full px-4 py-2.5 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-200 border border-white/30"
                            >
                                Berlangganan
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/20 pt-6 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-blue-100">
                            © 2024-2025 Kaspa Space. All Rights Reserved
                        </p>
                        <div className="flex gap-6 text-sm">
                            <a href="/privacy" className="hover:text-blue-100 transition-colors">
                                Kebijakan Privasi
                            </a>
                            <a href="/terms" className="hover:text-blue-100 transition-colors">
                                Syarat dan Ketentuan
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/62895363501632"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 z-50"
                aria-label="WhatsApp"
            >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
            </a>
        </footer>
    );
};

export default Footer;
