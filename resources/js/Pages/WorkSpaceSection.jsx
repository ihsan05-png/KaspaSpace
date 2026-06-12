import React, { useState, useMemo } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Head, Link, usePage } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import ProductModal from "@/Components/ProductModal";
import CartDrawer from "@/Components/CartDrawer";
import RoomAvailabilitySchedule from "@/Components/RoomAvailabilitySchedule";
import { IMAGE_PLACEHOLDER } from "@/utils/placeholders";
import heroBg from "../../images/workspace-hero.jpg";

// palette — matched to logo (navy → mid-blue → sky-blue)
const clr = {
    bg:              '#f5f8fd',
    surface:         '#ffffff',
    surfaceLow:      '#eef3fa',
    surfaceContainer:'#e4ecf7',
    onSurface:       '#191c1e',
    onSurfaceVar:    '#45464d',
    primary:         '#1a3b8c',
    secondary:       '#1e6cbe',
    outlineVar:      '#bfdbfe',
    outline:         '#76777d',
    error:           '#ba1a1a',
};

const WorkspaceSection = ({ products = [], currentCategory, categories = [] }) => {
    const [searchTerm, setSearchTerm]           = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen]         = useState(false);
    const [isCartOpen, setIsCartOpen]           = useState(false);
    const { props } = usePage();
    void props.cart;

    const filteredProducts = useMemo(() =>
        products.filter((p) =>
            searchTerm === "" || p.title?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [products, searchTerm]);

    const handleOrderClick = (product) => { setSelectedProduct(product); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedProduct(null); };
    const handleAddToCart  = () => setIsCartOpen(true);

    const getBadge = (product) => {
        if (product.promo_label) return { text: product.promo_label, bg: clr.error,     color: '#fff' };
        if (product.is_featured) return { text: 'Populer',           bg: clr.secondary,  color: '#fff' };
        return null;
    };

    const getPriceUnit = (product) => {
        const variants = product.variants || [];
        if (!variants.length) return '';
        const cheapest = [...variants].sort((a, b) => (a.price || 0) - (b.price || 0))[0];
        return cheapest?.name ? `/${cheapest.name}` : '';
    };

    const getImage = (product) => {
        if (product.images && product.images.length > 0) {
            const img = product.images[0];
            return img.startsWith('http') ? img : `/storage/${img}`;
        }
        return IMAGE_PLACEHOLDER;
    };

    return (
        <div className="min-h-screen antialiased" style={{ backgroundColor: clr.bg, color: clr.onSurface, fontFamily: "'Manrope', 'Plus Jakarta Sans', Inter, sans-serif" }}>
            <Head title="Ruang Kerja & Ketersediaan" />
            <Navbar />

            {/* ── HERO ─────────────────────────────────────────────── */}
            <section className="relative min-h-[640px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={heroBg} alt="Coworking Space" className="w-full h-full object-cover" loading="eager" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(19,27,46,0.85) 0%, rgba(19,27,46,0.55) 50%, rgba(19,27,46,0.25) 100%)' }} />
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col items-start gap-8 pt-24 pb-16">
                    <div className="w-full md:w-3/5">
                        <h1 className="font-extrabold text-white tracking-tight leading-tight mb-5"
                            style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2.8rem, 6vw, 4.5rem)' }}>
                            Ruang Kerja <br />
                            <span style={{ color: '#29b9f1' }}>Masa Kini</span>
                        </h1>
                        <p className="text-xl mb-10 font-light" style={{ color: '#e7e8e9', maxWidth: '28rem', lineHeight: 1.65 }}>
                            Tingkatkan produktivitas Anda di ruang yang dirancang untuk fokus, kolaborasi, dan tim berkinerja tinggi.
                        </p>

                        {/* Search Bar */}
                        <div className="flex flex-col md:flex-row items-center gap-2 max-w-xl p-2 shadow-2xl"
                            style={{ background: clr.surface, borderRadius: '1rem', border: `1px solid ${clr.outlineVar}` }}>
                            <div className="flex-1 flex items-center px-4 py-2 w-full gap-3"
                                style={{ borderRight: `1px solid ${clr.outlineVar}` }}>
                                <Search className="w-5 h-5 flex-shrink-0" style={{ color: clr.outline }} />
                                <input
                                    type="text"
                                    placeholder="Cari lokasi atau tipe ruangan..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full border-none outline-none font-medium placeholder:text-gray-400 bg-transparent"
                                    style={{ color: clr.onSurface }}
                                />
                            </div>
                            <a href="#schedule"
                                className="w-full md:w-auto px-8 py-3 font-bold whitespace-nowrap transition-opacity duration-200 text-center"
                                style={{ background: clr.secondary, color: '#fff', borderRadius: '0.75rem' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                Cek Jadwal
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PRODUCT GRID ─────────────────────────────────────── */}
            <section className="py-24 px-8" style={{ backgroundColor: clr.bg }}>
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <h2 className="font-bold tracking-tight mb-2"
                            style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: clr.onSurface }}>
                            Ruang Kerja Tersedia
                        </h2>
                        <p style={{ color: clr.onSurfaceVar, fontSize: '1.05rem' }}>
                            Pilih ruangan yang sesuai dengan gaya kerja Anda.{' '}
                            <span className="font-semibold" style={{ color: clr.secondary }}>{filteredProducts.length} ruang ditemukan</span>
                        </p>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map((product) => {
                                const badge = getBadge(product);
                                const unit  = getPriceUnit(product);
                                return (
                                    <article
                                        key={product.id}
                                        className="flex flex-col group hover:shadow-xl transition-shadow duration-300"
                                        style={{
                                            background: clr.surface,
                                            borderRadius: '1.5rem',
                                            overflow: 'hidden',
                                            boxShadow: '0 1px 6px rgba(25,28,30,0.07)',
                                            border: `1px solid ${clr.outlineVar}`,
                                        }}>

                                        {/* Image */}
                                        <div className="relative overflow-hidden" style={{ height: '16rem' }}>
                                            <Link href={`/product/${product.slug}`} className="block w-full h-full">
                                                <img
                                                    src={getImage(product)}
                                                    alt={product.title}
                                                    loading="lazy" decoding="async"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                                    onError={(e) => { e.target.src = IMAGE_PLACEHOLDER; }}
                                                />
                                            </Link>
                                            {badge && (
                                                <span className="absolute top-4 left-4 z-10 text-xs font-bold px-3 py-1 tracking-widest uppercase shadow"
                                                    style={{ background: badge.bg, color: badge.color, borderRadius: '9999px' }}>
                                                    {badge.text}
                                                </span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex flex-col flex-grow">
                                            <Link href={`/product/${product.slug}`}>
                                                <h3 className="text-xl font-bold mb-1 transition-colors"
                                                    style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif", color: clr.onSurface }}
                                                    onMouseEnter={e => e.currentTarget.style.color = clr.secondary}
                                                    onMouseLeave={e => e.currentTarget.style.color = clr.onSurface}>
                                                    {product.title}
                                                </h3>
                                            </Link>
                                            <p className="leading-relaxed mb-6 line-clamp-2 text-sm" style={{ color: clr.onSurfaceVar }}>
                                                {product.subtitle || product.description || '—'}
                                            </p>

                                            {/* Price + Button */}
                                            <div className="mt-auto pt-5 flex items-end justify-between"
                                                style={{ borderTop: `1px solid ${clr.outlineVar}` }}>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: clr.outline }}>Mulai dari</p>
                                                    <p className="text-lg font-bold" style={{ color: clr.secondary }}>
                                                        Rp{Number(product.min_price || product.base_price || 0).toLocaleString('id-ID')}
                                                        <span className="text-xs font-normal" style={{ color: clr.outline }}>{unit}</span>
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleOrderClick(product)}
                                                    className="flex items-center gap-2 px-5 py-2.5 font-bold text-sm transition-opacity duration-200"
                                                    style={{ background: clr.secondary, color: '#fff', borderRadius: '0.75rem' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                    Pesan
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                                style={{ background: clr.surfaceLow }}>
                                <Search className="w-9 h-9" style={{ color: clr.secondary }} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}>
                                Tidak ada ruang yang ditemukan
                            </h3>
                            <p className="mb-6" style={{ color: clr.onSurfaceVar }}>
                                {searchTerm ? 'Coba gunakan kata kunci yang berbeda' : 'Belum ada ruang kerja yang tersedia saat ini'}
                            </p>
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')}
                                    className="px-8 py-3 font-semibold text-white transition-opacity"
                                    style={{ background: clr.secondary, borderRadius: '0.75rem' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                    Tampilkan Semua
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* ── AVAILABILITY SCHEDULE ────────────────────────────── */}
            <section id="schedule" className="py-24 px-8" style={{ backgroundColor: clr.surfaceLow }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-extrabold tracking-tight mb-3"
                            style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: clr.onSurface }}>
                            Jadwal Ketersediaan Ruangan
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: clr.onSurfaceVar }}>
                            Cek ketersediaan real-time untuk hari ini.
                        </p>
                    </div>
                    <RoomAvailabilitySchedule />
                </div>
            </section>

            <ProductModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onAddToCart={handleAddToCart}
            />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <Footer />
        </div>
    );
};

export default WorkspaceSection;
