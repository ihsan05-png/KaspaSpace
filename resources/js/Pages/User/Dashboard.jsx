import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { 
    ShoppingBag, 
    Receipt, 
    Tag, 
    TrendingUp,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';

export default function UserDashboard({ orders, activeDiscounts, stats }) {
    const getStatusBadge = (paymentStatus, status) => {
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
                                                    {getStatusBadge(order.payment_status, order.status)}
                                                </div>
                                                
                                                <div className="space-y-2 mb-3">
                                                    {order.items.slice(0, 2).map((item) => (
                                                        <p key={item.id} className="text-sm text-gray-600">
                                                            {item.quantity}x {item.product_name}
                                                            {item.variant_name && ` - ${item.variant_name}`}
                                                        </p>
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
                                                    {order.payment_status === 'unpaid' && (
                                                        <a
                                                            href={`/order/${order.id}/payment`}
                                                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                                        >
                                                            Bayar Sekarang →
                                                        </a>
                                                    )}
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
        </>
    );
}
