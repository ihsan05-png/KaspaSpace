import React, { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AdminLayout from '@/Layouts/AdminLayout';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    Bars3Icon,
} from "@heroicons/react/24/outline";

const CategoriesIndex = ({ categories }) => {
    const [editingCategory, setEditingCategory] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: "",
        description: "",
        icon: "",
        is_active: true,
        sort_order: 0,
    });

    const handleCreate = (e) => {
        e.preventDefault();
        post(route("admin.categories.store"), {
            onSuccess: () => {
                reset();
                setShowCreateForm(false);
            },
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route("admin.categories.update", editingCategory.id), {
            onSuccess: () => {
                reset();
                setEditingCategory(null);
            },
        });
    };

    const handleEdit = (category) => {
        setData({
            name: category.name,
            description: category.description || "",
            icon: category.icon || "",
            is_active: category.is_active,
            sort_order: category.sort_order,
        });
        setEditingCategory(category);
        setShowCreateForm(false);
    };

    const handleDelete = (category) => {
        if (
            confirm(
                `Apakah Anda yakin ingin menghapus kategori "${category.name}"?`
            )
        ) {
            router.delete(route("admin.categories.destroy", category.id));
        }
    };

    const toggleStatus = (category) => {
        router.patch(
            route("admin.categories.update", category.id),
            {
                is_active: !category.is_active,
            },
            {
                preserveState: true,
                only: ["categories"],
            }
        );
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        setShowCreateForm(false);
        reset();
    };

    const iconOptions = [
        { value: "building-office", label: "🏢 Building Office" },
        { value: "briefcase", label: "💼 Briefcase" },
        { value: "cpu-chip", label: "🖥️ CPU Chip" },
        { value: "key", label: "🔑 Key" },
        { value: "book-open", label: "📖 Book Open" },
        { value: "cake", label: "🎂 Cake" },
        { value: "tag", label: "🏷️ Tag" },
        { value: "cog", label: "⚙️ Cog" },
    ];

    const BLUE = '#005bbf';

    return (
        <AdminLayout title="Kategori">
            <Head title="Kategori" />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
                        Kategori
                    </h1>
                    <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
                        Kelola kategori produk untuk memudahkan pelanggan menemukan produk
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '9px 18px', background: BLUE, color: '#fff',
                        border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                >
                    <PlusIcon style={{ width: 16, height: 16 }} />
                    Tambah Kategori
                </button>
            </div>

            {/* Create/Edit Form */}
            {(showCreateForm || editingCategory) && (
                <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(26,46,90,0.07)', marginBottom: 20, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f2f8' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
                            {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                        </h3>
                    </div>
                    <div style={{ padding: 20 }}>
                        <form onSubmit={editingCategory ? handleUpdate : handleCreate}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                        Nama Kategori <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Nama kategori"
                                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                                        required
                                    />
                                    {errors.name && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.name}</p>}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Icon</label>
                                    <select
                                        value={data.icon}
                                        onChange={(e) => setData('icon', e.target.value)}
                                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff', cursor: 'pointer' }}
                                    >
                                        <option value="">Pilih Icon</option>
                                        {iconOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Deskripsi</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Deskripsi kategori"
                                    rows={3}
                                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                        />
                                        Aktif
                                    </label>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Urutan</label>
                                        <input
                                            type="number"
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                            style={{ width: 80, padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        style={{ padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        style={{ padding: '9px 18px', background: BLUE, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: processing ? 0.6 : 1 }}
                                    >
                                        {processing ? 'Menyimpan...' : editingCategory ? 'Update' : 'Simpan'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Categories Table */}
            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(26,46,90,0.07)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f2f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
                        Daftar Kategori
                    </h2>
                    <span style={{ fontSize: 13, color: '#9ca3af' }}>{categories.data.length} kategori</span>
                </div>

                {categories.data.length === 0 ? (
                    <div style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        Belum ada kategori.{' '}
                        <button onClick={() => setShowCreateForm(true)} style={{ color: BLUE, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
                            Tambah sekarang
                        </button>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8faff' }}>
                                    {['', 'Kategori', 'Deskripsi', 'Produk', 'Status', 'Urutan', 'Aksi'].map((h, i) => (
                                        <th key={i} style={{
                                            padding: '11px 18px', fontSize: 11, fontWeight: 700, color: '#9ca3af',
                                            textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {categories.data.map((category, idx) => (
                                    <tr key={category.id}
                                        style={{ borderTop: '1px solid #f0f2f8', background: idx % 2 === 0 ? '#fff' : '#fafbff' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafbff'}
                                    >
                                        <td style={{ padding: '14px 18px' }}>
                                            <Bars3Icon style={{ width: 15, height: 15, color: '#d1d5db', cursor: 'move' }} />
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {category.icon && (
                                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <span style={{ fontSize: 16 }}>
                                                            {iconOptions.find(o => o.value === category.icon)?.label?.split(' ')[0] || '📁'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{category.name}</p>
                                                    <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{category.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 18px', maxWidth: 220 }}>
                                            <p style={{ fontSize: 12, color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {category.description || '-'}
                                            </p>
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <span style={{ fontSize: 13, color: '#374151' }}>{category.products_count || 0} produk</span>
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <button
                                                onClick={() => toggleStatus(category)}
                                                style={{
                                                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                                                    background: category.is_active ? '#dcfce7' : '#fee2e2',
                                                    color: category.is_active ? '#166534' : '#b91c1c',
                                                }}
                                            >
                                                {category.is_active ? 'Aktif' : 'Tidak Aktif'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <span style={{ fontSize: 13, color: '#9ca3af' }}>{category.sort_order}</span>
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <Link href={route('admin.categories.show', category.id)}
                                                    style={{ color: '#9ca3af', textDecoration: 'none', display: 'flex' }}>
                                                    <EyeIcon style={{ width: 15, height: 15 }} />
                                                </Link>
                                                <button onClick={() => handleEdit(category)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                                                    <PencilIcon style={{ width: 15, height: 15 }} />
                                                </button>
                                                <button onClick={() => handleDelete(category)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                                                    <TrashIcon style={{ width: 15, height: 15 }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {categories.links && categories.links.length > 3 && (
                    <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f2f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>
                            Menampilkan {categories.from || 0}–{categories.to || 0} dari {categories.total} kategori
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {categories.links.map((link, index) => (
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

export default CategoriesIndex;
