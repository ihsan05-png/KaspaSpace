import React, { useState, useRef, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const NAVY = '#1a2e5a';
const fmtRp = (n) => `Rp${Number(n).toLocaleString('id-ID')}`;

export default function CartDrawer({ isOpen, onClose }) {
    const { props } = usePage();
    const [localCart, setLocalCart] = useState(props.cart || []);
    const debounceTimers = useRef({});

    useEffect(() => {
        setLocalCart(props.cart || []);
    }, [props.cart]);

    const subtotal = localCart.reduce((t, item) => t + parseFloat(item.price) * parseInt(item.quantity), 0);

    const updateQuantity = (itemId, newQty) => {
        if (newQty < 1) { removeItem(itemId); return; }
        setLocalCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));
        if (debounceTimers.current[itemId]) clearTimeout(debounceTimers.current[itemId]);
        debounceTimers.current[itemId] = setTimeout(() => {
            axios.post('/cart/update-quantity', { id: itemId, quantity: newQty })
                .then(() => router.reload({ only: ['cart'] }))
                .catch(() => router.reload({ only: ['cart'] }));
        }, 800);
    };

    const removeItem = (itemId) => {
        const prev = [...localCart];
        setLocalCart(c => c.filter(i => i.id !== itemId));
        axios.post('/cart/remove', { id: itemId })
            .then(() => router.reload({ only: ['cart'] }))
            .catch(() => setLocalCart(prev));
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(15,23,42,0.45)',
                    backdropFilter: 'blur(2px)',
                    transition: 'opacity 0.3s',
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                }}
            />

            {/* Drawer */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '100%', maxWidth: 420,
                background: '#fff',
                zIndex: 9999,
                display: 'flex', flexDirection: 'column',
                boxShadow: '-8px 0 40px rgba(26,46,90,0.18)',
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
                fontFamily: 'Inter, sans-serif',
            }}>

                {/* ── Header ── */}
                <div style={{ padding: '22px 24px 0', background: '#fff', borderBottom: '1px solid #f0f2f8' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                Keranjang Belanja
                            </h2>
                            <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>Kaspa Space</p>
                        </div>
                        <button onClick={onClose} style={{
                            width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
                            background: '#f9fafb', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <X size={16} color="#6b7280" />
                        </button>
                    </div>

                    {/* Item count badge */}
                    {localCart.length > 0 && (
                        <div style={{ paddingBottom: 12 }}>
                            <span style={{ fontSize: 13, color: '#6b7280' }}>
                                {localCart.length} item dalam keranjang
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Content ── */}
                <div style={{ flex: 1, overflowY: 'auto', background: '#f8f9fc' }}>
                    {localCart.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, textAlign: 'center' }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eef2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <ShoppingCart size={36} color="#9ca3af" />
                            </div>
                            <p style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Keranjang Kosong</p>
                            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Belum ada produk di keranjang Anda</p>
                            <button onClick={() => { onClose(); router.visit('/workspace/coworking-space'); }} style={{
                                background: '#005bbf', color: '#fff', padding: '10px 24px',
                                borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                            }}>
                                Mulai Belanja
                            </button>
                        </div>
                    ) : (
                        <div style={{ padding: '16px 20px' }}>
                            {/* Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {localCart.map((item) => {
                                    const itemSubtotal = parseFloat(item.price) * parseInt(item.quantity);
                                    const imgSrc = item.product_image || null;

                                    return (
                                        <div key={item.id} style={{
                                            background: '#fff', borderRadius: 12,
                                            padding: '14px', display: 'flex', gap: 12,
                                            boxShadow: '0 1px 4px rgba(26,46,90,0.07)',
                                        }}>
                                            {/* Thumbnail */}
                                            <div style={{
                                                width: 64, height: 64, borderRadius: 10, overflow: 'hidden',
                                                flexShrink: 0, background: '#eef2f7',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {imgSrc ? (
                                                    <img src={imgSrc} alt={item.product_name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <ShoppingCart size={24} color="#9ca3af" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                                    <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.3 }}>
                                                        {item.product_name}
                                                    </p>
                                                    <button onClick={() => removeItem(item.id)} style={{
                                                        flexShrink: 0, background: 'none', border: 'none',
                                                        cursor: 'pointer', padding: 2, color: '#ef4444',
                                                    }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                {item.variant_name && (
                                                    <p style={{ fontSize: 12, color: '#005bbf', margin: '2px 0 0' }}>
                                                        {item.variant_name}
                                                    </p>
                                                )}

                                                {item.booking_date && (
                                                    <p style={{
                                                        fontSize: 11, color: '#059669', margin: '4px 0 0',
                                                        background: '#f0fdf4', borderRadius: 5,
                                                        padding: '2px 7px', display: 'inline-block',
                                                    }}>
                                                        {['private_office', 'virtual_office'].includes(item.product_type)
                                                            ? `Mulai: ${new Date(item.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                                            : `${item.booking_date} | ${item.booking_start_time}`}
                                                    </p>
                                                )}

                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                                                    {/* Qty control */}
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', gap: 8,
                                                        background: '#f3f4f6', borderRadius: 8, padding: '3px 8px',
                                                    }}>
                                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{
                                                            width: 22, height: 22, borderRadius: 5, border: 'none',
                                                            background: item.quantity <= 1 ? '#e5e7eb' : '#fff',
                                                            cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                                        }} disabled={item.quantity <= 1}>
                                                            <Minus size={11} color="#374151" />
                                                        </button>
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: NAVY, minWidth: 18, textAlign: 'center' }}>
                                                            {item.quantity}
                                                        </span>
                                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{
                                                            width: 22, height: 22, borderRadius: 5, border: 'none',
                                                            background: '#fff', cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                                        }}>
                                                            <Plus size={11} color="#374151" />
                                                        </button>
                                                    </div>

                                                    {/* Price */}
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{ fontSize: 14, fontWeight: 800, color: NAVY, margin: 0 }}>
                                                            {fmtRp(itemSubtotal)}
                                                        </p>
                                                        {item.quantity > 1 && (
                                                            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                                                                {fmtRp(item.price)} /item
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer Summary ── */}
                {localCart.length > 0 && (
                    <div style={{ background: '#fff', borderTop: '1px solid #f0f2f8', padding: '16px 20px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: '#6b7280' }}>Subtotal</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{fmtRp(subtotal)}</span>
                        </div>

                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 0', borderTop: '1px dashed #e5e7eb', marginBottom: 14,
                        }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>Total</span>
                            <span style={{ fontSize: 20, fontWeight: 800, color: '#005bbf' }}>{fmtRp(subtotal)}</span>
                        </div>

                        <button onClick={() => router.visit('/checkout')} style={{
                            width: '100%', padding: '13px 0', background: '#005bbf',
                            color: '#fff', border: 'none', borderRadius: 10,
                            fontSize: 15, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: '0 4px 14px rgba(0,91,191,0.28)',
                            transition: 'opacity 0.2s',
                        }}>
                            Lanjutkan ke Pembayaran <ArrowRight size={17} />
                        </button>

                        <button onClick={onClose} style={{
                            width: '100%', marginTop: 10, padding: '8px 0',
                            background: 'none', border: 'none', color: '#005bbf',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}>
                            Lanjut Belanja
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 8 }}>
                            <ShieldCheck size={12} color="#9ca3af" />
                            <span style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Pembayaran aman melalui Kaspa Space
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
