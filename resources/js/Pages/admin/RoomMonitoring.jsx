import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import RoomAvailabilitySchedule from '@/Components/RoomAvailabilitySchedule';
import axios from 'axios';
import { Activity, RefreshCw, LayoutGrid, DoorOpen, Building2, Users } from 'lucide-react';

const RoomMonitoring = () => {
    const [summary, setSummary] = useState([]);
    const [summaryDate, setSummaryDate] = useState('');
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const intervalRef = useRef(null);

    const fetchSummary = async () => {
        try {
            const res = await axios.get('/api/room-schedule/today');
            if (res.data.success) {
                setSummary(res.data.summary || []);
                setSummaryDate(res.data.date || '');
                setLastUpdated(new Date());
            }
        } catch (e) {
            console.error('Error fetching summary:', e);
        } finally {
            setSummaryLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
        intervalRef.current = setInterval(fetchSummary, 30000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const deskItems        = summary.filter(s => s.product_type === 'share_desk');
    const privateRoomItems = summary.filter(s => s.product_type === 'private_room');
    const officeItems      = summary.filter(s => s.product_type === 'private_office');

    const totalDesks       = deskItems.reduce((acc, s) => acc + s.total_stock, 0);
    const availableDesks   = deskItems.reduce((acc, s) => acc + s.available, 0);
    const bookedDesks      = deskItems.reduce((acc, s) => acc + s.booked, 0);

    const totalPrivate     = privateRoomItems.reduce((acc, s) => acc + s.total_stock, 0);
    const availablePrivate = privateRoomItems.reduce((acc, s) => acc + s.available, 0);
    const bookedPrivate    = privateRoomItems.reduce((acc, s) => acc + s.booked, 0);

    const totalOffice      = officeItems.reduce((acc, s) => acc + s.total_stock, 0);
    const availableOffice  = officeItems.reduce((acc, s) => acc + s.available, 0);
    const bookedOffice     = officeItems.reduce((acc, s) => acc + s.booked, 0);

    const totalBooked      = bookedDesks + bookedPrivate + bookedOffice;

    return (
        <AdminLayout>
            <Head title="Monitoring Ruangan - Admin" />

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="text-indigo-600" size={28} />
                            Monitoring Ruangan
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            Ketersediaan ruangan real-time dari database — {summaryDate}
                        </p>
                    </div>
                    {lastUpdated && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <RefreshCw size={12} />
                            Diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {/* Meja Coworking */}
                <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 rounded-lg">
                            <LayoutGrid className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Meja Coworking</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {summaryLoading ? '—' : `${availableDesks}/${totalDesks}`}
                            </p>
                            <p className="text-xs text-gray-400">{summaryLoading ? '' : `${bookedDesks} terpakai`}</p>
                        </div>
                    </div>
                </div>

                {/* Private Room */}
                <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 rounded-lg">
                            <DoorOpen className="text-indigo-600" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Private Room</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {summaryLoading ? '—' : `${availablePrivate}/${totalPrivate}`}
                            </p>
                            <p className="text-xs text-gray-400">{summaryLoading ? '' : `${bookedPrivate} terpakai`}</p>
                        </div>
                    </div>
                </div>

                {/* Private Office */}
                <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-100 rounded-lg">
                            <Building2 className="text-purple-600" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Private Office</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {summaryLoading ? '—' : `${availableOffice}/${totalOffice}`}
                            </p>
                            <p className="text-xs text-gray-400">{summaryLoading ? '' : `${bookedOffice} terpakai`}</p>
                        </div>
                    </div>
                </div>

                {/* Total Terisi Hari Ini */}
                <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-100 rounded-lg">
                            <Users className="text-red-600" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total Terisi</p>
                            <p className="text-2xl font-bold text-red-700">
                                {summaryLoading ? '—' : totalBooked}
                            </p>
                            <p className="text-xs text-gray-400">
                                {summaryLoading ? '' : `${bookedDesks} meja · ${bookedPrivate + bookedOffice} ruangan`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Schedule Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Panel Ketersediaan Ruangan (Sync Database)
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Data diambil langsung dari pesanan yang aktif di database. Auto-refresh setiap 30 detik.
                    </p>
                </div>
                <div className="p-4">
                    <RoomAvailabilitySchedule includeVirtual={true} />
                </div>
            </div>
        </AdminLayout>
    );
};

export default RoomMonitoring;
