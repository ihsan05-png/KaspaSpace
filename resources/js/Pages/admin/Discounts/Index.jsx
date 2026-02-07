import React, { useState, useRef, useCallback } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from '@/Layouts/AdminLayout';
import html2canvas from "html2canvas";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    TagIcon,
    CalendarIcon,
    ClockIcon,
    PaintBrushIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
    SwatchIcon,
} from "@heroicons/react/24/outline";

const DiscountsIndex = ({ discounts }) => {
    const [showDesignModal, setShowDesignModal] = useState(false);
    const [designData, setDesignData] = useState({
        code: 'DISCOUNT50',
        name: 'Diskon Tahun Baru',
        type: 'percentage',
        value: 0,
        bgColor: '#8B5CF6',
        textColor: '#FFFFFF',
        accentColor: '#A78BFA',
    });
    const [isDownloading, setIsDownloading] = useState(false);
    const couponRef = useRef(null);

    const handleDelete = (discount) => {
        if (
            confirm(
                `Apakah Anda yakin ingin menghapus diskon "${discount.name}"?`
            )
        ) {
            router.delete(route("admin.discounts.destroy", discount.id));
        }
    };

    const toggleStatus = (discount) => {
        router.patch(
            route("admin.discounts.toggle", discount.id),
            {},
            {
                preserveState: true,
            }
        );
    };

    const formatCurrency = (amount) => {
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (discount) => {
        if (!discount.is_active) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Tidak Aktif
            </span>;
        }

        const now = new Date();
        const endDate = discount.end_date ? new Date(discount.end_date) : null;

        if (endDate && now > endDate) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Kadaluarsa
            </span>;
        }

        if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Batas Tercapai
            </span>;
        }

        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Aktif
        </span>;
    };

    const getDiscountValue = (discount) => {
        if (discount.type === 'percentage') {
            return `${discount.value}%`;
        } else {
            return formatCurrency(discount.value);
        }
    };

    // Open design modal with existing discount data
    const openDesignForDiscount = (discount) => {
        setDesignData({
            code: discount.code,
            name: discount.name,
            type: discount.type,
            value: parseFloat(discount.value),
            bgColor: '#8B5CF6',
            textColor: '#FFFFFF',
            accentColor: '#A78BFA',
        });
        setShowDesignModal(true);
    };

    // Download coupon as PNG
    const handleDownloadPNG = useCallback(async () => {
        if (!couponRef.current) return;
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(couponRef.current, {
                scale: 2,
                backgroundColor: null,
                useCORS: true,
            });
            const link = document.createElement('a');
            link.download = `kupon-${designData.code}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Error downloading:', error);
            alert('Gagal mengunduh gambar');
        } finally {
            setIsDownloading(false);
        }
    }, [designData.code]);

    // Get display value for coupon preview
    const getDesignDisplayValue = () => {
        if (designData.type === 'percentage') {
            return `${designData.value}%`;
        } else {
            if (designData.value >= 1000000) {
                return `Rp${(designData.value / 1000000).toFixed(designData.value % 1000000 === 0 ? 0 : 1)}jt`;
            } else if (designData.value >= 1000) {
                return `Rp${(designData.value / 1000).toFixed(designData.value % 1000 === 0 ? 0 : 1)}rb`;
            }
            return `Rp${new Intl.NumberFormat('id-ID').format(designData.value)}`;
        }
    };

    // Lighten a color for decorative elements
    const lightenColor = (hex, percent) => {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, (num >> 16) + Math.round(255 * percent));
        const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * percent));
        const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * percent));
        return `rgb(${r}, ${g}, ${b})`;
    };

    return (
        <AdminLayout title="Diskon">
            <Head title="Diskon" />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Diskon
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Kelola diskon dan promosi untuk produk
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setDesignData({
                                    code: 'DISCOUNT50',
                                    name: 'Diskon Tahun Baru',
                                    type: 'percentage',
                                    value: 0,
                                    bgColor: '#8B5CF6',
                                    textColor: '#FFFFFF',
                                    accentColor: '#A78BFA',
                                });
                                setShowDesignModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                        >
                            <PaintBrushIcon className="h-5 w-5 mr-2" />
                            Buat Desain Diskon
                        </button>
                        <Link
                            href={route("admin.discounts.create")}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Tambah Diskon
                        </Link>
                    </div>
                </div>

                {/* Discounts List */}
                {discounts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada diskon</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Mulai dengan membuat diskon baru
                        </p>
                        <div className="mt-6">
                            <Link
                                href={route("admin.discounts.create")}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Tambah Diskon
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kode & Nama
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipe & Nilai
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Periode
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Penggunaan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {discounts.map((discount) => (
                                        <tr key={discount.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-100">
                                                        <TagIcon className="h-6 w-6 text-indigo-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {discount.code}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {discount.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {getDiscountValue(discount)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {discount.type === 'percentage' ? 'Persentase' : 'Nominal'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(discount.start_date)} - {formatDate(discount.end_date)}
                                                </div>
                                                {discount.min_purchase && (
                                                    <div className="text-sm text-gray-500">
                                                        Min: {formatCurrency(discount.min_purchase)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {discount.usage_count} / {discount.usage_limit || '\u221E'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(discount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => openDesignForDiscount(discount)}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                                        title="Desain Kupon"
                                                    >
                                                        <PaintBrushIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(discount)}
                                                        className={`p-2 rounded-md transition-colors ${
                                                            discount.is_active
                                                                ? 'text-green-600 hover:bg-green-50'
                                                                : 'text-gray-400 hover:bg-gray-50'
                                                        }`}
                                                        title={discount.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                    >
                                                        {discount.is_active ? (
                                                            <CheckCircleIcon className="h-5 w-5" />
                                                        ) : (
                                                            <XCircleIcon className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                    <Link
                                                        href={route("admin.discounts.edit", discount.id)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(discount)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Design Discount Modal */}
            {showDesignModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                Buat Desain Diskon Baru
                            </h2>
                            <button
                                onClick={() => setShowDesignModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left: Form */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Diskon</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Diskon</label>
                                                <input
                                                    type="text"
                                                    value={designData.code}
                                                    onChange={(e) => setDesignData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                                    placeholder="DISCOUNT50"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Diskon</label>
                                                <input
                                                    type="text"
                                                    value={designData.name}
                                                    onChange={(e) => setDesignData(prev => ({ ...prev, name: e.target.value }))}
                                                    placeholder="Diskon Tahun Baru"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Diskon</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDesignData(prev => ({ ...prev, type: 'percentage' }))}
                                                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                                                            designData.type === 'percentage'
                                                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <span className="text-lg font-bold">%</span>
                                                        Persentase
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDesignData(prev => ({ ...prev, type: 'fixed' }))}
                                                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                                                            designData.type === 'fixed'
                                                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <span className="text-lg font-bold">$</span>
                                                        Nominal
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {designData.type === 'percentage' ? 'Persentase Diskon (%)' : 'Nominal Diskon (Rp)'}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={designData.value}
                                                    onChange={(e) => setDesignData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                                                    placeholder="0"
                                                    min="0"
                                                    max={designData.type === 'percentage' ? 100 : undefined}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kustomisasi Desain</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Warna Latar Belakang</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={designData.bgColor}
                                                        onChange={(e) => setDesignData(prev => ({ ...prev, bgColor: e.target.value }))}
                                                        className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={designData.bgColor}
                                                        onChange={(e) => setDesignData(prev => ({ ...prev, bgColor: e.target.value }))}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={designData.textColor}
                                                        onChange={(e) => setDesignData(prev => ({ ...prev, textColor: e.target.value }))}
                                                        className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={designData.textColor}
                                                        onChange={(e) => setDesignData(prev => ({ ...prev, textColor: e.target.value }))}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Preset Warna</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { bg: '#8B5CF6', label: 'Ungu' },
                                                        { bg: '#3B82F6', label: 'Biru' },
                                                        { bg: '#10B981', label: 'Hijau' },
                                                        { bg: '#F59E0B', label: 'Kuning' },
                                                        { bg: '#EF4444', label: 'Merah' },
                                                        { bg: '#EC4899', label: 'Pink' },
                                                        { bg: '#06B6D4', label: 'Cyan' },
                                                        { bg: '#1F2937', label: 'Gelap' },
                                                    ].map((preset) => (
                                                        <button
                                                            key={preset.bg}
                                                            onClick={() => setDesignData(prev => ({ ...prev, bgColor: preset.bg, textColor: '#FFFFFF' }))}
                                                            className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${
                                                                designData.bgColor === preset.bg ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-400' : 'border-gray-200'
                                                            }`}
                                                            style={{ backgroundColor: preset.bg }}
                                                            title={preset.label}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Preview */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Desain</h3>

                                    {/* Coupon Preview */}
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 mb-4">
                                        <div
                                            ref={couponRef}
                                            className="relative overflow-hidden rounded-2xl"
                                            style={{
                                                backgroundColor: designData.bgColor,
                                                color: designData.textColor,
                                                padding: '32px',
                                                minHeight: '280px',
                                            }}
                                        >
                                            {/* Decorative elements */}
                                            <div
                                                className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
                                                style={{ backgroundColor: designData.textColor }}
                                            />
                                            <div
                                                className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full opacity-10"
                                                style={{ backgroundColor: designData.textColor }}
                                            />

                                            {/* Circle cutouts */}
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full" />
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-white rounded-full" />

                                            {/* Content */}
                                            <div className="relative z-10 text-center">
                                                <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-80 mb-2">
                                                    KUPON DISKON
                                                </p>
                                                <p className="text-5xl font-extrabold mb-2">
                                                    {getDesignDisplayValue()}
                                                </p>
                                                <p className="text-lg font-semibold mb-6">
                                                    {designData.name}
                                                </p>

                                                {/* Code box */}
                                                <div
                                                    className="inline-block px-6 py-3 rounded-xl"
                                                    style={{
                                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                                        backdropFilter: 'blur(10px)',
                                                    }}
                                                >
                                                    <p className="text-xs opacity-70 mb-1">Kode:</p>
                                                    <p className="text-lg font-bold tracking-wider">
                                                        {designData.code}
                                                    </p>
                                                </div>

                                                <p className="text-xs opacity-60 mt-4">
                                                    Gunakan kode ini saat checkout
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleDownloadPNG}
                                            disabled={isDownloading}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                                        >
                                            <ArrowDownTrayIcon className="h-5 w-5" />
                                            {isDownloading ? 'Mengunduh...' : 'Unduh sebagai Gambar (PNG)'}
                                        </button>

                                        <button
                                            onClick={() => setShowDesignModal(false)}
                                            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default DiscountsIndex;
