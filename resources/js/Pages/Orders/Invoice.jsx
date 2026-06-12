import { Head } from '@inertiajs/react';
import kaspaLogo from '@/../images/logo.png';

const BLUE = '#005bbf';
const NAVY = '#1a2e5a';
const fmtRp   = (n) => `Rp${Number(n).toLocaleString('id-ID')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
const methodLabel = (m) => ({ cash: 'Tunai', qris: 'QRIS', bank_transfer: 'Transfer Bank', midtrans: 'Midtrans' }[m] || m);

const getStatusConfig = (order) => {
    const cancelled = order.status === 'cancelled' || order.payment_status === 'cancelled';
    if (cancelled)                                     return { label: 'Dibatalkan', bg: '#fee2e2', color: '#b91c1c', stamp: 'DIBATALKAN', stampColor: '#b91c1c' };
    if (order.payment_status === 'refunded')           return { label: 'Refund',     bg: '#f3e8ff', color: '#7c3aed', stamp: 'REFUND',      stampColor: '#7c3aed' };
    if (['paid','verified'].includes(order.payment_status)) return { label: 'Terbayar', bg: '#dcfce7', color: '#166534', stamp: 'TERBAYAR', stampColor: BLUE };
    return { label: 'Menunggu', bg: '#fef9c3', color: '#854d0e', stamp: null, stampColor: null };
};

/* ── Decorative corner SVG (gradient wedge + diagonal hatching) ── */
function CornerTL() {
    return (
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" style={{ display: 'block' }}>
            <defs>
                <clipPath id="ctlClip">
                    <polygon points="0,0 140,0 0,140" />
                </clipPath>
                <linearGradient id="ctlGrad" x1="0" y1="0" x2="140" y2="140" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={NAVY} />
                    <stop offset="100%" stopColor={BLUE} />
                </linearGradient>
            </defs>
            <polygon points="0,0 140,0 0,140" fill="url(#ctlGrad)" />
            <g clipPath="url(#ctlClip)" opacity="0.15">
                {[-40, -20, 0, 20, 40, 60, 80, 100, 120, 140].map((offset, i) => (
                    <line key={i} x1={offset} y1={0} x2={offset + 140} y2={140} stroke="#fff" strokeWidth="10" />
                ))}
            </g>
        </svg>
    );
}

function CornerBR() {
    return (
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" style={{ display: 'block' }}>
            <defs>
                <clipPath id="cbrClip">
                    <polygon points="140,0 140,140 0,140" />
                </clipPath>
                <linearGradient id="cbrGrad" x1="140" y1="140" x2="0" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={NAVY} />
                    <stop offset="100%" stopColor={BLUE} />
                </linearGradient>
            </defs>
            <polygon points="140,0 140,140 0,140" fill="url(#cbrGrad)" />
            <g clipPath="url(#cbrClip)" opacity="0.15">
                {[-40, -20, 0, 20, 40, 60, 80, 100, 120, 140].map((offset, i) => (
                    <line key={i} x1={offset} y1={0} x2={offset + 140} y2={140} stroke="#fff" strokeWidth="10" />
                ))}
            </g>
        </svg>
    );
}

/* ── Rubber stamp SVG ── */
function StatusStamp({ text, color }) {
    return (
        <svg width="280" height="90" viewBox="0 0 280 90" fill="none"
            style={{
                position: 'absolute', top: '38%', left: '50%',
                transform: 'translateX(-50%) rotate(-22deg)',
                pointerEvents: 'none', zIndex: 5,
            }}>
            <rect x="4" y="4" width="272" height="82" rx="8"
                stroke={color} strokeWidth="5" fill="none" opacity="0.35" />
            <rect x="10" y="10" width="260" height="70" rx="5"
                stroke={color} strokeWidth="2" fill="none" opacity="0.2" />
            <text x="140" y="58"
                textAnchor="middle"
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                fontSize="36"
                fontWeight="900"
                fontFamily="'Plus Jakarta Sans', 'Arial Black', Arial, sans-serif"
                letterSpacing="5"
                opacity="0.35">
                {text}
            </text>
        </svg>
    );
}

export default function Invoice({ order, storeName = 'Kaspa Space', storeAddress = 'Jakarta Selatan' }) {
    const statusCfg = getStatusConfig(order);

    return (
        <div style={{
            minHeight: '100vh', background: '#f0f4ff',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '40px 16px',
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
        }}>
            <Head title={`Invoice ${order.order_number}`} />

            {/* Action buttons */}
            <div style={{ marginBottom: 24, display: 'flex', gap: 10 }} className="no-print">
                <button onClick={() => window.print()}
                    style={{
                        padding: '10px 24px',
                        background: 'linear-gradient(135deg, #1a2e5a 0%, #005bbf 100%)',
                        color: '#fff', border: 'none', borderRadius: 10,
                        fontWeight: 700, cursor: 'pointer', fontSize: 14,
                        boxShadow: '0 4px 14px rgba(0,91,191,0.3)',
                        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                    }}>
                    🖨 Cetak / Simpan PDF
                </button>
                <a href={`/orders/${order.id}/download-invoice`}
                    style={{
                        padding: '10px 24px', background: '#fff', color: BLUE,
                        border: `2px solid ${BLUE}`, borderRadius: 10,
                        fontWeight: 700, textDecoration: 'none', fontSize: 14,
                        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                    }}>
                    ⬇ Download PDF
                </a>
            </div>

            {/* ── Invoice card ── */}
            <div id="invoice-card" style={{
                width: '100%', maxWidth: 720, background: '#fff',
                borderRadius: 16, overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,91,191,0.12)',
                position: 'relative',
            }}>
                {/* Decorative corners */}
                <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                    <CornerTL />
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, pointerEvents: 'none' }}>
                    <CornerBR />
                </div>

                {/* ── Header ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', padding: '32px 44px 28px 160px', gap: 0 }}>
                    <div style={{ flex: 1 }}>
                        <img src={kaspaLogo} alt="Kaspa Space"
                            style={{ height: 44, objectFit: 'contain', display: 'block', marginBottom: 8 }} />
                        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Premium Coworking Hub</p>
                        <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>{storeAddress}</p>
                    </div>

                    {/* Vertical divider */}
                    <div style={{ width: 1, alignSelf: 'stretch', background: '#f0f2f8', margin: '0 32px' }} />

                    <div style={{ textAlign: 'right', minWidth: 200 }}>
                        <p style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                            color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 8px',
                        }}>
                            Invoice Number
                        </p>
                        <p style={{
                            fontSize: 16, fontWeight: 800, color: BLUE,
                            fontFamily: 'monospace', margin: '0 0 10px',
                            letterSpacing: '0.02em', wordBreak: 'break-all',
                        }}>
                            {order.order_number}
                        </p>
                        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                            Tanggal: {fmtDate(order.created_at)}
                        </p>
                    </div>
                </div>

                {/* ── Info box ── */}
                <div style={{ padding: '0 44px 28px' }}>
                    <div style={{
                        border: '1.5px solid #f0f2f8',
                        borderRadius: 14,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        overflow: 'hidden',
                        boxShadow: '0 1px 6px rgba(0,91,191,0.06)',
                    }}>
                        {/* Customer info */}
                        <div style={{ padding: '20px 24px' }}>
                            <p style={{
                                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                                textTransform: 'uppercase', color: BLUE, marginBottom: 14,
                            }}>
                                Informasi Pelanggan
                            </p>
                            <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: '0 0 8px' }}>
                                {order.customer_name}
                            </p>
                            {order.customer_email && (
                                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: 7 }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                    </svg>
                                    {order.customer_email}
                                </p>
                            )}
                            {order.customer_phone && (
                                <p style={{ fontSize: 13, color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 5 5l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                                    </svg>
                                    {order.customer_phone}
                                </p>
                            )}
                        </div>

                        {/* Order info */}
                        <div style={{ padding: '20px 24px', borderLeft: '1.5px solid #f0f2f8' }}>
                            <p style={{
                                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                                textTransform: 'uppercase', color: BLUE, marginBottom: 14,
                            }}>
                                Informasi Order
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <span style={{ fontSize: 13, color: '#6b7280' }}>Metode Pembayaran</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                                    {methodLabel(order.payment_method)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 13, color: '#6b7280' }}>Status</span>
                                <span style={{
                                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                    background: statusCfg.bg,
                                    color: statusCfg.color,
                                }}>
                                    {statusCfg.label}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Items table ── */}
                <div style={{ padding: '0 44px 32px', position: 'relative' }}>
                    {statusCfg.stamp && <StatusStamp text={statusCfg.stamp} color={statusCfg.stampColor} />}

                    <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative', zIndex: 2 }}>
                        <thead>
                            <tr style={{ background: '#f8faff' }}>
                                {['PRODUK', 'QTY', 'HARGA', 'SUBTOTAL'].map((h, i) => (
                                    <th key={h} style={{
                                        padding: '13px 16px', fontSize: 11, fontWeight: 700,
                                        letterSpacing: '0.07em', color: '#9ca3af',
                                        textAlign: i === 0 ? 'left' : 'right',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => {
                                const hasBooking = item.booking_start_at && item.booking_end_at;
                                return (
                                    <tr key={item.id} style={{
                                        borderTop: '1px solid #f0f2f8',
                                        background: idx % 2 === 0 ? '#fff' : '#fafbff',
                                    }}>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                                                {item.product_name}
                                            </span>
                                            {item.variant_name && (
                                                <span style={{ display: 'block', fontSize: 12, color: BLUE, marginTop: 2 }}>
                                                    {item.variant_name}
                                                </span>
                                            )}
                                            {hasBooking && (
                                                <span style={{ display: 'block', fontSize: 12, color: '#059669', marginTop: 2 }}>
                                                    {fmtDate(item.booking_start_at)}, {fmtTime(item.booking_start_at)} – {fmtTime(item.booking_end_at)}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 14, color: '#374151' }}>
                                            {item.quantity}
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 14, color: '#374151' }}>
                                            {fmtRp(item.price)}
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: BLUE }}>
                                            {fmtRp(item.subtotal)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Summary breakdown */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                        <div style={{ minWidth: 300 }}>
                            {/* Subtotal */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f2f8' }}>
                                <span style={{ fontSize: 13, color: '#6b7280' }}>Subtotal</span>
                                <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{fmtRp(order.subtotal)}</span>
                            </div>

                            {/* Diskon (jika ada) */}
                            {order.discount_amount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f2f8' }}>
                                    <span style={{ fontSize: 13, color: '#6b7280' }}>
                                        Diskon{order.discount_code ? ` (${order.discount_code})` : ''}
                                    </span>
                                    <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>-{fmtRp(order.discount_amount)}</span>
                                </div>
                            )}

                            {/* DPP */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f2f8' }}>
                                <span style={{ fontSize: 13, color: '#6b7280' }}>DPP</span>
                                <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{fmtRp(order.total - order.tax)}</span>
                            </div>

                            {/* PPN 11% */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #e5e7eb' }}>
                                <span style={{ fontSize: 13, color: '#6b7280' }}>PPN 11%</span>
                                <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{fmtRp(order.tax)}</span>
                            </div>

                            {/* Total */}
                            <div style={{
                                background: 'linear-gradient(135deg, #1a2e5a 0%, #005bbf 100%)',
                                borderRadius: 12, padding: '14px 20px', marginTop: 8,
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                boxShadow: '0 4px 20px rgba(0,91,191,0.3)',
                            }}>
                                <span style={{
                                    fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)',
                                    letterSpacing: '0.06em', textTransform: 'uppercase',
                                }}>
                                    Total (incl. PPN)
                                </span>
                                <span style={{
                                    fontSize: 20, fontWeight: 800, color: '#fff',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                }}>
                                    {fmtRp(order.total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div style={{
                    padding: '16px 44px 32px',
                    borderTop: '1px solid #f0f2f8',
                    background: '#f8faff',
                    textAlign: 'center',
                }}>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>
                        Terima kasih telah berbelanja di {storeName}. Invoice ini dibuat secara otomatis dan sah tanpa tanda tangan.
                    </p>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
                @media print {
                    .no-print { display: none !important; }
                    body { background: #fff !important; }
                    #invoice-card { box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; }
                }
            `}</style>
        </div>
    );
}
