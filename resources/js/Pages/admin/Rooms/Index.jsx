import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    PlusIcon, PencilSquareIcon, TrashIcon,
    BuildingOfficeIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

const BLUE = '#005bbf';

const PRODUCT_TYPE_LABEL = {
    share_desk:     'Share Desk',
    private_room:   'Private Room',
    private_office: 'Private Office',
    meeting_room:   'Meeting Room',
};

const PRODUCT_TYPE_COLOR = {
    share_desk:     { bg: '#f0fdf4', color: '#166534' },
    private_room:   { bg: '#eff6ff', color: '#005bbf' },
    private_office: { bg: '#eef2ff', color: '#4338ca' },
    meeting_room:   { bg: '#fefce8', color: '#854d0e' },
};

const emptyForm = {
    name: '', description: '', capacity: 1,
    unit_count: 1, unit_names: [], unit_capacities: [], unit_product_ids: [[]],
    is_active: true, product_ids: [],
};

export default function RoomsIndex({ rooms, products }) {
    const { flash } = usePage().props;
    const [showModal, setShowModal]   = useState(false);
    const [editing, setEditing]       = useState(null);
    const [form, setForm]             = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setForm(f => {
            const count = Math.max(1, f.unit_count);
            const names = [...(f.unit_names || [])];
            const caps  = [...(f.unit_capacities || [])];
            const upids = [...(f.unit_product_ids || [])];
            while (names.length < count) names.push('');
            while (caps.length  < count) caps.push('');
            while (upids.length < count) upids.push([]);
            return {
                ...f,
                unit_names:       names.slice(0, count),
                unit_capacities:  caps.slice(0, count),
                unit_product_ids: upids.slice(0, count),
            };
        });
    }, [form.unit_count]);

    const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };

    const openEdit = (room) => {
        setEditing(room);
        const count        = room.unit_count ?? 1;
        const existingNames = room.unit_names ?? [];
        const existingCaps  = room.unit_capacities ?? [];
        const existingUpids = room.unit_product_ids ?? null;
        const names = Array.from({ length: count }, (_, i) => existingNames[i] ?? '');
        const caps  = Array.from({ length: count }, (_, i) => existingCaps[i] != null ? String(existingCaps[i]) : '');
        const upids = Array.from({ length: count }, (_, i) => existingUpids ? (existingUpids[i] ?? []) : []);
        setForm({
            name: room.name, description: room.description || '',
            capacity: room.capacity, unit_count: count,
            unit_names: names, unit_capacities: caps, unit_product_ids: upids,
            is_active: room.is_active,
            product_ids: room.products?.map(p => p.id) || [],
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        const url    = editing ? `/admin/rooms/${editing.id}` : '/admin/rooms';
        const method = editing ? 'put' : 'post';
        router[method](url, form, {
            preserveScroll: true,
            onSuccess: () => { setShowModal(false); setSubmitting(false); },
            onError:   () => setSubmitting(false),
        });
    };

    const handleDelete = (room) => {
        if (!confirm(`Hapus ruangan "${room.name}"?`)) return;
        router.delete(`/admin/rooms/${room.id}`, { preserveScroll: true });
    };

    const toggleProduct = (id) =>
        setForm(f => ({
            ...f,
            product_ids: f.product_ids.includes(id)
                ? f.product_ids.filter(p => p !== id)
                : [...f.product_ids, id],
        }));

    const toggleUnitProduct = (unitIdx, productId) =>
        setForm(f => {
            const upids = (f.unit_product_ids || []).map((arr, i) =>
                i !== unitIdx ? arr
                    : arr.includes(productId) ? arr.filter(id => id !== productId) : [...arr, productId]
            );
            return { ...f, unit_product_ids: upids };
        });

    const setUnitName     = (i, v) => setForm(f => { const a = [...f.unit_names]; a[i] = v; return { ...f, unit_names: a }; });
    const setUnitCapacity = (i, v) => setForm(f => { const a = [...(f.unit_capacities || [])]; a[i] = v; return { ...f, unit_capacities: a }; });

    const inputStyle = {
        width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px',
        fontSize: 13, outline: 'none', color: '#374151', boxSizing: 'border-box',
    };

    const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

    const typeBadgeStyle = (type) => {
        const c = PRODUCT_TYPE_COLOR[type] || { bg: '#f3f4f6', color: '#6b7280' };
        return {
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
            background: c.bg, color: c.color,
        };
    };

    return (
        <AdminLayout>
            <Head title="Kelola Ruangan" />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
                        Kelola Ruangan
                    </h1>
                    <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
                        Atur ruangan fisik dan produk yang bisa di-booking di dalamnya.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '9px 18px', background: BLUE, color: '#fff',
                        border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                >
                    <PlusIcon style={{ width: 16, height: 16 }} />
                    Tambah Ruangan
                </button>
            </div>

            {flash?.success && (
                <div style={{ marginBottom: 16, padding: '10px 16px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, color: '#166534', fontSize: 13, fontWeight: 600 }}>
                    {flash.success}
                </div>
            )}

            {rooms.length === 0 ? (
                <div style={{
                    background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(26,46,90,0.07)',
                    border: '2px dashed #e5e7eb', padding: '64px 20px', textAlign: 'center',
                }}>
                    <BuildingOfficeIcon style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', margin: '0 0 4px' }}>Belum ada ruangan</p>
                    <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Klik "Tambah Ruangan" untuk mulai.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {rooms.map(room => {
                        const unitCount = room.unit_count ?? 1;
                        return (
                            <div key={room.id} style={{
                                background: room.is_active ? '#fff' : '#fff7ed',
                                border: `1px solid ${room.is_active ? '#f0f2f8' : '#fed7aa'}`,
                                borderRadius: 14,
                                boxShadow: '0 1px 6px rgba(26,46,90,0.07)',
                                display: 'flex', flexDirection: 'column',
                            }}>
                                {/* Card header */}
                                <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f0f2f8' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                            <BuildingOfficeIcon style={{ width: 18, height: 18, color: BLUE, flexShrink: 0 }} />
                                            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {room.name}
                                            </h3>
                                        </div>
                                        <span style={{
                                            flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                                            background: room.is_active ? '#dcfce7' : '#fed7aa',
                                            color: room.is_active ? '#166534' : '#c2410c',
                                        }}>
                                            {room.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                    {room.description && (
                                        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, paddingLeft: 26, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {room.description}
                                        </p>
                                    )}
                                </div>

                                {/* Stats */}
                                <div style={{ padding: '10px 18px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#f3f4f6', color: '#6b7280' }}>
                                        {unitCount} unit
                                    </span>
                                    {unitCount === 1 && (
                                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#eff6ff', color: BLUE }}>
                                            {room.capacity} meja/kursi
                                        </span>
                                    )}
                                </div>

                                {/* Unit list / product badges */}
                                <div style={{ padding: '0 18px 14px', flex: 1 }}>
                                    {unitCount > 1 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {Array.from({ length: unitCount }).map((_, i) => {
                                                const uName  = room.unit_names?.[i] || `Unit ${i + 1}`;
                                                const uCap   = room.unit_capacities?.[i];
                                                const uPids  = room.unit_product_ids?.[i] ?? null;
                                                const uProds = uPids !== null
                                                    ? room.products?.filter(p => uPids.includes(p.id)) ?? []
                                                    : room.products ?? [];
                                                return (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: '#f3f4f6', color: '#374151' }}>
                                                            {uName}{uCap ? ` · ${uCap}` : ''}
                                                        </span>
                                                        {uProds.map(p => (
                                                            <span key={p.id} style={typeBadgeStyle(p.product_type)}>
                                                                {PRODUCT_TYPE_LABEL[p.product_type] || p.title}
                                                            </span>
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        room.products?.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {room.products.map(p => (
                                                    <span key={p.id} style={typeBadgeStyle(p.product_type)}>
                                                        {PRODUCT_TYPE_LABEL[p.product_type] || p.title}
                                                    </span>
                                                ))}
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ padding: '12px 18px', borderTop: '1px solid #f0f2f8', display: 'flex', gap: 8 }}>
                                    <button
                                        onClick={() => openEdit(room)}
                                        style={{
                                            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                            padding: '8px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                            color: BLUE, border: `1px solid #bfdbfe`, borderRadius: 8, background: '#eff6ff',
                                        }}
                                    >
                                        <PencilSquareIcon style={{ width: 14, height: 14 }} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(room)}
                                        style={{
                                            width: 38, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', color: '#ef4444', border: '1px solid #fee2e2',
                                            borderRadius: 8, background: '#fff',
                                        }}
                                    >
                                        <TrashIcon style={{ width: 14, height: 14 }} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Create/Edit */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.5)', padding: 16, backdropFilter: 'blur(2px)',
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                        width: '100%', maxWidth: 540, maxHeight: '92vh', display: 'flex', flexDirection: 'column',
                    }}>
                        {/* Modal header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f0f2f8' }}>
                            <div>
                                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                    {editing ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
                                </h2>
                                {editing && <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{editing.name}</p>}
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                style={{ padding: 6, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8 }}
                            >
                                <XMarkIcon style={{ width: 20, height: 20 }} />
                            </button>
                        </div>

                        {/* Modal body */}
                        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1 }}>
                            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

                                {/* Nama & Deskripsi */}
                                <div>
                                    <label style={labelStyle}>Nama Ruangan <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        required
                                        placeholder="contoh: Private Office, Meeting Room A"
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Deskripsi</label>
                                    <textarea
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        rows={2}
                                        placeholder="Lokasi, fasilitas, dll. (opsional)"
                                        style={{ ...inputStyle, resize: 'none' }}
                                    />
                                </div>

                                {/* Jumlah unit & kapasitas global */}
                                <div style={{ display: 'grid', gridTemplateColumns: form.unit_count === 1 ? '1fr 1fr' : '1fr', gap: 12 }}>
                                    <div>
                                        <label style={labelStyle}>Jumlah Unit <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input
                                            type="number"
                                            value={form.unit_count}
                                            onChange={e => setForm(f => ({ ...f, unit_count: Math.max(1, parseInt(e.target.value) || 1) }))}
                                            min={1} max={20} required
                                            style={inputStyle}
                                        />
                                        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Berapa unit bisa dipesan bersamaan.</p>
                                    </div>
                                    {form.unit_count === 1 && (
                                        <div>
                                            <label style={labelStyle}>Kapasitas Meja/Kursi <span style={{ color: '#ef4444' }}>*</span></label>
                                            <input
                                                type="number"
                                                value={form.capacity}
                                                onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 1 }))}
                                                min={1} required
                                                style={inputStyle}
                                            />
                                            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Untuk share desk.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Detail tiap unit */}
                                <div>
                                    <label style={{ ...labelStyle, marginBottom: 8 }}>
                                        {form.unit_count > 1 ? 'Detail Tiap Unit' : 'Nama Unit'}
                                        <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>(opsional)</span>
                                    </label>

                                    {form.unit_count > 1 && (
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 6, paddingLeft: 52, paddingRight: 4 }}>
                                            <span style={{ flex: 1, fontSize: 11, color: '#9ca3af' }}>Nama</span>
                                            <span style={{ width: 80, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>Meja/Kursi</span>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {Array.from({ length: form.unit_count }).map((_, i) => (
                                            <div key={i} style={form.unit_count > 1 ? {
                                                border: '1px solid #f0f2f8', borderRadius: 10, padding: 12, background: '#fafbff', display: 'flex', flexDirection: 'column', gap: 10,
                                            } : {}}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {form.unit_count > 1 && (
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', width: 40, textAlign: 'center', flexShrink: 0 }}>
                                                            {i + 1}
                                                        </span>
                                                    )}
                                                    <input
                                                        type="text"
                                                        value={form.unit_names[i] ?? ''}
                                                        onChange={e => setUnitName(i, e.target.value)}
                                                        placeholder={`contoh: Room A, Office ${i + 1}`}
                                                        maxLength={100}
                                                        style={{ ...inputStyle, flex: 1 }}
                                                    />
                                                    {form.unit_count > 1 && (
                                                        <input
                                                            type="number"
                                                            value={form.unit_capacities?.[i] ?? ''}
                                                            onChange={e => setUnitCapacity(i, e.target.value)}
                                                            placeholder="—"
                                                            min={1}
                                                            style={{ ...inputStyle, width: 80, flexShrink: 0, textAlign: 'center' }}
                                                        />
                                                    )}
                                                </div>

                                                {/* Produk per-unit */}
                                                {form.unit_count > 1 && products.length > 0 && (
                                                    <div style={{ paddingLeft: 48, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                                        {products.map(p => (
                                                            <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(form.unit_product_ids?.[i] ?? []).includes(p.id)}
                                                                    onChange={() => toggleUnitProduct(i, p.id)}
                                                                    style={{ width: 14, height: 14, cursor: 'pointer', accentColor: BLUE }}
                                                                />
                                                                <span style={{ fontSize: 12, color: '#6b7280' }}>{p.title}</span>
                                                                <span style={typeBadgeStyle(p.product_type)}>
                                                                    {PRODUCT_TYPE_LABEL[p.product_type] ?? p.product_type}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                                        {form.unit_count > 1
                                            ? 'Kosongkan nama → otomatis "Unit 1, 2, …" · Kosongkan meja/kursi → pakai default.'
                                            : 'Kosongkan untuk nama otomatis.'}
                                    </p>
                                </div>

                                {/* Produk room-level (unit = 1 saja) */}
                                {form.unit_count === 1 && (
                                    <div>
                                        <label style={{ ...labelStyle, marginBottom: 8 }}>Produk yang bisa di-booking</label>
                                        <div style={{ border: '1px solid #f0f2f8', borderRadius: 10, padding: 12, maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {products.map(p => (
                                                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={form.product_ids.includes(p.id)}
                                                        onChange={() => toggleProduct(p.id)}
                                                        style={{ width: 15, height: 15, cursor: 'pointer', accentColor: BLUE }}
                                                    />
                                                    <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{p.title}</span>
                                                    <span style={typeBadgeStyle(p.product_type)}>
                                                        {PRODUCT_TYPE_LABEL[p.product_type] ?? p.product_type}
                                                    </span>
                                                </label>
                                            ))}
                                            {products.length === 0 && (
                                                <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '8px 0' }}>Belum ada produk booking tersedia.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Status aktif */}
                                {editing && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: '#f8faff', borderRadius: 10, border: '1px solid #f0f2f8' }}>
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>Status Ruangan</p>
                                            <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>Nonaktif = tidak muncul untuk booking</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                            style={{
                                                position: 'relative', display: 'inline-flex', height: 24, width: 44,
                                                alignItems: 'center', borderRadius: 20, border: 'none', cursor: 'pointer',
                                                background: form.is_active ? BLUE : '#d1d5db', transition: 'background 0.2s',
                                            }}
                                        >
                                            <span style={{
                                                display: 'inline-block', height: 16, width: 16, borderRadius: '50%', background: '#fff',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
                                                transform: form.is_active ? 'translateX(24px)' : 'translateX(4px)',
                                            }} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Modal footer */}
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f2f8', display: 'flex', gap: 12, background: '#f8faff', borderRadius: '0 0 16px 16px' }}>
                                <button
                                    type="submit"
                                    disabled={submitting || !form.name.trim() || form.unit_count < 1 || (form.unit_count === 1 && form.capacity < 1)}
                                    style={{
                                        flex: 1, padding: '10px 0', background: BLUE, color: '#fff',
                                        fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 10, cursor: 'pointer',
                                        opacity: (submitting || !form.name.trim()) ? 0.5 : 1,
                                    }}
                                >
                                    {submitting ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Buat Ruangan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#6b7280',
                                        border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff', cursor: 'pointer',
                                    }}
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
