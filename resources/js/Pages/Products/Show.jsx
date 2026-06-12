import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { IMAGE_PLACEHOLDER } from '@/utils/placeholders';
import {
    ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus, Star,
    Wifi, Wind, Monitor, Coffee, FileText, MapPin, Users, Clock,
    MessageCircle, CheckCircle
} from 'lucide-react';
import BookingDateTimePicker from '@/Components/BookingDateTimePicker';

const StarRating = ({ value, onChange, readonly = false }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
                <button
                    key={s}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onChange && onChange(s)}
                    onMouseEnter={() => !readonly && setHovered(s)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    className={`focus:outline-none ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                    <Star className={`w-5 h-5 transition-colors ${s <= (hovered || value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
            ))}
        </div>
    );
};

const getImg = (src) => {
    if (!src) return IMAGE_PLACEHOLDER;
    if (src.startsWith('http')) return src;
    return `/storage/${src}`;
};

const ProductShow = ({ product, rooms = [], relatedProducts = [], reviews = [], avgRating, reviewCount, canReview, userHasReviewed }) => {
    const [selectedVariant, setSelectedVariant]   = useState(null);
    const [quantity, setQuantity]                 = useState(1);
    const [customOptions, setCustomOptions]       = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isCartOpen, setIsCartOpen]             = useState(false);
    const [bookingData, setBookingData]           = useState({ date: null, startTime: null, endTime: null });

    const [reviewRating, setReviewRating]         = useState(5);
    const [reviewComment, setReviewComment]       = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [showReviewForm, setShowReviewForm]     = useState(false);
    const { flash, auth } = usePage().props;

    const isCoworkingBooking = ['share_desk', 'private_room'].includes(product.product_type);

    const { operationalHours } = usePage().props;
    const openTime  = product.open_time  || operationalHours?.open  || '08:00';
    const closeTime = product.close_time || operationalHours?.close || '17:00';
    const shareDeskCapacity = product.variants?.[0]?.stock_quantity ?? 8;

    useEffect(() => {
        if (product.variants && product.variants.length > 0) {
            const firstActive = product.variants.find(v => v.is_active && (!v.manage_stock || v.stock_quantity > 0));
            if (firstActive) setSelectedVariant(firstActive);
        }
    }, [product]);

    const images = product.images && product.images.length > 0 ? product.images : [null];

    const handlePrevImage = () => setCurrentImageIndex(p => p === 0 ? images.length - 1 : p - 1);
    const handleNextImage = () => setCurrentImageIndex(p => p === images.length - 1 ? 0 : p + 1);

    const handleVariantChange = (e) => {
        const variant = product.variants.find(v => v.id === parseInt(e.target.value));
        if (variant) setSelectedVariant(variant);
    };

    const handleCustomOptionChange = (name, value) =>
        setCustomOptions(prev => ({ ...prev, [name]: value }));

    const handleAddToCart = () => {
        if (!selectedVariant) { alert('Silakan pilih paket terlebih dahulu'); return; }
        if (isCoworkingBooking && (!bookingData.date || !bookingData.startTime)) {
            alert('Silakan pilih tanggal dan waktu booking'); return;
        }
        if (isCoworkingBooking && rooms.length > 0 && !bookingData.roomId) {
            alert('Silakan pilih ruangan terlebih dahulu'); return;
        }
        if (isCoworkingBooking && bookingData._pendingUnit) {
            alert('Silakan pilih unit ruangan terlebih dahulu'); return;
        }
        router.post('/cart/add', {
            product_id: product.id,
            product_name: product.title,
            variant_id: selectedVariant.id,
            variant_name: selectedVariant.name,
            custom_options: customOptions,
            quantity,
            price: selectedVariant.price,
            booking_date: bookingData.date || null,
            booking_start_time: bookingData.startTime || null,
            room_id: bookingData.roomId || null,
            unit_index: bookingData.unitIndex ?? null,
            unit_name: bookingData.unitName || null,
        }, {
            preserveScroll: true,
            onSuccess: () => setIsCartOpen(true),
            onError: () => alert('Gagal menambahkan ke keranjang'),
        });
    };

    const displayPrice = selectedVariant
        ? Number(selectedVariant.price)
        : (product.variants?.length > 0 ? Number(product.variants[0].price) : Number(product.base_price || 0));

    const minPrice = product.variants?.length > 0
        ? Math.min(...product.variants.map(v => v.price))
        : Number(product.base_price || 0);

    const badge = product.promo_label
        ? { text: product.promo_label, bg: '#ba1a1a', color: '#fff' }
        : product.is_featured
            ? { text: 'Populer', bg: '#006876', color: '#fff' }
            : null;

    return (
        <div className="min-h-screen antialiased" style={{ backgroundColor: '#f8f9fa', color: '#191c1d', fontFamily: 'Inter, sans-serif' }}>
            <Head title={product.title} />
            <Navbar />

            {/* ── MAIN CONTENT ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

                    {/* ── LEFT: Images + Details ── */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Hero Image */}
                        <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '16/10' }}>
                            <img
                                src={getImg(images[currentImageIndex])}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = IMAGE_PLACEHOLDER; }}
                            />
                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex gap-2 z-10">
                                {badge && (
                                    <span className="text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm"
                                        style={{ background: badge.bg, color: badge.color }}>
                                        {badge.text}
                                    </span>
                                )}
                                <span className="text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm"
                                    style={{ background: 'rgba(0,91,191,0.9)', color: '#fff' }}>
                                    Tersedia
                                </span>
                            </div>
                            {images.length > 1 && (
                                <>
                                    <button onClick={handlePrevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition">
                                        <ChevronLeft className="w-5 h-5" style={{ color: '#191c1d' }} />
                                    </button>
                                    <button onClick={handleNextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition">
                                        <ChevronRight className="w-5 h-5" style={{ color: '#191c1d' }} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {images.slice(0, 4).map((img, i) => (
                                    <button key={i} onClick={() => setCurrentImageIndex(i)}
                                        className="rounded-xl overflow-hidden transition-all duration-200"
                                        style={{
                                            aspectRatio: '4/3',
                                            border: currentImageIndex === i ? '2.5px solid #005bbf' : '2.5px solid transparent',
                                            boxShadow: currentImageIndex === i ? '0 0 0 3px rgba(0,91,191,0.15)' : 'none',
                                        }}>
                                        <img src={getImg(img)} alt={`${product.title} ${i + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = IMAGE_PLACEHOLDER; }} />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Product Title (mobile) */}
                        <div className="lg:hidden">
                            <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>
                                {product.title}
                            </h1>
                            {product.subtitle && (
                                <p className="text-lg mb-3" style={{ color: '#414754' }}>{product.subtitle}</p>
                            )}
                            <p className="text-sm mb-1" style={{ color: '#414754' }}>Mulai dari</p>
                            <p className="text-3xl font-extrabold" style={{ color: '#005bbf' }}>
                                Rp{minPrice.toLocaleString('id-ID')}
                            </p>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="rounded-2xl p-8" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>
                                    Tentang Produk
                                </h2>
                                <div className="leading-relaxed text-base" style={{ color: '#414754' }}
                                    dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }} />
                            </div>
                        )}

                        {/* Amenities / Features */}
                        <div className="rounded-2xl p-8" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                            <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>
                                Fasilitas & Keunggulan
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    { icon: Wifi,         label: 'Wi-Fi 100 Mbps' },
                                    { icon: Wind,         label: 'AC Ruangan' },
                                    { icon: Monitor,      label: 'Layar Presentasi' },
                                    { icon: Coffee,       label: 'Pantry & Minuman' },
                                    { icon: FileText,     label: 'Printer & Materai' },
                                    { icon: Users,        label: 'Resepsionis' },
                                    { icon: MapPin,       label: 'Lokasi Strategis' },
                                    { icon: Clock,        label: `Buka ${openTime}–${closeTime}` },
                                    { icon: CheckCircle,  label: 'Booking Instan' },
                                ].map(({ icon: Icon, label }) => (
                                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f3f4f5' }}>
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'rgba(0,91,191,0.1)' }}>
                                            <Icon className="w-4.5 h-4.5" style={{ color: '#005bbf' }} size={18} />
                                        </div>
                                        <span className="text-sm font-medium" style={{ color: '#191c1d' }}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Suite Configurations / Variants Table */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                <div className="px-8 py-5" style={{ borderBottom: '1px solid #f0f1f5' }}>
                                    <h2 className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>
                                        Pilihan Paket
                                    </h2>
                                </div>
                                <div className="divide-y" style={{ borderColor: '#f0f1f5' }}>
                                    {product.variants.map((v) => {
                                        const isActive = selectedVariant?.id === v.id;
                                        return (
                                            <button key={v.id}
                                                onClick={() => setSelectedVariant(v)}
                                                className="w-full text-left px-8 py-5 flex items-center justify-between transition-colors duration-150"
                                                style={{ background: isActive ? 'rgba(0,91,191,0.04)' : 'transparent' }}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                                                        style={{ borderColor: isActive ? '#005bbf' : '#c1c6d6' }}>
                                                        {isActive && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#005bbf' }} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold" style={{ color: '#191c1d' }}>{v.name}</p>
                                                        {v.description && (
                                                            <p className="text-sm mt-0.5" style={{ color: '#414754' }}>{v.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0 ml-4">
                                                    <p className="font-extrabold text-lg" style={{ color: '#005bbf' }}>
                                                        Rp{Number(v.price).toLocaleString('id-ID')}
                                                    </p>
                                                    {v.compare_price && Number(v.compare_price) > Number(v.price) && (
                                                        <p className="text-xs line-through" style={{ color: '#9ca3af' }}>
                                                            Rp{Number(v.compare_price).toLocaleString('id-ID')}
                                                        </p>
                                                    )}
                                                    {!v.is_active || (v.manage_stock && v.stock_quantity <= 0)
                                                        ? <span className="text-xs font-medium" style={{ color: '#ba1a1a' }}>Tidak tersedia</span>
                                                        : null}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── PRODUCT-TYPE SPECIFIC SECTIONS ── */}

                        {/* Virtual Office */}
                        {(product.product_type === 'virtual_office' || product.title?.toLowerCase().includes('virtual office')) && (
                            <div className="space-y-6">
                                <div className="rounded-2xl p-8" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                    <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>Jangan Hamburkan Uang Anda</h2>
                                    <p className="leading-relaxed mb-6" style={{ color: '#414754' }}>
                                        Tidak punya cukup uang, jarang ngantor, atau males kalau bangun kantor sendiri? Solusinya pakai virtual office saja! Anda hemat waktu dengan kantor siap pakai dan tidak perlu banyak usaha untuk membangun kantor sendiri.
                                    </p>
                                    <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>Apa Itu Virtual Office?</h2>
                                    <p className="leading-relaxed mb-4" style={{ color: '#414754' }}>
                                        Virtual office adalah sewa alamat kantor dengan fasilitas penunjang usaha. Anda dapat menggunakan alamat kantor Kaspa Space sebagai alamat usaha, lengkap dengan layanan penerimaan surat, meeting room, dan layanan bisnis lainnya.
                                    </p>
                                    <ul className="space-y-1 text-sm" style={{ color: '#005bbf' }}>
                                        <li><a href="https://kaspaspace.com/mengenal-virtual-office-solo-solusi-cerdas-untuk-para-pebisnis" target="_blank" rel="noopener noreferrer" className="hover:underline">→ Mengenal Virtual Office Solo - Solusi Cerdas untuk Para Pebisnis</a></li>
                                        <li><a href="https://kaspaspace.com/sejarah-dan-perkembangan-virtual-office-dari-ide-hingga-realisasi" target="_blank" rel="noopener noreferrer" className="hover:underline">→ Sejarah dan Perkembangan Virtual Office</a></li>
                                    </ul>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                        <div className="px-6 py-4" style={{ background: '#f3f4f5', borderBottom: '1px solid #e9eaec' }}>
                                            <h3 className="font-bold text-center" style={{ color: '#191c1d' }}>Paket Virtual Office</h3>
                                        </div>
                                        {[
                                            { label: 'Bronze', items: ['Jasa penerimaan surat, paket, panggilan, & email', 'Alamat kantor untuk non-badan usaha', 'Gratis akses eBook di eLibrary', 'Gratis meeting room 2 jam/bulan', 'Gratis pembuatan rekening bank BRI & Sinarmas'] },
                                            { label: 'Platinum', items: ['Jasa penerimaan surat, paket, panggilan, & email', 'Surat keterangan domisili gedung', 'Gratis akses eBook di eLibrary', 'Gratis meeting room 2 jam/bulan', 'Gratis pembuatan rekening bank BRI & Sinarmas', 'Voucher diskon 10% layanan Dokter Finance'] },
                                            { label: 'Gold', items: ['Jasa penerimaan surat, paket, panggilan, & email', 'Surat keterangan domisili gedung', 'Gratis akses eBook di eLibrary', 'Gratis meeting room 2 jam/bulan & coworking 6 hari/bulan', 'Gratis pembuatan rekening bank BRI & Sinarmas', 'Voucher diskon 10% layanan Dokter Finance', 'Voucher diskon 20% meeting room & coworking'] },
                                            { label: 'Diamond', items: ['Jasa penerimaan surat, paket, panggilan, & email', 'Surat keterangan domisili gedung', 'Gratis akses eBook di eLibrary', 'Gratis meeting room 4 jam/bulan & coworking 6 hari/bulan', 'Gratis pembuatan rekening bank BRI & Sinarmas', 'Voucher diskon 10% layanan Dokter Finance', 'Voucher diskon 20% meeting room & coworking', 'Voucher diskon 50% jasa pengajuan PKP'] },
                                        ].map((pkg, i, arr) => (
                                            <div key={pkg.label} className="px-6 py-4" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f1f5' : 'none' }}>
                                                <p className="font-bold mb-2" style={{ color: '#191c1d' }}>{pkg.label}:</p>
                                                <ul className="space-y-1">{pkg.items.map(it => <li key={it} className="text-sm flex gap-2" style={{ color: '#414754' }}><span style={{ color: '#005bbf', flexShrink: 0 }}>•</span>{it}</li>)}</ul>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                        <div className="px-6 py-4" style={{ background: '#f3f4f5', borderBottom: '1px solid #e9eaec' }}>
                                            <h3 className="font-bold text-center" style={{ color: '#191c1d' }}>Paket Bundling VO + Legalitas Usaha</h3>
                                        </div>
                                        {[
                                            { label: 'VO Platinum + Pendirian PT Perorangan', items: ['Virtual Office Platinum 12 bulan', 'Voucher diskon 20% meeting room & coworking', 'SK kemenkumham, surat pernyataan pendirian PT Perorangan, NIB, NPWP, lampiran RBA, Email baru, akun OSS'] },
                                            { label: 'VO Platinum + Pendirian PT', items: ['Virtual Office Platinum 12 bulan', 'Voucher diskon 20% meeting room & coworking', 'Voucher diskon 50% jasa pengajuan PKP', 'SK kemenkumham, akta notaris, NIB, NPWP, lampiran RBA, email baru, akun OSS'] },
                                            { label: 'VO Platinum + Pendirian CV', items: ['Virtual Office Platinum 12 bulan', 'Voucher diskon 20% meeting room & coworking', 'Voucher diskon 50% jasa pengajuan PKP', 'SK kemenkumham, akta notaris, NIB, NPWP, lampiran RBA, email baru, akun OSS'] },
                                        ].map((pkg, i, arr) => (
                                            <div key={pkg.label} className="px-6 py-4" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f1f5' : 'none' }}>
                                                <p className="font-bold mb-2" style={{ color: '#191c1d' }}>{pkg.label}:</p>
                                                <ul className="space-y-1">{pkg.items.map(it => <li key={it} className="text-sm flex gap-2" style={{ color: '#414754' }}><span style={{ color: '#005bbf', flexShrink: 0 }}>•</span>{it}</li>)}</ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Private Office */}
                        {(product.product_type === 'private_office' || product.title?.toLowerCase().includes('private office')) && (
                            <div className="space-y-6">
                                <div className="rounded-2xl p-8" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                    <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>Dikira Hemat Malah Boncos</h2>
                                    <p className="leading-relaxed mb-6" style={{ color: '#414754' }}>
                                        Sewa ruko di lokasi prestisius ratusan juta per tahun, belum renovasi, merawat, bayar listrik, air, internet, AC, dan lainnya. Solusinya pakai private office saja! Hemat waktu dengan kantor siap pakai dan tidak perlu keluar banyak uang.
                                    </p>
                                    <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>Apa Itu Private Office?</h2>
                                    <p className="leading-relaxed mb-4" style={{ color: '#414754' }}>
                                        Private office adalah ruang kantor privat untuk tim Anda. Dibuat khusus untuk UMKM/UKM yang ingin punya kantor sendiri, sudah sepaket dengan layanan resepsionis, kebersihan, internet, listrik, hingga meeting room.
                                    </p>
                                    <ul className="space-y-1 text-sm" style={{ color: '#005bbf' }}>
                                        <li><a href="https://kaspaspace.com/5-tips-memilih-workspace-yang-tepat-untuk-pertumbuhan-bisnis-anda" target="_blank" rel="noopener noreferrer" className="hover:underline">→ 5 Tips Memilih Workspace yang Tepat</a></li>
                                        <li><a href="https://kaspaspace.com/mengenal-service-office-space-layanan-ruang-kantor-modern" target="_blank" rel="noopener noreferrer" className="hover:underline">→ Mengenal Service Office Space</a></li>
                                        <li><a href="https://kaspaspace.com/sewa-kantor-kaspa-space-lebih-untung-daripada-sewa-ruko" target="_blank" rel="noopener noreferrer" className="hover:underline">→ Sewa Kantor Kaspa Space vs Ruko</a></li>
                                    </ul>
                                </div>
                                <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                    <div className="px-6 py-4" style={{ background: '#f3f4f5', borderBottom: '1px solid #e9eaec' }}>
                                        <h3 className="font-bold text-center" style={{ color: '#191c1d' }}>Varian Private Office</h3>
                                    </div>
                                    {[
                                        { label: 'Private Office 4 pax (small)', items: ['Jasa front desk resepsionis & office boy', 'Surat keterangan domisili gedung', 'Luas 8 m² dengan 2 meja, 4 kursi, & laci', 'AC 1/2 PK, Wi-Fi 100 Mbps, & stop kontak', 'Lobi, mushola, pantry dengan dispenser air panas dingin & teh', 'Gratis meeting room 5 jam/bulan', 'Gratis akses eBook di eLibrary', 'Voucher diskon 10% layanan Dokter Finance', 'Voucher diskon 20% meeting room & coworking'] },
                                        { label: 'Private Office 4 pax', items: ['Jasa front desk resepsionis & office boy', 'Surat keterangan domisili gedung', 'Luas 9 m² dengan 2 meja, 4 kursi, & laci', 'AC 1/2 PK, Wi-Fi 100 Mbps, & stop kontak', 'Lobi, mushola, pantry dengan dispenser air panas dingin & teh', 'Gratis meeting room 5 jam/bulan', 'Voucher diskon 20% meeting room & coworking'] },
                                        { label: 'Private Office 6 pax', items: ['Jasa front desk resepsionis & office boy', 'Surat keterangan domisili gedung', 'Luas 12 m² dengan 3 meja, 6 kursi, & laci', 'AC 3/4 PK, Wi-Fi 100 Mbps, stop kontak, & whiteboard', 'Gratis meeting room 5 jam/bulan', 'Voucher diskon 20% meeting room & coworking'] },
                                        { label: 'Private Office 8 pax', items: ['Jasa front desk resepsionis & office boy', 'Surat keterangan domisili gedung', 'Luas 14 m² dengan 4 meja, 8 kursi, & laci', 'AC 1 PK, Wi-Fi 100 Mbps, & stop kontak', 'Gratis meeting room 5 jam/bulan', 'Voucher diskon 20% meeting room & coworking'] },
                                    ].map((pkg, i, arr) => (
                                        <div key={pkg.label} className="px-6 py-4" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f1f5' : 'none' }}>
                                            <p className="font-bold mb-2" style={{ color: '#191c1d' }}>{pkg.label}:</p>
                                            <ul className="space-y-1">{pkg.items.map(it => <li key={it} className="text-sm flex gap-2" style={{ color: '#414754' }}><span style={{ color: '#005bbf', flexShrink: 0 }}>•</span>{it}</li>)}</ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Share Desk */}
                        {(product.product_type === 'share_desk' || product.title?.toLowerCase().includes('share desk') || product.title?.toLowerCase().includes('coworking')) && (
                            <div className="space-y-6">
                                <div className="rounded-2xl p-8" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                    <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>Kerja Produktif Tanpa Perlu Kantor Sendiri</h2>
                                    <p className="leading-relaxed mb-6" style={{ color: '#414754' }}>
                                        Capek kerja dari rumah tapi belum siap sewa kantor? Share desk adalah solusinya! Nikmati suasana kerja yang profesional, fasilitas lengkap, dan komunitas produktif hanya dengan biaya per jam.
                                    </p>
                                    <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>Apa Itu Share Desk?</h2>
                                    <p className="leading-relaxed" style={{ color: '#414754' }}>
                                        Share desk adalah layanan coworking space dengan konsep meja bersama. Sistem booking per jam memberikan fleksibilitas penuh — bayar sesuai kebutuhan, tanpa perlu kontrak bulanan.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                        <div className="px-6 py-4" style={{ background: '#f3f4f5', borderBottom: '1px solid #e9eaec' }}>
                                            <h3 className="font-bold text-center" style={{ color: '#191c1d' }}>Fasilitas Share Desk</h3>
                                        </div>
                                        <div className="px-6 py-4">
                                            <ul className="space-y-2">
                                                {['Meja & kursi kerja ergonomis dan nyaman', 'Wi-Fi kecepatan tinggi 100 Mbps', 'Stop kontak & colokan USB di setiap meja', 'AC sentral ruangan yang sejuk', 'Loker penyimpanan barang (opsional)', 'Pantry dengan air minum, teh, dan kopi', 'Area lobi dan ruang santai', 'Mushola & toilet bersih', 'Akses eBook di eLibrary Kaspa Space'].map(it => (
                                                    <li key={it} className="text-sm flex gap-2" style={{ color: '#414754' }}><span style={{ color: '#005bbf', flexShrink: 0 }}>•</span>{it}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                        <div className="px-6 py-4" style={{ background: '#f3f4f5', borderBottom: '1px solid #e9eaec' }}>
                                            <h3 className="font-bold text-center" style={{ color: '#191c1d' }}>Paket Durasi & Harga</h3>
                                        </div>
                                        <div className="px-6 py-4" style={{ borderBottom: '1px solid #f0f1f5' }}>
                                            <p className="font-bold mb-2" style={{ color: '#191c1d' }}>Booking Per Jam:</p>
                                            <ul className="space-y-1">
                                                {['Fleksibel mulai dari 1 jam hingga seharian', 'Bayar sesuai durasi yang dipilih', 'Booking real-time, langsung konfirmasi', 'Tidak perlu kontrak atau komitmen jangka panjang'].map(it => (
                                                    <li key={it} className="text-sm flex gap-2" style={{ color: '#414754' }}><span style={{ color: '#005bbf', flexShrink: 0 }}>•</span>{it}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="px-6 py-4">
                                            <p className="font-bold mb-2" style={{ color: '#191c1d' }}>Ketentuan:</p>
                                            <ul className="space-y-1">
                                                {[`Jam operasional ${openTime} – ${closeTime} WIB`, `Kapasitas meja hingga ${shareDeskCapacity} orang`, 'Meja dikembalikan tepat waktu', 'Dilarang membawa makanan berbau tajam', 'Jaga kebersihan dan ketenangan bersama'].map(it => (
                                                    <li key={it} className="text-sm flex gap-2" style={{ color: '#414754' }}><span style={{ color: '#005bbf', flexShrink: 0 }}>•</span>{it}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Private Room */}
                        {(product.product_type === 'private_room' || product.title?.toLowerCase().includes('private room')) && (
                            <div className="space-y-6">
                                <div className="rounded-2xl p-8" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                    <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>Rapat Profesional, Meeting Privat, Presentasi Berkesan</h2>
                                    <p className="leading-relaxed mb-6" style={{ color: '#414754' }}>
                                        Butuh ruangan privat untuk meeting klien, rapat tim, presentasi, sesi pelatihan, atau diskusi penting? Private room Kaspa Space hadir dengan ruangan nyaman dilengkapi peralatan presentasi lengkap.
                                    </p>
                                    <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>Apa Itu Private Room?</h2>
                                    <p className="leading-relaxed" style={{ color: '#414754' }}>
                                        Private room adalah ruangan meeting eksklusif yang dapat disewa per jam. Ruangan ini terpisah dari area coworking umum, memberikan privasi penuh untuk diskusi rahasia atau negosiasi bisnis.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                        <div className="px-6 py-4" style={{ background: '#f3f4f5', borderBottom: '1px solid #e9eaec' }}>
                                            <h3 className="font-bold text-center" style={{ color: '#191c1d' }}>Fasilitas Private Room</h3>
                                        </div>
                                        <div className="px-6 py-4">
                                            <ul className="space-y-2">
                                                {['Ruangan privat eksklusif dengan pintu tertutup', 'Meja rapat panjang dengan kursi nyaman', 'Layar proyektor / TV screen untuk presentasi', 'Whiteboard untuk brainstorming', 'Wi-Fi kecepatan tinggi 100 Mbps', 'AC ruangan yang dapat diatur suhu', 'Stop kontak & colokan USB', 'Pantry dengan air minum, teh, dan kopi', 'Layanan resepsionis untuk menyambut tamu'].map(it => (
                                                    <li key={it} className="text-sm flex gap-2" style={{ color: '#414754' }}><span style={{ color: '#005bbf', flexShrink: 0 }}>•</span>{it}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                        <div className="px-6 py-4" style={{ background: '#f3f4f5', borderBottom: '1px solid #e9eaec' }}>
                                            <h3 className="font-bold text-center" style={{ color: '#191c1d' }}>Ideal Digunakan Untuk</h3>
                                        </div>
                                        {[
                                            { label: 'Rapat & Meeting', desc: 'Meeting klien, rapat tim internal, negosiasi bisnis, atau diskusi proyek yang membutuhkan privasi penuh.' },
                                            { label: 'Presentasi & Pelatihan', desc: 'Sesi presentasi produk, pelatihan karyawan, workshop kecil, atau demo kepada klien dengan peralatan lengkap.' },
                                            { label: 'Wawancara & Konsultasi', desc: 'Sesi wawancara kandidat, konsultasi bisnis privat, atau coaching session yang membutuhkan suasana tenang.' },
                                        ].map((item, i, arr) => (
                                            <div key={item.label} className="px-6 py-4" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f1f5' : 'none' }}>
                                                <p className="font-bold mb-1" style={{ color: '#191c1d' }}>{item.label}</p>
                                                <p className="text-sm" style={{ color: '#414754' }}>{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Meeting Room */}
                        {(product.product_type === 'meeting_room' || product.title?.toLowerCase().includes('meeting room')) && (
                            <div className="space-y-6">
                                <div className="rounded-2xl p-8" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                    <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>Fokus Produktivitas</h2>
                                    <p className="leading-relaxed mb-6" style={{ color: '#414754' }}>
                                        Mau meeting tapi fasilitas kurang? Solusinya pakai meeting room di Kaspa Space! Proyektor, whiteboard, printer, resepsionis, FnB, dan fasilitas lainnya tersedia lengkap di satu tempat.
                                    </p>
                                    <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>Apa Itu Meeting Room?</h2>
                                    <p className="leading-relaxed" style={{ color: '#414754' }}>
                                        Meeting room adalah ruangan yang didesain untuk kegiatan rapat, pertemuan, presentasi, interview, atau menemui tamu penting. Resepsionis kami siap membantu menyambut tamu Anda.
                                    </p>
                                </div>
                                <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                    <div className="px-6 py-4" style={{ background: '#f3f4f5', borderBottom: '1px solid #e9eaec' }}>
                                        <h3 className="font-bold text-center" style={{ color: '#191c1d' }}>Paket Meeting Room</h3>
                                    </div>
                                    {[{ label: 'Basic', kursi: 4 }, { label: 'Standard', kursi: 8 }, { label: 'Plus', kursi: 12 }].map((pkg, i, arr) => (
                                        <div key={pkg.label} className="px-6 py-4" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f1f5' : 'none' }}>
                                            <p className="font-bold mb-2" style={{ color: '#191c1d' }}>{pkg.label}:</p>
                                            <ul className="space-y-1">
                                                {[`Jasa menerima, informator, dan komunikator tamu`, `Luas 13,5 m² dengan ${pkg.kursi} kursi`, 'AC, Wi-Fi 100 Mbps, 8 stop kontak, whiteboard, & LCD proyektor', 'Lobi, mushola, pantry dengan dispenser air panas dingin & teh', 'Gratis air minum kemasan & tisu', 'Gratis akses eBook di eLibrary'].map(it => (
                                                    <li key={it} className="text-sm flex gap-2" style={{ color: '#414754' }}><span style={{ color: '#005bbf', flexShrink: 0 }}>•</span>{it}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                    <div style={{ borderTop: '1px solid #e9eaec' }}>
                                        <div className="px-6 py-3" style={{ background: '#f3f4f5', borderBottom: '1px solid #e9eaec' }}>
                                            <h3 className="font-bold text-center" style={{ color: '#191c1d' }}>Meeting Room Untuk Mahasiswa</h3>
                                        </div>
                                        <div className="px-6 py-4">
                                            <ul className="space-y-1">
                                                {['Potongan harga 50%', 'Syarat dan ketentuan berlaku'].map(it => (
                                                    <li key={it} className="text-sm flex gap-2" style={{ color: '#414754' }}><span style={{ color: '#005bbf', flexShrink: 0 }}>•</span>{it}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                    <div className="px-6 py-4" style={{ background: '#f3f4f5', borderBottom: '1px solid #e9eaec' }}>
                                        <h3 className="font-bold text-center" style={{ color: '#191c1d' }}>Ketentuan Penggunaan</h3>
                                    </div>
                                    <div className="px-6 py-4">
                                        <ul className="space-y-1">
                                            {[`Jam operasional ${openTime} – ${closeTime} WIB`, 'Booking per jam, minimal 1 jam', 'Ruangan dikembalikan tepat waktu sesuai booking', 'Pemesanan dapat dilakukan minimal 30 menit sebelumnya', 'Kapasitas sesuai paket yang dipilih (Basic 4, Standard 8, Plus 12 kursi)'].map(it => (
                                                <li key={it} className="text-sm flex gap-2" style={{ color: '#414754' }}><span style={{ color: '#005bbf', flexShrink: 0 }}>•</span>{it}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Print */}
                        {(product.product_type === 'print' || product.title?.toLowerCase().includes('print')) && (
                            <div className="rounded-2xl p-8" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>Cetak Dokumen Cepat, Murah, dan Berkualitas</h2>
                                <p className="leading-relaxed mb-4" style={{ color: '#414754' }}>
                                    Butuh cetak dokumen, proposal, laporan, atau materi presentasi? Kaspa Space menyediakan layanan print berkualitas tinggi, berbagai pilihan ukuran kertas, dan hasil cetak yang tajam — langsung di tempat kerja Anda.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    {[
                                        { label: 'Harga Terjangkau', desc: 'Lebih hemat dibanding warnet atau print shop biasa, tanpa mengorbankan kualitas.' },
                                        { label: 'Praktis & Cepat', desc: 'Cetak dokumen langsung di tempat kerja. Tidak perlu keluar gedung.' },
                                        { label: 'Kualitas Terjamin', desc: 'Printer berkualitas dengan tinta original, hasil tajam dan profesional.' },
                                    ].map(item => (
                                        <div key={item.label} className="p-4 rounded-xl" style={{ background: '#f3f4f5' }}>
                                            <p className="font-bold mb-1" style={{ color: '#191c1d' }}>{item.label}</p>
                                            <p className="text-sm" style={{ color: '#414754' }}>{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Materai */}
                        {(product.product_type === 'materai' || product.title?.toLowerCase().includes('materai')) && (
                            <div className="rounded-2xl p-8" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>Materai Resmi, Praktis, dan Terpercaya</h2>
                                <p className="leading-relaxed mb-4" style={{ color: '#414754' }}>
                                    Perlu materai untuk dokumen perjanjian, kontrak kerja, atau surat kuasa? Kaspa Space menyediakan materai tempel dan e-Materai resmi yang sah secara hukum, tersedia langsung di lokasi.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    {[
                                        { label: 'Resmi & Terpercaya', desc: 'Produk resmi Peruri, terjamin keasliannya untuk semua dokumen hukum.' },
                                        { label: 'Praktis & Mudah', desc: 'Beli langsung di kasir Kaspa Space tanpa perlu antri panjang.' },
                                        { label: 'Stok Selalu Ada', desc: 'Stok dijaga tersedia setiap hari kerja, tidak perlu khawatir kehabisan.' },
                                    ].map(item => (
                                        <div key={item.label} className="p-4 rounded-xl" style={{ background: '#f3f4f5' }}>
                                            <p className="font-bold mb-1" style={{ color: '#191c1d' }}>{item.label}</p>
                                            <p className="text-sm" style={{ color: '#414754' }}>{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Legalitas */}
                        {(product.product_type === 'legalitas' || product.title?.toLowerCase().includes('legalitas')) && (
                            <div className="space-y-6">
                                <div className="rounded-2xl p-8" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                    <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>Urus Legalitas Usaha Tanpa Ribet</h2>
                                    <p className="leading-relaxed" style={{ color: '#414754' }}>
                                        Usaha Anda sudah berjalan tapi belum punya legalitas? Kaspa Space membantu pengurusan legalitas mulai dari SKDU, PKP, pendirian CV, PT, hingga PT Perorangan — proses cepat, harga transparan, didampingi tenaga profesional.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                        <div className="px-6 py-4" style={{ background: '#f3f4f5', borderBottom: '1px solid #e9eaec' }}>
                                            <h3 className="font-bold text-center" style={{ color: '#191c1d' }}>Paket & Harga Legalitas Usaha</h3>
                                        </div>
                                        <div className="divide-y" style={{ borderColor: '#f0f1f5' }}>
                                            {product.variants && product.variants.length > 0 ? product.variants.map((v) => (
                                                <div key={v.id} className="flex items-center justify-between px-6 py-3">
                                                    <span className="text-sm font-medium" style={{ color: '#414754' }}>{v.name}</span>
                                                    <div className="text-right">
                                                        <span className="text-sm font-bold" style={{ color: '#005bbf' }}>Rp{Number(v.price).toLocaleString('id-ID')}</span>
                                                        {v.compare_price && Number(v.compare_price) > Number(v.price) && (
                                                            <div className="text-xs line-through" style={{ color: '#9ca3af' }}>Rp{Number(v.compare_price).toLocaleString('id-ID')}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="px-6 py-4 text-sm text-center" style={{ color: '#414754' }}>Hubungi kami untuk informasi harga</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                        <div className="px-6 py-4" style={{ background: '#f3f4f5', borderBottom: '1px solid #e9eaec' }}>
                                            <h3 className="font-bold text-center" style={{ color: '#191c1d' }}>Yang Sudah Termasuk</h3>
                                        </div>
                                        <div className="px-6 py-4" style={{ borderBottom: '1px solid #f0f1f5' }}>
                                            <p className="font-bold mb-2" style={{ color: '#191c1d' }}>Layanan Umum:</p>
                                            <ul className="space-y-1">
                                                {['Konsultasi awal gratis sebelum pengurusan', 'Pendampingan proses dari awal hingga selesai', 'Update status pengurusan secara berkala', 'Dokumen digital dikirim via WhatsApp / email'].map(it => (
                                                    <li key={it} className="text-sm flex gap-2" style={{ color: '#414754' }}><span style={{ color: '#005bbf', flexShrink: 0 }}>•</span>{it}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="px-6 py-4">
                                            <p className="font-bold mb-2" style={{ color: '#191c1d' }}>Ketentuan:</p>
                                            <ul className="space-y-1">
                                                {['Estimasi waktu sesuai jenis layanan yang dipilih', 'Siapkan dokumen persyaratan yang diminta', 'Biaya pemerintah (PNBP) di luar harga layanan', 'Hubungi kami untuk konsultasi lebih lanjut'].map(it => (
                                                    <li key={it} className="text-sm flex gap-2" style={{ color: '#414754' }}><span style={{ color: '#005bbf', flexShrink: 0 }}>•</span>{it}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Related Products */}
                        {relatedProducts.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>
                                    Produk Terkait
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {relatedProducts.map((rec) => {
                                        const rMin = rec.variants?.length > 0
                                            ? Math.min(...rec.variants.map(v => v.price))
                                            : (rec.base_price || 0);
                                        const fullStars = Math.round(rec.avg_rating || 0);
                                        return (
                                            <div key={rec.id}
                                                className="flex flex-col group hover:-translate-y-1 transition-transform duration-300"
                                                style={{ background: '#fff', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                                <a href={`/product/${rec.slug}`} className="block overflow-hidden" style={{ aspectRatio: '4/3' }}>
                                                    <img
                                                        src={getImg(rec.images?.[0])}
                                                        alt={rec.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                        onError={(e) => { e.target.src = IMAGE_PLACEHOLDER; }}
                                                    />
                                                </a>
                                                <div className="p-4 flex flex-col flex-1">
                                                    <a href={`/product/${rec.slug}`}>
                                                        <h3 className="font-bold text-sm line-clamp-2 mb-2 leading-snug hover:text-[#005bbf] transition"
                                                            style={{ color: '#191c1d' }}>
                                                            {rec.title}
                                                        </h3>
                                                    </a>
                                                    {rec.review_count > 0 && (
                                                        <div className="flex items-center gap-1 mb-2">
                                                            {[1,2,3,4,5].map(s => (
                                                                <Star key={s} className={`w-3 h-3 ${s <= fullStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                                            ))}
                                                            <span className="text-xs ml-1" style={{ color: '#414754' }}>({rec.review_count})</span>
                                                        </div>
                                                    )}
                                                    <p className="text-sm font-bold mt-auto" style={{ color: '#005bbf' }}>
                                                        Dari Rp{Number(rMin).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Booking Card (sticky) ── */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-6">
                            <div className="rounded-2xl overflow-hidden"
                                style={{ background: '#fff', boxShadow: '0 20px 48px -12px rgba(25,28,29,0.14)', border: '1px solid rgba(193,198,214,0.2)' }}>
                                <div className="p-6" style={{ borderBottom: '1px solid #f0f1f5' }}>
                                    <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>
                                        {product.title}
                                    </h1>
                                    {product.subtitle && (
                                        <p className="text-sm mb-4" style={{ color: '#414754' }}>{product.subtitle}</p>
                                    )}
                                    <p className="text-xs font-medium mb-1" style={{ color: '#414754' }}>Mulai dari</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-extrabold" style={{ color: '#005bbf' }}>
                                            Rp{displayPrice.toLocaleString('id-ID')}
                                        </p>
                                        {selectedVariant?.compare_price && Number(selectedVariant.compare_price) > displayPrice && (
                                            <p className="text-base line-through" style={{ color: '#9ca3af' }}>
                                                Rp{Number(selectedVariant.compare_price).toLocaleString('id-ID')}
                                            </p>
                                        )}
                                    </div>
                                    {selectedVariant?.name && (
                                        <p className="text-xs mt-1" style={{ color: '#414754' }}>Paket: {selectedVariant.name}</p>
                                    )}
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Variant Select */}
                                    {product.variants && product.variants.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: '#191c1d' }}>Pilih Paket</label>
                                            <select
                                                value={selectedVariant?.id || ''}
                                                onChange={handleVariantChange}
                                                className="w-full px-4 py-3 text-sm rounded-xl border-none outline-none appearance-none font-medium"
                                                style={{ background: '#f3f4f5', color: '#191c1d', cursor: 'pointer' }}>
                                                {product.variants.map((v) => (
                                                    <option key={v.id} value={v.id}
                                                        disabled={!v.is_active || (v.manage_stock && v.stock_quantity <= 0)}>
                                                        {v.name} — Rp{Number(v.price).toLocaleString('id-ID')}
                                                        {!v.is_active || (v.manage_stock && v.stock_quantity <= 0) ? ' (Habis)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Booking Date/Time Picker */}
                                    {isCoworkingBooking && selectedVariant && (
                                        <BookingDateTimePicker
                                            productId={product.id}
                                            productType={product.product_type}
                                            selectedVariant={selectedVariant}
                                            onBookingChange={setBookingData}
                                            productOpen={product.open_time || null}
                                            productClose={product.close_time || null}
                                            rooms={rooms}
                                        />
                                    )}

                                    {/* Custom Options */}
                                    {product.custom_options && product.custom_options.length > 0 && (
                                        <div className="space-y-4">
                                            {product.custom_options.map((option, idx) => (
                                                <div key={idx}>
                                                    <label className="block text-sm font-semibold mb-2" style={{ color: '#191c1d' }}>
                                                        {option.label || option.name}
                                                        {option.required && <span className="ml-1" style={{ color: '#ba1a1a' }}>*</span>}
                                                    </label>
                                                    {option.type === 'checkbox' && (
                                                        <div className="flex items-center gap-3">
                                                            <input type="checkbox"
                                                                checked={customOptions[option.name] === 'ya'}
                                                                onChange={(e) => handleCustomOptionChange(option.name, e.target.checked ? 'ya' : '')}
                                                                className="w-5 h-5 rounded accent-[#005bbf]" />
                                                            <span className="text-sm" style={{ color: '#414754' }}>Ya</span>
                                                        </div>
                                                    )}
                                                    {option.type === 'text' && (
                                                        <input type="text"
                                                            value={customOptions[option.name] || ''}
                                                            onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                                                            className="w-full px-4 py-3 text-sm rounded-xl border-none outline-none"
                                                            style={{ background: '#f3f4f5', color: '#191c1d' }}
                                                            placeholder={option.placeholder || `Masukkan ${option.name}`} />
                                                    )}
                                                    {option.type === 'select' && option.options && (
                                                        <select
                                                            value={customOptions[option.name] || ''}
                                                            onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                                                            className="w-full px-4 py-3 text-sm rounded-xl border-none outline-none"
                                                            style={{ background: '#f3f4f5', color: '#191c1d' }}>
                                                            <option value="">Pilih {option.name}</option>
                                                            {option.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                                        </select>
                                                    )}
                                                    {option.type === 'textarea' && (
                                                        <textarea
                                                            value={customOptions[option.name] || ''}
                                                            onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                                                            rows={3}
                                                            className="w-full px-4 py-3 text-sm rounded-xl border-none outline-none resize-none"
                                                            style={{ background: '#f3f4f5', color: '#191c1d' }}
                                                            placeholder={option.placeholder || `Masukkan ${option.name}`} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Quantity */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: '#191c1d' }}>Jumlah</label>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                                                style={{ background: '#f3f4f5' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#e8eaed'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#f3f4f5'}>
                                                <Minus className="w-4 h-4" style={{ color: '#191c1d' }} />
                                            </button>
                                            <input type="number" value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-16 text-center text-sm font-bold rounded-xl border-none outline-none py-2"
                                                style={{ background: '#f3f4f5', color: '#191c1d' }}
                                                min="1" />
                                            <button onClick={() => setQuantity(quantity + 1)}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                                                style={{ background: '#f3f4f5' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#e8eaed'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#f3f4f5'}>
                                                <Plus className="w-4 h-4" style={{ color: '#191c1d' }} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Add to Cart */}
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={!selectedVariant || (isCoworkingBooking && (!bookingData.date || !bookingData.startTime))}
                                        className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-opacity"
                                        style={{
                                            background: 'linear-gradient(135deg, #005bbf 0%, #1a73e8 100%)',
                                            color: '#fff',
                                            opacity: (!selectedVariant || (isCoworkingBooking && (!bookingData.date || !bookingData.startTime))) ? 0.5 : 1,
                                            cursor: (!selectedVariant || (isCoworkingBooking && (!bookingData.date || !bookingData.startTime))) ? 'not-allowed' : 'pointer',
                                        }}>
                                        <ShoppingCart className="w-5 h-5" />
                                        {!selectedVariant
                                            ? 'Pilih Paket Terlebih Dahulu'
                                            : isCoworkingBooking && (!bookingData.date || !bookingData.startTime)
                                                ? 'Pilih Tanggal & Waktu'
                                                : 'Tambah ke Keranjang'}
                                    </button>

                                    {/* Hubungi Sales */}
                                    <a
                                        href="https://wa.me/6281234567890"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors"
                                        style={{ border: '1.5px solid #005bbf', color: '#005bbf', background: 'transparent' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,91,191,0.05)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                        <MessageCircle className="w-5 h-5" />
                                        Hubungi Sales
                                    </a>

                                    {/* Accordions */}
                                    <div className="space-y-2 pt-2">
                                        {[
                                            { title: 'Administrasi', body: 'Kami membutuhkan informasi serta dokumen terkait PIC dan perusahaan Anda. Hubungi kami untuk informasi lebih lanjut.' },
                                            { title: 'Kesepakatan', body: 'Silakan hubungi kami untuk informasi mengenai kesepakatan dan ketentuan layanan.' },
                                        ].map(({ title, body }) => (
                                            <details key={title} className="rounded-xl overflow-hidden" style={{ background: '#f3f4f5' }}>
                                                <summary className="flex justify-between items-center px-4 py-3 cursor-pointer font-semibold text-sm"
                                                    style={{ color: '#191c1d', listStyle: 'none' }}>
                                                    {title}
                                                    <span className="text-lg leading-none" style={{ color: '#414754' }}>+</span>
                                                </summary>
                                                <div className="px-4 pb-3 text-sm leading-relaxed" style={{ color: '#414754' }}>{body}</div>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── REVIEWS SECTION ── */}
            <div id="ulasan" className="py-16" style={{ background: '#f3f4f5' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>
                        Ulasan Pelanggan
                    </h2>

                    {flash?.success && (
                        <div className="mb-6 px-4 py-3 rounded-xl text-sm" style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#2e7d32' }}>
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 px-4 py-3 rounded-xl text-sm" style={{ background: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828' }}>
                            {flash.error}
                        </div>
                    )}

                    {/* Rating Summary */}
                    {(() => {
                        const starCounts = [5,4,3,2,1].map(s => ({ star: s, count: reviews.filter(r => r.rating === s).length }));
                        return (
                            <div className="rounded-2xl p-6 sm:p-8 mb-8" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                                <div className="flex flex-col sm:flex-row items-start gap-8">
                                    <div className="flex flex-col items-center sm:items-start gap-3 sm:min-w-[180px]">
                                        <div className="flex items-end gap-2">
                                            <span className="text-6xl font-extrabold leading-none" style={{ color: '#191c1d' }}>{avgRating ?? '0'}</span>
                                            <span className="text-xl mb-1" style={{ color: '#9ca3af' }}>/ 5</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {[1,2,3,4,5].map(s => (
                                                <Star key={s} className={`w-6 h-6 ${s <= Math.round(avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-sm" style={{ color: '#414754' }}>{reviewCount} ulasan</span>
                                        {canReview && !userHasReviewed && (
                                            <button onClick={() => setShowReviewForm(v => !v)}
                                                className="mt-2 px-5 py-2 rounded-full text-sm font-semibold transition-colors"
                                                style={{ background: '#fbbf24', color: '#191c1d' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f59e0b'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#fbbf24'}>
                                                {showReviewForm ? 'Tutup Form' : 'Tulis Ulasan'}
                                            </button>
                                        )}
                                        {!auth?.user && (
                                            <a href="/login" className="mt-2 px-5 py-2 rounded-full text-sm font-semibold transition-colors"
                                                style={{ background: '#fbbf24', color: '#191c1d' }}>
                                                Tulis Ulasan
                                            </a>
                                        )}
                                        {userHasReviewed && (
                                            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
                                                style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                                                <Star className="w-3.5 h-3.5 fill-green-500 text-green-500" /> Sudah diulas
                                            </span>
                                        )}
                                    </div>
                                    <div className="hidden sm:block w-px self-stretch" style={{ background: '#f0f1f5' }} />
                                    <div className="flex-1 space-y-2.5 w-full">
                                        {starCounts.map(({ star, count }) => (
                                            <div key={star} className="flex items-center gap-3">
                                                <div className="flex gap-0.5 w-24 flex-shrink-0">
                                                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= star ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />)}
                                                </div>
                                                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: '#f0f1f5' }}>
                                                    <div className="h-full rounded-full transition-all duration-500 bg-yellow-400"
                                                        style={{ width: reviewCount > 0 ? `${(count / reviewCount) * 100}%` : '0%' }} />
                                                </div>
                                                <span className="text-sm w-6 text-right font-medium" style={{ color: '#414754' }}>{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Review Form */}
                    {canReview && !userHasReviewed && showReviewForm && (
                        <div className="rounded-2xl p-6 mb-8 max-w-xl" style={{ background: '#fff', boxShadow: '0 8px 24px -8px rgba(25,28,29,0.08)' }}>
                            <h3 className="font-bold text-lg mb-5" style={{ color: '#191c1d' }}>Tulis Ulasan Anda</h3>
                            <div className="mb-5">
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#191c1d' }}>Rating</label>
                                <StarRating value={reviewRating} onChange={setReviewRating} />
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#191c1d' }}>Komentar</label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    rows={4} maxLength={1000}
                                    placeholder="Ceritakan pengalaman Anda menggunakan produk ini..."
                                    className="w-full text-sm p-3.5 rounded-xl border-none outline-none resize-none"
                                    style={{ background: '#f3f4f5', color: '#191c1d' }}
                                />
                                <p className="text-xs text-right mt-1" style={{ color: '#9ca3af' }}>{reviewComment.length}/1000</p>
                            </div>
                            <button
                                disabled={reviewSubmitting || !reviewComment.trim()}
                                onClick={() => {
                                    setReviewSubmitting(true);
                                    router.post('/reviews', { product_id: product.id, rating: reviewRating, comment: reviewComment }, {
                                        preserveScroll: true,
                                        onFinish: () => setReviewSubmitting(false),
                                        onSuccess: () => { setReviewComment(''); setShowReviewForm(false); },
                                    });
                                }}
                                className="px-7 py-2.5 rounded-full text-sm font-semibold transition-opacity"
                                style={{ background: '#191c1d', color: '#fff', opacity: (reviewSubmitting || !reviewComment.trim()) ? 0.5 : 1 }}>
                                {reviewSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
                            </button>
                        </div>
                    )}

                    {/* Review List */}
                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <div className="text-center py-16 rounded-2xl" style={{ background: '#fff' }}>
                                <Star className="w-12 h-12 mx-auto mb-3 fill-gray-100 text-gray-200" />
                                <p className="font-medium" style={{ color: '#9ca3af' }}>Belum ada ulasan untuk produk ini.</p>
                                <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Jadilah yang pertama memberikan ulasan!</p>
                            </div>
                        ) : reviews.map((review) => (
                            <div key={review.id} className="rounded-2xl p-5 sm:p-6 transition-shadow hover:shadow-md"
                                style={{ background: '#fff', boxShadow: '0 2px 8px rgba(25,28,29,0.06)', border: '1px solid #f0f1f5' }}>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                                            <span className="text-white font-bold text-sm">{review.user.name?.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm leading-tight" style={{ color: '#191c1d' }}>{review.user.name}</p>
                                            <div className="flex gap-0.5 mt-1">
                                                {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-xs" style={{ color: '#9ca3af' }}>{review.created_at}</span>
                                        {review.is_mine && (
                                            <button
                                                onClick={() => { if (confirm('Hapus ulasan ini?')) router.delete(`/reviews/${review.id}`, { preserveScroll: true }); }}
                                                className="text-xs font-medium transition-colors"
                                                style={{ color: '#ba1a1a' }}>
                                                Hapus
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="text-sm leading-relaxed pl-13" style={{ color: '#414754', paddingLeft: '52px' }}>{review.comment}</p>
                                )}
                                {review.admin_reply && (
                                    <div className="mt-4 py-3 px-4 rounded-xl" style={{ background: 'rgba(0,91,191,0.06)', border: '1px solid rgba(0,91,191,0.12)', marginLeft: '52px' }}>
                                        <p className="text-xs font-semibold mb-1" style={{ color: '#005bbf' }}>Balasan dari Tim Kaspa</p>
                                        <p className="text-sm" style={{ color: '#414754' }}>{review.admin_reply}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
};

export default ProductShow;
