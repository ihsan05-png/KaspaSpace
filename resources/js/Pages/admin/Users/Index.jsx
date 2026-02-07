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

    const getRoleBadge = (role) => {
        if (role === 'admin') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <ShieldCheckIcon className="w-3 h-3 mr-1" />
                    Admin
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <UserIcon className="w-3 h-3 mr-1" />
                User
            </span>
        );
    };

    return (
        <AdminLayout title="Kelola Pengguna">
            <Head title="Kelola Pengguna" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Kelola Pengguna</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Kelola pengguna dan hak akses sistem
                    </p>
                </div>

                {/* Actions Bar */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari pengguna..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowNewsletterModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <EnvelopeIcon className="h-5 w-5 mr-2" />
                            Kirim Newsletter
                            {totalSubscribers > 0 && (
                                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {totalSubscribers}
                                </span>
                            )}
                        </button>
                        <Link
                            href={route('admin.users.create')}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Tambah Pengguna
                        </Link>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {searchTerm ? 'Pengguna tidak ditemukan' : 'Belum ada pengguna'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? 'Coba kata kunci lain' : 'Mulai dengan menambahkan pengguna baru'}
                            </p>
                            {!searchTerm && (
                                <div className="mt-6">
                                    <Link
                                        href={route('admin.users.create')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Tambah Pengguna
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Terdaftar
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Terms
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Privacy
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Newsletter
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                            <span className="text-indigo-600 font-medium text-sm">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {user.agreed_terms ? (
                                                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                                                ) : (
                                                    <XMarkIcon className="h-5 w-5 text-gray-300 mx-auto" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {user.agreed_privacy ? (
                                                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                                                ) : (
                                                    <XMarkIcon className="h-5 w-5 text-gray-300 mx-auto" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {user.agreed_newsletter ? (
                                                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                                                ) : (
                                                    <XMarkIcon className="h-5 w-5 text-gray-300 mx-auto" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route('admin.users.edit', user.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    <PencilIcon className="h-5 w-5 inline" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="h-5 w-5 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary */}
                {filteredUsers.length > 0 && (
                    <div className="mt-4 text-sm text-gray-500">
                        Menampilkan {filteredUsers.length} pengguna
                        {searchTerm && ` dari ${users.length} total`}
                    </div>
                )}

                {/* Guest Newsletter Subscribers Section */}
                {guestSubscribers.length > 0 && (
                    <div className="mt-8">
                        <button
                            onClick={() => setShowGuestSubscribers(!showGuestSubscribers)}
                            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <UserGroupIcon className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-900">
                                        Guest Newsletter Subscribers
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {guestSubscribers.length} guest telah subscribe newsletter saat checkout
                                    </p>
                                </div>
                            </div>
                            {showGuestSubscribers ? (
                                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                            ) : (
                                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                            )}
                        </button>

                        {showGuestSubscribers && (
                            <div className="mt-4 bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-green-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Nama
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Subscribed
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {guestSubscribers.map((subscriber) => (
                                                <tr key={subscriber.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                                    <span className="text-green-600 font-medium text-sm">
                                                                        {subscriber.name.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {subscriber.name}
                                                                </div>
                                                                <div className="text-xs text-green-600">
                                                                    Guest
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{subscriber.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(subscriber.subscribed_at || subscriber.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleUnsubscribe(subscriber)}
                                                            className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                                                            title="Hapus dari newsletter"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

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
