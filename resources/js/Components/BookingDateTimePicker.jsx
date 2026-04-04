import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function BookingDateTimePicker({
    productId,
    selectedVariant,
    onBookingChange,
    dateOnly = false,
    productOpen = null,
    productClose = null,
    rooms = [],          // daftar ruangan yang tersedia untuk produk ini
}) {
    const { operationalHours } = usePage().props;
    const OPEN  = productOpen  || operationalHours?.open  || '08:00';
    const CLOSE = productClose || operationalHours?.close || '17:00';

    const [openH, openM]   = OPEN.split(':').map(Number);
    const [closeH, closeM] = CLOSE.split(':').map(Number);
    const openMinutes  = openH  * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    const [selectedDate, setSelectedDate]             = useState('');
    const [selectedStartTime, setSelectedStartTime]   = useState('');
    const [availabilityStatus, setAvailabilityStatus] = useState(null);
    const [availabilityMessage, setAvailabilityMessage] = useState('');
    const [remainingSlots, setRemainingSlots]         = useState(null);

    // Room selection
    const hasRooms = rooms.length > 0;
    const [roomOptions, setRoomOptions]   = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null); // {index, name}
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [roomError, setRoomError]       = useState('');

    const rawDuration   = selectedVariant?.duration_hours;
    const durationHours = (rawDuration && rawDuration > 0) ? rawDuration : 1;
    const durationMonths = Math.max(1, Math.round(durationHours / 720));

    const calculateEndDate = (startDate) => {
        if (!startDate) return null;
        const start = new Date(startDate);
        const end   = new Date(start);
        end.setMonth(end.getMonth() + durationMonths);
        return end;
    };

    const maxStartMinutes = closeMinutes - durationHours * 60;
    const maxStartTime = `${String(Math.floor(maxStartMinutes / 60)).padStart(2, '0')}:${String(maxStartMinutes % 60).padStart(2, '0')}`;

    const calculateEndTime = (startTime) => {
        if (!startTime) return null;
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + durationHours * 60;
        const endH = Math.floor(totalMinutes / 60);
        const endM = totalMinutes % 60;
        return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    };

    const endTime = calculateEndTime(selectedStartTime);
    const today   = new Date().toISOString().split('T')[0];

    // Reset saat variant berubah
    useEffect(() => {
        setSelectedStartTime('');
        setSelectedRoom(null);
        setSelectedUnit(null);
        setRoomOptions([]);
        if (!dateOnly) {
            setAvailabilityStatus(null);
            setAvailabilityMessage('');
        }
        onBookingChange({ date: selectedDate || null, startTime: null, endTime: null, roomId: null, unitIndex: null, unitName: null });
    }, [selectedVariant?.id]);

    // Reset saat date berubah (hourly)
    useEffect(() => {
        if (!dateOnly) {
            setSelectedStartTime('');
            setSelectedRoom(null);
            setSelectedUnit(null);
            setRoomOptions([]);
            setAvailabilityStatus(null);
            setAvailabilityMessage('');
            onBookingChange({ date: null, startTime: null, endTime: null, roomId: null, unitIndex: null, unitName: null });
        }
    }, [selectedDate]);

    // Helper: ambil daftar ruangan dari API
    const fetchRooms = (date, startTime) => {
        setLoadingRooms(true);
        setRoomError('');
        setSelectedRoom(null);
        axios.get('/api/rooms/availability', {
            params: { product_id: productId, date, start_time: startTime, duration_hours: durationHours }
        }).then(res => {
            setRoomOptions(res.data.rooms || []);
            setLoadingRooms(false);
        }).catch(() => {
            setRoomError('Gagal memuat daftar ruangan.');
            setLoadingRooms(false);
        });
    };

    // ── Date-only mode ──────────────────────────────────────────────
    useEffect(() => {
        if (!dateOnly || !selectedDate || !productId) {
            if (dateOnly) setAvailabilityStatus(null);
            return;
        }
        setAvailabilityStatus('checking');
        setAvailabilityMessage('');

        axios.get('/api/booking/availability', {
            params: { product_id: productId, date: selectedDate, start_time: '00:00', duration_hours: durationHours, date_only: true }
        }).then(res => {
            if (res.data.available) {
                setAvailabilityStatus('available');
                setAvailabilityMessage(res.data.message || 'Tersedia');
                setRemainingSlots(res.data.remaining ?? null);
                if (hasRooms) {
                    fetchRooms(selectedDate, '00:00');
                } else {
                    onBookingChange({ date: selectedDate, startTime: '00:00', endTime: null, roomId: null });
                }
            } else {
                setAvailabilityStatus('unavailable');
                setAvailabilityMessage(res.data.message || 'Tidak tersedia');
                onBookingChange({ date: selectedDate, startTime: null, endTime: null, roomId: null });
            }
        }).catch(() => {
            setAvailabilityStatus('unavailable');
            setAvailabilityMessage('Gagal memeriksa ketersediaan');
            onBookingChange({ date: selectedDate, startTime: null, endTime: null, roomId: null });
        });
    }, [dateOnly, selectedDate, productId, durationHours, selectedVariant?.id]);

    // ── Hourly booking ──────────────────────────────────────────────
    useEffect(() => {
        if (dateOnly) return;
        if (!selectedDate || !selectedStartTime || !productId) {
            setAvailabilityStatus(null);
            return;
        }

        const [h, m]       = selectedStartTime.split(':').map(Number);
        const startMinutes = h * 60 + m;
        const endMins      = startMinutes + durationHours * 60;

        if (startMinutes < openMinutes) {
            setAvailabilityStatus('unavailable');
            setAvailabilityMessage(`Jam operasional dimulai dari ${OPEN}`);
            onBookingChange({ date: selectedDate, startTime: null, endTime: null, roomId: null });
            return;
        }
        if (selectedDate === today) {
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            if (startMinutes < nowMinutes) {
                setAvailabilityStatus('unavailable');
                setAvailabilityMessage('Jam yang dipilih sudah lewat. Silakan pilih jam yang akan datang.');
                onBookingChange({ date: selectedDate, startTime: null, endTime: null, roomId: null });
                return;
            }
        }
        if (endMins > closeMinutes) {
            setAvailabilityStatus('unavailable');
            setAvailabilityMessage(`Booking melebihi jam operasional (${CLOSE}). Maksimal jam mulai: ${maxStartTime}`);
            onBookingChange({ date: selectedDate, startTime: null, endTime: null, roomId: null });
            return;
        }

        setSelectedRoom(null);
        setSelectedUnit(null);
        setRoomOptions([]);

        if (hasRooms) {
            // Langsung fetch room, skip global check
            setAvailabilityStatus('available');
            fetchRooms(selectedDate, selectedStartTime);
            onBookingChange({ date: selectedDate, startTime: selectedStartTime, endTime: calculateEndTime(selectedStartTime), roomId: null });
        } else {
            setAvailabilityStatus('checking');
            setAvailabilityMessage('');
            axios.get('/api/booking/availability', {
                params: { product_id: productId, date: selectedDate, start_time: selectedStartTime, duration_hours: durationHours }
            }).then(res => {
                if (res.data.available) {
                    setAvailabilityStatus('available');
                    setAvailabilityMessage(res.data.message || 'Slot tersedia');
                    setRemainingSlots(res.data.remaining ?? null);
                    onBookingChange({ date: selectedDate, startTime: selectedStartTime, endTime: calculateEndTime(selectedStartTime), roomId: null });
                } else {
                    setAvailabilityStatus('unavailable');
                    setAvailabilityMessage(res.data.message || 'Slot tidak tersedia');
                    onBookingChange({ date: selectedDate, startTime: null, endTime: null, roomId: null });
                }
            }).catch(() => {
                setAvailabilityStatus('unavailable');
                setAvailabilityMessage('Gagal memeriksa ketersediaan');
                onBookingChange({ date: selectedDate, startTime: null, endTime: null, roomId: null });
            });
        }
    }, [dateOnly, selectedDate, selectedStartTime, durationHours, productId]);

    // Pilih room
    const handleSelectRoom = (room) => {
        if (!room.available) return;
        setSelectedRoom(room);
        setSelectedUnit(null); // reset unit saat room berubah
        const startTime = selectedStartTime || '00:00';
        // Jika room punya multi-unit, tunggu user pilih unit dulu
        const hasUnits = room.units && room.units.length > 1;
        onBookingChange({
            date: selectedDate,
            startTime,
            endTime: dateOnly ? null : calculateEndTime(startTime),
            roomId: room.id,
            roomName: room.name,
            unitIndex: null,
            unitName: null,
            // Kalau tidak ada unit picker, langsung valid
            _pendingUnit: hasUnits,
        });
    };

    // Pilih unit spesifik dalam room
    const handleSelectUnit = (unit) => {
        if (!unit.available) return;
        setSelectedUnit(unit);
        const startTime = selectedStartTime || '00:00';
        onBookingChange({
            date: selectedDate,
            startTime,
            endTime: dateOnly ? null : calculateEndTime(startTime),
            roomId: selectedRoom.id,
            roomName: selectedRoom.name,
            unitIndex: unit.index,
            unitName: unit.name,
            _pendingUnit: false,
        });
    };

    const getMinStartTime = () => {
        if (selectedDate !== today) return OPEN;
        const now = new Date();
        const h = now.getHours(), m = now.getMinutes();
        const roundedM = Math.ceil(m / 5) * 5;
        const finalH = roundedM >= 60 ? h + 1 : h;
        const finalM = roundedM >= 60 ? 0 : roundedM;
        const minTime = `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
        return minTime < OPEN ? OPEN : minTime;
    };

    return (
        <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                {dateOnly ? 'Pilih Tanggal Mulai Sewa' : 'Pilih Waktu Booking'}
            </h3>

            {/* Date Picker */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {dateOnly ? 'Tanggal Mulai' : 'Tanggal Booking'} <span className="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={today}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
            </div>

            {/* Time Picker (hourly only) */}
            {!dateOnly && selectedDate && (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Jam Mulai <span className="text-red-500">*</span>
                        <span className="text-xs font-normal text-gray-500 ml-1">(Operasional {OPEN} – {CLOSE})</span>
                    </label>
                    <input
                        type="time"
                        value={selectedStartTime}
                        onChange={(e) => setSelectedStartTime(e.target.value)}
                        min={getMinStartTime()}
                        max={maxStartTime}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Durasi paket: {durationHours} jam · Maksimal jam mulai: {maxStartTime}
                    </p>
                </div>
            )}

            {/* Status (hanya jika tidak pakai rooms) */}
            {!hasRooms && availabilityStatus === 'checking' && (
                <div className="flex items-center gap-2 py-3 px-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Memeriksa ketersediaan...
                </div>
            )}
            {!hasRooms && availabilityStatus === 'available' && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                        {dateOnly ? (
                            <>
                                Tersedia! Periode sewa:&nbsp;
                                <span className="text-green-700">
                                    {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="text-green-600 mx-2">→</span>
                                <span className="text-green-700">
                                    {calculateEndDate(selectedDate)?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="text-green-600 font-normal ml-2">({durationMonths} bulan)</span>
                            </>
                        ) : (
                            <>Tersedia! Waktu Booking: {selectedStartTime} – {endTime} <span className="text-green-600 font-normal">({durationHours} jam)</span></>
                        )}
                    </p>
                    {remainingSlots !== null && <p className="text-xs text-green-600 mt-1">Sisa slot: {remainingSlots}</p>}
                </div>
            )}
            {!hasRooms && availabilityStatus === 'unavailable' && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 font-medium">{availabilityMessage}</p>
                </div>
            )}

            {/* ── Room Picker ─────────────────────────── */}
            {hasRooms && (selectedDate && (dateOnly || selectedStartTime)) && (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pilih Ruangan <span className="text-red-500">*</span>
                    </label>

                    {loadingRooms && (
                        <div className="flex items-center gap-2 py-3 px-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            Memuat ruangan...
                        </div>
                    )}

                    {roomError && <p className="text-sm text-red-600">{roomError}</p>}

                    {!loadingRooms && roomOptions.length > 0 && (
                        <div className="space-y-2">
                            {roomOptions.map(room => (
                                <button
                                    key={room.id}
                                    type="button"
                                    disabled={!room.available}
                                    onClick={() => handleSelectRoom(room)}
                                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition flex items-center justify-between ${
                                        selectedRoom?.id === room.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : room.available
                                                ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                                                : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                    }`}
                                >
                                    <div>
                                        <p className={`font-medium text-sm ${room.available ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {room.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{room.message}</p>
                                    </div>
                                    {selectedRoom?.id === room.id && !room.units && (
                                        <span className="text-blue-600 text-xs font-semibold">Dipilih ✓</span>
                                    )}
                                    {!room.available && (
                                        <span className="text-xs text-red-400 font-medium">Penuh</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {!loadingRooms && roomOptions.length === 0 && !roomError && (
                        <p className="text-sm text-gray-500 py-2">Tidak ada ruangan tersedia untuk waktu ini.</p>
                    )}

                    {/* Unit picker — muncul jika room dipilih dan punya multi-unit */}
                    {selectedRoom && selectedRoom.units && selectedRoom.units.length > 1 && (
                        <div className="mt-3">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Pilih Unit <span className="text-red-500">*</span>
                                <span className="ml-1 text-xs font-normal text-gray-400">
                                    ({selectedRoom.units.filter(u => u.available).length} tersedia)
                                </span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {selectedRoom.units.map(unit => (
                                    <button
                                        key={unit.index}
                                        type="button"
                                        disabled={!unit.available}
                                        onClick={() => handleSelectUnit(unit)}
                                        className={`text-left px-3 py-2.5 rounded-lg border-2 transition ${
                                            selectedUnit?.index === unit.index
                                                ? 'border-blue-500 bg-blue-50'
                                                : unit.available
                                                    ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                                                    : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        <p className={`text-sm font-medium truncate ${unit.available ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {unit.name}
                                        </p>
                                        {unit.capacity > 1 && (
                                            <p className="text-xs text-gray-400">{unit.capacity} meja/kursi</p>
                                        )}
                                        <p className={`text-xs mt-0.5 ${unit.available ? 'text-green-600' : 'text-red-400'}`}>
                                            {unit.available ? 'Tersedia' : 'Terisi'}
                                        </p>
                                        {selectedUnit?.index === unit.index && (
                                            <p className="text-xs text-blue-600 font-semibold mt-0.5">Dipilih ✓</p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Konfirmasi pilihan */}
                    {selectedRoom && (!selectedRoom.units || selectedRoom.units.length <= 1) && (
                        <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800 font-medium">
                                {dateOnly
                                    ? `${selectedRoom.name} · Mulai ${new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                    : `${selectedRoom.name} · ${selectedStartTime} – ${endTime} (${durationHours} jam)`
                                }
                            </p>
                        </div>
                    )}
                    {selectedRoom && selectedUnit && (
                        <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800 font-medium">
                                {dateOnly
                                    ? `${selectedRoom.name} › ${selectedUnit.name} · Mulai ${new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                    : `${selectedRoom.name} › ${selectedUnit.name} · ${selectedStartTime} – ${endTime} (${durationHours} jam)`
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
