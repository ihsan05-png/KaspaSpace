import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, ChevronDown } from 'lucide-react';
import { Head } from '@inertiajs/react';
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import ProductModal from "@/Components/ProductModal";
import { IMAGE_PLACEHOLDER } from "@/utils/placeholders";
import heroBg from '../../images/fnb-hero.jpg';

const getImg = (src) => {
    if (!src) return IMAGE_PLACEHOLDER;
    if (src.startsWith('http')) return src;
    return `/storage/${src}`;
};

const FAQ_ITEMS = [
    { q: 'Bisa dipesan di luar kantor?', a: 'Saat ini, layanan Kuliner Lokal kami eksklusif untuk member Kaspa Space di dalam area workspace untuk menjaga kualitas dan kecepatan pengiriman.' },
    { q: 'Bagaimana prosedur pemesanan?', a: 'Anda dapat memesan langsung melalui halaman ini. Pilih menu, pilih paket, dan tambahkan ke keranjang.' },
    { q: 'Cara konfirmasi pesanan?', a: 'Konfirmasi pesanan akan dikirimkan melalui notifikasi dan email setelah pembayaran berhasil dilakukan.' },
    { q: 'Apakah ada biaya pengiriman?', a: 'Tidak ada biaya pengiriman untuk pesanan yang diantar ke meja kerja Anda di dalam area Kaspa Space.' },
];

const FaqItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-2xl overflow-hidden transition-colors"
            style={{ background: '#fff', border: `1px solid ${open ? 'rgba(0,91,191,0.25)' : 'rgba(193,198,214,0.25)'}`, boxShadow: '0 2px 8px rgba(25,28,29,0.04)' }}>
            <button onClick={() => setOpen(v => !v)}
                className="w-full flex justify-between items-center px-6 py-5 text-left"
                style={{ outline: 'none' }}>
                <span className="font-semibold text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>{q}</span>
                <ChevronDown className="w-5 h-5 flex-shrink-0 transition-transform duration-300" style={{ color: '#414754', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
            {open && (
                <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#414754' }}>{a}</div>
            )}
        </div>
    );
};

