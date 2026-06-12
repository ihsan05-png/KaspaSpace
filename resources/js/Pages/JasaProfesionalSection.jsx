import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Shield, Zap, Award } from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import ProductModal from "@/Components/ProductModal";
import CartDrawer from "@/Components/CartDrawer";
import { IMAGE_PLACEHOLDER } from "@/utils/placeholders";
import heroBg from '../../images/jasa-hero.jpg';

const getImg = (src) => {
    if (!src) return IMAGE_PLACEHOLDER;
    if (src.startsWith('http')) return src;
    return `/storage/${src}`;
};

const JasaProfesionalSection = ({ products = [], currentCategory }) => {
    const [searchTerm, setSearchTerm]           = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen]         = useState(false);
    const [isCartOpen, setIsCartOpen]           = useState(false);

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            searchTerm === '' || p.title?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [products, searchTerm]);

    const handleOrderClick = (product) => { setSelectedProduct(product); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedProduct(null); };
    const handleAddToCart  = () => setIsCartOpen(true);

    return (
        <div className="min-h-screen antialiased" style={{ backgroundColor: '#f8f9fa', color: '#191c1d', fontFamily: 'Inter, sans-serif' }}>
            <Head title="Jasa Profesional" />
            <Navbar />

            {/* ── HERO ── */}
            <section className="px-6 lg:px-8 pt-20 pb-28 max-w-7xl mx-auto">
                {/* Soft background blob */}
                <div className="absolute inset-x-0 top-0 -z-10 h-[680px] pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, #f3f4f5 0%, #f8f9fa 50%, #edf0fb 100%)' }} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                    {/* Left Text */}
                    <div className="max-w-2xl">
                        <h1 className="font-extrabold tracking-tight leading-tight mb-6"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2.6rem, 5.5vw, 4rem)', color: '#191c1d' }}>
                            Tingkatkan Bisnis Anda dengan{' '}
                            <span style={{ background: 'linear-gradient(135deg, #005bbf 0%, #1a73e8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Jasa Profesional
                            </span>
                        </h1>
                        <p className="text-lg leading-relaxed mb-10" style={{ color: '#414754', maxWidth: '30rem' }}>
                            Dukungan ahli untuk kebutuhan bisnis Anda — dari legalitas, perpajakan, sertifikasi ISO, hingga cetak dokumen.
                        </p>

                        {/* Search Pill */}
                        <div className="flex items-center rounded-full p-1.5 max-w-md"
                            style={{ background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(193,198,214,0.3)' }}>
                            <Search className="w-5 h-5 ml-4 mr-2 flex-shrink-0" style={{ color: '#005bbf' }} />
                            <input
                                type="text"
                                placeholder="Cari layanan (mis. Legalitas, Pajak)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-base font-medium placeholder:text-gray-400"
                                style={{ color: '#191c1d' }}
                            />
                            <button
                                className="px-5 py-2.5 rounded-full text-sm font-bold transition-colors"
                                style={{ background: '#005bbf', color: '#fff' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#1a73e8'}
                                onMouseLeave={e => e.currentTarget.style.background = '#005bbf'}>
                                Cari
                            </button>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="hidden lg:block relative rounded-3xl overflow-hidden"
                        style={{ height: '480px', boxShadow: '0 20px 48px rgba(25,28,29,0.10)', border: '1px solid rgba(193,198,214,0.2)' }}>
                        <img src={heroBg} alt="Jasa Profesional" className="w-full h-full object-cover" />
                        <div className="absolute inset-0"
                            style={{ background: 'linear-gradient(to top, rgba(10,12,13,0.35) 0%, transparent 60%)' }} />
                    </div>
                </div>
            </section>

            {/* ── SERVICES GRID ── */}
            <section className="px-6 lg:px-8 py-20 max-w-7xl mx-auto">
                <div className="rounded-3xl p-8 lg:p-12" style={{ background: '#f3f4f5' }}>
                    {/* Header */}
                    <div className="mb-12">
                        <h2 className="font-bold tracking-tight mb-3"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: '#191c1d' }}>
                            Layanan Tersedia
                        </h2>
                        <p style={{ color: '#414754', fontSize: '1.05rem' }}>
                            {filteredProducts.length > 0
                                ? <><span className="font-semibold" style={{ color: '#005bbf' }}>{filteredProducts.length} layanan</span> siap membantu bisnis Anda</>
                                : 'Tidak ada layanan yang ditemukan'}
                        </p>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {filteredProducts.map((product) => {
                                const minPrice = product.min_price || product.base_price || 0;
                                const img = product.images?.[0] ? getImg(product.images[0]) : IMAGE_PLACEHOLDER;
                                return (
                                    <div key={product.id}
                                        className="group flex flex-col hover:-translate-y-1 transition-transform duration-300"
                                        style={{ background: '#fff', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)', border: '1px solid rgba(193,198,214,0.15)' }}>

                                        {/* Image */}
                                        <Link href={`/product/${product.slug}`} className="block relative overflow-hidden" style={{ height: '16rem' }}>
                                            <img src={img} alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                onError={(e) => { e.target.src = IMAGE_PLACEHOLDER; }} />
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                style={{ background: 'linear-gradient(to top, rgba(10,12,13,0.35), transparent)' }} />

                                            {/* Promo badge */}
                                            {product.promo_label && (
                                                <div className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider"
                                                    style={{ background: '#ba1a1a', color: '#fff' }}>
                                                    {product.promo_label}
                                                </div>
                                            )}

                                            {/* Category badge */}
                                            {product.category && (
                                                <div className="absolute top-4 right-4 text-xs font-medium px-3 py-1.5 rounded-full"
                                                    style={{ background: 'rgba(0,91,191,0.9)', backdropFilter: 'blur(8px)', color: '#fff' }}>
                                                    {product.category.name}
                                                </div>
                                            )}

                                            {/* Icon badge */}
                                            <div className="absolute bottom-4 left-4 w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
                                                style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}>
                                                <span className="text-lg">📋</span>
                                            </div>
                                        </Link>

                                        {/* Content */}
                                        <div className="p-7 flex flex-col flex-grow">
                                            <Link href={`/product/${product.slug}`}>
                                                <h3 className="text-xl font-bold mb-2 hover:text-[#005bbf] transition-colors"
                                                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>
                                                    {product.title}
                                                </h3>
                                            </Link>
                                            {product.subtitle && (
                                                <p className="text-sm leading-relaxed mb-5 line-clamp-2" style={{ color: '#414754' }}>
                                                    {product.subtitle}
                                                </p>
                                            )}

                                            {/* Price + CTA */}
                                            <div className="mt-auto pt-5 flex items-center justify-between"
                                                style={{ borderTop: '1px solid rgba(193,198,214,0.2)' }}>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#414754' }}>Mulai dari</p>
                                                    <p className="text-xl font-extrabold" style={{ color: '#005bbf', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                                        {minPrice > 0
                                                            ? `Rp${Number(minPrice).toLocaleString('id-ID')}`
                                                            : 'Hubungi Kami'}
                                                    </p>
                                                    {product.variants?.length > 0 && (
                                                        <p className="text-xs mt-0.5" style={{ color: '#414754' }}>{product.variants.length} paket tersedia</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleOrderClick(product)}
                                                    className="flex items-center gap-1.5 text-sm font-bold transition-all duration-200 group/btn"
                                                    style={{ color: '#005bbf' }}
                                                    onMouseEnter={e => e.currentTarget.style.gap = '0.5rem'}
                                                    onMouseLeave={e => e.currentTarget.style.gap = '0.375rem'}>
                                                    Pesan Sekarang
                                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
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
                                Tidak ada layanan yang ditemukan
                            </h3>
                            <p className="mb-6" style={{ color: '#414754' }}>
                                {searchTerm ? 'Coba gunakan kata kunci yang berbeda' : 'Belum ada layanan yang tersedia saat ini'}
                            </p>
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')}
                                    className="px-8 py-3 rounded-xl font-semibold text-white transition-colors"
                                    style={{ background: '#005bbf' }}>
                                    Tampilkan Semua
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* ── KENAPA KAMI ── */}
            <section className="px-6 lg:px-8 py-20 max-w-7xl mx-auto">
                <div className="text-center mb-14">
                    <h2 className="font-bold tracking-tight mb-4"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: '#191c1d' }}>
                        Kenapa Memilih Kami
                    </h2>
                    <p style={{ color: '#414754', fontSize: '1.05rem', maxWidth: '36rem', margin: '0 auto' }}>
                        Kami menggabungkan kecepatan dengan presisi, memberikan fondasi kepercayaan untuk bisnis Anda.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        {
                            icon: Shield,
                            title: 'Kepercayaan Penuh',
                            desc: 'Data perusahaan dan proses hukum Anda ditangani dengan kerahasiaan dan integritas tertinggi.',
                        },
                        {
                            icon: Zap,
                            title: 'Efisiensi Waktu',
                            desc: 'Proses yang efisien untuk menghasilkan dokumen dan persetujuan lebih cepat, menghemat waktu berharga Anda.',
                        },
                        {
                            icon: Award,
                            title: 'Keahlian Teruji',
                            desc: 'Tim konsultan kami membawa pengalaman bertahun-tahun di bidang hukum korporat dan perpajakan Indonesia.',
                        },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                                style={{ background: 'rgba(0,91,191,0.06)' }}>
                                <Icon className="w-9 h-9" style={{ color: '#005bbf' }} />
                            </div>
                            <h4 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>
                                {title}
                            </h4>
                            <p className="text-base leading-relaxed" style={{ color: '#414754' }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <ProductModal product={selectedProduct} isOpen={isModalOpen} onClose={handleCloseModal} onAddToCart={handleAddToCart} />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <Footer />
        </div>
    );
};

export default JasaProfesionalSection;
