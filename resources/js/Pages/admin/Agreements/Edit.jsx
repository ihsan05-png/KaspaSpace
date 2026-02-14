import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';

export default function AgreementsEdit({ agreement }) {
    const [title, setTitle] = useState(agreement.title);
    const [content, setContent] = useState(agreement.content || []);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const addSection = () => {
        setContent([...content, { title: '', items: [''] }]);
    };

    const removeSection = (sectionIndex) => {
        if (content.length <= 1) return;
        setContent(content.filter((_, i) => i !== sectionIndex));
    };

    const updateSectionTitle = (sectionIndex, value) => {
        const updated = [...content];
        updated[sectionIndex] = { ...updated[sectionIndex], title: value };
        setContent(updated);
    };

    const addItem = (sectionIndex) => {
        const updated = [...content];
        updated[sectionIndex] = {
            ...updated[sectionIndex],
            items: [...updated[sectionIndex].items, ''],
        };
        setContent(updated);
    };

    const removeItem = (sectionIndex, itemIndex) => {
        const updated = [...content];
        const items = updated[sectionIndex].items.filter((_, i) => i !== itemIndex);
        if (items.length === 0) return;
        updated[sectionIndex] = { ...updated[sectionIndex], items };
        setContent(updated);
    };

    const updateItem = (sectionIndex, itemIndex, value) => {
        const updated = [...content];
        const items = [...updated[sectionIndex].items];
        items[itemIndex] = value;
        updated[sectionIndex] = { ...updated[sectionIndex], items };
        setContent(updated);
    };

    const moveSectionUp = (index) => {
        if (index === 0) return;
        const updated = [...content];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        setContent(updated);
    };

    const moveSectionDown = (index) => {
        if (index === content.length - 1) return;
        const updated = [...content];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        setContent(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);

        router.put(`/admin/agreements/${agreement.id}`, {
            title,
            content,
            is_active: agreement.is_active,
        }, {
            onFinish: () => setSaving(false),
        });
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${agreement.title}`} />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.visit('/admin/agreements')}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit {agreement.title}</h1>
                            <p className="text-gray-500 text-sm">Tipe: {agreement.type === 'terms' ? 'Syarat & Ketentuan' : 'Kebijakan Privasi'}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                        <EyeIcon className="w-4 h-4" />
                        {showPreview ? 'Tutup Preview' : 'Preview'}
                    </button>
                </div>

                {/* Preview Modal */}
                {showPreview && (
                    <div className="mb-6 bg-white rounded-xl shadow-md border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">{title}</h2>
                        <div className="space-y-6 max-h-96 overflow-y-auto">
                            {content.map((section, idx) => (
                                <div key={idx}>
                                    <h3 className="font-bold text-gray-900 mb-2">{section.title}</h3>
                                    <ul className="space-y-2">
                                        {section.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Edit Form */}
                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Judul Agreement
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>

                    {/* Sections */}
                    <div className="space-y-4">
                        {content.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                        Section {sectionIndex + 1}
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => moveSectionUp(sectionIndex)}
                                            disabled={sectionIndex === 0}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 transition"
                                            title="Pindah ke atas"
                                        >
                                            <ChevronUpIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveSectionDown(sectionIndex)}
                                            disabled={sectionIndex === content.length - 1}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 transition"
                                            title="Pindah ke bawah"
                                        >
                                            <ChevronDownIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeSection(sectionIndex)}
                                            disabled={content.length <= 1}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30 transition"
                                            title="Hapus section"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Section Title */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Judul Section
                                    </label>
                                    <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        placeholder="Contoh: 1. Penerimaan Syarat"
                                        required
                                    />
                                </div>

                                {/* Items */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Poin-poin
                                    </label>
                                    {section.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="flex items-start gap-2">
                                            <span className="mt-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                                            <textarea
                                                value={item}
                                                onChange={(e) => updateItem(sectionIndex, itemIndex, e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                                                rows={2}
                                                placeholder="Isi poin..."
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeItem(sectionIndex, itemIndex)}
                                                disabled={section.items.length <= 1}
                                                className="mt-1 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30 transition"
                                                title="Hapus poin"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => addItem(sectionIndex)}
                                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-1"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        Tambah Poin
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Section Button */}
                    <button
                        type="button"
                        onClick={addSection}
                        className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition flex items-center justify-center gap-2 font-medium"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Tambah Section Baru
                    </button>

                    {/* Submit */}
                    <div className="mt-6 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/agreements')}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                        >
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
