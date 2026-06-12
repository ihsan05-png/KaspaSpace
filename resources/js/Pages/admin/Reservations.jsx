import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

export default function Reservations() {
    return (
        <AdminLayout>
            <Head title="Reservasi" />

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
                    Reservasi
                </h1>
                <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
                    Kelola reservasi workspace dan ruang meeting
                </p>
            </div>

            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(26,46,90,0.07)', padding: '64px 20px', textAlign: 'center' }}>
                <CalendarDaysIcon style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 15, fontWeight: 700, color: '#6b7280', margin: '0 0 6px' }}>Fitur Reservasi Sedang Dikembangkan</p>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Halaman ini akan segera tersedia</p>
            </div>
        </AdminLayout>
    );
}
