import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { RefreshCw, Wifi, WifiOff, ChevronLeft, ChevronRight } from 'lucide-react';

const clr = {
    bg:          '#f5f8fd',
    surface:     '#ffffff',
    surfaceLow:  '#eef3fa',
    onSurface:   '#191c1e',
    onSurfaceVar:'#45464d',
    secondary:   '#1e6cbe',
    outlineVar:  '#bfdbfe',
    outline:     '#76777d',
    error:       '#ba1a1a',
};

const RoomAvailabilitySchedule = ({ includeVirtual = false }) => {
    const [scheduleData, setScheduleData] = useState([]);
    const [currentDate, setCurrentDate] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isToday, setIsToday] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isConnected, setIsConnected] = useState(true);
    const intervalRef = useRef(null);

    const fetchSchedule = async (date) => {
        try {
            const response = await axios.get('/api/room-schedule', {
                params: { date: date || selectedDate, include_virtual: includeVirtual ? 1 : 0 }
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

    useEffect(() => {
        setIsLoading(true);
        fetchSchedule(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        if (isAutoRefresh && isToday) {
            intervalRef.current = setInterval(() => fetchSchedule(selectedDate), 30000);
        }

        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isAutoRefresh, isToday, selectedDate]);

    const handleRefresh = async () => {
        setIsLoading(true);
        await fetchSchedule(selectedDate);
    };

    const navigateDate = (direction) => {
        const current = new Date(selectedDate);
        current.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
        setSelectedDate(current.toISOString().split('T')[0]);
    };

    const goToToday = () => setSelectedDate(new Date().toISOString().split('T')[0]);

    const formatDateLabel = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div style={{
            background: clr.surface,
            borderRadius: '1.5rem',
            border: `1px solid ${clr.outlineVar}`,
            boxShadow: '0 1px 6px rgba(25,28,30,0.07)',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{ background: clr.surfaceLow, borderBottom: `1px solid ${clr.outlineVar}` }}
                className="px-5 py-3.5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="font-semibold text-sm" style={{ color: clr.onSurface }}>
                            Front Desk Panel : OKUPANSI
                        </h2>
                        {lastUpdated && (
                            <p className="text-xs mt-0.5" style={{ color: clr.outline }}>
                                Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Connection Status */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                                background: isConnected ? '#e8f4fd' : '#fde8e8',
                                color: isConnected ? clr.secondary : clr.error,
                            }}>
                            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                            {isConnected ? 'Terhubung' : 'Terputus'}
                        </div>

                        {/* Auto Refresh Toggle */}
                        <button
                            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-opacity"
                            style={{
                                background: isAutoRefresh && isToday ? '#e8f4fd' : clr.surfaceLow,
                                color: isAutoRefresh && isToday ? clr.secondary : clr.outline,
                                border: `1px solid ${isAutoRefresh && isToday ? clr.secondary : clr.outlineVar}`,
                            }}
                            title={isToday ? 'Auto refresh setiap 30 detik' : 'Auto refresh hanya untuk hari ini'}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isAutoRefresh && isToday ? 'animate-spin' : ''}`} />
                            Auto
                        </button>

                        {/* Manual Refresh */}
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-white rounded-full text-xs font-bold transition-opacity disabled:opacity-50"
                            style={{ background: clr.secondary }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Date Navigation */}
            <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-3"
                style={{ background: clr.bg, borderBottom: `1px solid ${clr.outlineVar}` }}>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigateDate('prev')}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: clr.surface, border: `1px solid ${clr.outlineVar}` }}
                    >
                        <ChevronLeft className="w-4 h-4" style={{ color: clr.onSurfaceVar }} />
                    </button>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg"
                        style={{
                            border: `1px solid ${clr.outlineVar}`,
                            background: clr.surface,
                            color: clr.onSurface,
                        }}
                    />

                    <button
                        onClick={() => navigateDate('next')}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: clr.surface, border: `1px solid ${clr.outlineVar}` }}
                    >
                        <ChevronRight className="w-4 h-4" style={{ color: clr.onSurfaceVar }} />
                    </button>

                    {!isToday && (
                        <button
                            onClick={goToToday}
                            className="px-3.5 py-1.5 text-white rounded-full text-xs font-bold transition-opacity"
                            style={{ background: clr.secondary }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            Hari Ini
                        </button>
                    )}
                </div>

                <div className="text-sm font-medium flex items-center gap-2" style={{ color: clr.onSurfaceVar }}>
                    {formatDateLabel(selectedDate)}
                    {isToday && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: '#e8f4fd', color: clr.secondary }}>
                            Live
                        </span>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: clr.secondary }} />
                    </div>
                ) : scheduleData.length === 0 ? (
                    <div className="text-center py-16 text-sm" style={{ color: clr.outline }}>
                        Tidak ada data untuk ditampilkan
                    </div>
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr style={{ background: clr.secondary, color: '#fff' }}>
                                <th className="px-4 py-3 text-left font-semibold text-xs tracking-wider"
                                    style={{ borderRight: `1px solid rgba(255,255,255,0.15)` }}>ROOM</th>
                                <th className="px-4 py-3 text-left font-semibold text-xs tracking-wider"
                                    style={{ borderRight: `1px solid rgba(255,255,255,0.15)` }}>DATE</th>
                                <th className="px-4 py-3 text-left font-semibold text-xs tracking-wider"
                                    style={{ borderRight: `1px solid rgba(255,255,255,0.15)` }}>TYPE</th>
                                <th className="px-4 py-3 text-left font-semibold text-xs tracking-wider"
                                    style={{ borderRight: `1px solid rgba(255,255,255,0.15)` }}>SUB TYPE</th>
                                <th className="px-4 py-3 text-center font-semibold text-xs tracking-wider"
                                    style={{ borderRight: `1px solid rgba(255,255,255,0.15)` }}>KAPASITAS</th>
                                <th className="px-4 py-3 text-center font-semibold text-xs tracking-wider"
                                    style={{ borderRight: `1px solid rgba(255,255,255,0.15)` }}>
                                    <span className="flex items-center justify-center gap-1">
                                        <span className="text-base">☺</span> OCCUPANCY
                                    </span>
                                </th>
                                <th className="px-4 py-3 text-center font-semibold text-xs tracking-wider"
                                    style={{ borderRight: `1px solid rgba(255,255,255,0.15)` }}>INV</th>
                                <th className="px-4 py-3 text-center font-semibold text-xs tracking-wider"
                                    style={{ borderRight: `1px solid rgba(255,255,255,0.15)` }}>CHECK-IN</th>
                                <th className="px-4 py-3 text-center font-semibold text-xs tracking-wider">CHECK-OUT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scheduleData.map((group, groupIndex) => {
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
                                    const isLastInSubGroup = isSubTypeStart
                                        ? (subSpan === 1)
                                        : (itemIndex + 1 >= group.items.length || group.items[itemIndex + 1]?.sub_type);
                                    const rowBg = groupIndex % 2 === 0 ? clr.surface : clr.surfaceLow;

                                    return (
                                        <tr
                                            key={`${groupIndex}-${itemIndex}`}
                                            style={{ background: rowBg, borderBottom: isLastInSubGroup ? `1px solid ${clr.outlineVar}` : 'none' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#e8f4fd'}
                                            onMouseLeave={e => e.currentTarget.style.background = rowBg}
                                        >
                                            {itemIndex === 0 ? (
                                                <td className="px-4 py-2.5 text-sm font-semibold align-top"
                                                    style={{ color: clr.onSurface, borderRight: `1px solid ${clr.outlineVar}` }}
                                                    rowSpan={group.items.length}>
                                                    {group.room}
                                                </td>
                                            ) : null}

                                            {itemIndex === 0 ? (
                                                <td className="px-4 py-2.5 text-sm align-top"
                                                    style={{ color: clr.onSurfaceVar, borderRight: `1px solid ${clr.outlineVar}` }}
                                                    rowSpan={group.items.length}>
                                                    {group.date}
                                                </td>
                                            ) : null}

                                            {itemIndex === 0 ? (
                                                <td className="px-4 py-2.5 text-sm align-top"
                                                    style={{ color: clr.onSurfaceVar, borderRight: `1px solid ${clr.outlineVar}` }}
                                                    rowSpan={group.items.length}>
                                                    {group.type}
                                                </td>
                                            ) : null}

                                            {isSubTypeStart ? (
                                                <td className="px-4 py-2.5 text-sm align-top"
                                                    style={{ color: clr.onSurfaceVar, borderRight: `1px solid ${clr.outlineVar}` }}
                                                    rowSpan={subSpan}>
                                                    {item.sub_type}
                                                </td>
                                            ) : null}

                                            {isSubTypeStart ? (
                                                <td className="px-4 py-2.5 text-sm text-center align-top"
                                                    style={{ color: clr.onSurfaceVar, borderRight: `1px solid ${clr.outlineVar}` }}
                                                    rowSpan={subSpan}>
                                                    {item.capacity || '-'}
                                                </td>
                                            ) : null}

                                            {isSubTypeStart ? (
                                                <td className="px-4 py-2.5 text-center align-top"
                                                    style={{ borderRight: `1px solid ${clr.outlineVar}` }}
                                                    rowSpan={subSpan}>
                                                    {item.occupancy ? (
                                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white"
                                                            style={{
                                                                background: item.occupancy === 'AVAILABLE' ? clr.secondary : clr.error,
                                                                minWidth: '5rem',
                                                            }}>
                                                            {item.occupancy === 'AVAILABLE' ? 'AVAILABLE' : 'FULL'}
                                                        </span>
                                                    ) : null}
                                                </td>
                                            ) : null}

                                            <td className="px-4 py-2.5 text-center text-sm"
                                                style={{ color: clr.onSurfaceVar, borderRight: `1px solid ${clr.outlineVar}` }}>
                                                {item.inv || '-'}
                                            </td>

                                            <td className="px-4 py-2.5 text-center text-sm"
                                                style={{ color: clr.onSurfaceVar, borderRight: `1px solid ${clr.outlineVar}` }}>
                                                {item.check_in || ''}
                                            </td>

                                            <td className="px-4 py-2.5 text-center text-sm" style={{ color: clr.onSurfaceVar }}>
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
            <div className="px-5 py-3" style={{ background: clr.surfaceLow, borderTop: `1px solid ${clr.outlineVar}` }}>
                <div className="flex items-center justify-between text-xs" style={{ color: clr.outline }}>
                    <span>Data untuk tanggal: {currentDate}</span>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full inline-block" style={{ background: clr.secondary }} />
                            <span>Tersedia</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full inline-block" style={{ background: clr.error }} />
                            <span>Penuh</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomAvailabilitySchedule;