const FoodBeverage = ({ products = [] }) => {
    const [searchTerm, setSearchTerm]           = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen]         = useState(false);

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            searchTerm === '' || p.title?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [products, searchTerm]);

    const handleOrderClick = (product) => { setSelectedProduct(product); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedProduct(null); };

    return (
        <div className="min-h-screen antialiased" style={{ backgroundColor: '#f8f9fa', color: '#191c1d', fontFamily: 'Inter, sans-serif' }}>
            <Head title="Kuliner Lokal" />
            <Navbar />

            {/* ── HERO ── */}
            <section className="relative min-h-[780px] flex items-start overflow-hidden" style={{ background: '#d9dadb' }}>
                {/* Right-side food image with left-fade gradient */}
                <div className="absolute inset-0 z-0">
                    <img src={heroBg} alt="Kuliner Lokal"
                        className="w-full h-full object-cover object-right scale-105"
                        style={{ transform: 'translateX(8%) scale(1.05)' }} />
                    <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to right, #d9dadb 0%, #d9dadb 22%, rgba(217,218,219,0.75) 36%, rgba(217,218,219,0.0) 52%)' }} />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-28 pb-16">
                    <div className="max-w-2xl">
                        <h1 className="font-extrabold tracking-tight leading-tight mb-6"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(3rem, 6vw, 4.5rem)', color: '#191c1d' }}>
                            Kuliner Lokal<br />
                            <span style={{ color: '#005bbf' }}>Elevated.</span>
                        </h1>
                        <p className="text-lg leading-relaxed mb-10" style={{ color: '#414754', maxWidth: '28rem' }}>
                            Nikmati cita rasa autentik Indonesia tanpa perlu meninggalkan meja kerja Anda. Menu lokal terkurasi, gratis pengiriman dan alat makan.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <a href="#menu"
                                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-colors"
                                style={{ background: '#005bbf', color: '#fff', boxShadow: '0 8px 24px rgba(0,91,191,0.25)' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#1a73e8'}
                                onMouseLeave={e => e.currentTarget.style.background = '#005bbf'}>
                                Pesan Sekarang <ArrowRight className="w-5 h-5" />
                            </a>
                            <a href="#menu"
                                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-colors"
                                style={{ color: '#005bbf', border: '1.5px solid rgba(0,91,191,0.25)', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.80)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.55)'}>
                                Lihat Menu
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── BENTO MENU GRID ── */}
            <section id="menu" className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="rounded-3xl p-8 lg:p-12" style={{ background: '#f3f4f5' }}>
                    {/* Section header + search */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h2 className="font-bold tracking-tight mb-2"
                                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: '#191c1d' }}>
                                Menu Pilihan
                            </h2>
                            <p style={{ color: '#414754' }}>
                                <span className="font-semibold" style={{ color: '#005bbf' }}>{filteredProducts.length} menu</span> tersedia hari ini
                            </p>
                        </div>
                        {/* Search */}
                        <div className="flex items-center rounded-full px-4 py-2.5 gap-2"
                            style={{ background: '#fff', border: '1px solid rgba(193,198,214,0.4)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', minWidth: '260px' }}>
                            <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#005bbf' }} />
                            <input type="text" placeholder="Cari menu..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-gray-400"
                                style={{ color: '#191c1d' }} />
                        </div>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ gridAutoRows: '380px' }}>
                            {filteredProducts.map((product, idx) => {
                                const img = product.images?.[0] ? getImg(product.images[0]) : null;
                                const minPrice = product.min_price || product.base_price
                                    || (product.variants?.length > 0 ? Math.min(...product.variants.map(v => v.price)) : 0);
                                const isLarge = idx === 0;

                                /* Solid-colour fallback cards (no image) */
                                const solidBgs = ['#008394', '#759efd', '#005bbf', '#006876', '#2b5bb5'];
                                const textColors = ['#fff', '#00337c', '#fff', '#fff', '#fff'];
                                const solidIdx = idx % solidBgs.length;

                                if (!img) {
                                    return (
                                        <div key={product.id}
                                            className={`relative rounded-3xl overflow-hidden flex flex-col justify-between p-8 cursor-pointer group transition-shadow hover:shadow-lg${isLarge ? ' md:col-span-2' : ''}`}
                                            style={{ background: solidBgs[solidIdx] }}
                                            onClick={() => handleOrderClick(product)}>
                                            <div>
                                                <h3 className="font-bold text-2xl mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: textColors[solidIdx] }}>
                                                    {product.title}
                                                </h3>
                                                {product.subtitle && <p className="text-sm opacity-80" style={{ color: textColors[solidIdx] }}>{product.subtitle}</p>}
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="font-extrabold text-2xl" style={{ color: textColors[solidIdx] }}>
                                                    {minPrice > 0 ? `Rp${Number(minPrice).toLocaleString('id-ID')}` : 'Lihat Harga'}
                                                </span>
                                                <button className="flex items-center gap-1 text-sm font-bold px-4 py-2 rounded-full transition-opacity hover:opacity-80"
                                                    style={{ background: 'rgba(255,255,255,0.2)', color: textColors[solidIdx] }}>
                                                    Pesan <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={product.id}
                                        className={`relative rounded-3xl overflow-hidden group cursor-pointer transition-shadow hover:shadow-lg${isLarge ? ' md:col-span-2' : ''}`}
                                        onClick={() => handleOrderClick(product)}>
                                        <img src={img} alt={product.title}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            onError={(e) => { e.target.src = IMAGE_PLACEHOLDER; }} />
                                        <div className="absolute inset-0"
                                            style={{ background: 'linear-gradient(to top, rgba(10,12,13,0.90) 0%, rgba(10,12,13,0.35) 50%, rgba(10,12,13,0.05) 100%)' }} />

                                        {/* Badges */}
                                        <div className="absolute top-5 left-5 flex gap-2 z-10">
                                            {product.promo_label && (
                                                <span className="text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide"
                                                    style={{ background: '#ff6b00', color: '#fff' }}>
                                                    {product.promo_label}
                                                </span>
                                            )}
                                            {product.is_featured && !product.promo_label && (
                                                <span className="text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide"
                                                    style={{ background: '#ff6b00', color: '#fff' }}>
                                                    Best Seller
                                                </span>
                                            )}
                                        </div>

                                        <div className="absolute bottom-7 left-7 right-7 z-10">
                                            <h3 className="font-extrabold text-white mb-1"
                                                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: isLarge ? '1.75rem' : '1.375rem' }}>
                                                {product.title}
                                            </h3>
                                            <div className="flex justify-between items-end mt-2">
                                                {product.subtitle && (
                                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{product.subtitle}</p>
                                                )}
                                                <span className="font-extrabold text-white text-xl ml-auto">
                                                    {minPrice > 0 ? `Rp${Number(minPrice).toLocaleString('id-ID')}` : 'Lihat Harga'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                                style={{ background: 'rgba(0,91,191,0.08)' }}>
                                <Search className="w-9 h-9" style={{ color: '#005bbf' }} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>
                                Tidak ada menu yang ditemukan
                            </h3>
                            <p className="mb-6" style={{ color: '#414754' }}>
                                {searchTerm ? 'Coba gunakan kata kunci yang berbeda' : 'Belum ada menu yang tersedia saat ini'}
                            </p>
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')}
                                    className="px-8 py-3 rounded-xl font-semibold text-white"
                                    style={{ background: '#005bbf' }}>
                                    Tampilkan Semua
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="py-20 px-6 lg:px-8 max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-bold tracking-tight mb-3"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2rem)', color: '#191c1d' }}>
                        Pertanyaan Umum
                    </h2>
                    <p style={{ color: '#414754' }}>Semua yang perlu Anda ketahui tentang pemesanan Kuliner Lokal.</p>
                </div>
                <div className="space-y-3">
                    {FAQ_ITEMS.map(item => <FaqItem key={item.q} {...item} />)}
                </div>
            </section>

            <ProductModal product={selectedProduct} isOpen={isModalOpen} onClose={handleCloseModal} />
            <Footer />
        </div>
    );
};

export default FoodBeverage;
