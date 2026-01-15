import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ShoppingBag, User, Mail, Phone, FileText, ArrowLeft, CheckCircle, CreditCard, Wallet, Tag, X } from 'lucide-react';
import axios from 'axios';

export default function CheckoutIndex({ 
    cart = [], 
    subtotal = 0, 
    tax = 0, 
    total = 0,
    user = null
}) {
    const [formData, setFormData] = useState({
        customer_name: user?.name || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || '',
        notes: '',
        payment_method: 'midtrans',
        discount_code: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountError, setDiscountError] = useState('');

    const paymentMethods = [
        {
            id: 'midtrans',
            name: 'Midtrans',
            icon: CreditCard,
            description: 'Bayar dengan kartu kredit, e-wallet, bank transfer',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'cash',
            name: 'Tunai',
            icon: Wallet,
            description: 'Bayar tunai saat pengambilan',
            color: 'from-green-500 to-emerald-500'
        }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handlePaymentMethodChange = (methodId) => {
        setFormData(prev => ({
            ...prev,
            payment_method: methodId
        }));
        if (errors.payment_method) {
            setErrors(prev => ({
                ...prev,
                payment_method: null
            }));
        }
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) {
            setDiscountError('Masukkan kode diskon');
            return;
        }

        setDiscountLoading(true);
        setDiscountError('');

        try {
            // Extract product IDs from cart
            const productIds = cart.map(item => item.product_id);
            
            const response = await axios.post('/validate-discount', {
                code: discountCode,
                subtotal: subtotal,
                product_ids: productIds
            });

            if (response.data.valid) {
                setAppliedDiscount(response.data.discount);
                setFormData(prev => ({
                    ...prev,
                    discount_code: discountCode
                }));
                setDiscountError('');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setDiscountError(error.response.data.message || 'Kode diskon tidak valid');
            } else {
                setDiscountError('Terjadi kesalahan saat memvalidasi diskon');
            }
            setAppliedDiscount(null);
        } finally {
            setDiscountLoading(false);
        }
    };

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
        setDiscountError('');
        setFormData(prev => ({
            ...prev,
            discount_code: ''
        }));
    };

    const calculateFinalTotal = () => {
        let finalTotal = total;
        if (appliedDiscount) {
            finalTotal = total - appliedDiscount.amount;
        }
        return finalTotal;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.log('Form submitted!', formData);
        
        // Validasi form
        const newErrors = {};
        if (!formData.customer_name.trim()) {
            newErrors.customer_name = 'Nama harus diisi';
        }
        if (!formData.customer_email.trim()) {
            newErrors.customer_email = 'Email harus diisi';
        }
        if (!formData.customer_phone.trim()) {
            newErrors.customer_phone = 'Nomor telepon harus diisi';
        }
        if (!formData.payment_method) {
            newErrors.payment_method = 'Pilih metode pembayaran';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            alert('Mohon lengkapi semua field yang wajib diisi!');
            console.log('Validation errors:', newErrors);
            return;
        }

        setIsSubmitting(true);
        console.log('Submitting to backend:', formData);

        router.post('/checkout', formData, {
            preserveScroll: true,
            onError: (errors) => {
                console.error('Checkout errors:', errors);
                setErrors(errors);
                setIsSubmitting(false);
                
                // Show error alert
                const errorMessages = Object.values(errors).join('\n');
                alert('Terjadi kesalahan:\n' + errorMessages);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.visit('/workspace/coworking-space?openCart=true')}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Keranjang
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        💳 Checkout
                    </h1>
                    <p className="text-gray-600 mt-1">Lengkapi informasi untuk menyelesaikan pesanan</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit}>
                            {/* Informasi Pemesan */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Informasi Pemesan
                            </h2>

                            <div className="space-y-5">
                                {/* Nama */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="customer_name"
                                            value={formData.customer_name}
                                            onChange={handleChange}
                                            disabled={!!user}
                                            className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                                                errors.customer_name ? 'border-red-500' : 'border-gray-200'
                                            } ${user ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </div>
                                    {errors.customer_name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            name="customer_email"
                                            value={formData.customer_email}
                                            onChange={handleChange}
                                            disabled={!!user}
                                            className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                                                errors.customer_email ? 'border-red-500' : 'border-gray-200'
                                            } ${user ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    {errors.customer_email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>
                                    )}
                                </div>

                                {/* Telepon */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nomor Telepon <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="customer_phone"
                                            value={formData.customer_phone}
                                            onChange={handleChange}
                                            disabled={!!user}
                                            className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                                                errors.customer_phone ? 'border-red-500' : 'border-gray-200'
                                            } ${user ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                            placeholder="08123456789"
                                        />
                                    </div>
                                    {errors.customer_phone && (
                                        <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>
                                    )}
                                </div>

                                {/* Catatan */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Catatan (Opsional)
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                                            placeholder="Tambahkan catatan khusus untuk pesanan Anda..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metode Pembayaran */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                Metode Pembayaran
                            </h2>

                            <div className="grid md:grid-cols-3 gap-4">
                                {paymentMethods.map((method) => {
                                    const Icon = method.icon;
                                    const isSelected = formData.payment_method === method.id;
                                    
                                    return (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => handlePaymentMethodChange(method.id)}
                                            className={`relative p-4 rounded-xl border-2 transition-all ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                            }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-2 right-2">
                                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                                </div>
                                            )}
                                            
                                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center mb-3`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            
                                            <h3 className="font-bold text-gray-900 text-left mb-1">
                                                {method.name}
                                            </h3>
                                            <p className="text-xs text-gray-600 text-left">
                                                {method.description}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            {errors.payment_method && (
                                <p className="text-red-500 text-sm mt-3">{errors.payment_method}</p>
                            )}

                            {/* Info tambahan berdasarkan metode pembayaran */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                {formData.payment_method === 'midtrans' && (
                                    <p className="text-sm text-gray-700">
                                        💡 Setelah checkout, Anda akan diarahkan ke halaman pembayaran Midtrans untuk menyelesaikan transaksi dengan berbagai metode pembayaran.
                                    </p>
                                )}
                                {formData.payment_method === 'cash' && (
                                    <p className="text-sm text-gray-700">
                                        💡 Siapkan uang tunai sesuai total pembayaran saat pengambilan pesanan.
                                    </p>
                                )}
                            </div>
                        </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Selesaikan Pesanan
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-blue-600" />
                                Ringkasan Pesanan
                            </h2>

                            {/* Cart Items */}
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-sm">
                                                {item.product_name}
                                            </h3>
                                            {item.variant_name && (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    {item.variant_name}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                {item.quantity} x Rp{Number(item.price).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">
                                                Rp{Number(item.subtotal).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">
                                        Rp{Number(subtotal).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                {tax > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Pajak</span>
                                        <span className="font-semibold">
                                            Rp{Number(tax).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}

                                {/* Discount Section */}
                                {appliedDiscount ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-green-600" />
                                                <span className="text-sm font-semibold text-green-700">
                                                    {appliedDiscount.code}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveDiscount}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">{appliedDiscount.name}</span>
                                            <span className="font-semibold text-green-600">
                                                -{appliedDiscount.formatted_amount}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tag className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-semibold text-gray-700">
                                                Punya Kode Diskon?
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                                onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                                                placeholder="Masukkan kode"
                                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                disabled={discountLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyDiscount}
                                                disabled={discountLoading}
                                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {discountLoading ? 'Cek...' : 'Pakai'}
                                            </button>
                                        </div>
                                        {discountError && (
                                            <p className="text-xs text-red-500 mt-2">{discountError}</p>
                                        )}
                                    </div>
                                )}

                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-xl font-bold text-gray-900">
                                        <span>Total</span>
                                        <span className="text-blue-600">
                                            Rp{Number(calculateFinalTotal()).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    {appliedDiscount && (
                                        <p className="text-xs text-gray-500 text-right mt-1">
                                            Hemat Rp{Number(appliedDiscount.amount).toLocaleString('id-ID')}!
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-xs text-gray-600 text-center">
                                    🔒 Pembayaran aman dan terenkripsi
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
