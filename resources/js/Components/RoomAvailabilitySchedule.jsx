import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { RefreshCw, Wifi, WifiOff, ChevronLeft, ChevronRight } from 'lucide-react';

const RoomAvailabilitySchedule = () => {
    const [scheduleData, setScheduleData] = useState([]);
    const [currentDate, setCurrentDate] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isToday, setIsToday] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isConnected, setIsConnected] = useState(true);
    const intervalRef = useRef(null);

    // Fetch schedule data
    const fetchSchedule = async (date) => {
        try {
            const response = await axios.get('/api/room-schedule', {
                params: { date: date || selectedDate }
            });

            if (response.data.success) {
                setScheduleData(response.data.schedule);
                setCurrentDate(response.data.date);
                setIsToday(response.data.is_today);
            }

            setLastUpdated(new Date());
            setIsConnected(true);
        } catch (error) {
            console.error('Error fetching schedule:', error);
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch on mount and when date changes
    useEffect(() => {
        setIsLoading(true);
        fetchSchedule(selectedDate);
    }, [selectedDate]);

    // Auto-refresh effect (only for today)
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (isAutoRefresh && isToday) {
            intervalRef.current = setInterval(() => fetchSchedule(selectedDate), 30000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isAutoRefresh, isToday, selectedDate]);

    // Manual refresh
    const handleRefresh = async () => {
        setIsLoading(true);
        await fetchSchedule(selectedDate);
    };

    // Navigate date
    const navigateDate = (direction) => {
        const current = new Date(selectedDate);
        current.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
        setSelectedDate(current.toISOString().split('T')[0]);
    };

    // Go to today
    const goToToday = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
    };

    // Format date for display in date picker
    const formatDateLabel = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-gray-700 font-semibold">Front Desk Panel : OKUPANSI</h2>
                        {lastUpdated && (
                            <p className="text-gray-500 text-xs mt-0.5">
                                Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Connection Status */}
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                            {isConnected ? 'Terhubung' : 'Terputus'}
                        </div>

                        {/* Auto Refresh Toggle */}
                        <button
                            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition ${isAutoRefresh && isToday ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}
                            title={isToday ? 'Auto refresh setiap 30 detik' : 'Auto refresh hanya untuk hari ini'}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isAutoRefresh && isToday ? 'animate-spin' : ''}`} />
                            Auto
                        </button>

                        {/* Manual Refresh */}
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Date Navigation */}
            <div className="px-4 py-3 bg-blue-50 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigateDate('prev')}
                        className="p-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition"
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium"
                    />

                    <button
                        onClick={() => navigateDate('next')}
                        className="p-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition"
                    >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>

                    {!isToday && (
                        <button
                            onClick={goToToday}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition"
                        >
                            Hari Ini
                        </button>
                    )}
                </div>

                <div className="text-sm text-gray-600 font-medium">
                    {formatDateLabel(selectedDate)}
                    {isToday && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Live</span>}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : scheduleData.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>Tidak ada data untuk ditampilkan</p>
                    </div>
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-blue-500 text-white">
                                <th className="px-4 py-3 text-left font-semibold text-sm border-r border-blue-400">ROOM</th>
                                <th className="px-4 py-3 text-left font-semibold text-sm border-r border-blue-400">DATE</th>
                                <th className="px-4 py-3 text-left font-semibold text-sm border-r border-blue-400">TYPE</th>
                                <th className="px-4 py-3 text-left font-semibold text-sm border-r border-blue-400">SUB TYPE</th>
                                <th className="px-4 py-3 text-center font-semibold text-sm border-r border-blue-400">KAPASITAS</th>
                                <th className="px-4 py-3 text-center font-semibold text-sm border-r border-blue-400">
                                    <span className="flex items-center justify-center gap-1">
                                        <span className="text-lg">☺</span> OCCUPANCY
                                    </span>
                                </th>
                                <th className="px-4 py-3 text-center font-semibold text-sm border-r border-blue-400">INV</th>
                                <th className="px-4 py-3 text-center font-semibold text-sm border-r border-blue-400">CHECK-IN</th>
                                <th className="px-4 py-3 text-center font-semibold text-sm">CHECK-OUT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scheduleData.map((group, groupIndex) => {
                                // Calculate rowSpan for sub_type groups
                                const subTypeSpans = [];
                                let i = 0;
                                while (i < group.items.length) {
                                    let span = 1;
                                    while (i + span < group.items.length && !group.items[i + span].sub_type) {
                                        span++;
                                    }
                                    subTypeSpans.push({ index: i, span });
                                    i += span;
                                }
                                const spanMap = {};
                                subTypeSpans.forEach(({ index, span }) => { spanMap[index] = span; });

                                return group.items.map((item, itemIndex) => {
                                    const isSubTypeStart = item.sub_type !== '';
                                    const subSpan = spanMap[itemIndex] || 0;
                                    const isLastInSubGroup = isSubTypeStart ? (subSpan === 1) : (itemIndex + 1 >= group.items.length || group.items[itemIndex + 1]?.sub_type);

                                    return (
                                    <tr
                                        key={`${groupIndex}-${itemIndex}`}
                                        className={`${isLastInSubGroup ? 'border-b border-gray-200' : ''} ${groupIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                                    >
                                        {itemIndex === 0 ? (
                                            <td className="px-4 py-2.5 font-medium text-gray-800 border-r border-gray-200 align-top" rowSpan={group.items.length}>
                                                {group.room}
                                            </td>
                                        ) : null}

                                        {itemIndex === 0 ? (
                                            <td className="px-4 py-2.5 text-gray-700 border-r border-gray-200 align-top" rowSpan={group.items.length}>
                                                {group.date}
                                            </td>
                                        ) : null}

                                        {itemIndex === 0 ? (
                                            <td className="px-4 py-2.5 text-gray-700 border-r border-gray-200 align-top" rowSpan={group.items.length}>
                                                {group.type}
                                            </td>
                                        ) : null}

                                        {isSubTypeStart ? (
                                            <td className="px-4 py-2.5 text-gray-700 border-r border-gray-200 align-top" rowSpan={subSpan}>
                                                {item.sub_type}
                                            </td>
                                        ) : null}

                                        {isSubTypeStart ? (
                                            <td className="px-4 py-2.5 text-center text-gray-600 border-r border-gray-200 text-sm align-top" rowSpan={subSpan}>
                                                {item.capacity || '-'}
                                            </td>
                                        ) : null}

                                        {isSubTypeStart ? (
                                            <td className="px-4 py-2.5 text-center border-r border-gray-200 align-top" rowSpan={subSpan}>
                                                {item.occupancy ? (
                                                    <span className={`inline-block px-3 py-1 rounded text-xs font-bold text-white min-w-[80px] ${item.occupancy === 'AVAILABLE' ? 'bg-green-600' : 'bg-red-700'}`}>
                                                        {item.occupancy === 'AVAILABLE' ? 'AVAILABLE' : 'FULL'}
                                                    </span>
                                                ) : null}
                                            </td>
                                        ) : null}

                                        <td className="px-4 py-2.5 text-center text-gray-700 border-r border-gray-200">
                                            {item.inv || '-'}
                                        </td>

                                        <td className="px-4 py-2.5 text-center text-gray-700 border-r border-gray-200">
                                            {item.check_in || ''}
                                        </td>

                                        <td className="px-4 py-2.5 text-center text-gray-700">
                                            {item.check_out || ''}
                                        </td>
                                    </tr>
                                    );
                                });
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Data untuk tanggal: {currentDate}</span>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-green-600 rounded"></span>
                            <span>Tersedia</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-red-700 rounded"></span>
                            <span>Penuh</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomAvailabilitySchedule;
