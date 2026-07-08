import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  PuzzlePieceIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  NewspaperIcon,
  UsersIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
  StarIcon,
  BuildingOfficeIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const BLUE = '#005bbf';
const BLUE_LIGHT = '#eff6ff';
const SIDEBAR_W = 240;

export default function AdminLayout({ children }) {
  const { auth } = usePage().props;
  const { url } = usePage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(
    url.startsWith('/admin/products') || url.startsWith('/admin/categories')
  );

  const userRole = auth?.user?.roles?.[0]?.name ?? auth?.user?.role ?? 'user';
  const isAdmin = userRole === 'admin';

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      router.post('/logout');
    }
  };

  const mainNav = [
    { name: 'Overview',     href: '/admin',               icon: HomeIcon,                  current: url === '/admin' },
    { name: 'Pesanan',      href: '/admin/orders',         icon: ClipboardDocumentListIcon, current: url.startsWith('/admin/orders') && !url.includes('paymentsettings') },

    { name: 'Monitoring',   href: '/admin/monitoring',     icon: ComputerDesktopIcon,       current: url.startsWith('/admin/monitoring') },
    { name: 'Jadwal',       href: '/admin/schedule',       icon: ChartBarIcon,              current: url.startsWith('/admin/schedule') },
    { name: 'Ruangan',      href: '/admin/rooms',          icon: BuildingOfficeIcon,        current: url.startsWith('/admin/rooms') },
    { name: 'Ulasan',       href: '/admin/reviews',        icon: StarIcon,                  current: url.startsWith('/admin/reviews') },
  ];

  const managementNav = isAdmin ? [
    {
      name: 'Manajemen Produk', icon: ShoppingBagIcon,
      current: url.startsWith('/admin/products') || url.startsWith('/admin/categories'),
      children: [
        { name: 'Kategori', href: '/admin/categories', current: url.startsWith('/admin/categories') },
        { name: 'Produk',   href: '/admin/products',   current: url.startsWith('/admin/products') },
      ],
    },
    { name: 'Diskon',    href: '/admin/discounts',  icon: TagIcon,      current: url.startsWith('/admin/discounts') },
    { name: 'Pengguna',  href: '/admin/users',      icon: UsersIcon,    current: url.startsWith('/admin/users') },
    { name: 'Statistik', href: '/admin/statistics', icon: ChartBarIcon, current: url.startsWith('/admin/statistics') },
  ] : [];

  const systemNav = isAdmin ? [
    { name: 'Integrasi',             href: '/admin/integrations',    icon: PuzzlePieceIcon,    current: url.startsWith('/admin/integrations') },
    { name: 'Pengaturan Pembayaran', href: '/admin/paymentsettings', icon: CurrencyDollarIcon, current: url.startsWith('/admin/paymentsettings') },
    { name: 'Agreements',            href: '/admin/agreements',      icon: DocumentTextIcon,   current: url.startsWith('/admin/agreements') },
    { name: 'News & Blogs',          href: '/admin/news',            icon: NewspaperIcon,      current: url.startsWith('/admin/news') },
  ] : [];

  const NavItem = ({ item }) => {
    if (item.children) {
      return (
        <div>
          <button
            onClick={() => setProductsMenuOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: item.current ? BLUE_LIGHT : 'transparent',
              color: item.current ? BLUE : '#6b7280',
              fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <item.icon style={{ width: 18, height: 18, flexShrink: 0 }} />
              {item.name}
            </span>
            {productsMenuOpen
              ? <ChevronDownIcon style={{ width: 14, height: 14 }} />
              : <ChevronRightIcon style={{ width: 14, height: 14 }} />}
          </button>
          {productsMenuOpen && (
            <div style={{ marginTop: 2, paddingLeft: 40 }}>
              {item.children.map(sub => (
                <Link key={sub.name} href={sub.href} style={{
                  display: 'block', padding: '6px 12px', borderRadius: 6,
                  fontSize: 13, fontWeight: 500, textDecoration: 'none',
                  color: sub.current ? BLUE : '#6b7280',
                  background: sub.current ? BLUE_LIGHT : 'transparent',
                  marginBottom: 2,
                }}>
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link href={item.href} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', borderRadius: 8, textDecoration: 'none',
        fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
        background: item.current ? BLUE : 'transparent',
        color: item.current ? '#fff' : '#6b7280',
      }}
        onMouseEnter={e => { if (!item.current) { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827'; } }}
        onMouseLeave={e => { if (!item.current) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; } }}
      >
        <item.icon style={{ width: 18, height: 18, flexShrink: 0 }} />
        {item.name}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#fff', borderRight: '1px solid #f0f2f8',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f0f2f8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: BLUE, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <BuildingOfficeIcon style={{ width: 20, height: 20, color: '#fff' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.2 }}>Kaspa Space</p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Management Suite</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
        {/* MAIN */}
        <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 10px' }}>Main</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 20 }}>
          {mainNav.map(item => <NavItem key={item.name} item={item} />)}
        </div>

        {/* MANAGEMENT */}
        {managementNav.length > 0 && (
          <>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 10px' }}>Management</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 20 }}>
              {managementNav.map(item => <NavItem key={item.name} item={item} />)}
            </div>
          </>
        )}

        {/* SYSTEM */}
        {systemNav.length > 0 && (
          <>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 10px' }}>System</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {systemNav.map(item => <NavItem key={item.name} item={item} />)}
            </div>
          </>
        )}
      </div>

      {/* Bottom */}
      <div style={{ padding: '12px', borderTop: '1px solid #f0f2f8' }}>
        <button onClick={handleLogout} style={{
          width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 600,
        }}>
          <ArrowRightOnRectangleIcon style={{ width: 16, height: 16 }} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f8ff', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar desktop */}
      <div style={{
        width: SIDEBAR_W, flexShrink: 0, position: 'fixed',
        top: 0, left: 0, bottom: 0, zIndex: 30,
        display: 'flex', flexDirection: 'column',
      }} className="hidden lg:flex">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} className="lg:hidden">
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'relative', width: SIDEBAR_W, height: '100%' }}>
            <button onClick={() => setSidebarOpen(false)} style={{
              position: 'absolute', top: 12, right: -44, width: 36, height: 36,
              borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <XMarkIcon style={{ width: 20, height: 20, color: '#fff' }} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Spacer — pushes main content past fixed sidebar on desktop */}
      <div className="hidden lg:block" style={{ width: SIDEBAR_W, flexShrink: 0 }} />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{
          height: 64, background: '#fff', borderBottom: '1px solid #f0f2f8',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
          position: 'sticky', top: 0, zIndex: 20,
          boxShadow: '0 1px 4px rgba(26,46,90,0.05)',
        }}>
          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden" style={{
            padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer',
          }}>
            <Bars3Icon style={{ width: 22, height: 22, color: '#6b7280' }} />
          </button>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
            <MagnifyingGlassIcon style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              width: 16, height: 16, color: '#9ca3af',
            }} />
            <input
              placeholder="Cari pesanan atau pelanggan..."
              style={{
                width: '100%', padding: '8px 12px 8px 36px',
                background: '#f5f8ff', border: '1px solid #e8edf5',
                borderRadius: 10, fontSize: 13, color: '#374151',
                outline: 'none', fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Icons */}
          <button style={{ padding: 8, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', position: 'relative' }}>
            <BellIcon style={{ width: 20, height: 20, color: '#6b7280' }} />
            <span style={{
              position: 'absolute', top: 6, right: 6, width: 8, height: 8,
              background: '#ef4444', borderRadius: '50%', border: '2px solid #fff',
            }} />
          </button>

          <button style={{ padding: 8, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <QuestionMarkCircleIcon style={{ width: 20, height: 20, color: '#6b7280' }} />
          </button>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, borderLeft: '1px solid #f0f2f8' }}>
            <div style={{ textAlign: 'right' }} className="hidden sm:block">
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{auth?.user?.name || 'Admin'}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, textTransform: 'capitalize' }}>{userRole}</p>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: BLUE,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                {(auth?.user?.name || 'A')[0].toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main style={{ flex: 1, padding: 24 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
