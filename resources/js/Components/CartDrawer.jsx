import React, { useState, useRef, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function CartDrawer({ isOpen, onClose }) {
    const { props } = usePage();
    const [localCart, setLocalCart] = useState(props.cart || []);
    const debounceTimers = useRef({});

    // Sync with server cart when props change
    useEffect(() => {
        setLocalCart(props.cart || []);
    }, [props.cart]);

    const calculateSubtotal = () => {
        return localCart.reduce((total, item) => {
            return total + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);
    };

    const updateQuantity = (itemId, newQuantity) => {
        // If quantity becomes 0, remove item instead
        if (newQuantity < 1) {
            removeItem(itemId);
            return;
        }
        
        // Update UI immediately (optimistic update)
        setLocalCart(prevCart => 
            prevCart.map(item => 
                item.id === itemId 
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );

        // Clear previous timer for this item
        if (debounceTimers.current[itemId]) {
            clearTimeout(debounceTimers.current[itemId]);
        }

        // Debounce: Wait 800ms before sending to server
        debounceTimers.current[itemId] = setTimeout(() => {
            axios.post('/cart/update-quantity', {
                id: itemId,
                quantity: newQuantity
            }).then(() => {
                // Reload cart props to update badge
                router.reload({ only: ['cart'] });
            }).catch(error => {
                console.error('Failed to update cart:', error);
                // Revert on error
                router.reload({ only: ['cart'] });
            });
        }, 800);
    };

    const removeItem = (itemId) => {
        // Update UI immediately (optimistic update)
        const previousCart = [...localCart];
        setLocalCart(prevCart => prevCart.filter(item => item.id !== itemId));

        // Send to server
        axios.post('/cart/remove', {
            id: itemId
        }).then(() => {
            // Reload cart props to update badge
            router.reload({ only: ['cart'] });
        }).catch(error => {
            console.error('Failed to remove item:', error);
            // Revert on error
            setLocalCart(previousCart);
        });
    };

    const handleCheckout = () => {
        router.visit('/checkout');
    };

    const subtotal = calculateSubtotal();

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/20 z-[9998] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-[9999] flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Keranjang belanja</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        type="button"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {localCart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <ShoppingCart className="w-16 h-16 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Keranjang Kosong
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Belum ada produk di keranjang Anda
                            </p>
                            <button
                                onClick={() => router.visit('/workspace/coworking-space')}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                                Mulai Belanja
                            </button>
                        </div>
                    ) : (
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                {localCart.length} item dalam keranjang
                            </p>

                            {/* Cart Items */}
                            <div className="space-y-4 mb-6">
                                {localCart.map((item, index) => (
                                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                        {/* Product Info */}
                                        <div className="mb-3">
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {item.product_name}
                                            </h3>
                                            <p className="text-sm text-blue-600 mb-1">
                                                Paket: {item.variant_name}
                                            </p>
                                            
                                            {/* Custom Options */}
                                            {item.custom_options && Object.keys(item.custom_options).length > 0 && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {Object.entries(item.custom_options).map(([key, value]) => (
                                                        <div key={key}>
                                                            {key}: {value}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Booking Info */}
                                            {item.booking_date && (
                                                <div className="text-xs text-green-700 mt-1 bg-green-50 px-2 py-1 rounded border border-green-200">
                                                    {['private_office', 'virtual_office'].includes(item.product_type) ? (
                                                        // Date-only booking: show only date
                                                        <>Mulai sewa: {new Date(item.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                                                    ) : (
                                                        // Hourly booking: show date + time
                                                        <>Booking: {item.booking_date} | {item.booking_start_time}</>
                                                    )}
                                                </div>
                                            )}

                                            <p className="text-lg font-bold text-blue-900 mt-2">
                                                Rp{parseFloat(item.price).toLocaleString('id-ID')}
                                            </p>
                                            <p className="text-xs text-gray-500">per item</p>
                                        </div>

                                        {/* Quantity Controls & Delete */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-10 text-center font-semibold text-gray-900">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Subtotal</p>
                                                    <p className="font-bold text-gray-900">
                                                        Rp{(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-500 hover:text-red-700 p-2"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary Box */}
                            <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h3>
                                
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-semibold text-gray-900">
                                            Rp{subtotal.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            Rp{subtotal.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-base hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                                >
                                    Lanjutkan ke Pembayaran
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full mt-3 text-blue-600 py-2 rounded-lg font-medium text-base hover:bg-blue-50 transition-colors"
                                >
                                    Lanjut Belanja
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
