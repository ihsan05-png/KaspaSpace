import { useState, useEffect } from 'react';
import {
    CheckCircle, Home, CreditCard, XCircle,
    Clock, AlertTriangle, QrCode, Copy, Check
} from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';

const fmtRp = (n) => `Rp${Number(n).toLocaleString('id-ID')}`;

const getProductImg = (item) => {
    const imgs = item.product?.images;
    if (!imgs) return null;
    const arr = Array.isArray(imgs) ? imgs : (typeof imgs === 'string' ? JSON.parse(imgs) : []);
    if (!arr[0]) return null;
    return arr[0].startsWith('http') ? arr[0] : `/storage/${arr[0]}`;
};

export default function Payment({ order, paymentSettings = null }) {
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [isCancelling, setIsCancelling]         = useState(false);
    const [paymentStatus, setPaymentStatus]       = useState(order.payment_status);
    const [orderStatus, setOrderStatus]           = useState(order.status);
    const [timeRemaining, setTimeRemaining]       = useState('');
    const [isExpired, setIsExpired]               = useState(false);
    const [showCancelModal, setShowCancelModal]   = useState(false);
    const [copied, setCopied]                     = useState(false);

    const isPaymentSuccessful = (s) => ['paid', 'verified'].includes(s);

    const handleCopyAccountNumber = () => {
        if (paymentSettings?.account_number) {
            navigator.clipboard.writeText(paymentSettings.account_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        if (!isPaymentSuccessful(paymentStatus) && paymentStatus !== 'refunded' && orderStatus !== 'cancelled') {
            localStorage.setItem('pendingOrder', JSON.stringify({
                id: order.id, order_number: order.order_number, total: order.total,
                payment_status: order.payment_status, payment_method: order.payment_method, created_at: order.created_at,
            }));
        } else {
            localStorage.removeItem('pendingOrder');
        }
    }, [order, paymentStatus, orderStatus]);

    useEffect(() => {
        if (order.payment_method === 'midtrans') {
            const script = document.createElement('script');
            script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '');
            document.body.appendChild(script);
            return () => { document.body.removeChild(script); };
        }
    }, [order.payment_method]);

    useEffect(() => {
        const calc = () => {
            const expiryMinutes = order.is_booking_product ? 10 : 24 * 60;
            const expiryTime    = new Date(new Date(order.created_at).getTime() + expiryMinutes * 60 * 1000);
            const diff          = expiryTime - new Date();
            if (diff <= 0) {
                setIsExpired(true); setTimeRemaining('Expired');
                if (paymentStatus === 'unpaid' && orderStatus !== 'cancelled') handleCancelExpiredOrder();
                return;
            }
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeRemaining(order.is_booking_product ? `${m}m ${s}d` : `${h}j ${m}m ${s}d`);
        };
        calc();
        const interval = setInterval(calc, 1000);
        return () => clearInterval(interval);
    }, [order.created_at, paymentStatus, orderStatus]);

    const handleCancelExpiredOrder = async () => {
        try { await axios.post(`/orders/${order.id}/cancel`); setOrderStatus('cancelled'); }
        catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (!isPaymentSuccessful(paymentStatus) && paymentStatus !== 'refunded' && orderStatus !== 'cancelled') {
            const interval = setInterval(checkPaymentStatus, 5000);
            return () => clearInterval(interval);
        }
    }, [paymentStatus, orderStatus]);

    const checkPaymentStatus = async () => {
        try {
            const endpoint = order.payment_method === 'midtrans'
                ? `/midtrans/check-status/${order.id}`
                : `/api/orders/${order.id}/status`;
            const res = await axios.get(endpoint);
            if (res.data.payment_status !== paymentStatus) {
                setPaymentStatus(res.data.payment_status);
                setOrderStatus(res.data.status);
                if (isPaymentSuccessful(res.data.payment_status)) {
                    setTimeout(() => { window.location.href = `/checkout/success/${order.id}`; }, 1000);
                }
            }
        } catch (e) { console.error(e); }
    };

    const handlePayment = async () => {
        if (isExpired) { alert('Pesanan sudah expired. Silakan buat pesanan baru.'); return; }
        setIsLoadingPayment(true);
        try {
            const { data } = await axios.post(`/midtrans/create-snap-token/${order.id}`);
            window.snap.pay(data.snap_token, {
                onSuccess: () => { setPaymentStatus('paid'); setOrderStatus('confirmed'); setTimeout(() => router.visit(`/checkout/success/${order.id}`), 1000); },
                onPending: () => { alert('Pembayaran tertunda.'); setIsLoadingPayment(false); },
                onError:   () => { alert('Terjadi kesalahan.'); setIsLoadingPayment(false); },
                onClose:   () => { setIsLoadingPayment(false); },
            });
        } catch (e) {
            alert(e.response?.data?.error || 'Gagal membuat pembayaran.');
            setIsLoadingPayment(false);
        }
    };

    const handleCancelOrder = async () => {
        setShowCancelModal(false); setIsCancelling(true);
        try {
            await axios.post(`/orders/${order.id}/cancel`);
            setOrderStatus('cancelled');
            setTimeout(() => router.visit('/'), 1500);
        } catch (e) {
            alert('Gagal membatalkan pesanan.'); setIsCancelling(false);
        }
    };

    const methodLabel = {
        midtrans: 'Midtrans (Online)',
        qris: 'QRIS',
        bank_transfer: `Transfer Bank${paymentSettings?.bank_name ? ` ${paymentSettings.bank_name}` : ''}`,
        cash: 'Tunai',
    }[order.payment_method] || order.payment_method;

    const isCancelled = orderStatus === 'cancelled';
    const isPaid      = isPaymentSuccessful(paymentStatus);
    const isPending   = !isPaid && !isCancelled && paymentStatus !== 'refunded';

    return (
        <div className="min-h-screen py-10 px-4" style={{ backgroundColor: '#eef2f7', fontFamily: 'Inter, sans-serif' }}>

            {/* ── CANCEL MODAL ── */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={() => setShowCancelModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="bg-red-50 px-6 pt-6 pb-4 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold" style={{ color: '#191c1d' }}>Batalkan Pesanan?</h3>
                            <p className="mt-2 text-sm" style={{ color: '#6b7280' }}>
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div className="px-6 py-5">
                            <div className="rounded-xl p-4 mb-4" style={{ background: '#f3f4f5' }}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span style={{ color: '#6b7280' }}>Nomor Pesanan</span>
                                    <span className="font-semibold" style={{ color: '#191c1d' }}>#{order.order_number || order.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm" style={{ color: '#6b7280' }}>Total</span>
                                    <span className="font-bold text-red-600">{fmtRp(order.total)}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowCancelModal(false)}
                                    className="flex-1 py-3 rounded-xl font-semibold text-sm"
                                    style={{ background: '#f3f4f5', color: '#414754' }}>
                                    Tidak, Kembali
                                </button>
                                <button onClick={handleCancelOrder}
                                    className="flex-1 py-3 rounded-xl font-semibold text-sm text-white"
                                    style={{ background: '#ef4444' }}>
                                    Ya, Batalkan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto">

                {/* ── HEADER CENTER ── */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ background: isCancelled ? '#ef4444' : isPaid ? '#10b981' : '#005bbf' }}>
                        {isCancelled
                            ? <XCircle className="w-8 h-8 text-white" />
                            : isPaid
                                ? <CheckCircle className="w-8 h-8 text-white" />
                                : <Clock className="w-8 h-8 text-white" />}
                    </div>

                    <h1 className="font-bold text-2xl mb-3"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>
                        {isCancelled ? 'Pesanan Dibatalkan' : isPaid ? 'Pembayaran Berhasil' : 'Menunggu Pembayaran'}
                    </h1>

                    {isPending && !isExpired && timeRemaining && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold mb-3"
                            style={{ background: '#fde8d8', color: '#d9480f', border: '1px solid #fbc8a5' }}>
                            <Clock className="w-3.5 h-3.5" />
                            Waktu tersisa: {timeRemaining}
                        </span>
                    )}
                    {isExpired && paymentStatus === 'unpaid' && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold mb-3"
                            style={{ background: '#fee2e2', color: '#b91c1c' }}>
                            ⚠️ Pesanan Expired
                        </span>
                    )}

                    <p className="text-sm" style={{ color: '#9aa0b4' }}>
                        Order ID: <span className="font-semibold" style={{ color: '#414754' }}>
                            #{order.order_number || order.id}
                        </span>
                    </p>
                </div>

                {/* ── MAIN 2-COL GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* ── LEFT COLUMN ── */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Item Pesanan card */}
                        <div className="rounded-2xl p-6"
                            style={{ background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                            <h2 className="font-semibold mb-4" style={{ fontSize: '1rem', color: '#374151' }}>
                                Item Pesanan
                            </h2>
                            <div className="space-y-5">
                                {order.items.map((item) => {
                                    const img = getProductImg(item);
                                    const isDateOnly = ['private_office', 'virtual_office'].includes(item.product?.product_type);
                                    return (
                                        <div key={item.id} className="flex gap-4">
                                            {/* Thumbnail */}
                                            {img ? (
                                                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                                    <img src={img} alt={item.product_name}
                                                        className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center"
                                                    style={{ background: 'rgba(0,91,191,0.08)' }}>
                                                    <CreditCard className="w-8 h-8" style={{ color: '#005bbf' }} />
                                                </div>
                                            )}

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className="font-bold" style={{ color: '#191c1d', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                                        {item.product_name}
                                                    </p>
                                                    <p className="font-bold flex-shrink-0" style={{ color: '#005bbf' }}>
                                                        {fmtRp(item.subtotal)}
                                                    </p>
                                                </div>
                                                {item.variant_name && (
                                                    <p className="text-sm mt-0.5" style={{ color: '#005bbf' }}>{item.variant_name}</p>
                                                )}
                                                {item.booking_start_at && item.booking_end_at && (
                                                    <p className="text-sm mt-0.5" style={{ color: '#10b981' }}>
                                                        {isDateOnly
                                                            ? `${new Date(item.booking_start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(item.booking_end_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                                            : `${new Date(item.booking_start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, ${new Date(item.booking_start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(item.booking_end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                                                        }
                                                    </p>
                                                )}
                                                <p className="text-sm mt-1" style={{ color: '#9aa0b4' }}>
                                                    {item.quantity} x {fmtRp(item.price)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Detail Pesanan card */}
                        <div className="rounded-2xl p-6"
                            style={{ background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                            <h2 className="font-semibold mb-4" style={{ fontSize: '1rem', color: '#374151' }}>
                                Detail Pesanan
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {[
                                    { label: 'Nama Pemesan',       value: order.customer_name },
                                    { label: 'Email',              value: order.customer_email },
                                    { label: 'Nomor Telepon',      value: order.customer_phone },
                                    { label: 'Metode Pembayaran',  value: methodLabel },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#9ca3af' }}>
                                            {label}
                                        </p>
                                        <p className="text-sm font-semibold" style={{ color: '#111827' }}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* QRIS card */}
                        {order.payment_method === 'qris' && isPending && !isExpired && (
                            <div className="rounded-2xl p-6"
                                style={{ background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                                <div className="text-center mb-5">
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                                        style={{ background: '#7c3aed' }}>
                                        <QrCode className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#191c1d' }}>
                                        Pembayaran QRIS
                                    </h3>
                                    <p className="text-sm" style={{ color: '#6b7280' }}>Scan QR Code untuk membayar</p>
                                </div>
                                {paymentSettings?.qris_image ? (
                                    <div className="rounded-xl p-4 mb-4 text-center" style={{ background: '#f3f4f5' }}>
                                        <img src={paymentSettings.qris_image} alt="QRIS" className="max-w-xs mx-auto rounded-lg" />
                                    </div>
                                ) : (
                                    <div className="rounded-xl p-8 text-center" style={{ background: '#f3f4f5' }}>
                                        <p className="text-sm" style={{ color: '#9aa0b4' }}>QR Code tidak tersedia</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bank Transfer card */}
                        {order.payment_method === 'bank_transfer' && isPending && !isExpired && paymentSettings?.account_number && (
                            <div className="rounded-2xl p-6"
                                style={{ background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                                <h2 className="font-semibold mb-4" style={{ fontSize: '1rem', color: '#374151' }}>
                                    Informasi Transfer
                                </h2>
                                <div className="rounded-xl p-4 space-y-3" style={{ background: '#f3f4f5' }}>
                                    {[
                                        ['Bank', paymentSettings.bank_name],
                                        ['Atas Nama', paymentSettings.account_name],
                                    ].map(([label, val]) => (
                                        <div key={label} className="flex justify-between">
                                            <span className="text-sm" style={{ color: '#6b7280' }}>{label}</span>
                                            <span className="text-sm font-semibold" style={{ color: '#191c1d' }}>{val}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm" style={{ color: '#6b7280' }}>Nomor Rekening</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-sm" style={{ color: '#191c1d' }}>
                                                {paymentSettings.account_number}
                                            </span>
                                            <button onClick={handleCopyAccountNumber}
                                                className="p-1.5 rounded-lg"
                                                style={{ background: '#e5e7eb' }}>
                                                {copied
                                                    ? <Check className="w-3.5 h-3.5 text-green-600" />
                                                    : <Copy className="w-3.5 h-3.5" style={{ color: '#6b7280' }} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div className="lg:col-span-1 space-y-3">

                        {/* Total Pembayaran card */}
                        <div className="rounded-2xl p-6"
                            style={{ background: '#005bbf', boxShadow: '0 8px 24px rgba(0,91,191,0.25)' }}>
                            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Total Pembayaran</p>
                            <p className="font-extrabold text-3xl text-white mb-5"
                                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {fmtRp(order.total)}
                            </p>
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm py-1.5"
                                    style={{ borderTop: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                                    <span className="truncate pr-2">
                                        {item.product_name}{item.variant_name ? ` (${item.variant_name})` : ''}
                                    </span>
                                    <span className="flex-shrink-0 font-semibold text-white">{fmtRp(item.subtotal)}</span>
                                </div>
                            ))}

                            {/* Cash instruction inside same blue card */}
                            {order.payment_method === 'cash' && isPending && !isExpired && (
                                <div className="mt-5 pt-4 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                                    <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.78)' }}>
                                        💰 Siapkan uang tunai sebesar:
                                    </p>
                                    <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.22)' }}>
                                        <p className="font-extrabold text-xl text-white"
                                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                            {fmtRp(order.total)}
                                        </p>
                                    </div>
                                    <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                        Bayar saat pengambilan pesanan
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Midtrans pay button */}
                        {order.payment_method === 'midtrans' && isPending && !isExpired && (
                            <button onClick={handlePayment} disabled={isLoadingPayment}
                                className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
                                style={{ background: '#1a73e8', boxShadow: '0 4px 14px rgba(0,91,191,0.3)' }}>
                                {isLoadingPayment
                                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Memuat...</>
                                    : <><CreditCard className="w-4 h-4" />Bayar Sekarang</>}
                            </button>
                        )}

                        {/* Kembali ke Beranda */}
                        <a href="/"
                            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                            style={{ background: '#fff', border: '1px solid rgba(193,198,214,0.3)', color: '#414754', boxShadow: '0 2px 8px rgba(25,28,29,0.05)' }}>
                            <Home className="w-4 h-4" />
                            Kembali ke Beranda
                        </a>

                        {/* Batalkan Pesanan */}
                        {isPending && !isExpired && (
                            <button onClick={() => setShowCancelModal(true)} disabled={isCancelling}
                                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                style={{ background: '#fff', border: '1.5px solid #ef4444', color: '#ef4444' }}>
                                {isCancelling
                                    ? <><div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />Membatalkan...</>
                                    : <><XCircle className="w-4 h-4" />Batalkan Pesanan</>}
                            </button>
                        )}

                        {/* Expired */}
                        {isExpired && paymentStatus === 'unpaid' && !isCancelled && (
                            <div className="rounded-2xl p-5 text-center"
                                style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                                <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                                <p className="font-bold text-sm mb-1" style={{ color: '#991b1b' }}>Pesanan Expired</p>
                                <p className="text-xs mb-3" style={{ color: '#ef4444' }}>
                                    Batas waktu ({order.is_booking_product ? '10 menit' : '24 jam'}) terlampaui
                                </p>
                                <a href="/" className="inline-block px-5 py-2 rounded-xl text-sm font-semibold text-white"
                                    style={{ background: '#005bbf' }}>
                                    Buat Pesanan Baru
                                </a>
                            </div>
                        )}

                        {/* Paid success */}
                        {isPaid && (
                            <div className="rounded-2xl p-5 text-center"
                                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                <p className="font-bold text-sm" style={{ color: '#065f46' }}>Pembayaran Berhasil!</p>
                            </div>
                        )}

                        {/* Info note */}
                        {isPending && !isExpired && (
                            <div className="rounded-xl px-4 py-3 flex items-start gap-2"
                                style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                                <span className="text-sm flex-shrink-0 mt-0.5">ℹ️</span>
                                <p className="text-xs leading-relaxed" style={{ color: '#1e40af' }}>
                                    {order.payment_method === 'cash'
                                        ? 'Pastikan melakukan pembayaran sebelum batas waktu yang tertera. Setelah membayar, pesanan Anda akan dikonfirmasi secara otomatis.'
                                        : order.payment_method === 'midtrans'
                                            ? 'Anda akan diarahkan ke halaman pembayaran Midtrans yang aman untuk menyelesaikan transaksi.'
                                            : 'Setelah pembayaran, admin akan mengkonfirmasi pesanan Anda secara otomatis.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
