import { useState, useEffect } from 'react';
import { router, usePage, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import kaspaLogo from '@/../images/logo.png';
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

    // Auto-sync Midtrans orders every 30 seconds
    useEffect(() => {
        const syncMidtransOrders = async () => {
            const midtransOrders = orders
                .filter(o =>
                    o.payment_method === 'midtrans' &&
                    o.payment_status === 'unpaid' &&
                    o.status !== 'cancelled'
                )
                .slice(0, 10); // batasi max 10 request sekaligus

            if (midtransOrders.length === 0) return;

            try {
                const results = await Promise.allSettled(
                    midtransOrders.map(order =>
                        axios.get(`/midtrans/check-status/${order.id}`)
                    )
                );
                const anyChanged = results.some(r => r.status === 'fulfilled');
                if (anyChanged) {
                    router.reload({ only: ['orders'], preserveScroll: true });
                }
            } catch (error) {
                console.error('Sync error:', error);
            }
        };

        const interval = setInterval(syncMidtransOrders, 30000);
        return () => clearInterval(interval);
    }, []); // jalankan sekali saja saat mount

    const handleStatusChange = (orderId, newStatus) => {
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
            (filterStatus === 'menunggu' && (order.payment_status === 'pending' || order.payment_status === 'unpaid') && !isCancelled(order)) ||
            (filterStatus === 'terbayar' && (order.payment_status === 'paid' || order.payment_status === 'verified') && !isCancelled(order) && order.payment_status !== 'refunded') ||
            (filterStatus === 'dibatalkan' && isCancelled(order)) ||
            (filterStatus === 'refunded' && order.payment_status === 'refunded');

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

        const statusText = (selectedOrder?.status === 'cancelled' || selectedOrder?.payment_status === 'cancelled') ? 'Dibatalkan' :
            selectedOrder?.payment_status === 'refunded' ? 'Refund' :
            (selectedOrder?.payment_status === 'paid' || selectedOrder?.payment_status === 'verified') ? 'Terbayar' : 'Menunggu Pembayaran';

        const statusClass = (selectedOrder?.status === 'cancelled' || selectedOrder?.payment_status === 'cancelled') ? 'status-cancelled' :
            selectedOrder?.payment_status === 'refunded' ? 'status-refunded' :
            (selectedOrder?.payment_status === 'paid' || selectedOrder?.payment_status === 'verified') ? 'status-paid' : 'status-unpaid';

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
                    .status-refunded { background: #f3e8ff; color: #6b21a8; }
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
        window.open(`/admin/orders/${selectedOrder.id}/download-invoice`, '_blank', 'noopener,noreferrer');
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
        if (orderStatus === 'cancelled' || paymentStatus === 'cancelled') {
            return (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#fee2e2', color: '#b91c1c' }}>
                    Dibatalkan
                </span>
            );
        }
        const map = {
            pending:  { bg: '#fef9c3', color: '#854d0e', label: 'Menunggu' },
            unpaid:   { bg: '#fef9c3', color: '#854d0e', label: 'Menunggu' },
            paid:     { bg: '#dcfce7', color: '#166534', label: 'Terbayar' },
            verified: { bg: '#dcfce7', color: '#166534', label: 'Terbayar' },
            rejected: { bg: '#fee2e2', color: '#b91c1c', label: 'Dibatalkan' },
            refunded: { bg: '#f3e8ff', color: '#7c3aed', label: 'Refund' },
        };
        const cfg = map[paymentStatus] || map.pending;
        return (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>
                {cfg.label}
            </span>
        );
    };

    const getPaymentMethodLabel = (method) => {
        const methods = {
            qris:          { text: 'QRIS',          bg: '#f3e8ff', color: '#7c3aed' },
            bank_transfer: { text: 'Transfer Bank', bg: '#eff6ff', color: '#005bbf' },
            cash:          { text: 'Tunai',         bg: '#fff7ed', color: '#c2410c' },
            midtrans:      { text: 'Midtrans',      bg: '#eef2ff', color: '#4338ca' },
        };
        const m = methods[method] || { text: method, bg: '#f3f4f6', color: '#6b7280' };
        return (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 8, background: m.bg, color: m.color }}>
                {m.text}
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

    const isCancelled = (o) => o.status === 'cancelled' || o.payment_status === 'cancelled';
    const stats = {
        menunggu: orders.filter(o => (o.payment_status === 'pending' || o.payment_status === 'unpaid') && !isCancelled(o)).length,
        terbayar: orders.filter(o => (o.payment_status === 'paid' || o.payment_status === 'verified') && !isCancelled(o) && o.payment_status !== 'refunded').length,
        dibatalkan: orders.filter(o => isCancelled(o)).length,
        refunded: orders.filter(o => o.payment_status === 'refunded').length,
        pendapatan: orders
            .filter(o => (o.payment_status === 'paid' || o.payment_status === 'verified') && !isCancelled(o) && o.payment_status !== 'refunded')
            .reduce((sum, o) => sum + Number(o.total), 0),
    };

    const BLUE = '#005bbf';

    const statCards = [
        { label: 'Menunggu',    value: stats.menunggu,   icon: Clock,        color: '#fefce8', iconColor: '#d97706' },
        { label: 'Terbayar',    value: stats.terbayar,   icon: CheckCircle,  color: '#f0fdf4', iconColor: '#16a34a' },
        { label: 'Dibatalkan',  value: stats.dibatalkan, icon: XCircle,      color: '#fef2f2', iconColor: '#dc2626' },
        { label: 'Refund',      value: stats.refunded,   icon: RefreshCw,    color: '#fdf4ff', iconColor: '#9333ea' },
        { label: 'Pendapatan',  value: `Rp${stats.pendapatan.toLocaleString('id-ID')}`, icon: DollarSign, color: '#eff6ff', iconColor: BLUE },
    ];

    return (
        <AdminLayout>
            <Head title="Kelola Pesanan" />

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
                    Kelola Pesanan
                </h1>
                <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
                    Kelola dan pantau semua pesanan pelanggan
                </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
                {statCards.map((s) => (
                    <div key={s.label} style={{
                        background: '#fff', borderRadius: 14, padding: '18px 20px',
                        boxShadow: '0 1px 6px rgba(26,46,90,0.07)',
                        display: 'flex', flexDirection: 'column', gap: 10,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {s.label}
                            </p>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <s.icon style={{ width: 18, height: 18, color: s.iconColor }} />
                            </div>
                        </div>
                        <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(26,46,90,0.07)', marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f2f8', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nomor pesanan atau nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                                border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151',
                                outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Filter style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af' }} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                paddingLeft: 34, paddingRight: 32, paddingTop: 9, paddingBottom: 9,
                                border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151',
                                background: '#fff', appearance: 'none', outline: 'none', cursor: 'pointer',
                            }}
                        >
                            <option value="all">Semua Status</option>
                            <option value="menunggu">Menunggu</option>
                            <option value="terbayar">Terbayar</option>
                            <option value="dibatalkan">Dibatalkan</option>
                            <option value="refunded">Refund</option>
                        </select>
                        <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af', pointerEvents: 'none' }} />
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(26,46,90,0.07)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8faff' }}>
                                {['Pesanan', 'Pelanggan', 'Metode', 'Total', 'Status', 'Aksi'].map((h, i) => (
                                    <th key={h} style={{
                                        padding: '11px 18px', fontSize: 11, fontWeight: 700, color: '#9ca3af',
                                        textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                                        Tidak ada data pesanan
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order, idx) => (
                                    <tr key={order.id} style={{ borderTop: '1px solid #f0f2f8', background: idx % 2 === 0 ? '#fff' : '#fafbff' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafbff'}
                                    >
                                        <td style={{ padding: '14px 18px' }}>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: BLUE, margin: 0 }}>{order.order_number}</p>
                                            <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                                                {order.paid_at ? formatDate(order.paid_at) : formatDate(order.created_at)}
                                            </p>
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{
                                                    width: 30, height: 30, borderRadius: '50%', background: '#eff6ff',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                }}>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: BLUE }}>
                                                        {(order.customer_name || 'U')[0].toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{order.customer_name}</p>
                                                    <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{order.customer_email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            {getPaymentMethodLabel(order.payment_method)}
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                                                Rp{Number(order.total).toLocaleString('id-ID')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            {getStatusBadge(order.payment_status, order.status)}
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {['cash', 'qris', 'bank_transfer'].includes(order.payment_method) && order.payment_status !== 'paid' && !isCancelled(order) && order.payment_status !== 'refunded' && (
                                                    <select
                                                        value={order.payment_status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        style={{ padding: '5px 8px', fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8, color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}
                                                    >
                                                        <option value="unpaid">Menunggu</option>
                                                        <option value="paid">Lunas</option>
                                                        <option value="cancelled">Batal</option>
                                                    </select>
                                                )}
                                                {(order.payment_status === 'paid' || order.payment_status === 'verified') && !isCancelled(order) && (
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, 'refunded')}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                                            padding: '5px 10px', background: '#f3e8ff', color: '#7c3aed',
                                                            border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                                        }}
                                                    >
                                                        <RefreshCw style={{ width: 13, height: 13 }} />
                                                        Refund
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openModal(order)}
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                                        padding: '5px 12px', background: BLUE, color: '#fff',
                                                        border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                                    }}
                                                >
                                                    <Eye style={{ width: 13, height: 13 }} />
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
                                            (selectedOrder.status === 'cancelled' || selectedOrder.payment_status === 'cancelled') ? 'status-cancelled' :
                                            selectedOrder.payment_status === 'refunded' ? 'status-refunded' :
                                            (selectedOrder.payment_status === 'paid' || selectedOrder.payment_status === 'verified') ? 'status-paid' : 'status-unpaid'
                                        }`}>{
                                            (selectedOrder.status === 'cancelled' || selectedOrder.payment_status === 'cancelled') ? 'Dibatalkan' :
                                            selectedOrder.payment_status === 'refunded' ? 'Refund' :
                                            (selectedOrder.payment_status === 'paid' || selectedOrder.payment_status === 'verified') ? 'Terbayar' : 'Menunggu Pembayaran'
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

                            {/* Dokumen Usaha */}
                            {(selectedOrder.doc_ktp || selectedOrder.doc_npwp || selectedOrder.doc_business_license || selectedOrder.doc_company_name) && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-teal-600" />
                                        Data Usaha
                                    </h3>
                                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 space-y-3">
                                        {selectedOrder.doc_company_name && (
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="text-gray-600">Nama Perusahaan:</span>
                                                <span className="font-semibold">{selectedOrder.doc_company_name}</span>
                                            </div>
                                        )}
                                        {selectedOrder.doc_pic_name && (
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="text-gray-600">Nama PIC:</span>
                                                <span className="font-semibold">{selectedOrder.doc_pic_name}</span>
                                            </div>
                                        )}
                                        {selectedOrder.doc_pic_phone && (
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="text-gray-600">No. Telp PIC:</span>
                                                <span className="font-semibold">{selectedOrder.doc_pic_phone}</span>
                                            </div>
                                        )}
                                        {[
                                            { key: 'doc_ktp',              label: 'KTP' },
                                            { key: 'doc_npwp',             label: 'NPWP' },
                                            { key: 'doc_business_license', label: 'SIUP / Izin Usaha' },
                                        ].map(({ key, label }) => selectedOrder[key] ? (
                                            <div key={key} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">{label}:</span>
                                                <a
                                                    href={selectedOrder[key]}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-teal-700 font-semibold hover:text-teal-900 underline underline-offset-2"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Lihat / Unduh
                                                </a>
                                            </div>
                                        ) : null)}
                                    </div>
                                </div>
                            )}

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
                                {confirmData.newStatus === 'refunded' && (
                                    <span className="text-purple-600">↩ Refund</span>
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
                        <div style={{ background: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>
                            {/* Top-left corner */}
                            <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                                <svg width="130" height="130" viewBox="0 0 130 130" fill="none">
                                    <defs><clipPath id="adminCtl"><polygon points="0,0 130,0 0,130" /></clipPath></defs>
                                    <polygon points="0,0 130,0 0,130" fill="#1a2e5a" />
                                    <g clipPath="url(#adminCtl)" opacity="0.18">
                                        {[-40,-20,0,20,40,60,80,100,120,140].map((o,i) => (
                                            <line key={i} x1={o} y1={0} x2={o+130} y2={130} stroke="#fff" strokeWidth="9" />
                                        ))}
                                    </g>
                                </svg>
                            </div>
                            {/* Bottom-right corner */}
                            <div style={{ position: 'absolute', bottom: 0, right: 0, pointerEvents: 'none' }}>
                                <svg width="130" height="130" viewBox="0 0 130 130" fill="none">
                                    <defs><clipPath id="adminCbr"><polygon points="130,0 130,130 0,130" /></clipPath></defs>
                                    <polygon points="130,0 130,130 0,130" fill="#1a2e5a" />
                                    <g clipPath="url(#adminCbr)" opacity="0.18">
                                        {[-40,-20,0,20,40,60,80,100,120,140].map((o,i) => (
                                            <line key={i} x1={o} y1={0} x2={o+130} y2={130} stroke="#fff" strokeWidth="9" />
                                        ))}
                                    </g>
                                </svg>
                            </div>

                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', padding: '32px 44px 28px 155px', gap: 0 }}>
                                <div style={{ flex: 1 }}>
                                    <img src={kaspaLogo} alt="Kaspa Space"
                                        style={{ height: 44, objectFit: 'contain', display: 'block', marginBottom: 8 }} />
                                    <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Premium Coworking Hub</p>
                                    <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>Jakarta Selatan</p>
                                </div>
                                <div style={{ width: 1, background: '#d1d5db', alignSelf: 'stretch', margin: '0 28px' }} />
                                <div style={{ textAlign: 'right', minWidth: 190 }}>
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 8px' }}>Invoice Number</p>
                                    <p style={{ fontSize: 15, fontWeight: 800, color: '#1a2e5a', fontFamily: 'monospace', margin: '0 0 8px', wordBreak: 'break-all' }}>
                                        {selectedOrder.order_number}
                                    </p>
                                    <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                                        Tanggal: {new Date(selectedOrder.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {/* Info box */}
                            <div style={{ padding: '0 44px 28px' }}>
                                <div style={{ border: '1.5px solid #d1d9e6', borderRadius: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
                                    <div style={{ padding: '18px 22px' }}>
                                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a7fa5', marginBottom: 12 }}>Informasi Pelanggan</p>
                                        <p style={{ fontWeight: 700, fontSize: 14, color: '#1a2e5a', margin: '0 0 6px' }}>{selectedOrder.customer_name}</p>
                                        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 4px' }}>✉ {selectedOrder.customer_email}</p>
                                        {selectedOrder.customer_phone && (
                                            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>📞 {selectedOrder.customer_phone}</p>
                                        )}
                                    </div>
                                    <div style={{ padding: '18px 22px', borderLeft: '1.5px solid #d1d9e6' }}>
                                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a7fa5', marginBottom: 12 }}>Informasi Order</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ fontSize: 13, color: '#6b7280' }}>Metode Pembayaran</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2e5a' }}>
                                                {selectedOrder.payment_method === 'cash' ? 'Tunai' :
                                                 selectedOrder.payment_method === 'qris' ? 'QRIS' :
                                                 selectedOrder.payment_method === 'bank_transfer' ? 'Transfer Bank' :
                                                 selectedOrder.payment_method === 'midtrans' ? 'Midtrans' : selectedOrder.payment_method}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 13, color: '#6b7280' }}>Status</span>
                                            <span style={{
                                                fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20,
                                                background: ['paid','verified'].includes(selectedOrder.payment_status) ? '#1a2e5a' : '#fef9c3',
                                                color: ['paid','verified'].includes(selectedOrder.payment_status) ? '#fff' : '#854d0e',
                                            }}>
                                                {['paid','verified'].includes(selectedOrder.payment_status) ? 'Terbayar' : 'Menunggu'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items table */}
                            <div style={{ padding: '0 44px 32px', position: 'relative' }}>
                                {/* Rubber stamp */}
                                {['paid','verified'].includes(selectedOrder.payment_status) && (
                                    <svg width="260" height="90" viewBox="0 0 260 90" fill="none"
                                        style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translateX(-50%) rotate(-22deg)', pointerEvents: 'none', zIndex: 5 }}>
                                        <rect x="4" y="4" width="252" height="82" rx="8" stroke="#1a2e5a" strokeWidth="5" fill="none" opacity="0.38" />
                                        <rect x="10" y="10" width="240" height="70" rx="5" stroke="#1a2e5a" strokeWidth="2" fill="none" opacity="0.22" />
                                        <text x="130" y="58" textAnchor="middle" fill="none" stroke="#1a2e5a" strokeWidth="2.5"
                                            fontSize="38" fontWeight="900" fontFamily="'Arial Black', Arial, sans-serif" letterSpacing="6" opacity="0.38">
                                            TERBAYAR
                                        </text>
                                    </svg>
                                )}
                                <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative', zIndex: 2 }}>
                                    <thead>
                                        <tr style={{ background: '#1a2e5a' }}>
                                            {['PRODUK', 'QTY', 'HARGA', 'SUBTOTAL'].map((h, i) => (
                                                <th key={h} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', color: '#fff', textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map((item, index) => (
                                            <tr key={index} style={{ background: index % 2 === 0 ? '#f5f7fb' : '#fff' }}>
                                                <td style={{ padding: '13px 16px', borderBottom: '1px solid #edf0f5' }}>
                                                    <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{item.product_name}</span>
                                                    {item.variant_name && (
                                                        <span style={{ display: 'block', fontSize: 12, color: '#3b82f6', marginTop: 2 }}>{item.variant_name}</span>
                                                    )}
                                                    {item.booking_start_at && item.booking_end_at && (
                                                        <span style={{ display: 'block', fontSize: 12, color: '#059669', marginTop: 2 }}>
                                                            {['private_office', 'virtual_office'].includes(item.product?.product_type)
                                                                ? `${new Date(item.booking_start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(item.booking_end_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                                                : `${new Date(item.booking_start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, ${new Date(item.booking_start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(item.booking_end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                                                            }
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '13px 16px', textAlign: 'right', fontSize: 14, color: '#374151', borderBottom: '1px solid #edf0f5' }}>{item.quantity}</td>
                                                <td style={{ padding: '13px 16px', textAlign: 'right', fontSize: 14, color: '#374151', borderBottom: '1px solid #edf0f5' }}>Rp{Number(item.price).toLocaleString('id-ID')}</td>
                                                <td style={{ padding: '13px 16px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#1a2e5a', borderBottom: '1px solid #edf0f5' }}>Rp{Number(item.subtotal).toLocaleString('id-ID')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                                    <div style={{ background: '#1a2e5a', borderRadius: 12, padding: '13px 32px', display: 'flex', alignItems: 'center', gap: 28 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</span>
                                        <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Rp{Number(selectedOrder.total).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ padding: '16px 44px 28px', borderTop: '1px solid #edf0f5', textAlign: 'center' }}>
                                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>
                                    Terima kasih telah berbelanja di Kaspa Space. Invoice ini dibuat secara otomatis dan sah tanpa tanda tangan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}