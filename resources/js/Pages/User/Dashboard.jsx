import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import {
    ShoppingBag, Receipt, Tag, TrendingUp, CheckCircle, Clock,
    XCircle, ShieldCheck, ShieldAlert, X, Bell, CalendarCheck,
    Download, Star, Copy, Check, CreditCard
} from 'lucide-react';

export default function UserDashboard({ orders, activeDiscounts, stats, agreement, termsAgreement, privacyAgreement, reviewedProductIds = [] }) {
    const [showModal, setShowModal]             = useState(null);
    const [completedBookings, setCompletedBookings] = useState([]);
    const [dismissedNotif, setDismissedNotif]   = useState(false);
    const [now, setNow]                         = useState(new Date());
    const [copiedCode, setCopiedCode]           = useState(null);

    const termsContent   = termsAgreement?.content   || [];
    const privacyContent = privacyAgreement?.content || [];

    const playNotificationSound = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            [523, 659, 784].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = 'sine'; osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.18);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.4);
                osc.start(ctx.currentTime + i * 0.18);
                osc.stop(ctx.currentTime + i * 0.18 + 0.4);
            });
        } catch (e) {}
    };

    const isBookingActive = (order, currentTime = now) => {
        if (order.payment_status !== 'paid') return false;
        return order.items.some(item => {
            if (!item.booking_start_at || !item.booking_end_at) return false;
            const start = new Date(item.booking_start_at);
            const end   = new Date(item.booking_end_at);
            return start <= currentTime && currentTime < end;
        });
    };

    const isBookingDone = (order, currentTime = now) => {
        if (order.payment_status !== 'paid') return false;
        const bookingItems = order.items.filter(item => item.booking_end_at);
        if (bookingItems.length === 0) return false;
        return bookingItems.every(item => new Date(item.booking_end_at) < currentTime);
    };

    const getToleranceEndTime = (order) => {
        const endTimes = order.items.filter(i => i.booking_end_at).map(i => new Date(i.booking_end_at));
        if (endTimes.length === 0) return null;
        return new Date(Math.max(...endTimes) + 10 * 60 * 1000);
    };

    useEffect(() => {
        const current  = new Date();
        const oneDayAgo = new Date(current - 24 * 60 * 60 * 1000);
        const recent = orders
            .filter(order => order.payment_status === 'paid' &&
                order.items.some(item => {
                    if (!item.booking_end_at) return false;
                    const endTime = new Date(item.booking_end_at);
                    return endTime >= oneDayAgo && endTime <= current;
                }))
            .sort((a, b) => {
                const latestA = Math.max(...a.items.filter(i => i.booking_end_at).map(i => new Date(i.booking_end_at)));
                const latestB = Math.max(...b.items.filter(i => i.booking_end_at).map(i => new Date(i.booking_end_at)));
                return latestB - latestA;
            })
            .slice(0, 1);
        setCompletedBookings(recent);

        const timers = [];
        orders.forEach(order => {
            if (order.payment_status !== 'paid') return;
            order.items.forEach(item => {
                if (!item.booking_end_at) return;
                const endTime = new Date(item.booking_end_at);
                const delay   = endTime - new Date();
                if (delay > 0 && delay < 25 * 60 * 60 * 1000) {
                    timers.push(setTimeout(() => {
                        setNow(new Date());
                        setDismissedNotif(false);
                        setCompletedBookings([order]);
                        playNotificationSound();
                    }, delay));
                }
            });
        });
        const interval = setInterval(() => setNow(new Date()), 30000);
        return () => { timers.forEach(t => clearTimeout(t)); clearInterval(interval); };
    }, [orders]);

    const getStatusBadge = (paymentStatus, order = null) => {
        if (order && isBookingActive(order)) return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#d1fae5', color: '#065f46' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Berlangsung
            </span>
        );
        if (order && isBookingDone(order)) return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#d1fae5', color: '#065f46' }}>
                <CalendarCheck className="w-3 h-3" />Selesai
            </span>
        );
        if (paymentStatus === 'paid') return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#d1fae5', color: '#065f46' }}>
                <CheckCircle className="w-3 h-3" />Dibayar
            </span>
        );
        if (paymentStatus === 'cancelled') return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#fee2e2', color: '#991b1b' }}>
                <XCircle className="w-3 h-3" />Dibatalkan
            </span>
        );
        if (paymentStatus === 'refunded') return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#f3f4f6', color: '#374151' }}>
                <XCircle className="w-3 h-3" />Refund
            </span>
        );
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#fef3c7', color: '#92400e' }}>
                <Clock className="w-3 h-3" />Menunggu Bayar
            </span>
        );
    };

    const fmtCurrency = (amount) => `Rp${Number(amount).toLocaleString('id-ID')}`;

    const fmtDate = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const fmtTime = (dateStr) => new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const latestActiveOrder = orders.find(o => isBookingActive(o)) || null;
    const notifOrder = latestActiveOrder || (completedBookings.length > 0 ? completedBookings[0] : null);
    const notifIsActive = !!latestActiveOrder;

    const isVerified = agreement?.agreed_terms && agreement?.agreed_privacy;

    return (
        <>
            <Head title="Dashboard" />
            <Navbar />

            <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                    {/* ── HEADER ── */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="font-bold mb-1"
                                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', color: '#191c1d' }}>
                                Dashboard Saya
                            </h1>
                            <p className="text-sm" style={{ color: '#6b7280' }}>
                                Kelola pesanan, lihat riwayat, dan temukan penawaran terbaik untuk ruang kerja Anda.
                            </p>
                        </div>
                        {agreement && (
                            <div className="flex-shrink-0">
                                {isVerified ? (
                                    <button onClick={() => setShowModal('terms')}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer"
                                        style={{ background: '#d1fae5', color: '#065f46' }}>
                                        <CheckCircle className="w-4 h-4" />
                                        Akun Terverifikasi
                                    </button>
                                ) : (
                                    <button onClick={() => setShowModal('terms')}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                                        style={{ background: '#fef3c7', color: '#92400e' }}>
                                        <ShieldAlert className="w-4 h-4" />
                                        Agreement Belum Lengkap
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── STATS ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                        {/* Total Pesanan */}
                        <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(193,198,214,0.2)', boxShadow: '0 4px 16px rgba(25,28,29,0.05)' }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: 'rgba(0,91,191,0.08)' }}>
                                <ShoppingBag className="w-6 h-6" style={{ color: '#005bbf' }} />
                            </div>
                            <p className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>Total Pesanan</p>
                            <p className="font-bold" style={{ fontSize: '2rem', color: '#191c1d', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {stats.totalOrders}
                            </p>
                        </div>

                        {/* Pesanan Selesai */}
                        <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(193,198,214,0.2)', boxShadow: '0 4px 16px rgba(25,28,29,0.05)' }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: 'rgba(16,185,129,0.08)' }}>
                                <CheckCircle className="w-6 h-6" style={{ color: '#10b981' }} />
                            </div>
                            <p className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>Pesanan Selesai</p>
                            <p className="font-bold" style={{ fontSize: '2rem', color: '#191c1d', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {stats.completedOrders}
                            </p>
                        </div>

                        {/* Total Belanja — blue card */}
                        <div className="rounded-2xl p-6" style={{ background: '#005bbf', boxShadow: '0 8px 24px rgba(0,91,191,0.25)' }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: 'rgba(255,255,255,0.15)' }}>
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>Total Belanja</p>
                            <p className="font-bold text-white" style={{ fontSize: '1.6rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {fmtCurrency(stats.totalSpent)}
                            </p>
                        </div>
                    </div>

                    {/* ── NOTIFIKASI BOOKING ── */}
                    {notifOrder && !dismissedNotif && (
                        <div className="mb-6 rounded-2xl p-4 flex items-start gap-3"
                            style={{
                                background: notifIsActive ? '#f0fdf4' : '#f0fdfa',
                                border: `1px solid ${notifIsActive ? '#bbf7d0' : '#99f6e4'}`,
                            }}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: notifIsActive ? '#d1fae5' : '#ccfbf1' }}>
                                <Bell className="w-4 h-4" style={{ color: notifIsActive ? '#059669' : '#0d9488' }} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold" style={{ color: notifIsActive ? '#065f46' : '#134e4a' }}>
                                    {notifIsActive ? '● Sesi booking Anda sedang berlangsung!' : 'Sesi booking Anda telah selesai!'}
                                </p>
                                <ul className="mt-1 space-y-0.5">
                                    {notifOrder.items.filter(i => i.booking_end_at).map(i => (
                                        <li key={i.id} className="text-xs" style={{ color: notifIsActive ? '#047857' : '#0f766e' }}>
                                            • {i.product_name}{i.variant_name ? ` - ${i.variant_name}` : ''}
                                            {i.booking_start_at && i.booking_end_at && (
                                                <span className="ml-1 opacity-75">({fmtTime(i.booking_start_at)} – {fmtTime(i.booking_end_at)})</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button onClick={() => setDismissedNotif(true)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* ── MAIN GRID ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── PESANAN TERBARU ── */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl overflow-hidden"
                                style={{ background: '#fff', border: '1px solid rgba(193,198,214,0.2)', boxShadow: '0 4px 16px rgba(25,28,29,0.05)' }}>
                                <div className="flex items-center justify-between px-6 py-4"
                                    style={{ borderBottom: '1px solid rgba(193,198,214,0.2)' }}>
                                    <h2 className="font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.05rem', color: '#191c1d' }}>
                                        Pesanan Terbaru
                                    </h2>
                                    <Link href="/orders" className="text-sm font-semibold hover:underline" style={{ color: '#005bbf' }}>
                                        Lihat Semua
                                    </Link>
                                </div>

                                {orders.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                            style={{ background: 'rgba(0,91,191,0.06)' }}>
                                            <Receipt className="w-8 h-8" style={{ color: '#005bbf' }} />
                                        </div>
                                        <p className="font-semibold mb-1" style={{ color: '#191c1d' }}>Belum ada pesanan</p>
                                        <p className="text-sm mb-5" style={{ color: '#6b7280' }}>Mulai berbelanja sekarang!</p>
                                        <Link href="/"
                                            className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                                            style={{ background: '#005bbf' }}>
                                            Mulai Belanja
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y" style={{ borderColor: 'rgba(193,198,214,0.15)' }}>
                                        {orders.map((order) => (
                                            <div key={order.id} className="px-6 py-5">
                                                {/* Order header */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: '#9aa0b4' }}>
                                                            Order ID
                                                        </p>
                                                        <p className="text-sm font-bold" style={{ color: '#005bbf' }}>
                                                            #{order.order_number || `ORD-${order.id}`}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs" style={{ color: '#9aa0b4' }}>{fmtDate(order.created_at)}</span>
                                                        {getStatusBadge(order.payment_status, order)}
                                                    </div>
                                                </div>

                                                {/* Items */}
                                                <div className="space-y-1.5 mb-4">
                                                    {order.items.slice(0, 2).map((item) => (
                                                        <div key={item.id}>
                                                            <p className="text-sm font-semibold" style={{ color: '#191c1d' }}>
                                                                {item.quantity}x {item.product_name}
                                                                {item.variant_name && ` - ${item.variant_name}`}
                                                            </p>
                                                            {item.booking_start_at && item.booking_end_at && (
                                                                <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#6b7280' }}>
                                                                    <Clock className="w-3 h-3" />
                                                                    {fmtTime(item.booking_start_at)} - {fmtTime(item.booking_end_at)} WIB
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {order.items.length > 2 && (
                                                        <p className="text-xs" style={{ color: '#9aa0b4' }}>
                                                            +{order.items.length - 2} produk lainnya
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Ulasan buttons */}
                                                {order.payment_status === 'paid' && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {order.items.map((item) => {
                                                            if (!item.product?.slug) return null;
                                                            const reviewed = reviewedProductIds.includes(item.product_id);
                                                            return (
                                                                <a key={item.id}
                                                                    href={`/product/${item.product.slug}#ulasan`}
                                                                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
                                                                    style={reviewed
                                                                        ? { background: '#fef3c7', color: '#92400e' }
                                                                        : { background: 'rgba(0,91,191,0.08)', color: '#005bbf' }}>
                                                                    <Star className="w-3 h-3" />
                                                                    {reviewed ? 'Lihat Ulasan' : 'Tulis Ulasan'}
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Footer row */}
                                                <div className="flex items-center justify-between pt-3"
                                                    style={{ borderTop: '1px solid rgba(193,198,214,0.15)' }}>
                                                    <div>
                                                        <p className="text-xs font-medium mb-0.5" style={{ color: '#9aa0b4' }}>Total Pembayaran</p>
                                                        <p className="font-bold" style={{ color: '#005bbf', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                                            {fmtCurrency(order.total)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {order.payment_status === 'unpaid' && (
                                                            <a href={`/order/${order.id}/payment`}
                                                                className="text-sm font-semibold hover:underline" style={{ color: '#005bbf' }}>
                                                                Bayar Sekarang →
                                                            </a>
                                                        )}
                                                        {(order.payment_status === 'paid' || order.payment_status === 'verified' || order.payment_status === 'refunded' || order.status === 'cancelled' || order.payment_status === 'cancelled') && (
                                                            <a href={`/orders/${order.id}/download-invoice`}
                                                                target="_blank" rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                                                style={{ color: '#414754', border: '1px solid rgba(193,198,214,0.4)', background: '#f3f4f5' }}>
                                                                <Download className="w-3.5 h-3.5" />
                                                                Invoice
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── DISKON TERSEDIA ── */}
                        <div className="lg:col-span-1">
                            <div className="rounded-2xl overflow-hidden"
                                style={{ background: '#fff', border: '1px solid rgba(193,198,214,0.2)', boxShadow: '0 4px 16px rgba(25,28,29,0.05)' }}>
                                <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(193,198,214,0.2)' }}>
                                    <h2 className="font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.05rem', color: '#191c1d' }}>
                                        Diskon Tersedia
                                    </h2>
                                </div>
                                <div className="p-5 space-y-4 max-h-[520px] overflow-y-auto">
                                    {activeDiscounts.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                                                style={{ background: 'rgba(0,91,191,0.06)' }}>
                                                <Tag className="w-7 h-7" style={{ color: '#005bbf' }} />
                                            </div>
                                            <p className="text-sm font-semibold mb-1" style={{ color: '#191c1d' }}>Belum ada diskon</p>
                                            <p className="text-xs" style={{ color: '#6b7280' }}>Diskon khusus Anda akan muncul di sini</p>
                                        </div>
                                    ) : (
                                        activeDiscounts.map((discount) => (
                                            <div key={discount.id} className="rounded-2xl p-4"
                                                style={{ border: '1.5px dashed rgba(0,91,191,0.3)', background: 'rgba(0,91,191,0.02)' }}>
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                                                    style={{ background: 'rgba(0,91,191,0.08)' }}>
                                                    <Tag className="w-5 h-5" style={{ color: '#005bbf' }} />
                                                </div>
                                                <p className="font-bold text-sm mb-1" style={{ color: '#191c1d', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                                    {discount.name}
                                                </p>
                                                {discount.description && (
                                                    <p className="text-xs leading-relaxed mb-3" style={{ color: '#6b7280' }}>
                                                        {discount.description}
                                                    </p>
                                                )}
                                                {/* Code + copy */}
                                                <div className="flex items-center justify-between px-3 py-2 rounded-xl mb-3"
                                                    style={{ background: '#f3f4f5', border: '1px solid rgba(193,198,214,0.3)' }}>
                                                    <span className="font-mono font-bold text-sm tracking-widest" style={{ color: '#005bbf' }}>
                                                        {discount.code}
                                                    </span>
                                                    <button onClick={() => copyCode(discount.code)}
                                                        className="p-1 rounded-lg transition-colors"
                                                        style={{ color: copiedCode === discount.code ? '#10b981' : '#9aa0b4' }}>
                                                        {copiedCode === discount.code
                                                            ? <Check className="w-4 h-4" />
                                                            : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between text-xs" style={{ color: '#9aa0b4' }}>
                                                    <span>
                                                        {discount.type === 'percentage'
                                                            ? `Diskon ${discount.value}%`
                                                            : fmtCurrency(discount.value)}
                                                        {discount.min_purchase > 0 && ` · Min. ${fmtCurrency(discount.min_purchase)}`}
                                                    </span>
                                                    {discount.end_date && (
                                                        <span>Berlaku hingga {new Date(discount.end_date).toLocaleDateString('id-ID')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* ── AGREEMENT MODAL ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={() => setShowModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(193,198,214,0.2)' }}>
                            <h3 className="font-bold text-base" style={{ color: '#191c1d' }}>
                                {showModal === 'terms'
                                    ? (termsAgreement?.title || 'Syarat & Ketentuan')
                                    : (privacyAgreement?.title || 'Kebijakan Privasi')}
                            </h3>
                            <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Tab switcher */}
                        <div className="flex px-6 pt-3 gap-4">
                            {['terms', 'privacy'].map((tab) => (
                                <button key={tab} onClick={() => setShowModal(tab)}
                                    className="text-sm font-semibold pb-2 border-b-2 transition-colors"
                                    style={{
                                        color: showModal === tab ? '#005bbf' : '#9aa0b4',
                                        borderColor: showModal === tab ? '#005bbf' : 'transparent',
                                    }}>
                                    {tab === 'terms' ? 'Syarat & Ketentuan' : 'Kebijakan Privasi'}
                                </button>
                            ))}
                        </div>
                        <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
                            {(showModal === 'terms' ? termsContent : privacyContent).map((section, idx) => (
                                <div key={idx}>
                                    {section.title && (
                                        <h4 className="font-semibold mb-2" style={{ color: '#191c1d' }}>{section.title}</h4>
                                    )}
                                    {Array.isArray(section.items) && (
                                        <ul className="space-y-1">
                                            {section.items.map((item, i) => (
                                                <li key={i} className="flex gap-2 text-sm" style={{ color: '#414754' }}>
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#005bbf' }} />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(193,198,214,0.2)' }}>
                            <button onClick={() => setShowModal(null)}
                                className="w-full py-2.5 rounded-xl font-semibold text-white text-sm"
                                style={{ background: '#005bbf' }}>
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
