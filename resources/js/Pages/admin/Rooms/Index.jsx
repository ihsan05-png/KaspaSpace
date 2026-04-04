import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    PlusIcon, PencilSquareIcon, TrashIcon,
    BuildingOfficeIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

const PRODUCT_TYPE_LABEL = {
    share_desk:     'Share Desk',
    private_room:   'Private Room',
    private_office: 'Private Office',
    meeting_room:   'Meeting Room',
};

const PRODUCT_TYPE_COLOR = {
    share_desk:     'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    private_room:   'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    private_office: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    meeting_room:   'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
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

    return (
        <AdminLayout>
            <Head title="Kelola Ruangan" />

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kelola Ruangan</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Atur ruangan fisik dan produk yang bisa di-booking di dalamnya.
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Tambah Ruangan
                    </button>
                </div>

                {flash?.success && (
                    <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {rooms.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
                        <BuildingOfficeIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Belum ada ruangan</p>
                        <p className="text-sm text-gray-400 mt-1">Klik "Tambah Ruangan" untuk mulai.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rooms.map(room => {
                            const unitCount = room.unit_count ?? 1;
                            return (
                                <div
                                    key={room.id}
                                    className={`bg-white rounded-2xl border shadow-sm flex flex-col transition hover:shadow-md ${
                                        room.is_active ? 'border-gray-200' : 'border-orange-200'
                                    }`}
                                >
                                    {/* Card header */}
                                    <div className={`px-5 pt-5 pb-4 ${!room.is_active ? 'bg-orange-50 rounded-t-2xl' : ''}`}>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <BuildingOfficeIcon className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                                <h3 className="font-semibold text-gray-900 leading-snug truncate">{room.name}</h3>
                                            </div>
                                            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                                                room.is_active ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {room.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>

                                        {room.description && (
                                            <p className="text-xs text-gray-500 line-clamp-2 ml-7">{room.description}</p>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="px-5 pb-3 flex items-center gap-2 flex-wrap">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                                            {unitCount} unit
                                        </span>
                                        {unitCount === 1 && (
                                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                                                {room.capacity} meja/kursi
                                            </span>
                                        )}
                                    </div>

                                    {/* Unit list / product badges */}
                                    <div className="px-5 pb-4 flex-1">
                                        {unitCount > 1 ? (
                                            <div className="space-y-1.5">
                                                {Array.from({ length: unitCount }).map((_, i) => {
                                                    const uName  = room.unit_names?.[i] || `Unit ${i + 1}`;
                                                    const uCap   = room.unit_capacities?.[i];
                                                    const uPids  = room.unit_product_ids?.[i] ?? null;
                                                    const uProds = uPids !== null
                                                        ? room.products?.filter(p => uPids.includes(p.id)) ?? []
                                                        : room.products ?? [];
                                                    return (
                                                        <div key={i} className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-xs bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded">
                                                                {uName}{uCap ? ` · ${uCap}` : ''}
                                                            </span>
                                                            {uProds.map(p => (
                                                                <span key={p.id} className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRODUCT_TYPE_COLOR[p.product_type] || 'bg-gray-100 text-gray-600'}`}>
                                                                    {PRODUCT_TYPE_LABEL[p.product_type] || p.title}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            room.products?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {room.products.map(p => (
                                                        <span key={p.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRODUCT_TYPE_COLOR[p.product_type] || 'bg-gray-100 text-gray-600'}`}>
                                                            {PRODUCT_TYPE_LABEL[p.product_type] || p.title}
                                                        </span>
                                                    ))}
                                                </div>
                                            )
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="px-5 pb-5 flex gap-2 border-t border-gray-100 pt-4">
                                        <button
                                            onClick={() => openEdit(room)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition font-medium"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(room)}
                                            className="flex items-center justify-center w-10 text-red-400 border border-red-200 rounded-lg hover:bg-red-50 hover:text-red-600 transition"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Create/Edit */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">

                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">
                                    {editing ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
                                </h2>
                                {editing && <p className="text-xs text-gray-400 mt-0.5">{editing.name}</p>}
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
                            <div className="p-6 space-y-5">

                                {/* Nama & Deskripsi */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Nama Ruangan <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            required
                                            placeholder="contoh: Private Office, Meeting Room A"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                                        <textarea
                                            value={form.description}
                                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                            rows={2}
                                            placeholder="Lokasi, fasilitas, dll. (opsional)"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Jumlah unit & kapasitas global */}
                                <div className={`grid gap-3 ${form.unit_count === 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Jumlah Unit <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={form.unit_count}
                                            onChange={e => setForm(f => ({ ...f, unit_count: Math.max(1, parseInt(e.target.value) || 1) }))}
                                            min={1} max={20} required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Berapa unit bisa dipesan bersamaan.</p>
                                    </div>
                                    {form.unit_count === 1 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Kapasitas Meja/Kursi <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={form.capacity}
                                                onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 1 }))}
                                                min={1} required
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Untuk share desk.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Detail tiap unit */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {form.unit_count > 1 ? 'Detail Tiap Unit' : 'Nama Unit'}
                                        <span className="ml-1 text-xs font-normal text-gray-400">(opsional)</span>
                                    </label>

                                    {form.unit_count > 1 && (
                                        <div className="flex gap-2 mb-1.5 pl-14 pr-1">
                                            <span className="flex-1 text-xs text-gray-400">Nama</span>
                                            <span className="w-20 text-xs text-gray-400 text-center">Meja/Kursi</span>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        {Array.from({ length: form.unit_count }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={form.unit_count > 1
                                                    ? 'border border-gray-200 rounded-xl p-3 space-y-2.5 bg-gray-50/50'
                                                    : ''}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {form.unit_count > 1 && (
                                                        <span className="text-xs font-semibold text-gray-400 w-12 flex-shrink-0 text-center">
                                                            {i + 1}
                                                        </span>
                                                    )}
                                                    <input
                                                        type="text"
                                                        value={form.unit_names[i] ?? ''}
                                                        onChange={e => setUnitName(i, e.target.value)}
                                                        placeholder={`contoh: Room A, Office ${i + 1}`}
                                                        maxLength={100}
                                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                                    />
                                                    {form.unit_count > 1 && (
                                                        <input
                                                            type="number"
                                                            value={form.unit_capacities?.[i] ?? ''}
                                                            onChange={e => setUnitCapacity(i, e.target.value)}
                                                            placeholder="—"
                                                            min={1}
                                                            className="w-20 flex-shrink-0 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-center bg-white"
                                                        />
                                                    )}
                                                </div>

                                                {/* Produk per-unit */}
                                                {form.unit_count > 1 && products.length > 0 && (
                                                    <div className="pl-14 flex flex-wrap gap-x-4 gap-y-1.5">
                                                        {products.map(p => (
                                                            <label key={p.id} className="flex items-center gap-1.5 cursor-pointer group">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(form.unit_product_ids?.[i] ?? []).includes(p.id)}
                                                                    onChange={() => toggleUnitProduct(i, p.id)}
                                                                    className="w-3.5 h-3.5 text-indigo-600 rounded cursor-pointer"
                                                                />
                                                                <span className="text-xs text-gray-600 group-hover:text-gray-900">{p.title}</span>
                                                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRODUCT_TYPE_COLOR[p.product_type] || 'bg-gray-100 text-gray-600'}`}>
                                                                    {PRODUCT_TYPE_LABEL[p.product_type] ?? p.product_type}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5">
                                        {form.unit_count > 1
                                            ? 'Kosongkan nama → otomatis "Unit 1, 2, …" · Kosongkan meja/kursi → pakai default.'
                                            : 'Kosongkan untuk nama otomatis.'}
                                    </p>
                                </div>

                                {/* Produk room-level (unit = 1 saja) */}
                                {form.unit_count === 1 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Produk yang bisa di-booking
                                        </label>
                                        <div className="border border-gray-200 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                                            {products.map(p => (
                                                <label key={p.id} className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.product_ids.includes(p.id)}
                                                        onChange={() => toggleProduct(p.id)}
                                                        className="w-4 h-4 text-indigo-600 rounded"
                                                    />
                                                    <span className="text-sm text-gray-700 flex-1 group-hover:text-gray-900">{p.title}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRODUCT_TYPE_COLOR[p.product_type] || 'bg-gray-100 text-gray-600'}`}>
                                                        {PRODUCT_TYPE_LABEL[p.product_type] ?? p.product_type}
                                                    </span>
                                                </label>
                                            ))}
                                            {products.length === 0 && (
                                                <p className="text-sm text-gray-400 text-center py-2">Belum ada produk booking tersedia.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Status aktif */}
                                {editing && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Status Ruangan</p>
                                            <p className="text-xs text-gray-400">Nonaktif = tidak muncul untuk booking</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Modal footer */}
                            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-2xl">
                                <button
                                    type="submit"
                                    disabled={submitting || !form.name.trim() || form.unit_count < 1 || (form.unit_count === 1 && form.capacity < 1)}
                                    className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                                >
                                    {submitting ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Buat Ruangan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-white transition"
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
