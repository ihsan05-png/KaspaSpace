import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

const ProductsIndex = ({ products, categories, filters }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get('search');
    
    router.get(route('admin.products.index'), {
      ...filters,
      search: search,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (key, value) => {
    router.get(route('admin.products.index'), {
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDelete = (product) => {
    if (!product.slug) {
      alert('Produk tidak memiliki slug yang valid.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      router.delete(route('admin.products.destroy', product.slug), {
        preserveScroll: true,
        onError: () => {
          alert('Gagal menghapus produk. Silakan coba lagi.');
        },
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedProducts.length} produk?`)) {
      router.delete(route('admin.products.bulk-delete'), {
        data: { product_ids: selectedProducts },
        preserveScroll: true,
        onSuccess: () => {
          setSelectedProducts([]);
          alert(`${selectedProducts.length} produk berhasil dihapus`);
        },
        onError: () => {
          alert('Gagal menghapus produk. Silakan coba lagi.');
        }
      });
    }
  };

  const updateProductStatus = (productSlug, isActive) => {
    router.patch(route('admin.products.update-status', productSlug), {
      is_active: isActive
    }, {
      preserveState: true,
      only: ['products']
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const BLUE = '#005bbf';

  const statCards = [
    { label: 'Total Produk',  value: products.total,                                icon: EllipsisVerticalIcon, color: '#eff6ff', iconColor: BLUE },
    { label: 'Produk Aktif',  value: products.data.filter(p => p.is_active).length, icon: EyeIcon,              color: '#f0fdf4', iconColor: '#16a34a' },
    { label: 'Produk Draft',  value: products.data.filter(p => !p.is_active).length,icon: FunnelIcon,           color: '#fefce8', iconColor: '#d97706' },
    { label: 'Kategori',      value: categories.length,                              icon: TagIcon,              color: '#fdf4ff', iconColor: '#9333ea' },
  ];

  return (
    <AdminLayout title="Produk">
      <Head title="Produk" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
            Produk
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
            Kelola produk dan layanan yang tersedia di toko Anda
          </p>
        </div>
        <Link
          href={route('admin.products.create')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', background: BLUE, color: '#fff',
            borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}
        >
          <PlusIcon style={{ width: 16, height: 16 }} />
          Tambah Produk
        </Link>
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

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(26,46,90,0.07)', marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f2f8', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af' }} />
            <input
              type="text"
              name="search"
              defaultValue={filters.search || ''}
              placeholder="Cari produk..."
              style={{
                width: '100%', paddingLeft: 34, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </form>
          <select
            value={filters.category_id || ''}
            onChange={(e) => handleFilterChange('category_id', e.target.value)}
            style={{ padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filters.status !== undefined ? filters.status : ''}
            onChange={(e) => handleFilterChange('status', e.target.value === '' ? null : e.target.value === 'true')}
            style={{ padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Tidak Aktif</option>
          </select>
          {selectedProducts.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{selectedProducts.length} dipilih</span>
              <button
                onClick={handleBulkDelete}
                style={{ padding: '6px 14px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Hapus
              </button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {products.data.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            Tidak ada produk.{' '}
            <Link href={route('admin.products.create')} style={{ color: BLUE, fontWeight: 600, textDecoration: 'none' }}>
              Tambah produk pertama
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: 20 }}>
            {products.data.map((product) => (
              <div key={product.id} style={{
                background: '#fff', border: '1px solid #f0f2f8', borderRadius: 12, overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(26,46,90,0.05)', transition: 'box-shadow 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,46,90,0.10)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(26,46,90,0.05)'}
              >
                {/* Image */}
                <div style={{ position: 'relative', aspectRatio: '16/9', background: '#f8faff' }}>
                  {product.images && product.images.length > 0 ? (
                    <img src={`/storage/${product.images[0]}`} alt={product.title}
                      loading="lazy" decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
                      No Image
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 8, left: 8 }}>
                    <input type="checkbox" checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)} style={{ cursor: 'pointer' }} />
                  </div>
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <button
                      onClick={() => updateProductStatus(product.slug, !product.is_active)}
                      style={{
                        padding: '3px 10px', fontSize: 11, fontWeight: 700, borderRadius: 20, border: 'none', cursor: 'pointer',
                        background: product.is_active ? '#dcfce7' : '#fee2e2',
                        color: product.is_active ? '#166534' : '#b91c1c',
                      }}
                    >
                      {product.is_active ? 'Aktif' : 'Draft'}
                    </button>
                  </div>
                  {product.promo_label && (
                    <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
                      <span style={{ padding: '3px 8px', background: BLUE, color: '#fff', fontSize: 11, fontWeight: 600, borderRadius: 6 }}>
                        {product.promo_label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '14px 16px' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.title}
                  </p>
                  {product.subtitle && (
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.subtitle}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: BLUE, margin: 0 }}>
                        {formatPrice(product.min_price)}
                        {product.max_price !== product.min_price && (
                          <span style={{ color: '#9ca3af', fontWeight: 400 }}> – {formatPrice(product.max_price)}</span>
                        )}
                      </p>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{product.category.name}</p>
                    </div>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{product.variants_count || 0} varian</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f0f2f8', paddingTop: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Link href={route('admin.products.show', product.slug)} title="Lihat"
                        style={{ color: '#9ca3af', textDecoration: 'none', display: 'flex' }}>
                        <EyeIcon style={{ width: 15, height: 15 }} />
                      </Link>
                      <Link href={route('admin.products.edit', product.slug)} title="Edit"
                        style={{ color: '#9ca3af', textDecoration: 'none', display: 'flex' }}>
                        <PencilIcon style={{ width: 15, height: 15 }} />
                      </Link>
                      <button onClick={() => handleDelete(product)} title="Hapus"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                        <TrashIcon style={{ width: 15, height: 15 }} />
                      </button>
                    </div>
                    <span style={{ fontSize: 11, color: '#d1d5db' }}>
                      {new Date(product.updated_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {products.links && products.links.length > 3 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f2f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              Menampilkan {products.from || 0}–{products.to || 0} dari {products.total} produk
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {products.links.map((link, index) => (
                <button
                  key={index}
                  onClick={() => link.url && router.visit(link.url)}
                  disabled={!link.url}
                  style={{
                    padding: '5px 10px', fontSize: 12, borderRadius: 8, border: 'none', cursor: link.url ? 'pointer' : 'not-allowed',
                    background: link.active ? BLUE : '#f3f4f6',
                    color: link.active ? '#fff' : link.url ? '#374151' : '#d1d5db',
                    fontWeight: link.active ? 700 : 400,
                  }}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductsIndex;
