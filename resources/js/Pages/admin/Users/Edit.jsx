import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const EditUser = ({ user }) => {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.role || 'user'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    return (
        <AdminLayout title="Edit Pengguna">
            <Head title="Edit Pengguna" />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <Link
                        href={route('admin.users.index')}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-3"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">Edit Pengguna</h1>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow max-w-2xl">
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="John Doe"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password Section */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Ubah Password
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Kosongkan jika tidak ingin mengubah password
                                    </p>

                                    {/* Password */}
                                    <div className="mb-4">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password Baru
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="••••••••"
                                        />
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                        )}
                                        <p className="mt-1 text-sm text-gray-500">
                                            Minimal 8 karakter
                                        </p>
                                    </div>

                                    {/* Password Confirmation */}
                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                            Konfirmasi Password Baru
                                        </label>
                                        <input
                                            type="password"
                                            id="password_confirmation"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="••••••••"
                                        />
                                        {errors.password_confirmation && (
                                            <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="role"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {errors.role && (
                                        <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">
                                        Admin memiliki akses penuh ke sistem
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex items-center justify-end space-x-3">
                                <Link
                                    href={route('admin.users.index')}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Update Pengguna'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default EditUser;
