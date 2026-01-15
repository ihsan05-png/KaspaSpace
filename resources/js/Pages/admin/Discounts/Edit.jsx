import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const EditDiscount = ({ discount, products, users }) => {
    const { data, setData, put, processing, errors } = useForm({
        code: discount.code || '',
        name: discount.name || '',
        description: discount.description || '',
        type: discount.type || 'percentage',
        value: discount.value || '',
        min_purchase: discount.min_purchase || '',
        max_discount: discount.max_discount || '',
        usage_limit: discount.usage_limit || '',
        start_date: discount.start_date ? discount.start_date.substring(0, 16) : '',
        end_date: discount.end_date ? discount.end_date.substring(0, 16) : '',
        is_active: discount.is_active ?? true,
        product_ids: discount.products?.map(p => p.id) || [],
        user_ids: discount.users?.map(u => u.id) || []
    });

    const [searchProduct, setSearchProduct] = useState('');
    const [searchUser, setSearchUser] = useState('');

    const handleProductToggle = (productId) => {
        const currentIds = data.product_ids || [];
        if (currentIds.includes(productId)) {
            setData('product_ids', currentIds.filter(id => id !== productId));
        } else {
            setData('product_ids', [...currentIds, productId]);
        }
    };

    const handleSelectAll = () => {
        if (data.product_ids.length === products.length) {
            setData('product_ids', []);
        } else {
            setData('product_ids', products.map(p => p.id));
        }
    };

    const handleUserToggle = (userId) => {
        const currentIds = data.user_ids || [];
        if (currentIds.includes(userId)) {
            setData('user_ids', currentIds.filter(id => id !== userId));
        } else {
            setData('user_ids', [...currentIds, userId]);
        }
    };

    const handleSelectAllUsers = () => {
        if (data.user_ids.length === users.length) {
            setData('user_ids', []);
        } else {
            setData('user_ids', users.map(u => u.id));
        }
    };

    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchProduct.toLowerCase())
    );

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
        user.email.toLowerCase().includes(searchUser.toLowerCase())
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.discounts.update', discount.id));
    };

    return (
        <AdminLayout title="Edit Diskon">
            <Head title="Edit Diskon" />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <Link
                        href={route('admin.discounts.index')}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-3"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">Edit Diskon</h1>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Usage Count Info */}
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-medium">Info:</span> Diskon ini telah digunakan{' '}
                                        <span className="font-semibold">{discount.usage_count}</span> kali
                                        {discount.usage_limit && ` dari ${discount.usage_limit} batas penggunaan`}
                                    </p>
                                </div>

                                {/* Code */}
                                <div>
                                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                                        Kode Diskon <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="DISCOUNT10"
                                    />
                                    {errors.code && (
                                        <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">
                                        Kode unik untuk diskon ini (contoh: NEWYEAR2026, DISCOUNT50K)
                                    </p>
                                </div>

                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Diskon <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Diskon Tahun Baru"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Deskripsi diskon..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                {/* Type and Value */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                            Tipe Diskon <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="type"
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="percentage">Persentase (%)</option>
                                            <option value="fixed">Nominal (Rp)</option>
                                        </select>
                                        {errors.type && (
                                            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                                            Nilai Diskon <span className="text-red-500">*</span>
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            {data.type === 'fixed' && (
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">Rp</span>
                                                </div>
                                            )}
                                            <input
                                                type="number"
                                                id="value"
                                                value={data.value}
                                                onChange={(e) => setData('value', e.target.value)}
                                                className={`block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
                                                    data.type === 'fixed' ? 'pl-10' : ''
                                                } ${data.type === 'percentage' ? 'pr-8' : ''}`}
                                                placeholder={data.type === 'percentage' ? '10' : '100000'}
                                                min="0"
                                                step={data.type === 'percentage' ? '0.01' : '1000'}
                                            />
                                            {data.type === 'percentage' && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">%</span>
                                                </div>
                                            )}
                                        </div>
                                        {errors.value && (
                                            <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                                        )}
                                        <p className="mt-1 text-sm text-gray-500">
                                            {data.type === 'percentage' 
                                                ? 'Contoh: 10 untuk diskon 10%' 
                                                : 'Contoh: 100000 untuk diskon Rp 100.000'}
                                        </p>
                                    </div>
                                </div>

                                {/* Min Purchase and Max Discount */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="min_purchase" className="block text-sm font-medium text-gray-700 mb-1">
                                            Minimum Pembelian
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">Rp</span>
                                            </div>
                                            <input
                                                type="number"
                                                id="min_purchase"
                                                value={data.min_purchase}
                                                onChange={(e) => setData('min_purchase', e.target.value)}
                                                className="block w-full pl-10 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                                placeholder="0"
                                                min="0"
                                                step="1000"
                                            />
                                        </div>
                                        {errors.min_purchase && (
                                            <p className="mt-1 text-sm text-red-600">{errors.min_purchase}</p>
                                        )}
                                        <p className="mt-1 text-sm text-gray-500">
                                            Kosongkan jika tidak ada minimum
                                        </p>
                                    </div>

                                    {data.type === 'percentage' && (
                                        <div>
                                            <label htmlFor="max_discount" className="block text-sm font-medium text-gray-700 mb-1">
                                                Maksimal Diskon
                                            </label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">Rp</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    id="max_discount"
                                                    value={data.max_discount}
                                                    onChange={(e) => setData('max_discount', e.target.value)}
                                                    className="block w-full pl-10 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                                    placeholder="0"
                                                    min="0"
                                                    step="1000"
                                                />
                                            </div>
                                            {errors.max_discount && (
                                                <p className="mt-1 text-sm text-red-600">{errors.max_discount}</p>
                                            )}
                                            <p className="mt-1 text-sm text-gray-500">
                                                Kosongkan jika tidak ada batas
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Usage Limit */}
                                <div>
                                    <label htmlFor="usage_limit" className="block text-sm font-medium text-gray-700 mb-1">
                                        Batas Penggunaan
                                    </label>
                                    <input
                                        type="number"
                                        id="usage_limit"
                                        value={data.usage_limit}
                                        onChange={(e) => setData('usage_limit', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Unlimited"
                                        min="1"
                                    />
                                    {errors.usage_limit && (
                                        <p className="mt-1 text-sm text-red-600">{errors.usage_limit}</p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">
                                        Kosongkan untuk unlimited. Saat ini telah digunakan {discount.usage_count} kali
                                    </p>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Mulai
                                        </label>
                                        <input
                                            type="datetime-local"
                                            id="start_date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        {errors.start_date && (
                                            <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Berakhir
                                        </label>
                                        <input
                                            type="datetime-local"
                                            id="end_date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        {errors.end_date && (
                                            <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Products Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Berlaku untuk Produk
                                    </label>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Kosongkan jika diskon berlaku untuk semua produk. Pilih produk tertentu jika diskon hanya berlaku untuk produk tersebut.
                                    </p>

                                    {/* Search and Select All */}
                                    <div className="mb-3 flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Cari produk..."
                                            value={searchProduct}
                                            onChange={(e) => setSearchProduct(e.target.value)}
                                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSelectAll}
                                            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            {data.product_ids.length === products.length ? 'Batal Semua' : 'Pilih Semua'}
                                        </button>
                                    </div>

                                    {/* Products List */}
                                    <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
                                        {filteredProducts.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                Tidak ada produk ditemukan
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-200">
                                                {filteredProducts.map((product) => (
                                                    <label
                                                        key={product.id}
                                                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={data.product_ids.includes(product.id)}
                                                            onChange={() => handleProductToggle(product.id)}
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                        />
                                                        <div className="ml-3 flex-1">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {product.title}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                Rp {Number(product.base_price).toLocaleString('id-ID')}
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {data.product_ids.length > 0 && (
                                        <p className="mt-2 text-sm text-indigo-600">
                                            {data.product_ids.length} produk dipilih
                                        </p>
                                    )}

                                    {errors.product_ids && (
                                        <p className="mt-1 text-sm text-red-600">{errors.product_ids}</p>
                                    )}
                                </div>

                                {/* Users Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Visible untuk User
                                    </label>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Kosongkan jika diskon visible untuk semua user. Pilih user tertentu jika diskon hanya visible untuk user tersebut.
                                    </p>

                                    {/* Search and Select All */}
                                    <div className="mb-3 flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Cari user..."
                                            value={searchUser}
                                            onChange={(e) => setSearchUser(e.target.value)}
                                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSelectAllUsers}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors text-sm font-medium"
                                        >
                                            {data.user_ids.length === users.length ? 'Batal Semua' : 'Pilih Semua'}
                                        </button>
                                    </div>

                                    {/* Users List */}
                                    <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
                                        {filteredUsers.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                Tidak ada user ditemukan
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-200">
                                                {filteredUsers.map((user) => (
                                                    <label
                                                        key={user.id}
                                                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={data.user_ids.includes(user.id)}
                                                            onChange={() => handleUserToggle(user.id)}
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                        />
                                                        <div className="ml-3 flex-1">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {data.user_ids.length > 0 && (
                                        <p className="mt-2 text-sm text-indigo-600">
                                            {data.user_ids.length} user dipilih
                                        </p>
                                    )}

                                    {errors.user_ids && (
                                        <p className="mt-1 text-sm text-red-600">{errors.user_ids}</p>
                                    )}
                                </div>

                                {/* Is Active */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                        Aktifkan diskon
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex items-center justify-end space-x-3">
                                <Link
                                    href={route('admin.discounts.index')}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Update Diskon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default EditDiscount;
