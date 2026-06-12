import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, Wifi, Coffee, Lock, Monitor, ShoppingCart, ChevronDown } from 'lucide-react';
import { IMAGE_PLACEHOLDER } from '@/utils/placeholders';
import BookingDateTimePicker from '@/Components/BookingDateTimePicker';

const getImg = (src) => {
    if (!src) return IMAGE_PLACEHOLDER;
    if (src.startsWith('http')) return src;
    return `/storage/${src}`;
};

export default function ProductModal({ product, isOpen, onClose, onAddToCart }) {
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity]               = useState(1);
    const [customOptions, setCustomOptions]     = useState({});
    const [bookingData, setBookingData]         = useState({ date: null, startTime: null, endTime: null });

    useEffect(() => {
        if (isOpen && product) {
            setSelectedVariant(null);
            setQuantity(1);
            setCustomOptions({});
            setBookingData({ date: null, startTime: null, endTime: null });

            if (product.variants && product.variants.length > 0) {
                const isBooking = ['share_desk', 'private_room', 'meeting_room', 'private_office', 'virtual_office'].includes(product.product_type);
                const first = product.variants.find(v =>
                    v.is_active && (isBooking || !v.manage_stock || v.stock_quantity > 0)
                );
                if (first) setSelectedVariant(first);
            }
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const isHourlyBooking   = ['share_desk', 'private_room', 'meeting_room'].includes(product.product_type);
    const isDateOnlyBooking = ['private_office', 'virtual_office'].includes(product.product_type);
    const isCoworkingBooking = isHourlyBooking || isDateOnlyBooking;

    let productCustomOptions = [];
    try {
        if (product.custom_options) {
            const raw = typeof product.custom_options === 'string'
                ? JSON.parse(product.custom_options)
                : product.custom_options;
            productCustomOptions = raw.map(o => ({
                name:        o.name || o.question || o.label || '',
                label:       o.label || o.question || o.name || '',
                type:        o.type || 'text',
                required:    o.required || false,
                placeholder: o.placeholder || null,
                options:     o.options || null,
            }));
        }
    } catch { productCustomOptions = []; }

    const rooms = product.rooms || [];

    const handleCustomOptionChange = (name, value) =>
        setCustomOptions(prev => ({ ...prev, [name]: value }));

    const handleAddToCart = () => {
        if (!selectedVariant) { alert('Silakan pilih paket terlebih dahulu'); return; }
        if (isHourlyBooking && (!bookingData.date || !bookingData.startTime)) {
            alert('Silakan pilih tanggal dan waktu booking'); return;
        }
        if (isDateOnlyBooking && !bookingData.date) {
            alert('Silakan pilih tanggal mulai sewa'); return;
        }
        if (isCoworkingBooking && rooms.length > 0 && !bookingData.roomId) {
            alert('Silakan pilih ruangan terlebih dahulu'); return;
        }
        if (isCoworkingBooking && bookingData._pendingUnit) {
            alert('Silakan pilih unit ruangan terlebih dahulu'); return;
        }

        router.post('/cart/add', {
            product_id:          product.id,
            product_name:        product.title,
            product_type:        product.product_type || null,
            variant_id:          selectedVariant.id,
            variant_name:        selectedVariant.name,
            custom_options:      customOptions,
            quantity,
            price:               selectedVariant.price,
            booking_date:        bookingData.date || null,
            booking_start_time:  bookingData.startTime || null,
            room_id:             bookingData.roomId || null,
            unit_index:          bookingData.unitIndex ?? null,
            unit_name:           bookingData.unitName || null,
        }, {
            preserveScroll: true,
            onSuccess: () => { onClose(); if (onAddToCart) onAddToCart(); },
            onError: (errors) => {
                const msg = errors.booking || errors.stock || errors.product_id || Object.values(errors)[0] || 'Gagal menambahkan ke keranjang';
                alert(msg);
            },
        });
    };

    const productImage = product.images && product.images.length > 0
        ? getImg(product.images[0])
        : IMAGE_PLACEHOLDER;

    const displayPrice = selectedVariant
        ? Number(selectedVariant.price)
        : (product.variants?.length > 0 ? Number(product.variants[0].price) : Number(product.base_price || 0));

    const isDisabled = !selectedVariant
        || (isHourlyBooking && (!bookingData.date || !bookingData.startTime))
        || (isDateOnlyBooking && !bookingData.date)
        || (isCoworkingBooking && rooms.length > 0 && !bookingData.roomId)
        || (isCoworkingBooking && bookingData._pendingUnit);

    const btnLabel = !selectedVariant
        ? 'Pilih Paket Terlebih Dahulu'
        : isHourlyBooking && (!bookingData.date || !bookingData.startTime)
            ? 'Pilih Tanggal & Waktu Booking'
            : isDateOnlyBooking && !bookingData.date
                ? 'Pilih Tanggal Mulai Sewa'
                : isCoworkingBooking && rooms.length > 0 && !bookingData.roomId
                    ? 'Pilih Ruangan'
                    : isCoworkingBooking && bookingData._pendingUnit
                        ? 'Pilih Unit Ruangan'
                        : 'Konfirmasi Pesanan';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(10,12,13,0.72)', backdropFilter: 'blur(6px)' }}>

            {/* Floating Close Button */}
            <button onClick={onClose}
                className="absolute top-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}>
                <X className="w-5 h-5" style={{ color: '#414754' }} />
            </button>

            {/* Modal Container */}
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
                style={{
                    maxWidth: '960px',
                    maxHeight: '92vh',
                    background: '#f3f4f5',
                }}>

                {/* ── LEFT: Immersive Image Panel ── */}
                <div className="hidden lg:block relative flex-shrink-0" style={{ width: '42%' }}>
                    <img
                        src={productImage}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = IMAGE_PLACEHOLDER; }}
                        style={{ minHeight: '520px' }}
                    />
                    <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(10,12,13,0.85) 0%, rgba(10,12,13,0.30) 50%, rgba(10,12,13,0.10) 100%)' }} />

                    {/* Badge */}
                    {(product.promo_label || product.is_featured) && (
                        <div className="absolute top-6 left-6">
                            <span className="text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider"
                                style={{
                                    background: product.promo_label ? '#ba1a1a' : '#006876',
                                    color: '#fff',
                                }}>
                                {product.promo_label || 'Populer'}
                            </span>
                        </div>
                    )}

                    {/* Bottom overlay text */}
                    <div className="absolute bottom-10 left-8 right-8">
                        <h2 className="font-extrabold text-white mb-2 leading-tight"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem' }}>
                            {product.title}
                        </h2>
                        {product.subtitle && (
                            <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                {product.subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: Booking Form Panel ── */}
                <div className="flex-1 overflow-y-auto relative" style={{ background: '#f3f4f5' }}>
                    {/* Decorative blur orbs */}
                    <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full pointer-events-none"
                        style={{ background: 'rgba(0,91,191,0.06)', filter: 'blur(48px)' }} />
                    <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none"
                        style={{ background: 'rgba(43,91,181,0.05)', filter: 'blur(64px)' }} />

                    {/* Glass Card */}
                    <div className="relative z-10 m-4 lg:m-8 rounded-3xl p-6 lg:p-8"
                        style={{
                            background: 'rgba(255,255,255,0.75)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.5)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                        }}>

                        {/* Mobile product name */}
                        <div className="lg:hidden mb-4 flex items-start gap-3">
                            <img src={productImage} alt={product.title}
                                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                onError={(e) => { e.target.src = IMAGE_PLACEHOLDER; }} />
                            <div>
                                <h2 className="font-extrabold text-lg leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>
                                    {product.title}
                                </h2>
                                {product.subtitle && <p className="text-sm mt-0.5" style={{ color: '#414754' }}>{product.subtitle}</p>}
                            </div>
                        </div>

                        {/* Price Header */}
                        <div className="mb-7">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
                                style={{ background: 'rgba(0,91,191,0.10)', color: '#005bbf' }}>
                                {product.category?.name || 'Kaspa Space'}
                            </span>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-extrabold tracking-tight leading-none"
                                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#191c1d' }}>
                                    Rp{displayPrice.toLocaleString('id-ID')}
                                </span>
                                {selectedVariant?.name && (
                                    <span className="font-medium text-base" style={{ color: '#414754' }}>
                                        {selectedVariant.compare_price && Number(selectedVariant.compare_price) > displayPrice && (
                                            <span className="line-through mr-2 text-sm" style={{ color: '#9ca3af' }}>
                                                Rp{Number(selectedVariant.compare_price).toLocaleString('id-ID')}
                                            </span>
                                        )}
                                        {selectedVariant.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Variant Select */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: '#414754' }}>
                                        Pilihan Paket Layanan
                                    </label>
                                    <div className="relative group">
                                        <select
                                            value={selectedVariant?.id || ''}
                                            onChange={(e) => {
                                                const v = product.variants.find(v => v.id === parseInt(e.target.value));
                                                if (v) setSelectedVariant(v);
                                            }}
                                            className="w-full appearance-none rounded-2xl py-4 px-5 pr-12 font-semibold transition-all cursor-pointer outline-none"
                                            style={{
                                                background: 'rgba(255,255,255,0.55)',
                                                border: '1px solid rgba(193,198,214,0.35)',
                                                color: '#191c1d',
                                                fontSize: '0.925rem',
                                            }}
                                            onFocus={e => { e.target.style.background = '#fff'; e.target.style.border = '1.5px solid #005bbf'; }}
                                            onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.55)'; e.target.style.border = '1px solid rgba(193,198,214,0.35)'; }}>
                                            {product.variants.map((v) => (
                                                <option key={v.id} value={v.id}
                                                    disabled={!v.is_active || (!isCoworkingBooking && v.manage_stock && v.stock_quantity <= 0)}>
                                                    {v.name} — Rp{Number(v.price).toLocaleString('id-ID')}
                                                    {!v.is_active || (!isCoworkingBooking && v.manage_stock && v.stock_quantity <= 0) ? ' (Habis)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4" style={{ color: '#414754' }} />
                                    </div>
                                </div>
                            )}

                            {/* Booking Date/Time Picker */}
                            {isCoworkingBooking && selectedVariant && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: '#414754' }}>
                                        {isDateOnlyBooking ? 'Mulai Masa Sewa' : 'Tanggal & Waktu Booking'}
                                    </label>
                                    <BookingDateTimePicker
                                        productId={product.id}
                                        selectedVariant={selectedVariant}
                                        onBookingChange={setBookingData}
                                        dateOnly={isDateOnlyBooking}
                                        productOpen={product.open_time || null}
                                        productClose={product.close_time || null}
                                        rooms={rooms}
                                    />
                                </div>
                            )}

                            {/* Custom Options */}
                            {productCustomOptions.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#414754' }}>Opsi Tambahan</h3>
                                    {productCustomOptions.map((option, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: '#414754' }}>
                                                {option.label || option.name}
                                                {option.required && <span className="ml-1" style={{ color: '#ba1a1a' }}>*</span>}
                                            </label>
                                            {option.type === 'checkbox' && (
                                                <div className="flex items-center gap-3">
                                                    <input type="checkbox"
                                                        checked={customOptions[option.name] === 'tidak'}
                                                        onChange={(e) => handleCustomOptionChange(option.name, e.target.checked ? 'tidak' : '')}
                                                        className="w-5 h-5 rounded accent-[#005bbf]" />
                                                    <span className="text-sm font-medium" style={{ color: '#414754' }}>Ya</span>
                                                </div>
                                            )}
                                            {option.type === 'text' && (
                                                <input type="text"
                                                    value={customOptions[option.name] || ''}
                                                    onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                                                    className="w-full rounded-2xl py-4 px-5 font-medium outline-none transition-all"
                                                    style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(193,198,214,0.35)', color: '#191c1d', fontSize: '0.925rem' }}
                                                    onFocus={e => { e.target.style.background = '#fff'; e.target.style.border = '1.5px solid #005bbf'; }}
                                                    onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.55)'; e.target.style.border = '1px solid rgba(193,198,214,0.35)'; }}
                                                    placeholder={option.placeholder || `Masukkan ${option.name}`} />
                                            )}
                                            {option.type === 'select' && option.options && (
                                                <div className="relative">
                                                    <select
                                                        value={customOptions[option.name] || ''}
                                                        onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                                                        className="w-full appearance-none rounded-2xl py-4 px-5 pr-12 font-medium outline-none transition-all cursor-pointer"
                                                        style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(193,198,214,0.35)', color: '#191c1d', fontSize: '0.925rem' }}
                                                        onFocus={e => { e.target.style.background = '#fff'; e.target.style.border = '1.5px solid #005bbf'; }}
                                                        onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.55)'; e.target.style.border = '1px solid rgba(193,198,214,0.35)'; }}>
                                                        <option value="">Pilih {option.name}</option>
                                                        {option.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4" style={{ color: '#414754' }} />
                                                </div>
                                            )}
                                            {option.type === 'textarea' && (
                                                <textarea
                                                    value={customOptions[option.name] || ''}
                                                    onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                                                    rows={2}
                                                    className="w-full rounded-2xl py-4 px-5 font-medium outline-none transition-all resize-none"
                                                    style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(193,198,214,0.35)', color: '#191c1d', fontSize: '0.925rem' }}
                                                    onFocus={e => { e.target.style.background = '#fff'; e.target.style.border = '1.5px solid #005bbf'; }}
                                                    onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.55)'; e.target.style.border = '1px solid rgba(193,198,214,0.35)'; }}
                                                    placeholder={option.placeholder || `Masukkan ${option.name}`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Amenities Strip */}
                            <div className="py-5" style={{ borderTop: '1px solid rgba(193,198,214,0.25)', borderBottom: '1px solid rgba(193,198,214,0.25)' }}>
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#414754' }}>Fasilitas Premium</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { icon: Wifi,    label: 'Wi-Fi 100 Mbps' },
                                        { icon: Monitor, label: 'Layar Presentasi' },
                                        { icon: Coffee,  label: 'Pantry & Minuman' },
                                        { icon: Lock,    label: 'Akses Aman' },
                                    ].map(({ icon: Icon, label }) => (
                                        <div key={label} className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ background: 'rgba(0,91,191,0.08)' }}>
                                                <Icon className="w-4 h-4" style={{ color: '#005bbf' }} />
                                            </div>
                                            <span className="text-sm font-medium" style={{ color: '#414754' }}>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity (hidden for booking products) */}
                            {!isCoworkingBooking && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: '#414754' }}>Jumlah</label>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-11 h-11 rounded-xl font-bold text-lg transition-colors flex items-center justify-center"
                                            style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(193,198,214,0.35)', color: '#191c1d' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fff'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.55)'}>
                                            −
                                        </button>
                                        <input type="number" value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-16 text-center font-bold rounded-xl py-2.5 outline-none"
                                            style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(193,198,214,0.35)', color: '#191c1d' }}
                                            min="1" />
                                        <button onClick={() => setQuantity(quantity + 1)}
                                            className="w-11 h-11 rounded-xl font-bold text-lg transition-colors flex items-center justify-center"
                                            style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(193,198,214,0.35)', color: '#191c1d' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fff'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.55)'}>
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* CTA Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={isDisabled}
                                className="w-full rounded-2xl py-5 px-8 font-bold text-lg flex items-center justify-center gap-2.5 transition-all duration-300"
                                style={{
                                    background: isDisabled ? '#c1c6d6' : '#005bbf',
                                    color: '#fff',
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    boxShadow: isDisabled ? 'none' : '0 12px 32px rgba(0,91,191,0.25)',
                                }}
                                onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.background = '#1a73e8'; }}
                                onMouseLeave={e => { if (!isDisabled) e.currentTarget.style.background = '#005bbf'; }}>
                                <ShoppingCart className="w-5 h-5" />
                                {btnLabel}
                            </button>

                            {/* Footer Disclaimer */}
                            <p className="text-center text-xs" style={{ color: '#727785' }}>
                                *Dengan mengonfirmasi, Anda menyetujui{' '}
                                <a href="#" className="hover:underline underline-offset-4" style={{ color: '#005bbf' }}>
                                    Syarat &amp; Ketentuan Layanan
                                </a>{' '}
                                Kaspa Space.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
