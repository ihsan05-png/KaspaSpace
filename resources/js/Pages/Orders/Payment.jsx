import { useState, useEffect } from 'react';
import { CheckCircle, ShoppingBag, ArrowLeft, CreditCard, RefreshCw, XCircle, Clock, AlertTriangle, QrCode, Building2, Copy, Check } from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';

export default function Payment({ order, paymentSettings = null }) {
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
    const [orderStatus, setOrderStatus] = useState(order.status);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [isExpired, setIsExpired] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [copied, setCopied] = useState(false);

    // Helper to check if payment is successful (paid or verified)
    const isPaymentSuccessful = (status) => ['paid', 'verified'].includes(status);

    const handleCopyAccountNumber = () => {
        if (paymentSettings?.account_number) {
            navigator.clipboard.writeText(paymentSettings.account_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Save order to localStorage for later access
    useEffect(() => {
        if (!isPaymentSuccessful(paymentStatus) && paymentStatus !== 'refunded' && orderStatus !== 'cancelled') {
            const orderData = {
                id: order.id,
                order_number: order.order_number,
                total: order.total,
                payment_status: order.payment_status,
                payment_method: order.payment_method,
                created_at: order.created_at
            };
            localStorage.setItem('pendingOrder', JSON.stringify(orderData));
        } else {
            // Remove from localStorage if paid or cancelled
            localStorage.removeItem('pendingOrder');
        }
    }, [order, paymentStatus, orderStatus]);

    // Load Midtrans Snap script
    useEffect(() => {
        if (order.payment_method === 'midtrans') {
            const script = document.createElement('script');
            script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '');
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, [order.payment_method]);

    // Calculate time remaining and check expiry
    useEffect(() => {
        const calculateTimeRemaining = () => {
            const createdAt = new Date(order.created_at);
            const expiryTime = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours
            const now = new Date();
            const diff = expiryTime - now;

            if (diff <= 0) {
                setIsExpired(true);
                setTimeRemaining('Expired');
                // Auto-cancel if expired and still unpaid
                if (paymentStatus === 'unpaid' && orderStatus !== 'cancelled') {
                    handleCancelExpiredOrder();
                }
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setTimeRemaining(`${hours}j ${minutes}m ${seconds}d`);
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [order.created_at, paymentStatus, orderStatus]);

    const handleCancelExpiredOrder = async () => {
        try {
            await axios.post(`/orders/${order.id}/cancel`);
            setOrderStatus('cancelled');
        } catch (error) {
            console.error('Error cancelling expired order:', error);
        }
    };

    // Check payment status periodically for both payment methods
    useEffect(() => {
        if (!isPaymentSuccessful(paymentStatus) && paymentStatus !== 'refunded' && orderStatus !== 'cancelled') {
            const interval = setInterval(() => {
                checkPaymentStatus();
            }, 5000); // Check every 5 seconds

            return () => clearInterval(interval);
        }
    }, [paymentStatus, orderStatus]);

    const checkPaymentStatus = async () => {
        try {
            // For midtrans, use midtrans endpoint
            if (order.payment_method === 'midtrans') {
                const response = await axios.get(`/midtrans/check-status/${order.id}`);
                if (response.data.payment_status !== paymentStatus) {
                    setPaymentStatus(response.data.payment_status);
                    setOrderStatus(response.data.status);

                    // Redirect to success page if payment is successful
                    if (isPaymentSuccessful(response.data.payment_status)) {
                        setTimeout(() => {
                            window.location.href = `/checkout/success/${order.id}`;
                        }, 1000);
                    }
                }
            } else {
                // For cash, qris, and bank_transfer, check order status directly from database
                const response = await axios.get(`/api/orders/${order.id}/status`);
                if (response.data.payment_status !== paymentStatus) {
                    setPaymentStatus(response.data.payment_status);
                    setOrderStatus(response.data.status);

                    // Redirect to success page if payment is successful
                    if (isPaymentSuccessful(response.data.payment_status)) {
                        setTimeout(() => {
                            window.location.href = `/checkout/success/${order.id}`;
                        }, 1000);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
    };

    const handlePayment = async () => {
        if (isExpired) {
            alert('Pesanan sudah expired. Silakan buat pesanan baru.');
            return;
        }

        setIsLoadingPayment(true);
        
        try {
            // Get Snap Token from backend
            const response = await axios.post(`/midtrans/create-snap-token/${order.id}`);
            const { snap_token } = response.data;

            // Trigger Snap payment
            window.snap.pay(snap_token, {
                onSuccess: function(result) {
                    console.log('Payment success:', result);
                    setPaymentStatus('paid');
                    setOrderStatus('confirmed');
                    setTimeout(() => {
                        router.visit(`/checkout/success/${order.id}`);
                    }, 1000);
                },
                onPending: function(result) {
                    console.log('Payment pending:', result);
                    alert('Pembayaran tertunda. Silakan selesaikan pembayaran Anda.');
                    setIsLoadingPayment(false);
                },
                onError: function(result) {
                    console.log('Payment error:', result);
                    alert('Terjadi kesalahan saat memproses pembayaran.');
                    setIsLoadingPayment(false);
                },
                onClose: function() {
                    console.log('Payment popup closed');
                    setIsLoadingPayment(false);
                }
            });
        } catch (error) {
            console.error('Error creating payment:', error);
            alert(error.response?.data?.error || 'Gagal membuat pembayaran. Silakan coba lagi.');
            setIsLoadingPayment(false);
        }
    };

    const handleCancelOrder = async () => {
        setShowCancelModal(false);
        setIsCancelling(true);
        try {
            await axios.post(`/orders/${order.id}/cancel`);
            setOrderStatus('cancelled');
            setTimeout(() => {
                router.visit('/');
            }, 1500);
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('Gagal membatalkan pesanan. Silakan coba lagi.');
            setIsCancelling(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div 
                            className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
                            onClick={() => setShowCancelModal(false)}
                        ></div>

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 px-6 pt-6 pb-4">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                                <div className="mt-4 text-center">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Batalkan Pesanan?
                                    </h3>
                                    <p className="mt-3 text-base text-gray-600">
                                        Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-white px-6 py-4">
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Nomor Pesanan</span>
                                        <span className="text-sm font-semibold text-gray-900">#{order.order_number || order.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total</span>
                                        <span className="text-lg font-bold text-red-600">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.total)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCancelModal(false)}
                                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors duration-200"
                                    >
                                        Tidak, Kembali
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelOrder}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        Ya, Batalkan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto px-4">
                {/* Success Banner, Cancelled Banner, or Waiting Payment Banner */}
                {orderStatus === 'cancelled' ? (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <XCircle className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-red-900 mb-2">
                                    Pesanan Dibatalkan
                                </h1>
                                <p className="text-red-700">
                                    Pesanan ini telah dibatalkan. Silakan buat pesanan baru jika Anda masih membutuhkan.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : isPaymentSuccessful(paymentStatus) ? (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-green-900 mb-2">
                                    Pembayaran Berhasil
                                </h1>
                                <p className="text-green-700">
                                    Pembayaran untuk pesanan #{order.order_number || order.id} telah dikonfirmasi. Terima kasih atas pesanan Anda!
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Clock className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-blue-900 mb-2">
                                    Menunggu Pembayaran
                                </h1>
                                <p className="text-blue-700">
                                    Pesanan Anda telah dibuat dengan nomor #{order.order_number || order.id}. Silakan lakukan pembayaran untuk menyelesaikan pesanan.
                                </p>
                                {paymentStatus === 'unpaid' && !isExpired && (
                                    <div className="mt-3 flex items-center gap-2 text-blue-800">
                                        <Clock className="w-5 h-5" />
                                        <span className="font-semibold">Waktu tersisa: {timeRemaining}</span>
                                    </div>
                                )}
                                {isExpired && paymentStatus === 'unpaid' && (
                                    <div className="mt-3 text-red-600 font-semibold">
                                        ⚠️ Pesanan ini telah expired (lebih dari 24 jam)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Details */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-blue-600" />
                        Detail Pesanan
                    </h2>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Nomor Pesanan</span>
                            <span className="font-bold text-gray-900">#{order.id}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Nama Pemesan</span>
                            <span className="font-semibold text-gray-900">{order.customer_name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Email</span>
                            <span className="font-semibold text-gray-900">{order.customer_email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Telepon</span>
                            <span className="font-semibold text-gray-900">{order.customer_phone}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Metode Pembayaran</span>
                            <span className="font-semibold text-gray-900">
                                {order.payment_method === 'midtrans' && 'Midtrans (Online Payment)'}
                                {order.payment_method === 'qris' && 'QRIS'}
                                {order.payment_method === 'bank_transfer' && 'Transfer Bank'}
                                {order.payment_method === 'cash' && 'Tunai'}
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Status Pembayaran</span>
                            {isPaymentSuccessful(paymentStatus) ? (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    Sudah Dibayar
                                </span>
                            ) : paymentStatus === 'refunded' ? (
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                                    Refund
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold flex items-center gap-1">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Menunggu Pembayaran
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t pt-4">
                        <h3 className="font-bold text-gray-900 mb-3">Item Pesanan</h3>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-100">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{item.product_name}</p>
                                        {item.variant_name && (
                                            <p className="text-sm text-blue-600">{item.variant_name}</p>
                                        )}
                                        {item.booking_start_at && item.booking_end_at && (
                                            <p className="text-sm text-emerald-600">
                                                {['private_office', 'virtual_office'].includes(item.product?.product_type) ? (
                                                    // Date-only booking: show date range
                                                    <>
                                                        {new Date(item.booking_start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(item.booking_end_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </>
                                                ) : (
                                                    // Hourly booking: show date + time range
                                                    <>
                                                        {new Date(item.booking_start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })},{' '}
                                                        {new Date(item.booking_start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(item.booking_end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </>
                                                )}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            {item.quantity} x Rp{Number(item.price).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <p className="font-bold text-gray-900">
                                        Rp{Number(item.subtotal).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t mt-4 pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">Total Pembayaran</span>
                            <span className="text-2xl font-bold text-blue-600">
                                Rp{Number(order.total).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Action */}
                {order.payment_method === 'midtrans' && paymentStatus === 'unpaid' && orderStatus !== 'cancelled' && (
                    <div className="space-y-4">
                        {!isExpired ? (
                            <>
                                <button
                                    onClick={handlePayment}
                                    disabled={isLoadingPayment}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoadingPayment ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Memuat...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5" />
                                            Bayar Sekarang dengan Midtrans
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    disabled={isCancelling}
                                    className="w-full bg-white border-2 border-red-500 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isCancelling ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                            Membatalkan...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-5 h-5" />
                                            Batalkan Pesanan
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                <p className="text-red-900 font-bold text-lg mb-2">Pesanan Expired</p>
                                <p className="text-red-700 mb-4">Pesanan ini telah melewati batas waktu pembayaran (24 jam)</p>
                                <a
                                    href="/"
                                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                                >
                                    Buat Pesanan Baru
                                </a>
                            </div>
                        )}
                        {!isExpired && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-blue-800 text-sm text-center">
                                    💳 Anda akan diarahkan ke halaman pembayaran Midtrans yang aman untuk menyelesaikan transaksi
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {order.payment_method === 'midtrans' && isPaymentSuccessful(paymentStatus) && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-4">
                        <div className="flex items-center justify-center gap-3">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div className="text-center">
                                <p className="text-green-900 font-bold text-lg">Pembayaran Berhasil!</p>
                                <p className="text-green-700 text-sm">Pesanan Anda telah dikonfirmasi</p>
                            </div>
                        </div>
                    </div>
                )}

                {order.payment_method === 'cash' && (
                    <div className="space-y-4">
                        {isPaymentSuccessful(paymentStatus) ? (
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                                <div className="flex items-center justify-center gap-3">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                    <div className="text-center">
                                        <p className="text-green-900 font-bold text-lg">Pembayaran Lunas!</p>
                                        <p className="text-green-700 text-sm">Pesanan Anda sudah dibayar</p>
                                    </div>
                                </div>
                            </div>
                        ) : paymentStatus === 'unpaid' && orderStatus !== 'cancelled' ? (
                            <>
                                {!isExpired ? (
                                    <>
                                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 px-6 rounded-xl shadow-lg text-center">
                                            <h3 className="text-2xl font-bold mb-3">💰 Pembayaran Tunai</h3>
                                            <p className="text-blue-100 mb-4">
                                                Silakan siapkan uang tunai sebesar:
                                            </p>
                                            <div className="bg-white/20 backdrop-blur rounded-lg py-4 px-6 inline-block">
                                                <p className="text-3xl font-bold">
                                                    Rp{Number(order.total).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                            <p className="text-blue-100 text-sm mt-4">
                                                Bayar saat pengambilan pesanan
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            disabled={isCancelling}
                                            className="w-full bg-white border-2 border-red-500 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isCancelling ? (
                                                <>
                                                    <div className="w-5 h-5 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                    Membatalkan...
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-5 h-5" />
                                                    Batalkan Pesanan
                                                </>
                                            )}
                                        </button>
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <p className="text-blue-800 text-sm text-center">
                                                💡 Pesanan akan dikonfirmasi setelah pembayaran tunai diterima
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                        <p className="text-red-900 font-bold text-lg mb-2">Pesanan Expired</p>
                                        <p className="text-red-700 mb-4">Pesanan ini telah melewati batas waktu pembayaran (24 jam)</p>
                                        <a
                                            href="/"
                                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                                        >
                                            Buat Pesanan Baru
                                        </a>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                )}

                {/* QRIS Payment */}
                {order.payment_method === 'qris' && (
                    <div className="space-y-4">
                        {isPaymentSuccessful(paymentStatus) ? (
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                                <div className="flex items-center justify-center gap-3">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                    <div className="text-center">
                                        <p className="text-green-900 font-bold text-lg">Pembayaran Berhasil!</p>
                                        <p className="text-green-700 text-sm">Pesanan Anda sudah dibayar via QRIS</p>
                                    </div>
                                </div>
                            </div>
                        ) : paymentStatus === 'unpaid' && orderStatus !== 'cancelled' ? (
                            <>
                                {!isExpired ? (
                                    <>
                                        <div className="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-lg">
                                            <div className="text-center mb-6">
                                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <QrCode className="w-8 h-8 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran QRIS</h3>
                                                <p className="text-gray-600">
                                                    Scan QR Code di bawah untuk membayar
                                                </p>
                                            </div>

                                            {paymentSettings?.qris_image ? (
                                                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                                    <img
                                                        src={paymentSettings.qris_image}
                                                        alt="QRIS Code"
                                                        className="max-w-xs mx-auto rounded-lg"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="bg-gray-100 rounded-xl p-8 mb-6 text-center">
                                                    <p className="text-gray-500">QR Code tidak tersedia</p>
                                                </div>
                                            )}

                                            <div className="bg-purple-50 rounded-lg p-4 mb-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Total Pembayaran</span>
                                                    <span className="text-2xl font-bold text-purple-600">
                                                        Rp{Number(order.total).toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-600 space-y-2">
                                                <p className="flex items-start gap-2">
                                                    <span className="text-purple-500">1.</span>
                                                    Buka aplikasi e-wallet atau mobile banking Anda
                                                </p>
                                                <p className="flex items-start gap-2">
                                                    <span className="text-purple-500">2.</span>
                                                    Pilih menu Scan QR / QRIS
                                                </p>
                                                <p className="flex items-start gap-2">
                                                    <span className="text-purple-500">3.</span>
                                                    Scan QR Code di atas dan masukkan nominal pembayaran
                                                </p>
                                                <p className="flex items-start gap-2">
                                                    <span className="text-purple-500">4.</span>
                                                    Konfirmasi pembayaran
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            disabled={isCancelling}
                                            className="w-full bg-white border-2 border-red-500 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isCancelling ? (
                                                <>
                                                    <div className="w-5 h-5 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                    Membatalkan...
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-5 h-5" />
                                                    Batalkan Pesanan
                                                </>
                                            )}
                                        </button>
                                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                            <p className="text-purple-800 text-sm text-center">
                                                💡 Setelah pembayaran berhasil, admin akan mengkonfirmasi pesanan Anda
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                        <p className="text-red-900 font-bold text-lg mb-2">Pesanan Expired</p>
                                        <p className="text-red-700 mb-4">Pesanan ini telah melewati batas waktu pembayaran (24 jam)</p>
                                        <a
                                            href="/"
                                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                                        >
                                            Buat Pesanan Baru
                                        </a>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                )}

                {/* Bank Transfer Payment */}
                {order.payment_method === 'bank_transfer' && (
                    <div className="space-y-4">
                        {isPaymentSuccessful(paymentStatus) ? (
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                                <div className="flex items-center justify-center gap-3">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                    <div className="text-center">
                                        <p className="text-green-900 font-bold text-lg">Pembayaran Berhasil!</p>
                                        <p className="text-green-700 text-sm">Pesanan Anda sudah dibayar via Transfer Bank</p>
                                    </div>
                                </div>
                            </div>
                        ) : paymentStatus === 'unpaid' && orderStatus !== 'cancelled' ? (
                            <>
                                {!isExpired ? (
                                    <>
                                        <div className="bg-white border-2 border-orange-200 rounded-xl p-6 shadow-lg">
                                            <div className="text-center mb-6">
                                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Building2 className="w-8 h-8 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Transfer Bank</h3>
                                                <p className="text-gray-600">
                                                    Transfer ke rekening di bawah ini
                                                </p>
                                            </div>

                                            {paymentSettings?.bank_name && paymentSettings?.account_number ? (
                                                <div className="space-y-4 mb-6">
                                                    <div className="bg-orange-50 rounded-xl p-4">
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-600">Bank</span>
                                                                <span className="font-bold text-gray-900">{paymentSettings.bank_name}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-600">Nomor Rekening</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-gray-900 font-mono">{paymentSettings.account_number}</span>
                                                                    <button
                                                                        onClick={handleCopyAccountNumber}
                                                                        className="p-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 transition-colors"
                                                                        title="Salin nomor rekening"
                                                                    >
                                                                        {copied ? (
                                                                            <Check className="w-4 h-4 text-green-600" />
                                                                        ) : (
                                                                            <Copy className="w-4 h-4 text-orange-600" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-600">Atas Nama</span>
                                                                <span className="font-bold text-gray-900">{paymentSettings.account_name}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-100 rounded-xl p-8 mb-6 text-center">
                                                    <p className="text-gray-500">Informasi rekening tidak tersedia</p>
                                                </div>
                                            )}

                                            <div className="bg-orange-50 rounded-lg p-4 mb-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Total Pembayaran</span>
                                                    <span className="text-2xl font-bold text-orange-600">
                                                        Rp{Number(order.total).toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-600 space-y-2">
                                                <p className="flex items-start gap-2">
                                                    <span className="text-orange-500">1.</span>
                                                    Transfer sesuai nominal di atas ke rekening yang tertera
                                                </p>
                                                <p className="flex items-start gap-2">
                                                    <span className="text-orange-500">2.</span>
                                                    Pastikan nominal transfer sudah benar
                                                </p>
                                                <p className="flex items-start gap-2">
                                                    <span className="text-orange-500">3.</span>
                                                    Simpan bukti transfer untuk konfirmasi
                                                </p>
                                                <p className="flex items-start gap-2">
                                                    <span className="text-orange-500">4.</span>
                                                    Admin akan mengkonfirmasi pembayaran Anda
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            disabled={isCancelling}
                                            className="w-full bg-white border-2 border-red-500 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isCancelling ? (
                                                <>
                                                    <div className="w-5 h-5 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                    Membatalkan...
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-5 h-5" />
                                                    Batalkan Pesanan
                                                </>
                                            )}
                                        </button>
                                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                            <p className="text-orange-800 text-sm text-center">
                                                💡 Setelah transfer, admin akan mengkonfirmasi pembayaran Anda
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                        <p className="text-red-900 font-bold text-lg mb-2">Pesanan Expired</p>
                                        <p className="text-red-700 mb-4">Pesanan ini telah melewati batas waktu pembayaran (24 jam)</p>
                                        <a
                                            href="/"
                                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                                        >
                                            Buat Pesanan Baru
                                        </a>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                )}

                {/* Back Button */}
                <a
                    href="/"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali ke Beranda
                </a>
            </div>
        </div>
    );
}