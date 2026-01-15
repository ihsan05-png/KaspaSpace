import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from '@/Layouts/AdminLayout';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    TagIcon,
    CalendarIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";

const DiscountsIndex = ({ discounts }) => {
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

                    <Link
                        href={route("admin.discounts.create")}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Tambah Diskon
                    </Link>
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
                                                    {discount.usage_count} / {discount.usage_limit || '∞'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(discount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
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
        </AdminLayout>
    );
};

export default DiscountsIndex;
