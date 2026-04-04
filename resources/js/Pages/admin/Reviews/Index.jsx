import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    StarIcon,
    TrashIcon,
    ChatBubbleLeftEllipsisIcon,
    CheckCircleIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const StarRating = ({ rating, size = 'sm' }) => {
    const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) =>
                s <= rating
                    ? <StarSolid key={s} className={`${sz} text-yellow-400`} />
                    : <StarIcon key={s} className={`${sz} text-gray-300`} />
            )}
        </div>
    );
};

export default function ReviewsIndex({ reviews, filters }) {
    const { flash } = usePage().props;

    const [search, setSearch] = useState(filters?.search || '');
    const [ratingFilter, setRatingFilter] = useState(filters?.rating || '');
    const [approvedFilter, setApprovedFilter] = useState(filters?.approved ?? '');
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState('');

    const applyFilters = () => {
        router.get('/admin/reviews', {
            search: search || undefined,
            rating: ratingFilter || undefined,
            approved: approvedFilter !== '' ? approvedFilter : undefined,
        }, { preserveState: true, replace: true });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') applyFilters();
    };

    const handleDelete = (id) => {
        if (!confirm('Hapus ulasan ini?')) return;
        router.delete(`/admin/reviews/${id}`, { preserveScroll: true });
    };

    const handleToggleApprove = (id) => {
        router.patch(`/admin/reviews/${id}/toggle-approve`, {}, { preserveScroll: true });
    };

    const handleReply = (review) => {
        setReplyingId(review.id);
        setReplyText(review.admin_reply || '');
    };

    const submitReply = (id) => {
        router.post(`/admin/reviews/${id}/reply`, { admin_reply: replyText }, {
            preserveScroll: true,
            onSuccess: () => {
                setReplyingId(null);
                setReplyText('');
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Kelola Ulasan" />

            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Kelola Ulasan</h1>
                    <p className="text-gray-500 mt-1">Moderasi, balas, dan hapus ulasan pelanggan.</p>
                </div>

                {/* Flash message */}
                {flash?.success && (
                    <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                        {flash.success}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-48">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Cari</label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nama, produk, komentar..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Rating</label>
                        <select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Semua</option>
                            {[5, 4, 3, 2, 1].map((r) => (
                                <option key={r} value={r}>{r} Bintang</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                        <select
                            value={approvedFilter}
                            onChange={(e) => setApprovedFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Semua</option>
                            <option value="1">Ditampilkan</option>
                            <option value="0">Disembunyikan</option>
                        </select>
                    </div>
                    <button
                        onClick={applyFilters}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
                    >
                        Filter
                    </button>
                </div>

                {/* Reviews list */}
                {reviews.data.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <StarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Belum ada ulasan.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.data.map((review) => (
                            <div
                                key={review.id}
                                className={`bg-white rounded-xl shadow-sm border p-5 ${
                                    review.is_approved ? 'border-gray-200' : 'border-orange-200 bg-orange-50'
                                }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="font-semibold text-gray-900">{review.user?.name}</span>
                                            <StarRating rating={review.rating} />
                                            <span className="text-xs text-gray-400">{review.created_at}</span>
                                            {!review.is_approved && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                                    Disembunyikan
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-indigo-600 mt-0.5">
                                            Produk: <a href={`/product/${review.product?.slug}`} target="_blank" className="hover:underline">{review.product?.title}</a>
                                        </p>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleToggleApprove(review.id)}
                                            title={review.is_approved ? 'Sembunyikan' : 'Tampilkan'}
                                            className={`p-1.5 rounded-lg transition ${
                                                review.is_approved
                                                    ? 'text-green-600 hover:bg-green-50'
                                                    : 'text-gray-400 hover:bg-gray-100'
                                            }`}
                                        >
                                            {review.is_approved
                                                ? <CheckCircleIcon className="w-5 h-5" />
                                                : <XCircleIcon className="w-5 h-5" />
                                            }
                                        </button>
                                        <button
                                            onClick={() => handleReply(review)}
                                            title="Balas"
                                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                                        >
                                            <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            title="Hapus"
                                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Comment */}
                                <p className="mt-3 text-gray-700 text-sm">{review.comment}</p>

                                {/* Admin reply display */}
                                {review.admin_reply && replyingId !== review.id && (
                                    <div className="mt-3 ml-4 pl-4 border-l-2 border-indigo-300 bg-indigo-50 rounded-r-lg py-2 px-3">
                                        <p className="text-xs font-semibold text-indigo-700 mb-1">Balasan Admin</p>
                                        <p className="text-sm text-gray-700">{review.admin_reply}</p>
                                    </div>
                                )}

                                {/* Reply form */}
                                {replyingId === review.id && (
                                    <div className="mt-3 ml-4 pl-4 border-l-2 border-indigo-300">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            rows={3}
                                            placeholder="Tulis balasan admin..."
                                            className="w-full border border-gray-300 rounded-lg text-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => submitReply(review.id)}
                                                disabled={!replyText.trim()}
                                                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                                            >
                                                Simpan Balasan
                                            </button>
                                            <button
                                                onClick={() => setReplyingId(null)}
                                                className="px-3 py-1.5 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {reviews.last_page > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {reviews.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                                    link.active
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 disabled:opacity-40'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
