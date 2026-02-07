import { useState, useEffect } from 'react';
import { router, usePage, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';
import {
    Search,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Filter,
    ChevronDown,
    Calendar,
    User,
    CreditCard,
    DollarSign,
    RefreshCw,
    AlertTriangle,
    Printer,
    Mail,
    FileText,
    Send,
    Package,
    Download
} from 'lucide-react';

export default function AdminOrdersIndex({ orders = [] }) {
    // Debug: Log orders data
    console.log('Orders received:', orders);
    console.log('Orders length:', orders?.length);
    console.log('Orders type:', typeof orders);
    
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmData, setConfirmData] = useState({ orderId: null, newStatus: null });
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    // Auto-sync Midtrans orders every 10 seconds
    useEffect(() => {
        const syncMidtransOrders = async () => {
            const midtransOrders = orders.filter(o =>
                o.payment_method === 'midtrans' &&
                o.payment_status === 'unpaid'
            );

            if (midtransOrders.length === 0) return;

            try {
                await Promise.all(
                    midtransOrders.map(order =>
                        axios.get(`/midtrans/check-status/${order.id}`).catch(() => null)
                    )
                );
                router.reload({ only: ['orders'] });
            } catch (error) {
                console.error('Sync error:', error);
            }
        };

        const interval = setInterval(syncMidtransOrders, 10000);
        return () => clearInterval(interval);
    }, [orders]);

    const handleStatusChange = (orderId, newStatus) => {
        console.log('handleStatusChange called:', orderId, newStatus);
        setConfirmData({ orderId, newStatus });
        setShowConfirmModal(true);
    };

    const confirmStatusChange = async () => {
        const { orderId, newStatus } = confirmData;
        setIsProcessing(true);
        
        try {
            await router.patch(`/admin/orders/${orderId}/status`, {
                payment_status: newStatus
            }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setShowConfirmModal(false);
                    setIsProcessing(false);
                },
                onError: (errors) => {
                    console.error('Error updating status:', errors);
                    alert('Gagal mengubah status pesanan');
                    setIsProcessing(false);
                }
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat mengubah status');
            setIsProcessing(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = 
            filterStatus === 'all' || 
            order.payment_status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const openModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
        setEmailSent(false);
    };

    const openInvoiceModal = (order) => {
        setSelectedOrder(order);
        setShowInvoiceModal(true);
        setEmailSent(false);
    };

    const closeInvoiceModal = () => {
        setShowInvoiceModal(false);
        setSelectedOrder(null);
        setEmailSent(false);
    };

    const getInvoiceHtml = () => {
        const logoUrl = `${window.location.origin}/images/kaspa-space-logo.png`;
        const paymentMethodText = selectedOrder?.payment_method === 'cash' ? 'Tunai' :
            selectedOrder?.payment_method === 'qris' ? 'QRIS' :
            selectedOrder?.payment_method === 'bank_transfer' ? 'Transfer Bank' :
            selectedOrder?.payment_method === 'midtrans' ? 'Midtrans' : selectedOrder?.payment_method;

        const statusText = selectedOrder?.payment_status === 'paid' || selectedOrder?.payment_status === 'verified' ? 'Lunas' :
            selectedOrder?.status === 'cancelled' ? 'Dibatalkan' : 'Menunggu Pembayaran';

        const statusClass = selectedOrder?.payment_status === 'paid' || selectedOrder?.payment_status === 'verified' ? 'status-paid' :
            selectedOrder?.status === 'cancelled' ? 'status-cancelled' : 'status-unpaid';

        const itemsHtml = selectedOrder?.items?.map(item => {
            let bookingInfo = '';
            if (item.booking_start_at && item.booking_end_at) {
                const start = new Date(item.booking_start_at);
                const end = new Date(item.booking_end_at);
                const isDateOnly = ['private_office', 'virtual_office'].includes(item.product?.product_type);

                if (isDateOnly) {
                    // Date-only booking: show date range
                    const startDate = start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                    const endDate = end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                    bookingInfo = `<br><small style="color: #059669;">${startDate} - ${endDate}</small>`;
                } else {
                    // Hourly booking: show date + time range
                    const dateStr = start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                    const startTime = start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    const endTime = end.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    bookingInfo = `<br><small style="color: #059669;">${dateStr}, ${startTime} - ${endTime}</small>`;
                }
            }
            return `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                    ${item.product_name}
                    ${item.variant_name ? `<br><small style="color: #3b82f6;">${item.variant_name}</small>` : ''}
                    ${bookingInfo}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">Rp${Number(item.price).toLocaleString('id-ID')}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">Rp${Number(item.subtotal).toLocaleString('id-ID')}</td>
            </tr>
        `}).join('') || '';

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${selectedOrder?.order_number}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                    .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
                    .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .invoice-info div { flex: 1; }
                    .invoice-info h3 { color: #3b82f6; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; }
                    .invoice-info p { margin: 5px 0; font-size: 14px; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    .invoice-table th { background: #3b82f6; color: white; padding: 12px; text-align: left; font-size: 14px; }
                    .invoice-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
                    .invoice-total { text-align: right; margin-top: 20px; }
                    .invoice-total .total-row { display: flex; justify-content: flex-end; margin: 5px 0; }
                    .invoice-total .total-label { width: 150px; text-align: right; padding-right: 20px; }
                    .invoice-total .total-value { width: 150px; text-align: right; font-weight: bold; }
                    .invoice-total .grand-total { font-size: 18px; color: #3b82f6; border-top: 2px solid #3b82f6; padding-top: 10px; margin-top: 10px; }
                    .invoice-footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
                    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                    .status-paid { background: #dcfce7; color: #166534; }
                    .status-unpaid { background: #fef9c3; color: #854d0e; }
                    .status-cancelled { background: #fee2e2; color: #991b1b; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <div class="invoice-header">
                    <img src="${logoUrl}" alt="Kaspa Space" style="height: 100px;" />
                </div>
                <div class="invoice-info">
                    <div>
                        <h3>Informasi Pesanan</h3>
                        <p><strong>No. Invoice:</strong> ${selectedOrder?.order_number}</p>
                        <p><strong>Tanggal:</strong> ${formatDate(selectedOrder?.created_at)}</p>
                        <p><strong>Metode Pembayaran:</strong> ${paymentMethodText}</p>
                        <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${statusText}</span></p>
                    </div>
                    <div>
                        <h3>Informasi Pelanggan</h3>
                        <p><strong>Nama:</strong> ${selectedOrder?.customer_name}</p>
                        <p><strong>Email:</strong> ${selectedOrder?.customer_email}</p>
                        ${selectedOrder?.customer_phone ? `<p><strong>Telepon:</strong> ${selectedOrder?.customer_phone}</p>` : ''}
                    </div>
                </div>
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Produk</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Harga</th>
                            <th style="text-align: right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <div class="invoice-total">
                    <div class="total-row grand-total">
                        <span class="total-label">TOTAL:</span>
                        <span class="total-value">Rp${Number(selectedOrder?.total).toLocaleString('id-ID')}</span>
                    </div>
                </div>
                <div class="invoice-footer">
                    <p>Terima kasih telah berbelanja di Kaspa Space</p>
                    <p>Invoice ini dibuat secara otomatis dan sah tanpa tanda tangan</p>
                </div>
            </body>
            </html>
        `;
    };

    const handlePrintInvoice = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(getInvoiceHtml());
        printWindow.document.close();
        printWindow.focus();

        // Wait for image to load before printing
        const img = printWindow.document.querySelector('img');
        const doPrint = () => {
            printWindow.print();
            printWindow.close();
        };

        if (img && !img.complete) {
            img.onload = doPrint;
            img.onerror = doPrint;
        } else {
            setTimeout(doPrint, 300);
        }
    };

    const handleDownloadInvoice = () => {
        if (!selectedOrder) return;

        // Download PDF langsung dari backend
        window.location.href = `/admin/orders/${selectedOrder.id}/download-invoice`;
    };

    const handleSendInvoiceEmail = async () => {
        if (!selectedOrder) return;

        setIsSendingEmail(true);
        try {
            await axios.post(`/admin/orders/${selectedOrder.id}/send-invoice`);
            setEmailSent(true);
            setTimeout(() => setEmailSent(false), 3000);
        } catch (error) {
            console.error('Error sending invoice:', error);
            alert('Gagal mengirim invoice. Pastikan konfigurasi email sudah benar.');
        } finally {
            setIsSendingEmail(false);
        }
    };

    const getStatusBadge = (paymentStatus, orderStatus) => {
        // Jika cancelled, tampilkan Gagal
        if (orderStatus === 'cancelled') {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3" />
                    Gagal
                </span>
            );
        }

        const statuses = {
            pending: { 
                color: 'bg-yellow-100 text-yellow-800', 
                text: 'Menunggu', 
                icon: Clock 
            },
            unpaid: { 
                color: 'bg-yellow-100 text-yellow-800', 
                text: 'Menunggu', 
                icon: Clock 
            },
            paid: { 
                color: 'bg-green-100 text-green-800', 
                text: 'Terbayar', 
                icon: CheckCircle 
            },
            verified: { 
                color: 'bg-green-100 text-green-800', 
                text: 'Terverifikasi', 
                icon: CheckCircle 
            },
            rejected: { 
                color: 'bg-red-100 text-red-800', 
                text: 'Ditolak', 
                icon: XCircle 
            },
            refunded: { 
                color: 'bg-gray-100 text-gray-800', 
                text: 'Refund', 
                icon: XCircle 
            }
        };
        
        const status_info = statuses[paymentStatus] || statuses.pending;
        const Icon = status_info.icon;
        
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${status_info.color}`}>
                <Icon className="w-3 h-3" />
                {status_info.text}
            </span>
        );
    };

    const getPaymentMethodLabel = (method) => {
        const methods = {
            qris: { text: 'QRIS', color: 'bg-purple-100 text-purple-700' },
            bank_transfer: { text: 'Transfer Bank', color: 'bg-blue-100 text-blue-700' },
            cash: { text: 'Tunai', color: 'bg-orange-100 text-orange-700' },
            midtrans: { text: 'Midtrans', color: 'bg-indigo-100 text-indigo-700' }
        };
        const methodInfo = methods[method] || { text: method, color: 'bg-gray-100 text-gray-700' };
        return (
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${methodInfo.color}`}>
                {methodInfo.text}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
        });
    };

    const stats = {
        pending: orders.filter(o => o.payment_status === 'pending' || o.payment_status === 'unpaid').length,
        paid: orders.filter(o => o.payment_status === 'unpaid' && ['cash', 'qris', 'bank_transfer'].includes(o.payment_method)).length, // Manual payment methods need verification
        verified: orders.filter(o =>
            o.payment_status === 'verified' ||
            (o.payment_status === 'paid' && o.payment_method === 'midtrans') || // Midtrans paid = auto verified
            (o.payment_status === 'paid' && ['cash', 'qris', 'bank_transfer'].includes(o.payment_method)) // Manual methods paid = verified
        ).length
    };

    return (
        <AdminLayout>
            <Head title="Kelola Pesanan" />
            
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Pesanan</h1>
                <p className="text-gray-600">Kelola dan pantau semua pesanan pelanggan</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-600 text-sm font-medium">Menunggu Pembayaran</p>
                            <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
                        </div>
                        <Clock className="w-10 h-10 text-yellow-400" />
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 text-sm font-medium">Perlu Verifikasi</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{stats.paid}</p>
                        </div>
                        <Clock className="w-10 h-10 text-blue-400" />
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 text-sm font-medium">Terverifikasi</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">{stats.verified}</p>
                        </div>
                        <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nomor pesanan atau nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                        >
                            <option value="all">Semua Status</option>
                            <option value="pending">Menunggu</option>
                            <option value="paid">Perlu Verifikasi</option>
                            <option value="verified">Terverifikasi</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Pesanan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Pelanggan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Metode
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada data pesanan
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{order.order_number}</p>
                                                <p className="text-sm text-gray-500">
                                                    {order.paid_at ? formatDate(order.paid_at) : formatDate(order.created_at)}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{order.customer_name}</p>
                                                <p className="text-sm text-gray-500">{order.customer_email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getPaymentMethodLabel(order.payment_method)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">
                                                Rp{Number(order.total).toLocaleString('id-ID')}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(order.payment_status, order.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {['cash', 'qris', 'bank_transfer'].includes(order.payment_method) && order.payment_status !== 'paid' && order.status !== 'cancelled' && (
                                                    <select
                                                        value={order.payment_status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="unpaid">Menunggu</option>
                                                        <option value="paid">Lunas</option>
                                                        <option value="cancelled">Batal</option>
                                                    </select>
                                                )}
                                                <button
                                                    onClick={() => openModal(order)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Detail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Detail & Verifikasi */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Detail Pembayaran</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Order Info */}
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Informasi Pesanan</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">No. Pesanan:</span>
                                            <span className="font-semibold">{selectedOrder.order_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tanggal:</span>
                                            <span className="font-semibold">{formatDate(selectedOrder.created_at)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total:</span>
                                            <span className="font-semibold text-blue-600">
                                                Rp{Number(selectedOrder.total).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Metode:</span>
                                            {getPaymentMethodLabel(selectedOrder.payment_method)}
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            {getStatusBadge(selectedOrder.payment_status, selectedOrder.status)}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Informasi Pelanggan</h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <p className="text-gray-600">Nama:</p>
                                            <p className="font-semibold">{selectedOrder.customer_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Email:</p>
                                            <p className="font-semibold">{selectedOrder.customer_email}</p>
                                        </div>
                                        {selectedOrder.customer_phone && (
                                            <div>
                                                <p className="text-gray-600">Telepon:</p>
                                                <p className="font-semibold">{selectedOrder.customer_phone}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            {selectedOrder.items && selectedOrder.items.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        Item Pesanan
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-gray-600">Produk</th>
                                                    <th className="px-4 py-2 text-center text-gray-600">Qty</th>
                                                    <th className="px-4 py-2 text-right text-gray-600">Harga</th>
                                                    <th className="px-4 py-2 text-right text-gray-600">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.items.map((item, index) => (
                                                    <tr key={index} className="border-t border-gray-200">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {item.product_image ? (
                                                                    <img
                                                                        src={item.product_image}
                                                                        alt={item.product_name}
                                                                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                                                                    />
                                                                ) : (
                                                                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                                                                        <Package className="w-7 h-7 text-gray-400" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{item.product_name}</p>
                                                                    {item.variant_name && (
                                                                        <p className="text-xs text-blue-600">{item.variant_name}</p>
                                                                    )}
                                                                    {item.booking_start_at && item.booking_end_at && (
                                                                        <p className="text-xs text-emerald-600 mt-0.5">
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
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            Rp{Number(item.price).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-semibold">
                                                            Rp{Number(item.subtotal).toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-blue-50">
                                                <tr>
                                                    <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-700">
                                                        Total:
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-blue-600">
                                                        Rp{Number(selectedOrder.total).toLocaleString('id-ID')}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Invoice Actions */}
                            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    Invoice
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <button
                                        onClick={() => setShowInvoiceModal(true)}
                                        className="bg-white border border-blue-300 text-blue-600 py-2.5 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Lihat
                                    </button>
                                    <button
                                        onClick={handlePrintInvoice}
                                        className="bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Cetak
                                    </button>
                                    <button
                                        onClick={handleDownloadInvoice}
                                        className="bg-purple-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Unduh PDF
                                    </button>
                                    <button
                                        onClick={handleSendInvoiceEmail}
                                        disabled={isSendingEmail}
                                        className="bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSendingEmail ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Mengirim...
                                            </>
                                        ) : emailSent ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Terkirim!
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-4 h-4" />
                                                Email
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Hidden Invoice Print Area */}
                            <div id="invoice-print-area" className="hidden">
                                <div className="invoice-header">
                                    <img src="/images/kaspa-space-logo.png" alt="Kaspa Space" style={{height: '100px', marginBottom: '10px'}} />
                                </div>
                                <div className="invoice-info">
                                    <div>
                                        <h3>Informasi Pesanan</h3>
                                        <p><strong>No. Invoice:</strong> {selectedOrder.order_number}</p>
                                        <p><strong>Tanggal:</strong> {formatDate(selectedOrder.created_at)}</p>
                                        <p><strong>Metode Pembayaran:</strong> {
                                            selectedOrder.payment_method === 'cash' ? 'Tunai' :
                                            selectedOrder.payment_method === 'qris' ? 'QRIS' :
                                            selectedOrder.payment_method === 'bank_transfer' ? 'Transfer Bank' :
                                            selectedOrder.payment_method === 'midtrans' ? 'Midtrans' : selectedOrder.payment_method
                                        }</p>
                                        <p><strong>Status:</strong> <span className={`status-badge ${
                                            selectedOrder.payment_status === 'paid' || selectedOrder.payment_status === 'verified' ? 'status-paid' :
                                            selectedOrder.status === 'cancelled' ? 'status-cancelled' : 'status-unpaid'
                                        }`}>{
                                            selectedOrder.payment_status === 'paid' || selectedOrder.payment_status === 'verified' ? 'Lunas' :
                                            selectedOrder.status === 'cancelled' ? 'Dibatalkan' : 'Menunggu Pembayaran'
                                        }</span></p>
                                    </div>
                                    <div>
                                        <h3>Informasi Pelanggan</h3>
                                        <p><strong>Nama:</strong> {selectedOrder.customer_name}</p>
                                        <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                                        {selectedOrder.customer_phone && <p><strong>Telepon:</strong> {selectedOrder.customer_phone}</p>}
                                    </div>
                                </div>
                                <table className="invoice-table">
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th style={{textAlign: 'center'}}>Qty</th>
                                            <th style={{textAlign: 'right'}}>Harga</th>
                                            <th style={{textAlign: 'right'}}>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    {item.product_name}
                                                    {item.variant_name && <br />}
                                                    {item.variant_name && <small style={{color: '#3b82f6'}}>{item.variant_name}</small>}
                                                    {item.booking_start_at && item.booking_end_at && (
                                                        <>
                                                            <br />
                                                            <small style={{color: '#059669'}}>
                                                                {['private_office', 'virtual_office'].includes(item.product?.product_type) ? (
                                                                    `${new Date(item.booking_start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(item.booking_end_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                                                ) : (
                                                                    `${new Date(item.booking_start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, ${new Date(item.booking_start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(item.booking_end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                                                                )}
                                                            </small>
                                                        </>
                                                    )}
                                                </td>
                                                <td style={{textAlign: 'center'}}>{item.quantity}</td>
                                                <td style={{textAlign: 'right'}}>Rp{Number(item.price).toLocaleString('id-ID')}</td>
                                                <td style={{textAlign: 'right'}}>Rp{Number(item.subtotal).toLocaleString('id-ID')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="invoice-total">
                                    <div className="total-row grand-total">
                                        <span className="total-label">TOTAL:</span>
                                        <span className="total-value">Rp{Number(selectedOrder.total).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                                <div className="invoice-footer">
                                    <p>Terima kasih telah berbelanja di Kaspa Space</p>
                                    <p>Invoice ini dibuat secara otomatis dan sah tanpa tanda tangan</p>
                                </div>
                            </div>

                            {/* Payment Proof */}
                            {selectedOrder.payment_proof && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">Bukti Pembayaran</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <img
                                            src={selectedOrder.payment_proof}
                                            alt="Bukti Pembayaran"
                                            className="w-full max-h-96 object-contain rounded-lg"
                                        />
                                        <div className="mt-3 text-center">
                                            <a
                                                href={selectedOrder.payment_proof}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                Lihat ukuran penuh →
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Midtrans payment auto-verified info */}
                            {selectedOrder.payment_status === 'paid' && selectedOrder.payment_method === 'midtrans' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                    <div>
                                        <p className="font-semibold text-green-900">Pembayaran Terverifikasi Otomatis</p>
                                        <p className="text-sm text-green-700">
                                            Pembayaran Midtrans telah diverifikasi pada {formatDate(selectedOrder.paid_at || selectedOrder.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedOrder.payment_status === 'verified' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                    <div>
                                        <p className="font-semibold text-green-900">Pembayaran Terverifikasi</p>
                                        <p className="text-sm text-green-700">
                                            Pembayaran telah diverifikasi pada {formatDate(selectedOrder.paid_at)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {(selectedOrder.payment_status === 'pending' || selectedOrder.payment_status === 'unpaid') && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                    <div>
                                        <p className="font-semibold text-yellow-900">Menunggu Pembayaran</p>
                                        <p className="text-sm text-yellow-700">
                                            {selectedOrder.payment_method === 'qris' && 'Pelanggan belum melakukan pembayaran via QRIS'}
                                            {selectedOrder.payment_method === 'bank_transfer' && 'Pelanggan belum melakukan transfer bank'}
                                            {selectedOrder.payment_method === 'cash' && 'Pelanggan belum melakukan pembayaran tunai'}
                                            {selectedOrder.payment_method === 'midtrans' && 'Pelanggan belum menyelesaikan pembayaran Midtrans'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
                        <div className="text-center">
                            {/* Icon */}
                            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Konfirmasi Perubahan Status
                            </h3>
                            
                            {/* Message */}
                            <p className="text-gray-600 mb-2">
                                Apakah Anda yakin ingin mengubah status pesanan menjadi:
                            </p>
                            <p className="text-xl font-bold mb-6">
                                {confirmData.newStatus === 'paid' && (
                                    <span className="text-green-600">✓ Lunas</span>
                                )}
                                {confirmData.newStatus === 'unpaid' && (
                                    <span className="text-yellow-600">⏳ Menunggu</span>
                                )}
                                {confirmData.newStatus === 'cancelled' && (
                                    <span className="text-red-600">✕ Dibatalkan</span>
                                )}
                            </p>
                            
                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setConfirmData({ orderId: null, newStatus: null });
                                    }}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmStatusChange}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        'Oke, Ubah Status'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Preview Modal */}
            {showInvoiceModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Invoice #{selectedOrder.order_number}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrintInvoice}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Printer className="w-4 h-4" />
                                    Cetak
                                </button>
                                <button
                                    onClick={handleDownloadInvoice}
                                    className="px-3 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Unduh PDF
                                </button>
                                <button
                                    onClick={handleSendInvoiceEmail}
                                    disabled={isSendingEmail}
                                    className="px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
                                >
                                    {isSendingEmail ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : emailSent ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    {isSendingEmail ? 'Mengirim...' : emailSent ? 'Terkirim!' : 'Email'}
                                </button>
                                <button
                                    onClick={() => setShowInvoiceModal(false)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl px-2"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Invoice Content */}
                        <div className="p-8">
                            {/* Invoice Header */}
                            <div className="text-center mb-8 pb-6 border-b-2 border-blue-500">
                                <img
                                    src="/images/kaspa-space-logo.png"
                                    alt="Kaspa Space"
                                    className="h-24 mx-auto"
                                />
                            </div>

                            {/* Invoice Info */}
                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Informasi Pesanan</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-gray-500">No. Invoice:</span> <span className="font-semibold">{selectedOrder.order_number}</span></p>
                                        <p><span className="text-gray-500">Tanggal:</span> <span className="font-semibold">{formatDate(selectedOrder.created_at)}</span></p>
                                        <p><span className="text-gray-500">Metode Pembayaran:</span> <span className="font-semibold">
                                            {selectedOrder.payment_method === 'cash' ? 'Tunai' :
                                             selectedOrder.payment_method === 'qris' ? 'QRIS' :
                                             selectedOrder.payment_method === 'bank_transfer' ? 'Transfer Bank' :
                                             selectedOrder.payment_method === 'midtrans' ? 'Midtrans' : selectedOrder.payment_method}
                                        </span></p>
                                        <p><span className="text-gray-500">Status:</span> {getStatusBadge(selectedOrder.payment_status, selectedOrder.status)}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Informasi Pelanggan</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-gray-500">Nama:</span> <span className="font-semibold">{selectedOrder.customer_name}</span></p>
                                        <p><span className="text-gray-500">Email:</span> <span className="font-semibold">{selectedOrder.customer_email}</span></p>
                                        {selectedOrder.customer_phone && (
                                            <p><span className="text-gray-500">Telepon:</span> <span className="font-semibold">{selectedOrder.customer_phone}</span></p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Invoice Items Table */}
                            <div className="mb-8">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-blue-600 text-white">
                                            <th className="px-4 py-3 text-left rounded-tl-lg">Produk</th>
                                            <th className="px-4 py-3 text-center">Qty</th>
                                            <th className="px-4 py-3 text-right">Harga</th>
                                            <th className="px-4 py-3 text-right rounded-tr-lg">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-4">
                                                    <p className="font-medium text-gray-900">{item.product_name}</p>
                                                    {item.variant_name && (
                                                        <p className="text-sm text-blue-600">{item.variant_name}</p>
                                                    )}
                                                    {item.booking_start_at && item.booking_end_at && (
                                                        <p className="text-sm text-emerald-600 mt-1">
                                                            {['private_office', 'virtual_office'].includes(item.product?.product_type) ? (
                                                                <>
                                                                    {new Date(item.booking_start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(item.booking_end_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {new Date(item.booking_start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })},{' '}
                                                                    {new Date(item.booking_start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(item.booking_end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                                </>
                                                            )}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-center">{item.quantity}</td>
                                                <td className="px-4 py-4 text-right">Rp{Number(item.price).toLocaleString('id-ID')}</td>
                                                <td className="px-4 py-4 text-right font-semibold">Rp{Number(item.subtotal).toLocaleString('id-ID')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Invoice Total */}
                            <div className="flex justify-end mb-8">
                                <div className="w-64">
                                    <div className="flex justify-between py-3 border-t-2 border-blue-500">
                                        <span className="text-lg font-bold text-gray-900">TOTAL</span>
                                        <span className="text-xl font-bold text-blue-600">Rp{Number(selectedOrder.total).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Invoice Footer */}
                            <div className="text-center pt-6 border-t border-gray-200">
                                <p className="text-gray-600">Terima kasih telah berbelanja di Kaspa Space</p>
                                <p className="text-gray-400 text-sm mt-1">Invoice ini dibuat secara otomatis dan sah tanpa tanda tangan</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}