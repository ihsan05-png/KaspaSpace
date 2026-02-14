import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const formatCurrency = (amount) => {
    if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1).replace('.0', '')}M`;
    if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1).replace('.0', '')}jt`;
    if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const formatFullCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num);

// ============================================================
// SVG CHART COMPONENTS (no external dependencies)
// ============================================================

// --- Line Chart ---
function LineChart({ data, dataKey, color = '#3b82f6', height = 280 }) {
    const width = 700;
    const padding = { top: 40, right: 30, bottom: 40, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const values = data.map(d => d[dataKey]);
    const maxVal = Math.max(...values, 1);
    const minVal = 0;
    const range = maxVal - minVal || 1;

    const points = data.map((d, i) => {
        const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
        const y = padding.top + chartH - ((d[dataKey] - minVal) / range) * chartH;
        return { x, y, ...d };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = pathD + ` L ${points[points.length - 1]?.x} ${padding.top + chartH} L ${points[0]?.x} ${padding.top + chartH} Z`;

    // Y-axis ticks
    const tickCount = 5;
    const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => {
        const val = minVal + (range / tickCount) * i;
        const y = padding.top + chartH - (i / tickCount) * chartH;
        return { val, y };
    });

    const [hovered, setHovered] = useState(null);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Grid lines */}
            {yTicks.map((tick, i) => (
                <g key={i}>
                    <line x1={padding.left} y1={tick.y} x2={width - padding.right} y2={tick.y} stroke="#e5e7eb" strokeWidth="1" />
                    <text x={padding.left - 8} y={tick.y + 4} textAnchor="end" fontSize="11" fill="#6b7280">
                        {formatCurrency(tick.val)}
                    </text>
                </g>
            ))}

            {/* Area fill */}
            <path d={areaD} fill={color} opacity="0.1" />

            {/* Line */}
            <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />

            {/* X-axis labels */}
            {(() => {
                const step = data.length > 15 ? Math.ceil(data.length / 6) : 1;
                const labels = [];
                for (let i = 0; i < points.length; i++) {
                    if (i % step === 0) labels.push(i);
                }
                return labels.map((i) => (
                    <text key={i} x={points[i].x} y={height - 8} textAnchor="middle" fontSize="11" fill="#6b7280">
                        {points[i].month}
                    </text>
                ));
            })()}

            {/* Data points & hover */}
            {points.map((p, i) => {
                const tooltipW = 140;
                const tooltipH = 42;
                let tx = p.x - tooltipW / 2;
                if (tx < 5) tx = 5;
                if (tx + tooltipW > width - 5) tx = width - 5 - tooltipW;
                let ty = p.y - tooltipH - 10;
                if (ty < 2) ty = p.y + 14;
                const label = p.monthFull || p.dateFull || p.month;

                return (
                    <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
                        <circle cx={p.x} cy={p.y} r={hovered === i ? 6 : 4} fill={color} stroke="white" strokeWidth="2" />
                        {hovered === i && (
                            <g>
                                <rect x={tx} y={ty} width={tooltipW} height={tooltipH} rx="4" fill="#1f2937" opacity="0.9" />
                                <text x={tx + tooltipW / 2} y={ty + 15} textAnchor="middle" fontSize="10" fill="#9ca3af">
                                    {label}
                                </text>
                                <text x={tx + tooltipW / 2} y={ty + 32} textAnchor="middle" fontSize="12" fill="white" fontWeight="600">
                                    {formatFullCurrency(p[dataKey])}
                                </text>
                            </g>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

// --- Bar Chart (stacked) ---
function BarChart({ data, keys, colors, height = 250 }) {
    const width = 700;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map(d => keys.reduce((sum, k) => sum + (d[k] || 0), 0)), 1);
    const barWidth = Math.min(chartW / data.length * 0.6, 40);
    const gap = chartW / data.length;

    // Y-axis
    const tickCount = 5;
    const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => {
        const val = Math.round((maxVal / tickCount) * i);
        const y = padding.top + chartH - (i / tickCount) * chartH;
        return { val, y };
    });

    const [hovered, setHovered] = useState(null);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {yTicks.map((tick, i) => (
                <g key={i}>
                    <line x1={padding.left} y1={tick.y} x2={width - padding.right} y2={tick.y} stroke="#e5e7eb" strokeWidth="1" />
                    <text x={padding.left - 6} y={tick.y + 4} textAnchor="end" fontSize="11" fill="#6b7280">{tick.val}</text>
                </g>
            ))}

            {data.map((d, i) => {
                const x = padding.left + gap * i + (gap - barWidth) / 2;
                let yOffset = 0;
                return (
                    <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
                        {keys.map((key, ki) => {
                            const val = d[key] || 0;
                            const barH = (val / maxVal) * chartH;
                            const y = padding.top + chartH - yOffset - barH;
                            yOffset += barH;
                            return (
                                <rect key={ki} x={x} y={y} width={barWidth} height={Math.max(barH, 0)} fill={colors[ki]} rx="2" opacity={hovered === i ? 1 : 0.85} />
                            );
                        })}
                        <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="11" fill="#6b7280">{d.month}</text>
                        {hovered === i && (
                            <g>
                                <rect x={x + barWidth / 2 - 70} y={padding.top - 10} width="140" height={20 + keys.length * 16} rx="4" fill="#1f2937" opacity="0.9" />
                                {keys.map((key, ki) => (
                                    <text key={ki} x={x + barWidth / 2} y={padding.top + 6 + ki * 16} textAnchor="middle" fontSize="11" fill={colors[ki]} fontWeight="500">
                                        {key}: {d[key] || 0}
                                    </text>
                                ))}
                            </g>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

// --- Donut Chart ---
function DonutChart({ data, colors, size = 180 }) {
    const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
    const center = size / 2;
    const radius = size / 2 - 10;
    const innerRadius = radius * 0.6;

    let startAngle = -Math.PI / 2;
    const segments = data.map((d, i) => {
        const angle = (d.count / total) * Math.PI * 2;
        const endAngle = startAngle + angle;
        const largeArc = angle > Math.PI ? 1 : 0;

        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);
        const ix1 = center + innerRadius * Math.cos(startAngle);
        const iy1 = center + innerRadius * Math.sin(startAngle);
        const ix2 = center + innerRadius * Math.cos(endAngle);
        const iy2 = center + innerRadius * Math.sin(endAngle);

        const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
        startAngle = endAngle;

        return { ...d, path, color: colors[i % colors.length], percentage: ((d.count / total) * 100).toFixed(1) };
    });

    return (
        <div className="flex items-center gap-6">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {segments.map((s, i) => (
                    <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="2" className="hover:opacity-80 transition-opacity cursor-pointer" />
                ))}
                <text x={center} y={center - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1f2937">{total}</text>
                <text x={center} y={center + 12} textAnchor="middle" fontSize="11" fill="#6b7280">Total</text>
            </svg>
            <div className="space-y-2">
                {segments.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }}></span>
                        <span className="text-gray-700 capitalize">{s.method}</span>
                        <span className="text-gray-500">({s.percentage}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// STAT CARD COMPONENT
// ============================================================
function StatCard({ icon, iconBg, title, value, prefix = '' }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
                {icon}
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{prefix}{value}</p>
                <p className="text-sm text-gray-500 mt-1">{title}</p>
            </div>
        </div>
    );
}

// ============================================================
// STATUS BADGE (konsisten dengan halaman Pesanan)
// ============================================================
function StatusBadge({ paymentStatus, orderStatus }) {
    if (orderStatus === 'cancelled') {
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Gagal</span>;
    }

    const config = {
        paid:     { label: 'Terbayar',      bg: 'bg-green-100 text-green-700' },
        verified: { label: 'Terverifikasi', bg: 'bg-green-100 text-green-700' },
        unpaid:   { label: 'Menunggu',      bg: 'bg-yellow-100 text-yellow-700' },
        pending:  { label: 'Menunggu',      bg: 'bg-yellow-100 text-yellow-700' },
        rejected: { label: 'Ditolak',       bg: 'bg-red-100 text-red-700' },
        refunded: { label: 'Refund',        bg: 'bg-gray-100 text-gray-700' },
    };
    const c = config[paymentStatus] || config.pending;

    return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${c.bg}`}>{c.label}</span>;
}

// ============================================================
// MAIN STATISTICS PAGE
// ============================================================
export default function Statistics({
    summary = {},
    monthlyRevenue = [],
    monthlyOrderStatus = [],
    recentTransactions = [],
    topProducts = [],
    paymentMethods = [],
    dailyRevenue = [],
}) {
    const [activeChart, setActiveChart] = useState('monthly');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

    const periodLabel = useMemo(() => {
        switch (selectedPeriod) {
            case 'today': return 'hari ini';
            case 'week': return '7 hari terakhir';
            case 'month': return 'bulan ini';
            case 'last_month': return 'bulan lalu';
            case 'pick_month':
                if (selectedMonth) {
                    const [y, m] = selectedMonth.split('-');
                    const d = new Date(y, m - 1);
                    return 'bulan ' + d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                }
                return 'pilih bulan';
            case 'date':
                if (selectedDate) {
                    return new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                }
                return 'pilih tanggal';
            default: return '7 hari terakhir';
        }
    }, [selectedPeriod, selectedMonth, selectedDate]);

    const filteredTransactions = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter by period
        let result = recentTransactions.filter(t => {
            const d = new Date(t.date);
            d.setHours(0, 0, 0, 0);

            switch (selectedPeriod) {
                case 'today':
                    return d.getTime() === today.getTime();
                case 'week': {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return d >= weekAgo;
                }
                case 'month':
                    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
                case 'last_month': {
                    const lm = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
                }
                case 'pick_month': {
                    if (!selectedMonth) return true;
                    const [y, m] = selectedMonth.split('-').map(Number);
                    return d.getMonth() === m - 1 && d.getFullYear() === y;
                }
                case 'date':
                    if (!selectedDate) return true;
                    const sd = new Date(selectedDate);
                    sd.setHours(0, 0, 0, 0);
                    return d.getTime() === sd.getTime();
                default:
                    return true;
            }
        });

        // Filter by status
        if (filterStatus !== 'all') {
            if (filterStatus === 'cancelled') {
                result = result.filter(t => t.status === 'cancelled');
            } else {
                result = result.filter(t => t.payment_status === filterStatus && t.status !== 'cancelled');
            }
        }

        return result;
    }, [recentTransactions, selectedPeriod, selectedMonth, selectedDate, filterStatus]);

    const exportToExcel = () => {
        const statusLabel = (ps, os) => {
            if (os === 'cancelled') return 'Gagal';
            const map = { paid: 'Terbayar', verified: 'Terverifikasi', unpaid: 'Menunggu', pending: 'Menunggu', rejected: 'Ditolak', refunded: 'Refund' };
            return map[ps] || 'Menunggu';
        };
        const statusColor = (ps, os) => {
            if (os === 'cancelled') return { bg: '#FEE2E2', color: '#991B1B' };
            const map = {
                paid: { bg: '#DCFCE7', color: '#166534' },
                verified: { bg: '#DCFCE7', color: '#166534' },
                unpaid: { bg: '#FEF9C3', color: '#854D0E' },
                pending: { bg: '#FEF9C3', color: '#854D0E' },
                rejected: { bg: '#FEE2E2', color: '#991B1B' },
                refunded: { bg: '#F3F4F6', color: '#374151' },
            };
            return map[ps] || map.pending;
        };

        const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.total, 0);

        const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>Transaksi</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
        </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        </head><body>
        <table>
            <tr><td colspan="6" style="font-size:18pt;font-weight:bold;color:#1E3A5F;padding:10px 0 4px 0;font-family:Calibri;">KASPA SPACE</td></tr>
            <tr><td colspan="6" style="font-size:12pt;color:#4B5563;padding:0 0 2px 0;font-family:Calibri;">Laporan Transaksi</td></tr>
            <tr><td colspan="6" style="font-size:10pt;color:#6B7280;padding:0 0 12px 0;font-family:Calibri;">Tanggal: ${today} | Filter: ${filterStatus === 'all' ? 'Semua Status' : statusLabel(filterStatus, filterStatus === 'cancelled' ? 'cancelled' : '')}</td></tr>
            <tr>
                <td style="background:#1E3A5F;color:white;font-weight:bold;padding:10px 14px;font-size:10pt;font-family:Calibri;border:1px solid #1E3A5F;">No</td>
                <td style="background:#1E3A5F;color:white;font-weight:bold;padding:10px 14px;font-size:10pt;font-family:Calibri;border:1px solid #1E3A5F;">ID Pesanan</td>
                <td style="background:#1E3A5F;color:white;font-weight:bold;padding:10px 14px;font-size:10pt;font-family:Calibri;border:1px solid #1E3A5F;">Tanggal</td>
                <td style="background:#1E3A5F;color:white;font-weight:bold;padding:10px 14px;font-size:10pt;font-family:Calibri;border:1px solid #1E3A5F;">Pelanggan</td>
                <td style="background:#1E3A5F;color:white;font-weight:bold;padding:10px 14px;font-size:10pt;font-family:Calibri;border:1px solid #1E3A5F;">Produk</td>
                <td style="background:#1E3A5F;color:white;font-weight:bold;padding:10px 14px;font-size:10pt;font-family:Calibri;border:1px solid #1E3A5F;text-align:right;">Jumlah</td>
                <td style="background:#1E3A5F;color:white;font-weight:bold;padding:10px 14px;font-size:10pt;font-family:Calibri;border:1px solid #1E3A5F;text-align:center;">Status</td>
            </tr>
            ${filteredTransactions.map((t, i) => {
                const bg = i % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
                const sc = statusColor(t.payment_status, t.status);
                const border = 'border:1px solid #E5E7EB;';
                const cell = `background:${bg};padding:8px 14px;font-size:10pt;font-family:Calibri;${border}`;
                return `<tr>
                    <td style="${cell}text-align:center;">${i + 1}</td>
                    <td style="${cell}font-weight:600;">#${t.order_number}</td>
                    <td style="${cell}">${t.date}</td>
                    <td style="${cell}">${t.customer_name}</td>
                    <td style="${cell}">${t.product}</td>
                    <td style="${cell}text-align:right;font-weight:600;">${formatFullCurrency(t.total)}</td>
                    <td style="background:${sc.bg};color:${sc.color};padding:8px 14px;font-size:10pt;font-family:Calibri;${border}text-align:center;font-weight:bold;">${statusLabel(t.payment_status, t.status)}</td>
                </tr>`;
            }).join('')}
            <tr>
                <td colspan="5" style="background:#F1F5F9;padding:10px 14px;font-size:10pt;font-family:Calibri;font-weight:bold;text-align:right;border:1px solid #E5E7EB;">TOTAL</td>
                <td style="background:#F1F5F9;padding:10px 14px;font-size:10pt;font-family:Calibri;font-weight:bold;text-align:right;border:1px solid #E5E7EB;">${formatFullCurrency(totalAmount)}</td>
                <td style="background:#F1F5F9;border:1px solid #E5E7EB;"></td>
            </tr>
            <tr><td colspan="6" style="padding:12px 0 0 0;font-size:9pt;color:#9CA3AF;font-family:Calibri;">Diekspor dari Kaspa Space Admin - ${today}</td></tr>
        </table>
        </body></html>`;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transaksi_kaspa_space_${new Date().toISOString().slice(0, 10)}.xls`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const donutColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const topProductMax = topProducts.length > 0 ? Math.max(...topProducts.map(p => p.total_revenue)) : 1;

    return (
        <AdminLayout>
            <Head title="Statistik" />

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Statistik</h1>
                <p className="text-gray-500 mt-1">Lihat statistik dan analisis bisnis Anda</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    icon={<svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    iconBg="bg-blue-50"
                    title="Total Pendapatan"
                    value={formatFullCurrency(summary.totalRevenue || 0)}
                    change={summary.revenueChange || 0}
                />
                <StatCard
                    icon={<svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                    iconBg="bg-green-50"
                    title="Total Pesanan"
                    value={formatNumber(summary.totalOrders || 0)}
                    change={summary.ordersChange || 0}
                />
                <StatCard
                    icon={<svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    iconBg="bg-purple-50"
                    title="Pelanggan Aktif"
                    value={formatNumber(summary.totalCustomers || 0)}
                    change={summary.customersChange || 0}
                />
                <StatCard
                    icon={<svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                    iconBg="bg-orange-50"
                    title="Produk Terjual"
                    value={formatNumber(summary.totalProductsSold || 0)}
                    change={summary.productsSoldChange || 0}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Grafik Pendapatan</h2>
                            <p className="text-sm text-gray-500">
                                {activeChart === 'monthly' ? 'Pendapatan 12 bulan terakhir' : 'Pendapatan 30 hari terakhir'}
                            </p>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-0.5">
                            <button
                                onClick={() => setActiveChart('monthly')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeChart === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Bulanan
                            </button>
                            <button
                                onClick={() => setActiveChart('daily')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeChart === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Harian
                            </button>
                        </div>
                    </div>
                    {activeChart === 'monthly' ? (
                        monthlyRevenue.length > 0 ? (
                            <LineChart data={monthlyRevenue} dataKey="revenue" color="#3b82f6" />
                        ) : (
                            <div className="flex items-center justify-center h-[250px] text-gray-400">Belum ada data pendapatan</div>
                        )
                    ) : (
                        dailyRevenue.length > 0 ? (
                            <LineChart data={dailyRevenue.map(d => ({ ...d, month: d.date }))} dataKey="revenue" color="#10b981" />
                        ) : (
                            <div className="flex items-center justify-center h-[250px] text-gray-400">Belum ada data pendapatan</div>
                        )
                    )}
                </div>

                {/* Order Status Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Status Pesanan</h2>
                    <p className="text-sm text-gray-500 mb-4">Perbandingan status pesanan per bulan</p>
                    {monthlyOrderStatus.length > 0 ? (
                        <>
                            <BarChart
                                data={monthlyOrderStatus}
                                keys={['completed', 'cancelled', 'pending']}
                                colors={['#10b981', '#ef4444', '#f59e0b']}
                                height={220}
                            />
                            <div className="flex items-center justify-center gap-4 mt-3">
                                <span className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Selesai
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Dibatalkan
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Pending
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-[220px] text-gray-400">Belum ada data pesanan</div>
                    )}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Recent Transactions */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h2>
                            <p className="text-sm text-gray-500">Daftar transaksi {periodLabel}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="today">Hari Ini</option>
                                <option value="week">7 Hari Terakhir</option>
                                <option value="month">Bulan Ini</option>
                                <option value="last_month">Bulan Lalu</option>
                                <option value="pick_month">Pilih Bulan</option>
                                <option value="date">Pilih Tanggal</option>
                            </select>
                            {selectedPeriod === 'pick_month' && (
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            )}
                            {selectedPeriod === 'date' && (
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            )}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Semua Status</option>
                                <option value="paid">Terbayar</option>
                                <option value="unpaid">Menunggu</option>
                                <option value="cancelled">Gagal</option>
                                <option value="refunded">Refund</option>
                            </select>
                            <button
                                onClick={exportToExcel}
                                disabled={filteredTransactions.length === 0}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Export
                            </button>
                        </div>
                    </div>

                    {filteredTransactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b">
                                        <th className="pb-3 font-medium">ID Pesanan</th>
                                        <th className="pb-3 font-medium">Tanggal</th>
                                        <th className="pb-3 font-medium">Pelanggan</th>
                                        <th className="pb-3 font-medium">Produk</th>
                                        <th className="pb-3 font-medium text-right">Jumlah</th>
                                        <th className="pb-3 font-medium text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredTransactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 font-medium text-gray-900">#{t.order_number}</td>
                                            <td className="py-3 text-gray-600">{t.date}</td>
                                            <td className="py-3 text-gray-700">{t.customer_name}</td>
                                            <td className="py-3 text-gray-600 max-w-[200px] truncate">{t.product}</td>
                                            <td className="py-3 text-right font-medium text-gray-900">{formatFullCurrency(t.total)}</td>
                                            <td className="py-3 text-center"><StatusBadge paymentStatus={t.payment_status} orderStatus={t.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            {filterStatus === 'all'
                                ? `Belum ada transaksi ${periodLabel}`
                                : 'Tidak ada transaksi dengan status tersebut'
                            }
                        </div>
                    )}
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    {/* Top Products */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Produk Terlaris</h2>
                        <p className="text-sm text-gray-500 mb-4">Berdasarkan pendapatan</p>
                        {topProducts.length > 0 ? (
                            <div className="space-y-4">
                                {topProducts.map((product, i) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-800 truncate max-w-[60%]">{product.name}</span>
                                            <span className="text-xs text-gray-500">{product.total_sold} terjual</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${(product.total_revenue / topProductMax) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatFullCurrency(product.total_revenue)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">Belum ada data produk terjual</div>
                        )}
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Metode Pembayaran</h2>
                        <p className="text-sm text-gray-500 mb-4">Distribusi metode pembayaran</p>
                        {paymentMethods.length > 0 ? (
                            <DonutChart data={paymentMethods} colors={donutColors} size={160} />
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">Belum ada data pembayaran</div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
