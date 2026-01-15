import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Integrations() {
    return (
        <AdminLayout>
            <Head title="Integrasi" />
            
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Integrasi</h1>
                <p className="text-gray-600">Kelola integrasi dengan layanan pihak ketiga</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Fitur Integrasi Sedang Dikembangkan</p>
                    <p className="text-gray-400 mt-2">Halaman ini akan segera tersedia</p>
                </div>
            </div>
        </AdminLayout>
    );
}
