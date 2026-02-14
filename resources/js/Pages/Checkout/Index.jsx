import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ShoppingBag, User, Mail, Phone, FileText, ArrowLeft, CheckCircle, CreditCard, Wallet, Tag, X, QrCode, Building2, FileCheck } from 'lucide-react';
import axios from 'axios';

export default function CheckoutIndex({
    cart = [],
    subtotal = 0,
    tax = 0,
    total = 0,
    user = null,
    paymentSettings = null,
    termsAgreement = null,
    privacyAgreement = null,
}) {
    const [formData, setFormData] = useState({
        customer_name: user?.name || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || '',
        notes: '',
        payment_method: 'midtrans',
        discount_code: '',
    });
    // Check if user has already agreed (registered users who agreed, not admin-created users)
    const hasAgreed = user?.agreed_terms && user?.agreed_privacy && user?.agreed_newsletter;
    const needsAgreement = !user || !hasAgreed;

    const [agreements, setAgreements] = useState({
        terms: hasAgreed || false,
        privacy: hasAgreed || false,
        newsletter: hasAgreed || false,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountError, setDiscountError] = useState('');
    const [showModal, setShowModal] = useState(null); // 'terms' | 'privacy' | null

    const termsContent = termsAgreement?.content || [];
    const privacyContent = privacyAgreement?.content || [];

    const paymentMethods = [
        {
            id: 'midtrans',
            name: 'Midtrans',
            icon: CreditCard,
            description: 'Bayar dengan kartu kredit, e-wallet, bank transfer',
            color: 'from-blue-500 to-cyan-500'
        },
        ...(paymentSettings?.qris_image ? [{
            id: 'qris',
            name: 'QRIS',
            icon: QrCode,
            description: 'Scan QR Code untuk pembayaran',
            color: 'from-purple-500 to-pink-500'
        }] : []),
        ...(paymentSettings?.bank_name && paymentSettings?.account_number ? [{
            id: 'bank_transfer',
            name: 'Transfer Bank',
            icon: Building2,
            description: `Transfer ke ${paymentSettings.bank_name}`,
            color: 'from-orange-500 to-amber-500'
        }] : []),
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

    const handleAgreementChange = (key) => {
        setAgreements(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        if (errors[key]) {
            setErrors(prev => ({
                ...prev,
                [key]: null
            }));
        }
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
        // Validate agreements for users who haven't agreed yet (guests + admin-created users)
        if (needsAgreement) {
            if (!agreements.terms) {
                newErrors.terms = 'Anda harus menyetujui Syarat & Ketentuan';
            }
            if (!agreements.privacy) {
                newErrors.privacy = 'Anda harus menyetujui Kebijakan Privasi';
            }
            if (!agreements.newsletter) {
                newErrors.newsletter = 'Anda harus menyetujui berlangganan newsletter';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            alert('Mohon lengkapi semua field yang wajib diisi!');
            console.log('Validation errors:', newErrors);
            return;
        }

        setIsSubmitting(true);

        // Include agreement data for users who need to agree
        const submitData = {
            ...formData,
            agreed_newsletter: needsAgreement ? agreements.newsletter : false,
            needs_agreement: needsAgreement,
        };

        console.log('Submitting to backend:', submitData);

        router.post('/checkout', submitData, {
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
                                {formData.payment_method === 'qris' && (
                                    <p className="text-sm text-gray-700">
                                        💡 Setelah checkout, Anda akan melihat QR Code QRIS untuk melakukan pembayaran melalui aplikasi e-wallet atau mobile banking.
                                    </p>
                                )}
                                {formData.payment_method === 'bank_transfer' && (
                                    <p className="text-sm text-gray-700">
                                        💡 Setelah checkout, Anda akan melihat detail rekening bank untuk melakukan transfer pembayaran.
                                    </p>
                                )}
                                {formData.payment_method === 'cash' && (
                                    <p className="text-sm text-gray-700">
                                        💡 Siapkan uang tunai sesuai total pembayaran saat pengambilan pesanan.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Agreement Section - For guests and users who haven't agreed yet */}
                        {needsAgreement && (
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-blue-600" />
                                Persetujuan
                            </h2>

                            <div className="space-y-4">
                                {/* Terms & Conditions */}
                                <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    agreements.terms
                                        ? 'border-blue-500 bg-blue-50'
                                        : errors.terms
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                    <input
                                        type="checkbox"
                                        checked={agreements.terms}
                                        onChange={() => handleAgreementChange('terms')}
                                        className="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">
                                                Syarat & Ketentuan
                                            </span>
                                            <span className="text-red-500 text-sm">*</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Saya menyetujui{' '}
                                            <button
                                                type="button"
                                                className="text-blue-600 hover:underline font-medium"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setShowModal('terms');
                                                }}
                                            >
                                                Syarat & Ketentuan
                                            </button>
                                            {' '}yang berlaku.
                                        </p>
                                    </div>
                                </label>
                                {errors.terms && (
                                    <p className="text-red-500 text-sm -mt-2 ml-1">{errors.terms}</p>
                                )}

                                {/* Privacy Policy */}
                                <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    agreements.privacy
                                        ? 'border-blue-500 bg-blue-50'
                                        : errors.privacy
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                    <input
                                        type="checkbox"
                                        checked={agreements.privacy}
                                        onChange={() => handleAgreementChange('privacy')}
                                        className="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">
                                                Kebijakan Privasi
                                            </span>
                                            <span className="text-red-500 text-sm">*</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Saya menyetujui{' '}
                                            <button
                                                type="button"
                                                className="text-blue-600 hover:underline font-medium"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setShowModal('privacy');
                                                }}
                                            >
                                                Kebijakan Privasi
                                            </button>
                                            {' '}yang berlaku.
                                        </p>
                                    </div>
                                </label>
                                {errors.privacy && (
                                    <p className="text-red-500 text-sm -mt-2 ml-1">{errors.privacy}</p>
                                )}

                                {/* Newsletter Subscription */}
                                <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    agreements.newsletter
                                        ? 'border-blue-500 bg-blue-50'
                                        : errors.newsletter
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                    <input
                                        type="checkbox"
                                        checked={agreements.newsletter}
                                        onChange={() => handleAgreementChange('newsletter')}
                                        className="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">
                                                Berlangganan Newsletter
                                            </span>
                                            <span className="text-red-500 text-sm">*</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Saya bersedia menerima informasi promo, penawaran menarik, dan update terbaru melalui email.
                                        </p>
                                    </div>
                                </label>
                                {errors.newsletter && (
                                    <p className="text-red-500 text-sm -mt-2 ml-1">{errors.newsletter}</p>
                                )}
                            </div>
                        </div>
                        )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || (needsAgreement && (!agreements.terms || !agreements.privacy || !agreements.newsletter))}
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
                                            {item.booking_date && (
                                                <p className="text-xs text-green-600 mt-1">
                                                    {['private_office', 'virtual_office'].includes(item.product_type) ? (
                                                        <>Mulai sewa: {new Date(item.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                                                    ) : (
                                                        <>Booking: {item.booking_date} pukul {item.booking_start_time}</>
                                                    )}
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

            {/* Agreement Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(null)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {showModal === 'terms' ? (termsAgreement?.title || 'Syarat & Ketentuan') : (privacyAgreement?.title || 'Kebijakan Privasi')}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowModal(null)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {(showModal === 'terms' ? termsContent : privacyContent).map((section, idx) => (
                                <div key={idx}>
                                    <h3 className="font-bold text-gray-900 mb-2">{section.title}</h3>
                                    <ul className="space-y-2">
                                        {section.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setShowModal(null)}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
