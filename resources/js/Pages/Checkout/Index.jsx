import { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { CreditCard, QrCode, Building2, Wallet, Tag, X, ArrowRight, ShieldCheck, FileUp } from 'lucide-react';
import axios from 'axios';
import kaspaLogo from '../../../images/logo.png';

const clr = {
    primary:   '#005bbf',
    primaryCt: '#1a73e8',
    surface:   '#f3f4f5',
    surfaceLow:'#f3f4f5',
    surfaceHi: '#e7e8e9',
    onSurface: '#191c1d',
    onSurfaceV:'#414754',
    secondary: '#2b5bb5',
    tertiary:  '#006876',
};

const inp = "w-full bg-[#f3f4f5] border border-transparent focus:border-[#005bbf] rounded-xl px-5 py-4 text-[#191c1d] focus:ring-4 focus:ring-[#005bbf]/10 outline-none transition-all duration-200 placeholder-[#9aa0b4]";

export default function CheckoutIndex({
    cart = [],
    subtotal = 0,
    ppnEnabled = true,
    ppnRate = 11,
    user = null,
    paymentSettings = null,
    termsAgreement = null,
    privacyAgreement = null,
}) {
    const [formData, setFormData] = useState({
        customer_name:  user?.name  || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || '',
        notes: '',
        payment_method: 'midtrans',
        discount_code: '',
    });

    const hasAgreed    = user?.agreed_terms && user?.agreed_privacy && user?.agreed_newsletter;
    const needsAgreement = !user || !hasAgreed;

    const [agreements, setAgreements] = useState({
        terms:      hasAgreed || false,
        privacy:    hasAgreed || false,
        newsletter: hasAgreed || false,
    });

    const hasVO            = cart.some(i => i.product_type === 'virtual_office');
    const hasPrivateOffice = cart.some(i => i.product_type === 'private_office');
    const needsDocs        = hasVO || hasPrivateOffice;

    const [docFiles, setDocFiles] = useState({ doc_ktp: null, doc_npwp: null, doc_business_license: null });
    const [docText,  setDocText]  = useState({ doc_company_name: '', doc_pic_name: '', doc_pic_phone: '' });

    const refKtp             = useRef(null);
    const refNpwp            = useRef(null);
    const refBusinessLicense = useRef(null);
    const fileInputRefs = { doc_ktp: refKtp, doc_npwp: refNpwp, doc_business_license: refBusinessLicense };

    const handleFileChange = (field) => (e) => {
        const file = e.target.files[0] || null;
        setDocFiles(prev => ({ ...prev, [field]: file }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleDocTextChange = (e) => {
        const { name, value } = e.target;
        setDocText(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const [errors,          setErrors]          = useState({});
    const [isSubmitting,    setIsSubmitting]     = useState(false);
    const [discountCode,    setDiscountCode]     = useState('');
    const [appliedDiscount, setAppliedDiscount]  = useState(null);
    const [discountLoading, setDiscountLoading]  = useState(false);
    const [discountError,   setDiscountError]    = useState('');
    const [showModal,       setShowModal]        = useState(null);

    const termsContent   = termsAgreement?.content   || [];
    const privacyContent = privacyAgreement?.content || [];

    const paymentMethods = [
        { id: 'midtrans',      name: 'Midtrans',       description: 'Bayar dengan kartu kredit, e-wallet, bank transfer', accent: clr.primary },
        ...(paymentSettings?.qris_image ? [{
            id: 'qris', name: 'QRIS', description: 'Scan QR Code untuk pembayaran', accent: clr.secondary,
        }] : []),
        ...(paymentSettings?.bank_name && paymentSettings?.account_number ? [{
            id: 'bank_transfer', name: 'Transfer Bank',
            description: `Transfer ke ${paymentSettings.bank_name}`, accent: clr.tertiary,
        }] : []),
        { id: 'cash', name: 'Tunai', description: 'Bayar tunai saat pengambilan', accent: '#414754' },
    ];

    const paymentIcons = {
        midtrans:     <CreditCard className="w-6 h-6" />,
        qris:         <QrCode    className="w-6 h-6" />,
        bank_transfer:<Building2 className="w-6 h-6" />,
        cash:         <Wallet    className="w-6 h-6" />,
    };

    const paymentInfo = {
        midtrans:     '💡 Setelah checkout, Anda akan diarahkan ke halaman pembayaran Midtrans dengan berbagai metode pembayaran.',
        qris:         '💡 Setelah checkout, Anda akan melihat QR Code QRIS untuk pembayaran melalui aplikasi e-wallet atau mobile banking.',
        bank_transfer:'💡 Setelah checkout, Anda akan melihat detail rekening bank untuk transfer pembayaran.',
        cash:         '💡 Siapkan uang tunai sesuai total pembayaran saat pengambilan pesanan.',
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) { setDiscountError('Masukkan kode diskon'); return; }
        setDiscountLoading(true); setDiscountError('');
        try {
            const res = await axios.post('/validate-discount', {
                code: discountCode, subtotal,
                cart_items: cart.map(i => ({ product_id: i.product_id, subtotal: i.subtotal })),
            });
            if (res.data.valid) {
                setAppliedDiscount(res.data.discount);
                setFormData(prev => ({ ...prev, discount_code: discountCode }));
                setDiscountError('');
            }
        } catch (err) {
            setDiscountError(err.response?.data?.message || 'Kode diskon tidak valid');
            setAppliedDiscount(null);
        } finally { setDiscountLoading(false); }
    };

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null); setDiscountCode(''); setDiscountError('');
        setFormData(prev => ({ ...prev, discount_code: '' }));
    };

    const handleAgreementChange = (key) => {
        setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
    };

    const finalDpp   = () => subtotal - (appliedDiscount ? appliedDiscount.amount : 0);
    const finalPpn   = () => ppnEnabled ? Math.round(finalDpp() * (ppnRate / 100)) : 0;
    const finalTotal = () => finalDpp() + finalPpn();

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.customer_name.trim())  newErrors.customer_name  = 'Nama harus diisi';
        if (!formData.customer_email.trim()) newErrors.customer_email = 'Email harus diisi';
        if (!formData.customer_phone.trim()) newErrors.customer_phone = 'Nomor telepon harus diisi';
        if (!formData.payment_method)        newErrors.payment_method = 'Pilih metode pembayaran';
        if (needsAgreement) {
            if (!agreements.terms)      newErrors.terms      = 'Anda harus menyetujui Syarat & Ketentuan';
            if (!agreements.privacy)    newErrors.privacy    = 'Anda harus menyetujui Kebijakan Privasi';
            if (!agreements.newsletter) newErrors.newsletter = 'Anda harus menyetujui berlangganan newsletter';
        }
        if (needsDocs) {
            if (hasVO && !docFiles.doc_ktp) newErrors.doc_ktp = 'KTP wajib diunggah';
            if (hasPrivateOffice && !docText.doc_company_name.trim()) newErrors.doc_company_name = 'Nama perusahaan wajib diisi';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            alert('Mohon lengkapi semua field yang wajib diisi!');
            return;
        }
        setIsSubmitting(true);
        const submitData = {
            ...formData,
            agreed_newsletter: needsAgreement ? agreements.newsletter : false,
            needs_agreement:   needsAgreement,
            ...(needsDocs && {
                doc_ktp:              docFiles.doc_ktp,
                doc_npwp:             docFiles.doc_npwp,
                doc_business_license: docFiles.doc_business_license,
                doc_company_name:     docText.doc_company_name,
                doc_pic_name:         docText.doc_pic_name,
                doc_pic_phone:        docText.doc_pic_phone,
            }),
        };
        router.post('/checkout', submitData, {
            forceFormData:  needsDocs,
            preserveScroll: true,
            onError: (errs) => { setErrors(errs); setIsSubmitting(false); alert('Terjadi kesalahan:\n' + Object.values(errs).join('\n')); },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: '#f3f4f5', color: clr.onSurface }}>
            <Head title="Checkout" />

            {/* Glass Nav */}
            <header className="fixed top-0 w-full z-50" style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="max-w-7xl mx-auto flex justify-between items-center px-6 lg:px-8 h-18 py-4">
                    <a href="/">
                        <img src={kaspaLogo} alt="Kaspa Space" className="h-10 object-contain" />
                    </a>
                    <div className="flex items-center gap-2 bg-[#f3f4f5] px-4 py-2 rounded-full border border-[#e7e8e9]">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: clr.onSurfaceV }}>Secure Checkout</span>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-24 px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Title */}
                <div className="mb-10 text-left">
                    <h1 className="font-extrabold tracking-tight mb-2" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '2.75rem', color: clr.onSurface }}>Checkout</h1>
                    <p style={{ color: clr.onSurfaceV, fontSize: '1.1rem' }}>Lengkapi informasi untuk menyelesaikan pesanan</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* ===== LEFT: Forms ===== */}
                    <div className="lg:col-span-7 space-y-8">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Section 1: Informasi Pemesan */}
                            <section className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-[#e7e8e9] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full rounded-l-3xl" style={{ background: clr.primary }} />
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: '#d8e2ff', color: clr.primary, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>1</div>
                                    <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Informasi Pemesan</h2>
                                </div>
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold" style={{ color: clr.onSurfaceV }}>Nama Lengkap</label>
                                            <input name="customer_name" value={formData.customer_name} onChange={handleChange}
                                                disabled={!!user} placeholder="Masukkan nama lengkap Anda"
                                                className={inp + (errors.customer_name ? ' !border-red-500' : '') + (user ? ' opacity-60 cursor-not-allowed' : '')} />
                                            {errors.customer_name && <p className="text-red-500 text-xs">{errors.customer_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold" style={{ color: clr.onSurfaceV }}>Email</label>
                                            <input type="email" name="customer_email" value={formData.customer_email} onChange={handleChange}
                                                disabled={!!user} placeholder="contoh@email.com"
                                                className={inp + (errors.customer_email ? ' !border-red-500' : '') + (user ? ' opacity-60 cursor-not-allowed' : '')} />
                                            {errors.customer_email && <p className="text-red-500 text-xs">{errors.customer_email}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold" style={{ color: clr.onSurfaceV }}>Nomor Telepon</label>
                                        <input type="tel" name="customer_phone" value={formData.customer_phone} onChange={handleChange}
                                            disabled={!!user} placeholder="081234567890"
                                            className={inp + (errors.customer_phone ? ' !border-red-500' : '') + (user ? ' opacity-60 cursor-not-allowed' : '')} />
                                        {errors.customer_phone && <p className="text-red-500 text-xs">{errors.customer_phone}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold" style={{ color: clr.onSurfaceV }}>Catatan (Opsional)</label>
                                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                                            placeholder="Tambahkan catatan khusus untuk pesanan Anda"
                                            className={inp + ' resize-none'} />
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Dokumen / Data Usaha (conditional) */}
                            {needsDocs && (
                                <section className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-[#e7e8e9] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full rounded-l-3xl" style={{ background: clr.tertiary }} />
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: '#cffafe', color: clr.tertiary, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>2</div>
                                        <div>
                                            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Data Usaha</h2>
                                            <p className="text-sm mt-0.5" style={{ color: clr.onSurfaceV }}>Diperlukan untuk Virtual Office / Private Office</p>
                                        </div>
                                    </div>

                                    {/* Virtual Office: file uploads */}
                                    {hasVO && (
                                        <div className="space-y-5 mb-6">
                                            <p className="text-sm font-semibold" style={{ color: clr.onSurfaceV }}>Dokumen Virtual Office (PDF, JPG, PNG — maks. 5 MB)</p>
                                            {[
                                                { key: 'doc_ktp',              label: 'KTP Direktur / Pemilik',     required: true },
                                                { key: 'doc_npwp',             label: 'NPWP Perusahaan / Pribadi',  required: false },
                                                { key: 'doc_business_license', label: 'SIUP / Izin Usaha',          required: false },
                                            ].map(({ key, label, required }) => (
                                                <div key={key} className="space-y-1.5">
                                                    <label className="text-sm font-semibold" style={{ color: clr.onSurfaceV }}>
                                                        {label}{required && <span className="text-red-500 ml-1">*</span>}
                                                    </label>
                                                    <div
                                                        className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all duration-200 ${docFiles[key] ? 'border-green-400 bg-green-50' : errors[key] ? 'border-red-400' : 'border-[#e7e8e9] hover:border-[#005bbf]'}`}
                                                        onClick={() => fileInputRefs[key].current?.click()}>
                                                        <input
                                                            ref={fileInputRefs[key]}
                                                            type="file"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            className="hidden"
                                                            onChange={handleFileChange(key)}
                                                        />
                                                        <div className="flex items-center gap-3">
                                                            <FileUp className="w-5 h-5 flex-shrink-0" style={{ color: docFiles[key] ? '#16a34a' : clr.tertiary }} />
                                                            {docFiles[key] ? (
                                                                <span className="text-sm font-medium text-green-700 truncate">✓ {docFiles[key].name}</span>
                                                            ) : (
                                                                <span className="text-sm" style={{ color: clr.onSurfaceV }}>Klik untuk pilih file</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {errors[key] && <p className="text-red-500 text-xs">{errors[key]}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Private Office: text fields */}
                                    {hasPrivateOffice && (
                                        <div className={`space-y-5 ${hasVO ? 'border-t border-[#e7e8e9] pt-6' : ''}`}>
                                            <p className="text-sm font-semibold" style={{ color: clr.onSurfaceV }}>Data Perusahaan (Private Office)</p>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold" style={{ color: clr.onSurfaceV }}>
                                                    Nama Perusahaan <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    name="doc_company_name"
                                                    value={docText.doc_company_name}
                                                    onChange={handleDocTextChange}
                                                    placeholder="PT / CV Nama Perusahaan"
                                                    className={inp + (errors.doc_company_name ? ' !border-red-500' : '')}
                                                />
                                                {errors.doc_company_name && <p className="text-red-500 text-xs">{errors.doc_company_name}</p>}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold" style={{ color: clr.onSurfaceV }}>Nama PIC</label>
                                                    <input
                                                        name="doc_pic_name"
                                                        value={docText.doc_pic_name}
                                                        onChange={handleDocTextChange}
                                                        placeholder="Person in Charge"
                                                        className={inp}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold" style={{ color: clr.onSurfaceV }}>No. Telepon PIC</label>
                                                    <input
                                                        type="tel"
                                                        name="doc_pic_phone"
                                                        value={docText.doc_pic_phone}
                                                        onChange={handleDocTextChange}
                                                        placeholder="0812xxxxxxxx"
                                                        className={inp}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Section 3: Metode Pembayaran */}
                            <section className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-[#e7e8e9] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full rounded-l-3xl" style={{ background: clr.secondary }} />
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: '#d9e2ff', color: clr.secondary, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{needsDocs ? '3' : '2'}</div>
                                    <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Metode Pembayaran</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {paymentMethods.map((m) => {
                                        const selected = formData.payment_method === m.id;
                                        return (
                                            <button key={m.id} type="button" onClick={() => { setFormData(p => ({ ...p, payment_method: m.id })); if(errors.payment_method) setErrors(p=>({...p,payment_method:null})); }}
                                                className="relative p-5 rounded-2xl border-2 text-left flex items-start gap-4 transition-all duration-300 group"
                                                style={{ borderColor: selected ? m.accent : '#e7e8e9', background: selected ? `${m.accent}08` : '#fff' }}>
                                                {/* Radio indicator */}
                                                <div className="absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                                                    style={{ borderColor: selected ? m.accent : '#c1c6d6', background: selected ? m.accent : 'transparent' }}>
                                                    {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <div className="p-3.5 rounded-xl transition-transform duration-300 group-hover:scale-110"
                                                    style={{ background: `${m.accent}22`, color: m.accent }}>
                                                    {paymentIcons[m.id]}
                                                </div>
                                                <div className="pr-6">
                                                    <p className="font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: clr.onSurface }}>{m.name}</p>
                                                    <p className="text-sm leading-snug" style={{ color: clr.onSurfaceV }}>{m.description}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.payment_method && <p className="text-red-500 text-sm mt-3">{errors.payment_method}</p>}
                                {formData.payment_method && (
                                    <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: '#f3f4f5', color: clr.onSurfaceV }}>
                                        {paymentInfo[formData.payment_method]}
                                    </div>
                                )}
                            </section>

                            {/* Section 4: Persetujuan */}
                            {needsAgreement && (
                                <section className="bg-white rounded-3xl p-8 border border-[#e7e8e9] shadow-sm">
                                    <div className="space-y-5">
                                        {[
                                            { key: 'terms',      label: 'Syarat & Ketentuan', modal: 'terms',   text: 'Saya menyetujui' },
                                            { key: 'privacy',    label: 'Kebijakan Privasi',  modal: 'privacy', text: 'Saya menyetujui' },
                                            { key: 'newsletter', label: null, modal: null,
                                              text: 'Berlangganan Newsletter untuk info promo eksklusif.' },
                                        ].map(({ key, label, modal, text }) => (
                                            <div key={key}>
                                                <label className="flex items-start gap-4 group cursor-pointer">
                                                    <div className="pt-0.5">
                                                        <input type="checkbox" checked={agreements[key]}
                                                            onChange={() => handleAgreementChange(key)}
                                                            className="w-5 h-5 rounded cursor-pointer"
                                                            style={{ accentColor: clr.primary }} />
                                                    </div>
                                                    <span className="text-[15px] leading-snug transition-colors" style={{ color: clr.onSurfaceV }}>
                                                        {label ? (
                                                            <>{text}{' '}
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowModal(modal); }}
                                                                    className="font-semibold hover:underline" style={{ color: clr.primary }}>{label}</button>
                                                                {' '}yang berlaku.</>
                                                        ) : text}
                                                    </span>
                                                </label>
                                                {errors[key] && <p className="text-red-500 text-xs mt-1 ml-9">{errors[key]}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Submit */}
                            <button type="submit"
                                disabled={isSubmitting || (needsAgreement && (!agreements.terms || !agreements.privacy || !agreements.newsletter))}
                                className="w-full text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", background: `linear-gradient(135deg, ${clr.primary} 0%, ${clr.primaryCt} 100%)`, boxShadow: '0 8px 24px -4px rgba(0,91,191,0.35)' }}>
                                {isSubmitting ? (
                                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Memproses...</>
                                ) : (
                                    <>Selesaikan Pesanan <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* ===== RIGHT: Order Summary ===== */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-3xl shadow-xl border border-[#e7e8e9] overflow-hidden flex flex-col">
                                <div className="p-8 lg:p-10 border-b border-[#e7e8e9] flex-grow">
                                    <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Ringkasan Pesanan</h2>

                                    {/* Cart Items */}
                                    <div className="space-y-6 mb-8 pb-8 border-b border-dashed border-[#e7e8e9]">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex gap-4">
                                                {/* Thumbnail */}
                                                <div className="w-24 h-24 rounded-2xl bg-[#f3f4f5] overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center">
                                                    {item.product_image ? (
                                                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#d8e2ff', color: clr.primary }}>
                                                            <CreditCard className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col justify-between py-1 flex-1">
                                                    <div>
                                                        <h3 className="font-bold text-lg mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: clr.onSurface }}>{item.product_name}</h3>
                                                        {item.variant_name && <p className="text-sm font-semibold" style={{ color: clr.primary }}>{item.variant_name}</p>}
                                                        <p className="font-bold text-xl tracking-tight mt-1" style={{ color: clr.primary }}>Rp{Number(item.subtotal).toLocaleString('id-ID')}</p>
                                                    </div>
                                                    <div className="space-y-1 mt-2">
                                                        {item.booking_date && (
                                                            <p className="flex items-center gap-1.5 text-sm" style={{ color: clr.onSurfaceV }}>
                                                                <span className="text-xs">📅</span>
                                                                {['private_office','virtual_office'].includes(item.product_type)
                                                                    ? `Mulai sewa: ${new Date(item.booking_date).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}`
                                                                    : `Booking: ${item.booking_date} pukul ${item.booking_start_time}`}
                                                            </p>
                                                        )}
                                                        <p className="flex items-center gap-1.5 text-sm" style={{ color: clr.onSurfaceV }}>
                                                            <span className="text-xs">🛒</span>
                                                            {item.quantity} x Rp{Number(item.price).toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calculations */}
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-center" style={{ color: clr.onSurfaceV }}>
                                            <span className="font-medium">Subtotal</span>
                                            <span className="font-bold text-lg" style={{ color: clr.onSurface }}>Rp{Number(subtotal).toLocaleString('id-ID')}</span>
                                        </div>
                                        {ppnEnabled && (
                                        <div className="flex justify-between items-center" style={{ color: clr.onSurfaceV }}>
                                            <span className="font-medium">PPN {ppnRate}%</span>
                                            <span className="font-bold" style={{ color: clr.onSurface }}>Rp{Number(finalPpn()).toLocaleString('id-ID')}</span>
                                        </div>
                                        )}

                                        {/* Diskon */}
                                        {appliedDiscount ? (
                                            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm font-bold text-green-700">{appliedDiscount.code}</span>
                                                    </div>
                                                    <button type="button" onClick={handleRemoveDiscount} className="text-red-400 hover:text-red-600 transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">{appliedDiscount.name}</span>
                                                    <span className="font-bold text-green-600">-{appliedDiscount.formatted_amount}</span>
                                                </div>
                                                {appliedDiscount.applicable_product_ids?.length > 0 && (() => {
                                                    const items = cart.filter(i => appliedDiscount.applicable_product_ids.includes(i.product_id));
                                                    return items.length > 0 ? (
                                                        <div className="mt-2 pt-2 border-t border-green-200">
                                                            <p className="text-xs text-green-700 font-medium mb-1">Berlaku untuk:</p>
                                                            {items.map((i, idx) => <p key={idx} className="text-xs text-green-600">• {i.product_name}{i.variant_name ? ` - ${i.variant_name}` : ''}</p>)}
                                                        </div>
                                                    ) : null;
                                                })()}
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl p-5" style={{ background: clr.surface }}>
                                                <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: clr.onSurface }}>
                                                    <Tag className="w-4 h-4" style={{ color: clr.primary }} />
                                                    Punya Kode Diskon?
                                                </p>
                                                <div className="flex gap-2">
                                                    <input type="text" value={discountCode}
                                                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                                                        placeholder="Masukkan kode" disabled={discountLoading}
                                                        className="flex-grow bg-white border border-[#e7e8e9] focus:border-[#005bbf] rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                                                    <button type="button" onClick={handleApplyDiscount} disabled={discountLoading}
                                                        className="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:text-white disabled:opacity-50"
                                                        style={{ background: '#e7e8e9', color: clr.onSurface }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = clr.secondary; e.currentTarget.style.color = '#fff'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = '#e7e8e9'; e.currentTarget.style.color = clr.onSurface; }}>
                                                        {discountLoading ? 'Cek...' : 'Pakai'}
                                                    </button>
                                                </div>
                                                {discountError && <p className="text-xs text-red-500 mt-2">{discountError}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Total & CTA */}
                                <div className="p-8 lg:p-10 border-t border-[#e7e8e9]" style={{ background: '#f8f9ff' }}>
                                    <div className="flex justify-between items-end mb-8">
                                        <span className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Total</span>
                                        <span className="font-extrabold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '2.2rem', color: clr.primary }}>
                                            Rp{Number(finalTotal()).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    {appliedDiscount && (
                                        <p className="text-xs text-green-600 text-right -mt-6 mb-6">
                                            Hemat Rp{Number(appliedDiscount.amount).toLocaleString('id-ID')}!
                                        </p>
                                    )}
                                    <div className="flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4 rounded-lg w-full bg-white border border-[#e7e8e9]" style={{ color: clr.onSurfaceV }}>
                                        <ShieldCheck className="w-4 h-4 text-green-600" />
                                        Transaksi aman dengan enkripsi 256-bit
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Syarat/Privasi */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                                {showModal === 'terms' ? (termsAgreement?.title || 'Syarat & Ketentuan') : (privacyAgreement?.title || 'Kebijakan Privasi')}
                            </h2>
                            <button type="button" onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {(showModal === 'terms' ? termsContent : privacyContent).map((section, i) => (
                                <div key={i}>
                                    <h3 className="font-bold mb-2 text-sm" style={{ color: clr.onSurface }}>{section.title}</h3>
                                    <ul className="space-y-1.5">
                                        {section.items.map((item, j) => (
                                            <li key={j} className="flex items-start gap-2 text-sm" style={{ color: clr.onSurfaceV }}>
                                                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: clr.primary }} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-200">
                            <button type="button" onClick={() => setShowModal(null)}
                                className="w-full text-white py-3 rounded-xl font-semibold transition"
                                style={{ background: clr.primary }}>
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
