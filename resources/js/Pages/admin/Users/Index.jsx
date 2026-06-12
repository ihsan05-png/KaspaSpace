import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    UserIcon,
    ShieldCheckIcon,
    CheckIcon,
    XMarkIcon,
    EnvelopeIcon,
    PaperClipIcon,
    XCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

const UsersIndex = ({ users, guestSubscribers = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewsletterModal, setShowNewsletterModal] = useState(false);
    const [newsletterForm, setNewsletterForm] = useState({
        subject: '',
        message: '',
        attachment: null
    });
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState(null);
    const [showGuestSubscribers, setShowGuestSubscribers] = useState(false);

    // Count newsletter subscribers (registered users)
    const registeredSubscribers = users.filter(user => user.agreed_newsletter);

    // Total unique subscribers (registered + guests, minus duplicates by email)
    const registeredEmails = registeredSubscribers.map(u => u.email);
    const uniqueGuestSubscribers = guestSubscribers.filter(g => !registeredEmails.includes(g.email));
    const totalSubscribers = registeredSubscribers.length + uniqueGuestSubscribers.length;

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setSendResult(null);

        const formData = new FormData();
        formData.append('subject', newsletterForm.subject);
        formData.append('message', newsletterForm.message);
        if (newsletterForm.attachment) {
            formData.append('attachment', newsletterForm.attachment);
        }

        try {
            const response = await axios.post(route('admin.newsletter.send'), formData);
            const result = response.data;

            if (result.success) {
                setSendResult({ success: true, message: result.message });
                setNewsletterForm({ subject: '', message: '', attachment: null });
                setTimeout(() => {
                    setShowNewsletterModal(false);
                    setSendResult(null);
                }, 2000);
            } else {
                setSendResult({ success: false, message: result.message || 'Gagal mengirim newsletter' });
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Terjadi kesalahan saat mengirim';
            setSendResult({ success: false, message: msg });
        }

        setSending(false);
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (user) => {
        if (confirm(`Yakin ingin menghapus pengguna ${user.name}?`)) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    const handleUnsubscribe = (subscriber) => {
        if (confirm(`Yakin ingin menghapus ${subscriber.email} dari newsletter?`)) {
            router.delete(route('admin.newsletter.unsubscribe', subscriber.id));
        }
    };

    const BLUE = '#005bbf';

    const getRoleBadge = (role) => {
        if (role === 'admin') {
            return (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#f3e8ff', color: '#7c3aed' }}>
                    Admin
                </span>
            );
        }
        return (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#eff6ff', color: BLUE }}>
                User
            </span>
        );
    };

    return (
        <AdminLayout title="Kelola Pengguna">
            <Head title="Kelola Pengguna" />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
                        Kelola Pengguna
                    </h1>
                    <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
                        Kelola pengguna dan hak akses sistem
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={() => setShowNewsletterModal(true)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '9px 18px', background: '#f0fdf4', color: '#16a34a',
                            border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        }}
                    >
                        <EnvelopeIcon style={{ width: 16, height: 16 }} />
                        Kirim Newsletter
                        {totalSubscribers > 0 && (
                            <span style={{ marginLeft: 4, padding: '1px 8px', background: '#16a34a', color: '#fff', borderRadius: 20, fontSize: 11 }}>
                                {totalSubscribers}
                            </span>
                        )}
                    </button>
                    <Link
                        href={route('admin.users.create')}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '9px 18px', background: BLUE, color: '#fff',
                            borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none',
                        }}
                    >
                        <PlusIcon style={{ width: 16, height: 16 }} />
                        Tambah Pengguna
                    </Link>
                </div>
            </div>

            {/* Search + Table */}
            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(26,46,90,0.07)', overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f2f8', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
                        <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Cari pengguna..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', paddingLeft: 34, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                                border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151',
                                outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    {filteredUsers.length > 0 && (
                        <span style={{ fontSize: 13, color: '#9ca3af', marginLeft: 'auto' }}>
                            {filteredUsers.length} pengguna{searchTerm ? ` dari ${users.length}` : ''}
                        </span>
                    )}
                </div>

                {filteredUsers.length === 0 ? (
                    <div style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        {searchTerm ? 'Pengguna tidak ditemukan' : 'Belum ada pengguna'}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8faff' }}>
                                    {['Nama', 'Email', 'Role', 'Terdaftar', 'Terms', 'Privacy', 'Newsletter', 'Aksi'].map((h, i) => (
                                        <th key={h} style={{
                                            padding: '11px 18px', fontSize: 11, fontWeight: 700, color: '#9ca3af',
                                            textAlign: i >= 4 ? 'center' : 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, idx) => (
                                    <tr key={user.id}
                                        style={{ borderTop: '1px solid #f0f2f8', background: idx % 2 === 0 ? '#fff' : '#fafbff' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafbff'}
                                    >
                                        <td style={{ padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%', background: '#eff6ff',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: BLUE }}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <span style={{ fontSize: 13, color: '#374151' }}>{user.email}</span>
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <span style={{ fontSize: 12, color: '#6b7280' }}>
                                                {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </td>
                                        {[user.agreed_terms, user.agreed_privacy, user.agreed_newsletter].map((agreed, i) => (
                                            <td key={i} style={{ padding: '14px 18px', textAlign: 'center' }}>
                                                {agreed
                                                    ? <CheckIcon style={{ width: 16, height: 16, color: '#16a34a', margin: '0 auto', display: 'block' }} />
                                                    : <XMarkIcon style={{ width: 16, height: 16, color: '#d1d5db', margin: '0 auto', display: 'block' }} />
                                                }
                                            </td>
                                        ))}
                                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
                                                <Link href={route('admin.users.edit', user.id)}
                                                    style={{ color: '#9ca3af', textDecoration: 'none', display: 'flex' }}>
                                                    <PencilIcon style={{ width: 15, height: 15 }} />
                                                </Link>
                                                <button onClick={() => handleDelete(user)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                                                    <TrashIcon style={{ width: 15, height: 15 }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Guest Newsletter Subscribers */}
            {guestSubscribers.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(26,46,90,0.07)', overflow: 'hidden' }}>
                    <button
                        onClick={() => setShowGuestSubscribers(!showGuestSubscribers)}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
                            borderBottom: showGuestSubscribers ? '1px solid #f0f2f8' : 'none',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UserGroupIcon style={{ width: 18, height: 18, color: '#16a34a' }} />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Guest Newsletter Subscribers</p>
                                <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{guestSubscribers.length} guest telah subscribe newsletter saat checkout</p>
                            </div>
                        </div>
                        {showGuestSubscribers
                            ? <ChevronUpIcon style={{ width: 16, height: 16, color: '#9ca3af' }} />
                            : <ChevronDownIcon style={{ width: 16, height: 16, color: '#9ca3af' }} />
                        }
                    </button>

                    {showGuestSubscribers && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8faff' }}>
                                        {['Nama', 'Email', 'Subscribed', 'Aksi'].map((h, i) => (
                                            <th key={h} style={{
                                                padding: '11px 18px', fontSize: 11, fontWeight: 700, color: '#9ca3af',
                                                textAlign: i === 3 ? 'right' : 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {guestSubscribers.map((subscriber, idx) => (
                                        <tr key={subscriber.id}
                                            style={{ borderTop: '1px solid #f0f2f8', background: idx % 2 === 0 ? '#fff' : '#fafbff' }}
                                        >
                                            <td style={{ padding: '14px 18px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>
                                                            {subscriber.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{subscriber.name}</p>
                                                        <p style={{ fontSize: 11, color: '#16a34a', margin: 0 }}>Guest</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <span style={{ fontSize: 13, color: '#374151' }}>{subscriber.email}</span>
                                            </td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <span style={{ fontSize: 12, color: '#6b7280' }}>
                                                    {new Date(subscriber.subscribed_at || subscriber.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                                <button onClick={() => handleUnsubscribe(subscriber)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'inline-flex', padding: 0 }}>
                                                    <TrashIcon style={{ width: 15, height: 15 }} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Newsletter Modal */}
            {showNewsletterModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={() => setShowNewsletterModal(false)}
                        />

                        {/* Modal */}
                        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                            <form onSubmit={handleNewsletterSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                            <EnvelopeIcon className="h-6 w-6 mr-2 text-green-600" />
                                            Kirim Newsletter
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setShowNewsletterModal(false)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <XCircleIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <p className="text-sm text-green-700">
                                            <strong>{totalSubscribers}</strong> subscriber akan menerima email ini
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            ({registeredSubscribers.length} user terdaftar, {uniqueGuestSubscribers.length} guest)
                                        </p>
                                    </div>

                                    {sendResult && (
                                        <div className={`mb-4 p-3 rounded-lg ${sendResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {sendResult.message}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Subject Email
                                            </label>
                                            <input
                                                type="text"
                                                value={newsletterForm.subject}
                                                onChange={(e) => setNewsletterForm({...newsletterForm, subject: e.target.value})}
                                                placeholder="Promo Spesial Kaspa Space!"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pesan
                                            </label>
                                            <textarea
                                                value={newsletterForm.message}
                                                onChange={(e) => setNewsletterForm({...newsletterForm, message: e.target.value})}
                                                placeholder="Tulis pesan newsletter Anda di sini..."
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Lampiran File (Opsional)
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <label className="flex-1 cursor-pointer">
                                                    <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors">
                                                        <PaperClipIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                        <span className="text-sm text-gray-600">
                                                            {newsletterForm.attachment ? newsletterForm.attachment.name : 'Pilih file...'}
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx"
                                                        onChange={(e) => setNewsletterForm({...newsletterForm, attachment: e.target.files[0]})}
                                                        className="hidden"
                                                    />
                                                </label>
                                                {newsletterForm.attachment && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewsletterForm({...newsletterForm, attachment: null})}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                                                    >
                                                        <XMarkIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                                    <button
                                        type="submit"
                                        disabled={sending || totalSubscribers === 0}
                                        className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sending ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <EnvelopeIcon className="h-4 w-4 mr-2" />
                                                Kirim ke {totalSubscribers} Subscriber
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewsletterModal(false)}
                                        className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default UsersIndex;
