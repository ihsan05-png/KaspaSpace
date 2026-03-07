import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import {
    ShoppingBag,
    Receipt,
    Tag,
    TrendingUp,
    CheckCircle,
    Clock,
    XCircle,
    ShieldCheck,
    ShieldAlert,
    X,
    Bell,
    CalendarCheck,
    Download
} from 'lucide-react';

export default function UserDashboard({ orders, activeDiscounts, stats, agreement, termsAgreement, privacyAgreement }) {
    const [showModal, setShowModal] = useState(null);
    const [completedBookings, setCompletedBookings] = useState([]);
    const [dismissedNotif, setDismissedNotif] = useState(false);
    const [now, setNow] = useState(new Date());

    const termsContent = termsAgreement?.content || [];
    const privacyContent = privacyAgreement?.content || [];

    // Bunyi notifikasi via Web Audio API
    const playNotificationSound = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523, 659, 784]; // Do-Mi-Sol
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.18);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.4);
                osc.start(ctx.currentTime + i * 0.18);
                osc.stop(ctx.currentTime + i * 0.18 + 0.4);
            });
        } catch (e) {
            // Browser mungkin memblokir AudioContext tanpa interaksi user
        }
    };

    // Cek apakah booking sedang berlangsung saat ini
    const isBookingActive = (order, currentTime = now) => {
        if (order.payment_status !== 'paid') return false;
        return order.items.some(item => {
            if (!item.booking_start_at || !item.booking_end_at) return false;
            const start = new Date(item.booking_start_at);
            const end = new Date(item.booking_end_at);
            return start <= currentTime && currentTime < end;
        });
    };

    // Cek apakah semua booking di order sudah selesai
    const isBookingDone = (order, currentTime = now) => {
        if (order.payment_status !== 'paid') return false;
        const bookingItems = order.items.filter(item => item.booking_end_at);
        if (bookingItems.length === 0) return false;
        return bookingItems.every(item => new Date(item.booking_end_at) < currentTime);
    };

    // Hitung waktu akhir toleransi 10 menit dari booking end terbaru
    const getToleranceEndTime = (order) => {
        const endTimes = order.items
            .filter(i => i.booking_end_at)
            .map(i => new Date(i.booking_end_at));
        if (endTimes.length === 0) return null;
        const maxEnd = new Date(Math.max(...endTimes));
        return new Date(maxEnd.getTime() + 10 * 60 * 1000);
    };

    useEffect(() => {
        // 1. Set completedBookings awal — ambil HANYA yang paling baru selesai
        const current = new Date();
        const oneDayAgo = new Date(current - 24 * 60 * 60 * 1000);
        const recent = orders
            .filter(order => {
                if (order.payment_status !== 'paid') return false;
                return order.items.some(item => {
                    if (!item.booking_end_at) return false;
                    const endTime = new Date(item.booking_end_at);
                    return endTime >= oneDayAgo && endTime <= current;
                });
            })
            // Urutkan berdasarkan booking_end_at terbaru
            .sort((a, b) => {
                const latestEndA = Math.max(...a.items.filter(i => i.booking_end_at).map(i => new Date(i.booking_end_at)));
                const latestEndB = Math.max(...b.items.filter(i => i.booking_end_at).map(i => new Date(i.booking_end_at)));
                return latestEndB - latestEndA;
            })
            .slice(0, 1); // Hanya tampilkan 1 yang paling baru
        setCompletedBookings(recent);

        // 2. Jadwalkan timeout tepat saat booking aktif berakhir
        const timers = [];
        orders.forEach(order => {
            if (order.payment_status !== 'paid') return;
            order.items.forEach(item => {
                if (!item.booking_end_at) return;
                const endTime = new Date(item.booking_end_at);
                const delay = endTime - new Date();
                if (delay > 0 && delay < 25 * 60 * 60 * 1000) {
                    const timer = setTimeout(() => {
                        setNow(new Date());
                        setDismissedNotif(false);
                        // Ganti notifikasi dengan yang baru selesai ini (paling terbaru)
                        setCompletedBookings([order]);
                        playNotificationSound();
                    }, delay);
                    timers.push(timer);
                }
            });
        });

        // 3. Update now setiap 30 detik agar badge "Berlangsung" akurat
        const interval = setInterval(() => setNow(new Date()), 30000);

        return () => {
            timers.forEach(t => clearTimeout(t));
            clearInterval(interval);
        };
    }, [orders]);

    const getStatusBadge = (paymentStatus, order = null) => {
        if (order) {
            // Booking sedang berlangsung
            if (isBookingActive(order)) {
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                        Berlangsung
                    </span>
                );
            }
            // Booking sudah selesai
            if (isBookingDone(order)) {
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        <CalendarCheck className="w-3 h-3 mr-1" />
                        Selesai
                    </span>
                );
            }
        }
        if (paymentStatus === 'paid') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Dibayar
                </span>
            );
        } else if (paymentStatus === 'cancelled') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    Dibatalkan
                </span>
            );
        } else if (paymentStatus === 'refunded') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    Refund
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock className="w-3 h-3 mr-1" />
                Menunggu Pembayaran
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Notifikasi: cari order terbaru yang sedang aktif atau baru selesai
    // orders sudah diurutkan terbaru dari backend
    const latestActiveOrder = orders.find(o => isBookingActive(o)) || null;
    const notifOrder = latestActiveOrder || (completedBookings.length > 0 ? completedBookings[0] : null);
    const notifIsActive = !!latestActiveOrder;

    return (
        <>
            <Head title="Dashboard" />
            <Navbar />
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard Saya</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Kelola pesanan dan lihat diskon yang tersedia
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Pesanan Selesai</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Belanja</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Agreement Status */}
                    {agreement && (
                        <div className="mb-8">
                            {agreement.agreed_terms && agreement.agreed_privacy ? (
                                <div className="rounded-xl shadow-sm overflow-hidden border border-emerald-200">
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white/20 rounded-full p-2">
                                                <ShieldCheck className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm tracking-wide">
                                                    Akun Terverifikasi
                                                </p>
                                                <p className="text-emerald-100 text-xs mt-0.5">
                                                    Semua persetujuan telah ditandatangani secara digital
                                                </p>
                                            </div>
                                        </div>
                                        {agreement.agreed_at && (
                                            <div className="bg-white/15 rounded-lg px-3 py-1.5 text-right flex-shrink-0">
                                                <p className="text-emerald-100 text-[10px] uppercase tracking-wider font-medium">Tanggal Persetujuan</p>
                                                <p className="text-white text-xs font-semibold mt-0.5">{agreement.agreed_at}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-white px-6 py-3 flex flex-wrap gap-3 items-center">
                                        <button onClick={() => setShowModal('terms')} className="flex items-center gap-2 text-xs text-emerald-700 font-medium hover:text-emerald-900 hover:underline transition-colors">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            Syarat &amp; Ketentuan
                                        </button>
                                        <span className="text-gray-200">|</span>
                                        <button onClick={() => setShowModal('privacy')} className="flex items-center gap-2 text-xs text-emerald-700 font-medium hover:text-emerald-900 hover:underline transition-colors">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            Kebijakan Privasi
                                        </button>
                                        <span className="text-gray-200">|</span>
                                        <div className={`flex items-center gap-2 text-xs font-medium ${agreement.agreed_newsletter ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {agreement.agreed_newsletter
                                                ? <CheckCircle className="w-4 h-4 text-blue-400" />
                                                : <XCircle className="w-4 h-4 text-gray-300" />}
                                            Newsletter
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl shadow-sm overflow-hidden border border-amber-200">
                                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-4 flex items-center gap-3">
                                        <div className="bg-white/20 rounded-full p-2">
                                            <ShieldAlert className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">Agreement Belum Lengkap</p>
                                            <p className="text-amber-100 text-xs mt-0.5">Harap selesaikan persetujuan untuk mengakses semua fitur</p>
                                        </div>
                                    </div>
                                    <div className="bg-white px-6 py-3 flex flex-wrap gap-3 items-center">
                                        <button onClick={() => setShowModal('terms')} className={`flex items-center gap-2 text-xs font-medium transition-colors hover:underline ${agreement.agreed_terms ? 'text-emerald-700 hover:text-emerald-900' : 'text-gray-400 hover:text-gray-600'}`}>
                                            {agreement.agreed_terms ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                                            Syarat &amp; Ketentuan
                                        </button>
                                        <span className="text-gray-200">|</span>
                                        <button onClick={() => setShowModal('privacy')} className={`flex items-center gap-2 text-xs font-medium transition-colors hover:underline ${agreement.agreed_privacy ? 'text-emerald-700 hover:text-emerald-900' : 'text-gray-400 hover:text-gray-600'}`}>
                                            {agreement.agreed_privacy ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                                            Kebijakan Privasi
                                        </button>
                                        <span className="text-gray-200">|</span>
                                        <div className={`flex items-center gap-2 text-xs font-medium ${agreement.agreed_newsletter ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {agreement.agreed_newsletter ? <CheckCircle className="w-4 h-4 text-blue-400" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                                            Newsletter
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notifikasi Booking */}
                    {notifOrder && !dismissedNotif && (
                        <div className={`mb-6 border rounded-xl p-4 flex items-start gap-3 ${
                            notifIsActive
                                ? 'bg-green-50 border-green-200'
                                : 'bg-teal-50 border-teal-200'
                        }`}>
                            <div className={`flex-shrink-0 rounded-full p-2 mt-0.5 ${
                                notifIsActive ? 'bg-green-100' : 'bg-teal-100'
                            }`}>
                                <Bell className={`w-4 h-4 ${notifIsActive ? 'text-green-600' : 'text-teal-600'}`} />
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-semibold flex items-center gap-2 ${
                                    notifIsActive ? 'text-green-900' : 'text-teal-900'
                                }`}>
                                    {notifIsActive && (
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                                    )}
                                    {notifIsActive
                                        ? 'Sesi booking Anda sedang berlangsung!'
                                        : 'Sesi booking Anda telah selesai!'}
                                </p>
                                <ul className="mt-1 space-y-0.5">
                                    {notifOrder.items.filter(i => i.booking_end_at).map(i => (
                                        <li key={i.id} className={`text-xs ${notifIsActive ? 'text-green-700' : 'text-teal-700'}`}>
                                            • {i.product_name}{i.variant_name ? ` - ${i.variant_name}` : ''}
                                            {i.booking_start_at && i.booking_end_at && (
                                                <span className="ml-1 opacity-75">
                                                    ({new Date(i.booking_start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} – {new Date(i.booking_end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                <p className={`text-xs mt-1 ${notifIsActive ? 'text-green-600' : 'text-teal-600'}`}>
                                    {notifIsActive
                                        ? `Selesai pukul ${new Date(Math.max(...notifOrder.items.filter(i => i.booking_end_at).map(i => new Date(i.booking_end_at)))).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                                        : (() => {
                                            const toleranceEnd = getToleranceEndTime(notifOrder);
                                            const isWithinTolerance = toleranceEnd && now < toleranceEnd;
                                            return isWithinTolerance
                                                ? `Anda masih memiliki toleransi 10 menit hingga pukul ${toleranceEnd.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}. Harap segera membereskan barang dan meninggalkan ruangan.`
                                                : 'Terima kasih telah menggunakan layanan Kaspa Space.';
                                        })()
                                    }
                                </p>
                            </div>
                            <button
                                onClick={() => setDismissedNotif(true)}
                                className={`flex-shrink-0 transition-colors ${notifIsActive ? 'text-green-400 hover:text-green-600' : 'text-teal-400 hover:text-teal-600'}`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Orders */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Pesanan Terbaru</h2>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {orders.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada pesanan</h3>
                                            <p className="mt-1 text-sm text-gray-500">Mulai berbelanja sekarang!</p>
                                            <div className="mt-6">
                                                <Link
                                                    href="/"
                                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Mulai Belanja
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        orders.map((order) => (
                                            <div key={order.id} className="p-6 hover:bg-gray-50">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            #{order.order_number || `ORD-${order.id}`}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(order.payment_status, order)}
                                                </div>
                                                
                                                <div className="space-y-2 mb-3">
                                                    {order.items.slice(0, 2).map((item) => (
                                                        <div key={item.id}>
                                                            <p className="text-sm text-gray-600">
                                                                {item.quantity}x {item.product_name}
                                                                {item.variant_name && ` - ${item.variant_name}`}
                                                            </p>
                                                            {item.booking_start_at && item.booking_end_at && (
                                                                <p className="text-xs text-blue-600">
                                                                    {new Date(item.booking_start_at).toLocaleDateString('id-ID', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric'
                                                                    })}, {new Date(item.booking_start_at).toLocaleTimeString('id-ID', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })} - {new Date(item.booking_end_at).toLocaleTimeString('id-ID', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {order.items.length > 2 && (
                                                        <p className="text-sm text-gray-500">
                                                            +{order.items.length - 2} produk lainnya
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {formatCurrency(order.total)}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        {order.payment_status === 'unpaid' && (
                                                            <a
                                                                href={`/order/${order.id}/payment`}
                                                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                                            >
                                                                Bayar Sekarang →
                                                            </a>
                                                        )}
                                                        {(order.payment_status === 'paid' || order.payment_status === 'verified') && (
                                                            <a
                                                                href={`/orders/${order.id}/download-invoice`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                Invoice
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Available Discounts */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Diskon Tersedia</h2>
                                </div>
                                <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                                    {activeDiscounts.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Tag className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-500">Belum ada diskon tersedia</p>
                                        </div>
                                    ) : (
                                        activeDiscounts.map((discount) => (
                                            <div 
                                                key={discount.id} 
                                                className="border border-dashed border-blue-300 rounded-lg p-4 bg-blue-50"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-1">
                                                            <Tag className="h-4 w-4 text-blue-600 mr-2" />
                                                            <span className="font-mono font-bold text-blue-600">
                                                                {discount.code}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                                            {discount.name}
                                                        </p>
                                                        {discount.description && (
                                                            <p className="text-xs text-gray-600 mb-2">
                                                                {discount.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-600">
                                                        {discount.type === 'percentage' 
                                                            ? `Diskon ${discount.value}%`
                                                            : formatCurrency(discount.value)
                                                        }
                                                    </span>
                                                    {discount.min_purchase > 0 && (
                                                        <span className="text-gray-500">
                                                            Min. {formatCurrency(discount.min_purchase)}
                                                        </span>
                                                    )}
                                                </div>

                                                {discount.end_date && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Berlaku hingga {new Date(discount.end_date).toLocaleDateString('id-ID')}
                                                    </p>
                                                )}
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

            {/* Agreement Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900">
                                {showModal === 'terms'
                                    ? (termsAgreement?.title || 'Syarat & Ketentuan')
                                    : (privacyAgreement?.title || 'Kebijakan Privasi')}
                            </h3>
                            <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
                            {(showModal === 'terms' ? termsContent : privacyContent).map((section, idx) => (
                                <div key={idx}>
                                    {section.title && (
                                        <h4 className="font-semibold text-gray-800 mb-2">{section.title}</h4>
                                    )}
                                    {Array.isArray(section.items) && (
                                        <ul className="space-y-1">
                                            {section.items.map((item, i) => (
                                                <li key={i} className="flex gap-2 text-sm text-gray-600">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowModal(null)}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
