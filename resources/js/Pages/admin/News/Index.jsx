import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from '@/Layouts/AdminLayout';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
} from "@heroicons/react/24/outline";

const NewsIndex = ({ news }) => {
    const handleDelete = (newsItem) => {
        if (
            confirm(
                `Apakah Anda yakin ingin menghapus berita "${newsItem.title}"?`
            )
        ) {
            router.delete(route("admin.news.destroy", newsItem.id));
        }
    };

    const toggleStatus = (newsItem) => {
        router.patch(
            route("admin.news.update", newsItem.id),
            {
                is_published: !newsItem.is_published,
            },
            {
                preserveState: true,
            }
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AdminLayout title="News & Blogs">
            <Head title="News & Blogs" />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            News & Blogs
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Kelola berita dan artikel untuk website
                        </p>
                    </div>

                    <Link
                        href={route("admin.news.create")}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Tambah Berita
                    </Link>
                </div>

                {/* News List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Judul
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Penulis
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal Publikasi
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
                                {news.data && news.data.length > 0 ? (
                                    news.data.map((newsItem) => (
                                        <tr key={newsItem.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {newsItem.image && (
                                                        <img
                                                            src={`/storage/${newsItem.image}`}
                                                            alt={newsItem.title}
                                                            className="h-10 w-10 rounded object-cover mr-3"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {newsItem.title}
                                                        </div>
                                                        {newsItem.excerpt && (
                                                            <div className="text-sm text-gray-500 truncate max-w-md">
                                                                {newsItem.excerpt}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {newsItem.author || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {newsItem.published_at ? formatDate(newsItem.published_at) : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => toggleStatus(newsItem)}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        newsItem.is_published
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {newsItem.is_published ? (
                                                        <>
                                                            <EyeIcon className="h-3 w-3 mr-1" />
                                                            Published
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeSlashIcon className="h-3 w-3 mr-1" />
                                                            Draft
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={route("admin.news.edit", newsItem.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(newsItem)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-8 text-center text-sm text-gray-500"
                                        >
                                            Belum ada berita. Klik tombol "Tambah Berita" untuk membuat berita baru.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {news.links && news.links.length > 3 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                {news.prev_page_url && (
                                    <Link
                                        href={news.prev_page_url}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {news.next_page_url && (
                                    <Link
                                        href={news.next_page_url}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{news.from}</span> to{' '}
                                        <span className="font-medium">{news.to}</span> of{' '}
                                        <span className="font-medium">{news.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        {news.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    link.active
                                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                } ${
                                                    index === 0 ? 'rounded-l-md' : ''
                                                } ${
                                                    index === news.links.length - 1 ? 'rounded-r-md' : ''
                                                } ${
                                                    !link.url ? 'cursor-not-allowed opacity-50' : ''
                                                }`}
                                                disabled={!link.url}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default NewsIndex;
