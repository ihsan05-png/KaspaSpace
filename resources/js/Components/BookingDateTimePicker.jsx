import { useState, useEffect } from 'react';
import axios from 'axios';

export default function BookingDateTimePicker({
    productId,
    selectedVariant,
    onBookingChange,
    dateOnly = false, // For private_office: only date, no time picker
}) {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedStartTime, setSelectedStartTime] = useState('');
    const [availabilityStatus, setAvailabilityStatus] = useState(null); // null | 'checking' | 'available' | 'unavailable'
    const [availabilityMessage, setAvailabilityMessage] = useState('');
    const [remainingSlots, setRemainingSlots] = useState(null);

    // Ensure durationHours is at least 1 for validation
    const rawDuration = selectedVariant?.duration_hours;
    const durationHours = (rawDuration && rawDuration > 0) ? rawDuration : 1;

    // Calculate duration in months for private office (720 hours = 1 month)
    const durationMonths = Math.max(1, Math.round(durationHours / 720));

    // Calculate end date for private office (date-only booking)
    const calculateEndDate = (startDate) => {
        if (!startDate) return null;
        const start = new Date(startDate);
        const end = new Date(start);
        end.setMonth(end.getMonth() + durationMonths);
        return end;
    };

    // Calculate max start time so booking ends by 17:00
    const maxStartHour = 17 - durationHours;
    const maxStartTime = `${String(Math.floor(maxStartHour)).padStart(2, '0')}:${maxStartHour % 1 === 0 ? '00' : '30'}`;

    // Calculate end time from start time + duration
    const calculateEndTime = (startTime) => {
        if (!startTime) return null;
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + durationHours * 60;
        const endH = Math.floor(totalMinutes / 60);
        const endM = totalMinutes % 60;
        return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    };

    const endTime = calculateEndTime(selectedStartTime);

    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    // Reset when variant changes (only for hourly booking, dateOnly will re-check automatically)
    useEffect(() => {
        setSelectedStartTime('');
        // For dateOnly mode, don't reset status - let the dateOnly useEffect re-check
        if (!dateOnly) {
            setAvailabilityStatus(null);
            setAvailabilityMessage('');
        }
        onBookingChange({ date: selectedDate || null, startTime: null, endTime: null });
    }, [selectedVariant?.id]);

    // Reset time when date changes (for hourly booking)
    useEffect(() => {
        if (!dateOnly) {
            setSelectedStartTime('');
            setAvailabilityStatus(null);
            setAvailabilityMessage('');
            onBookingChange({ date: null, startTime: null, endTime: null });
        }
    }, [selectedDate]);

    // For dateOnly mode: check availability when date is selected
    useEffect(() => {
        if (!dateOnly || !selectedDate || !productId) {
            if (dateOnly) {
                setAvailabilityStatus(null);
            }
            return;
        }

        setAvailabilityStatus('checking');
        setAvailabilityMessage('');

        axios.get('/api/booking/availability', {
            params: {
                product_id: productId,
                date: selectedDate,
                start_time: '00:00', // Default for date-only booking
                duration_hours: durationHours,
                date_only: true,
            }
        })
        .then(res => {
            if (res.data.available) {
                setAvailabilityStatus('available');
                setAvailabilityMessage(res.data.message || 'Tersedia');
                setRemainingSlots(res.data.remaining ?? null);
                onBookingChange({
                    date: selectedDate,
                    startTime: '00:00', // Default for date-only
                    endTime: null,
                });
            } else {
                setAvailabilityStatus('unavailable');
                setAvailabilityMessage(res.data.message || 'Tidak tersedia');
                onBookingChange({ date: selectedDate, startTime: null, endTime: null });
            }
        })
        .catch(err => {
            console.error('Failed to check availability:', err);
            setAvailabilityStatus('unavailable');
            const errorMsg = err.response?.data?.message || 'Gagal memeriksa ketersediaan';
            setAvailabilityMessage(errorMsg);
            onBookingChange({ date: selectedDate, startTime: null, endTime: null });
        });
    }, [dateOnly, selectedDate, productId, durationHours, selectedVariant?.id]);

    // For hourly booking: check availability when date + time are both selected
    useEffect(() => {
        if (dateOnly) return; // Skip for date-only mode

        if (!selectedDate || !selectedStartTime || !productId) {
            setAvailabilityStatus(null);
            return;
        }

        // Validate time range
        const [h, m] = selectedStartTime.split(':').map(Number);
        const startMinutes = h * 60 + m;
        const endMinutes = startMinutes + durationHours * 60;

        if (startMinutes < 8 * 60) {
            setAvailabilityStatus('unavailable');
            setAvailabilityMessage('Jam operasional dimulai dari 08:00');
            onBookingChange({ date: selectedDate, startTime: null, endTime: null });
            return;
        }

        // Prevent booking past times for today
        if (selectedDate === today) {
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            if (startMinutes < nowMinutes) {
                setAvailabilityStatus('unavailable');
                setAvailabilityMessage('Jam yang dipilih sudah lewat. Silakan pilih jam yang akan datang.');
                onBookingChange({ date: selectedDate, startTime: null, endTime: null });
                return;
            }
        }

        if (endMinutes > 17 * 60) {
            setAvailabilityStatus('unavailable');
            setAvailabilityMessage(`Booking melebihi jam operasional. Maksimal jam mulai: ${maxStartTime}`);
            onBookingChange({ date: selectedDate, startTime: null, endTime: null });
            return;
        }

        setAvailabilityStatus('checking');
        setAvailabilityMessage('');

        axios.get('/api/booking/availability', {
            params: {
                product_id: productId,
                date: selectedDate,
                start_time: selectedStartTime,
                duration_hours: durationHours,
            }
        })
        .then(res => {
            if (res.data.available) {
                setAvailabilityStatus('available');
                setAvailabilityMessage(res.data.message || 'Slot tersedia');
                setRemainingSlots(res.data.remaining ?? null);
                onBookingChange({
                    date: selectedDate,
                    startTime: selectedStartTime,
                    endTime: calculateEndTime(selectedStartTime),
                });
            } else {
                setAvailabilityStatus('unavailable');
                setAvailabilityMessage(res.data.message || 'Slot tidak tersedia');
                onBookingChange({ date: selectedDate, startTime: null, endTime: null });
            }
        })
        .catch(err => {
            console.error('Failed to check availability:', err);
            setAvailabilityStatus('unavailable');
            const errorMsg = err.response?.data?.message || 'Gagal memeriksa ketersediaan';
            setAvailabilityMessage(errorMsg);
            onBookingChange({ date: selectedDate, startTime: null, endTime: null });
        });
    }, [dateOnly, selectedDate, selectedStartTime, durationHours, productId]);

    // Calculate minimum start time: if today, use current time (rounded up); otherwise 08:00
    const getMinStartTime = () => {
        if (selectedDate !== today) return '08:00';
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        // Round up to nearest 5 minutes
        const roundedM = Math.ceil(m / 5) * 5;
        const finalH = roundedM >= 60 ? h + 1 : h;
        const finalM = roundedM >= 60 ? 0 : roundedM;
        const minTime = `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
        // Don't go below 08:00
        return minTime < '08:00' ? '08:00' : minTime;
    };
    const minStartTime = getMinStartTime();

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

            {/* Time Input - Only for hourly booking */}
            {!dateOnly && selectedDate && (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Jam Mulai <span className="text-red-500">*</span>
                        <span className="text-xs font-normal text-gray-500 ml-1">
                            (Operasional 08:00 - 17:00)
                        </span>
                    </label>
                    <input
                        type="time"
                        value={selectedStartTime}
                        onChange={(e) => setSelectedStartTime(e.target.value)}
                        min={minStartTime}
                        max={maxStartTime}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Durasi paket: {durationHours} jam. Maksimal jam mulai: {maxStartTime}
                    </p>
                </div>
            )}

            {/* Availability Status */}
            {availabilityStatus === 'checking' && (
                <div className="flex items-center gap-2 py-3 px-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Memeriksa ketersediaan...
                </div>
            )}

            {availabilityStatus === 'available' && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                        {dateOnly ? (
                            <>
                                Tersedia! Periode sewa:
                                <br />
                                <span className="text-green-700">
                                    {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="text-green-600 mx-2">→</span>
                                <span className="text-green-700">
                                    {calculateEndDate(selectedDate)?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="text-green-600 font-normal ml-2">
                                    ({durationMonths} bulan)
                                </span>
                            </>
                        ) : (
                            <>
                                Tersedia! Waktu Booking: {selectedStartTime} - {endTime}
                                <span className="text-green-600 font-normal ml-1">
                                    ({durationHours} jam)
                                </span>
                            </>
                        )}
                    </p>
                    {remainingSlots !== null && (
                        <p className="text-xs text-green-600 mt-1">
                            Sisa slot: {remainingSlots}
                        </p>
                    )}
                </div>
            )}

            {availabilityStatus === 'unavailable' && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 font-medium">
                        {availabilityMessage}
                    </p>
                </div>
            )}
        </div>
    );
}
