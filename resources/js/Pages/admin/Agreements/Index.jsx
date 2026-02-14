import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PencilSquareIcon, DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function AgreementsIndex({ agreements }) {
    const getIcon = (type) => {
        if (type === 'terms') return <DocumentTextIcon className="w-8 h-8 text-blue-600" />;
        return <ShieldCheckIcon className="w-8 h-8 text-green-600" />;
    };

    const getLabel = (type) => {
        if (type === 'terms') return 'Syarat & Ketentuan';
        return 'Kebijakan Privasi';
    };

    return (
        <AdminLayout>
            <Head title="Kelola Agreements" />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Kelola Agreements</h1>
                    <p className="text-gray-600 mt-1">Edit konten Syarat & Ketentuan dan Kebijakan Privasi yang ditampilkan di halaman register dan checkout.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {agreements.map((agreement) => (
                        <div key={agreement.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {getIcon(agreement.type)}
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">{agreement.title}</h2>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">{getLabel(agreement.type)}</span>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    agreement.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {agreement.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                    {agreement.content?.length || 0} bagian/section
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Terakhir diubah: {new Date(agreement.updated_at).toLocaleDateString('id-ID', {
                                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            <Link
                                href={`/admin/agreements/${agreement.id}/edit`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                                Edit Konten
                            </Link>
                        </div>
                    ))}
                </div>

                {agreements.length === 0 && (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Belum ada agreement. Jalankan seeder untuk membuat data awal.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
