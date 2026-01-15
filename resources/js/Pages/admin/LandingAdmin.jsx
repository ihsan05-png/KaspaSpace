import React from 'react';
import { Link, Head, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  ShoppingBagIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const LandingAdmin = ({ stats: statsData, recentOrders = [] }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date with timezone
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

  // Handle delete order
  const handleDeleteOrder = (orderId, orderNumber) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pesanan #${orderNumber}?`)) {
      router.delete(`/admin/orders/${orderId}/delete`, {
        preserveScroll: true,
        onSuccess: () => {
          // Success notification handled by backend
        },
        onError: () => {
          alert('Gagal menghapus pesanan');
        }
      });
    }
  };

  const stats = [
    {
      name: 'Total Pesanan',
      value: statsData?.totalOrders || 0,
      icon: ShoppingBagIcon,
      change: '+0%',
      changeType: 'increase',
    },
    {
      name: 'Total Pengguna',
      value: statsData?.totalUsers || 0,
      icon: UserGroupIcon,
      change: '+0%',
      changeType: 'increase',
    },
    {
      name: 'Pendapatan',
      value: formatCurrency(statsData?.totalRevenue || 0),
      icon: CurrencyDollarIcon,
      change: '+0%',
      changeType: 'increase',
    },
    {
      name: 'Produk Aktif',
      value: statsData?.activeProducts || 0,
      icon: ChartBarIcon,
      change: '0',
      changeType: 'neutral',
    },
  ];

  return (
    <AdminLayout>
      <Head title="Dashboard Admin" />
      
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Selamat datang di dashboard admin Kaspa Space
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6 hover:shadow-lg transition-shadow"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'increase'
                    ? 'text-green-600'
                    : stat.changeType === 'decrease'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/orders"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingBagIcon className="h-5 w-5 mr-2 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">
              Kelola Pesanan
            </span>
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">
              Kelola Produk
            </span>
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">
              Kelola Kategori
            </span>
          </Link>
          <Link
            href="/admin/paymentsettings"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CurrencyDollarIcon className="h-5 w-5 mr-2 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">
              Pengaturan Pembayaran
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Aktivitas Terbaru
        </h2>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Pesanan #{order.order_number}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.customer_name} • {order.paid_at ? formatDate(order.paid_at) : formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    order.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : order.payment_status === 'unpaid' && order.status !== 'cancelled'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.payment_status === 'paid' ? 'Dibayar' : 
                     order.payment_status === 'unpaid' && order.status !== 'cancelled' ? 'Menunggu' : 'Gagal'}
                  </span>
                  <button
                    onClick={() => handleDeleteOrder(order.id, order.order_number)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus pesanan"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Belum ada aktivitas terbaru</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default LandingAdmin;