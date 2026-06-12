import React from 'react';
import { Link, Head, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  ShoppingBagIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const BLUE = '#005bbf';
const fmtRp  = (n) => `Rp${Number(n).toLocaleString('id-ID')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

const StatusBadge = ({ order }) => {
  const cancelled = order.status === 'cancelled' || order.payment_status === 'cancelled';
  const paid      = order.payment_status === 'paid' || order.payment_status === 'verified';
  const refunded  = order.payment_status === 'refunded';
  const cfg = cancelled ? { bg: '#fee2e2', color: '#b91c1c', label: 'Dibatalkan' }
            : refunded  ? { bg: '#f3e8ff', color: '#7c3aed', label: 'Refund' }
            : paid      ? { bg: '#dcfce7', color: '#166534', label: 'Terbayar' }
            :             { bg: '#fef9c3', color: '#854d0e', label: 'Menunggu' };
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
    }}>{cfg.label}</span>
  );
};

const LandingAdmin = ({ stats: statsData, recentOrders = [] }) => {
  const { auth } = usePage().props;

  const handleDeleteOrder = (orderId, orderNumber) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pesanan #${orderNumber}?`)) {
      router.delete(`/admin/orders/${orderId}/delete`, { preserveScroll: true,
        onError: () => alert('Gagal menghapus pesanan') });
    }
  };

  const statCards = [
    { label: 'Total Pesanan',  value: statsData?.totalOrders   || 0,                          icon: ShoppingBagIcon,   color: '#eff6ff', iconColor: BLUE },
    { label: 'Total Pengguna', value: statsData?.totalUsers    || 0,                          icon: UserGroupIcon,     color: '#f0fdf4', iconColor: '#16a34a' },
    { label: 'Pendapatan',     value: fmtRp(statsData?.totalRevenue || 0),                    icon: CurrencyDollarIcon,color: '#fefce8', iconColor: '#d97706' },
    { label: 'Produk Aktif',   value: statsData?.activeProducts || 0,                         icon: ChartBarIcon,      color: '#fdf4ff', iconColor: '#9333ea' },
  ];

  const quickActions = [
    { label: 'Kelola Pesanan',          href: '/admin/orders',         icon: ClipboardDocumentListIcon },
    { label: 'Kelola Produk',           href: '/admin/products',       icon: ShoppingBagIcon },
    { label: 'Kelola Kategori',         href: '/admin/categories',     icon: TagIcon },
    { label: 'Pengaturan Pembayaran',   href: '/admin/paymentsettings',icon: CurrencyDollarIcon },
  ];

  return (
    <AdminLayout>
      <Head title="Dashboard Admin" />

      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
          Selamat datang di dashboard admin Kaspa Space
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
          Berikut adalah ringkasan operasional ruang kerja Anda hari ini.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
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
            <p style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* Left: Recent Orders */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(26,46,90,0.07)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f0f2f8' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Aktivitas Pesanan Terbaru</h2>
            <Link href="/admin/orders" style={{ fontSize: 13, fontWeight: 600, color: BLUE, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Lihat Semua <ArrowRightIcon style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8faff' }}>
                  {['ID Pesanan', 'Pelanggan', 'Waktu', 'Total', 'Status', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#9ca3af',
                      textAlign: i >= 3 ? 'right' : 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => (
                  <tr key={order.id} style={{ borderTop: '1px solid #f0f2f8', background: idx % 2 === 0 ? '#fff' : '#fafbff' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <Link href={`/admin/orders`} style={{ fontSize: 13, fontWeight: 700, color: BLUE, textDecoration: 'none' }}>
                        #{order.order_number?.substring(0, 16)}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
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
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>
                        {fmtDate(order.paid_at || order.created_at)}
                      </p>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                        {fmtTime(order.paid_at || order.created_at)}
                      </p>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{fmtRp(order.total)}</span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <StatusBadge order={order} />
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button onClick={() => handleDeleteOrder(order.id, order.order_number)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}>
                        <TrashIcon style={{ width: 15, height: 15 }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              Belum ada aktivitas terbaru
            </div>
          )}
        </div>

        {/* Right: Quick Actions + Promo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Aksi Cepat */}
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(26,46,90,0.07)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #f0f2f8' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Aksi Cepat</h2>
            </div>
            <div style={{ padding: '12px' }}>
              {quickActions.map((a) => (
                <Link key={a.label} href={a.href} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 4,
                  textDecoration: 'none', transition: 'background 0.15s',
                  border: '1px solid #f0f2f8',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#f0f2f8'; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <a.icon style={{ width: 16, height: 16, color: BLUE }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{a.label}</span>
                  <ArrowRightIcon style={{ width: 14, height: 14, color: '#9ca3af', marginLeft: 'auto' }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Promo card */}
          <div style={{
            background: 'linear-gradient(135deg, #1a2e5a 0%, #005bbf 100%)',
            borderRadius: 14, padding: '20px',
            boxShadow: '0 4px 20px rgba(0,91,191,0.3)',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🚀</div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 0 6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Tingkatkan Bisnis Workspace Anda
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', margin: '0 0 14px', lineHeight: 1.5 }}>
              Aktifkan modul statistik premium untuk melihat tren okupansi gedung secara real-time.
            </p>
            <Link href="/admin/statistics" style={{
              display: 'inline-block', padding: '7px 16px',
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              borderRadius: 8, fontSize: 12, fontWeight: 700,
              textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)',
            }}>
              Pelajari Lebih Lanjut
            </Link>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default LandingAdmin;
