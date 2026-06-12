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

const BLUE = '#005bbf';

const StarRating = ({ rating, size = 'sm' }) => {
    const sz = size === 'sm' ? 16 : 20;
    return (
        <div style={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((s) =>
                s <= rating
                    ? <StarSolid key={s} style={{ width: sz, height: sz, color: '#facc15' }} />
                    : <StarIcon key={s} style={{ width: sz, height: sz, color: '#d1d5db' }} />
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

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
                    Kelola Ulasan
                </h1>
                <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
                    Moderasi, balas, dan hapus ulasan pelanggan.
                </p>
            </div>

            {/* Flash message */}
            {flash?.success && (
                <div style={{ marginBottom: 16, padding: '10px 16px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, color: '#166534', fontSize: 13, fontWeight: 600 }}>
                    {flash.success}
                </div>
            )}

            {/* Filters */}
            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(26,46,90,0.07)', marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f2f8', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cari</label>
                        <div style={{ position: 'relative' }}>
                            <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af' }} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nama, produk, komentar..."
                                style={{
                                    width: '100%', paddingLeft: 34, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                                    border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151',
                                    outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rating</label>
                        <select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            style={{ padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="">Semua</option>
                            {[5, 4, 3, 2, 1].map((r) => (
                                <option key={r} value={r}>{r} Bintang</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</label>
                        <select
                            value={approvedFilter}
                            onChange={(e) => setApprovedFilter(e.target.value)}
                            style={{ padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="">Semua</option>
                            <option value="1">Ditampilkan</option>
                            <option value="0">Disembunyikan</option>
                        </select>
                    </div>
                    <button
                        onClick={applyFilters}
                        style={{ padding: '9px 18px', background: BLUE, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                    >
                        Filter
                    </button>
                </div>
            </div>

            {/* Reviews list */}
            {reviews.data.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(26,46,90,0.07)', padding: '48px 20px', textAlign: 'center' }}>
                    <StarIcon style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 12px' }} />
                    <p style={{ color: '#9ca3af', fontSize: 14 }}>Belum ada ulasan.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reviews.data.map((review) => (
                        <div key={review.id} style={{
                            background: review.is_approved ? '#fff' : '#fff7ed',
                            borderRadius: 14,
                            boxShadow: '0 1px 6px rgba(26,46,90,0.07)',
                            border: `1px solid ${review.is_approved ? '#f0f2f8' : '#fed7aa'}`,
                            padding: '18px 20px',
                        }}>
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{review.user?.name}</span>
                                        <StarRating rating={review.rating} />
                                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{review.created_at}</span>
                                        {!review.is_approved && (
                                            <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#fed7aa', color: '#c2410c' }}>
                                                Disembunyikan
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: 12, color: BLUE, marginTop: 4 }}>
                                        Produk:{' '}
                                        <a href={`/product/${review.product?.slug}`} target="_blank" style={{ color: BLUE, textDecoration: 'none', fontWeight: 600 }}>
                                            {review.product?.title}
                                        </a>
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                    <button
                                        onClick={() => handleToggleApprove(review.id)}
                                        title={review.is_approved ? 'Sembunyikan' : 'Tampilkan'}
                                        style={{
                                            padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer',
                                            background: 'none', color: review.is_approved ? '#16a34a' : '#9ca3af',
                                        }}
                                    >
                                        {review.is_approved
                                            ? <CheckCircleIcon style={{ width: 20, height: 20 }} />
                                            : <XCircleIcon style={{ width: 20, height: 20 }} />
                                        }
                                    </button>
                                    <button
                                        onClick={() => handleReply(review)}
                                        title="Balas"
                                        style={{ padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'none', color: BLUE }}
                                    >
                                        <ChatBubbleLeftEllipsisIcon style={{ width: 20, height: 20 }} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        title="Hapus"
                                        style={{ padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'none', color: '#ef4444' }}
                                    >
                                        <TrashIcon style={{ width: 20, height: 20 }} />
                                    </button>
                                </div>
                            </div>

                            {/* Comment */}
                            <p style={{ marginTop: 10, fontSize: 13, color: '#374151' }}>{review.comment}</p>

                            {/* Admin reply display */}
                            {review.admin_reply && replyingId !== review.id && (
                                <div style={{
                                    marginTop: 10, marginLeft: 16, paddingLeft: 14, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
                                    borderLeft: '2px solid #bfdbfe', background: '#eff6ff', borderRadius: '0 8px 8px 0',
                                }}>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: BLUE, marginBottom: 4 }}>Balasan Admin</p>
                                    <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{review.admin_reply}</p>
                                </div>
                            )}

                            {/* Reply form */}
                            {replyingId === review.id && (
                                <div style={{ marginTop: 10, marginLeft: 16, paddingLeft: 14, borderLeft: '2px solid #bfdbfe' }}>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        rows={3}
                                        placeholder="Tulis balasan admin..."
                                        style={{
                                            width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13,
                                            padding: 12, outline: 'none', boxSizing: 'border-box', resize: 'vertical', color: '#374151',
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                        <button
                                            onClick={() => submitReply(review.id)}
                                            disabled={!replyText.trim()}
                                            style={{
                                                padding: '7px 16px', background: BLUE, color: '#fff', border: 'none',
                                                borderRadius: 8, fontSize: 12, fontWeight: 700,
                                                cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                                                opacity: replyText.trim() ? 1 : 0.5,
                                            }}
                                        >
                                            Simpan Balasan
                                        </button>
                                        <button
                                            onClick={() => setReplyingId(null)}
                                            style={{
                                                padding: '7px 16px', background: 'none', color: '#6b7280',
                                                border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                            }}
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
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 6 }}>
                    {reviews.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            style={{
                                padding: '6px 12px', fontSize: 12, borderRadius: 8, border: 'none',
                                cursor: link.url ? 'pointer' : 'not-allowed',
                                background: link.active ? BLUE : '#f3f4f6',
                                color: link.active ? '#fff' : link.url ? '#374151' : '#d1d5db',
                                fontWeight: link.active ? 700 : 400,
                            }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
