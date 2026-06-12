import { useState } from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const inp = {
    base: "w-full px-4 py-3 rounded-lg text-sm transition-all duration-200 outline-none",
    normal: "bg-[#f3f4f5] border border-transparent focus:border-[#1a73e8] focus:bg-white placeholder-[#9aa0b4] text-[#191c1d]",
};

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#414754' }}>{label}</label>
            {children}
            <InputError message={error} className="mt-1 text-xs" />
        </div>
    );
}

export default function Register({ termsAgreement, privacyAgreement }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', phone: '', password: '', password_confirmation: '',
        terms: false, privacy: false, newsletter: false,
    });
    const [showPw, setShowPw] = useState(false);
    const [showCpw, setShowCpw] = useState(false);
    const [showModal, setShowModal] = useState(null);

    const allChecked = data.terms && data.privacy && data.newsletter;

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Daftar" />

            <form onSubmit={submit} className="space-y-4">
                {/* Nama & Telepon */}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Nama Lengkap" error={errors.name}>
                        <input
                            placeholder="Jane Doe"
                            value={data.name}
                            autoFocus
                            onChange={(e) => setData('name', e.target.value)}
                            className={`${inp.base} ${inp.normal}`}
                        />
                    </Field>
                    <Field label="No. Telepon" error={errors.phone}>
                        <input
                            type="tel"
                            placeholder="08xxxxxxxxxx"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className={`${inp.base} ${inp.normal}`}
                        />
                    </Field>
                </div>

                {/* Email */}
                <Field label="Email" error={errors.email}>
                    <input
                        type="email"
                        placeholder="jane@company.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className={`${inp.base} ${inp.normal}`}
                    />
                </Field>

                {/* Password */}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Kata Sandi" error={errors.password}>
                        <div className="relative">
                            <input
                                type={showPw ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`${inp.base} ${inp.normal} pr-10`}
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                                {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </Field>
                    <Field label="Konfirmasi Kata Sandi" error={errors.password_confirmation}>
                        <div className="relative">
                            <input
                                type={showCpw ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className={`${inp.base} ${inp.normal} pr-10`}
                            />
                            <button type="button" onClick={() => setShowCpw(!showCpw)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                                {showCpw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </Field>
                </div>

                {/* Persetujuan */}
                <div className="space-y-2 pt-1">
                    {[
                        { key: 'terms', label: 'Syarat & Ketentuan', modal: 'terms', prefix: 'Saya setuju dengan ' },
                        { key: 'privacy', label: 'Kebijakan Privasi', modal: 'privacy', prefix: 'dan ' },
                        { key: 'newsletter', label: 'Berlangganan newsletter & promo', modal: null, prefix: '' },
                    ].map(({ key, label, modal, prefix }) => (
                        <label key={key} className="flex items-start gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data[key]}
                                onChange={(e) => setData(key, e.target.checked)}
                                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                            />
                            <span className="text-sm" style={{ color: '#414754' }}>
                                {prefix}
                                {modal ? (
                                    <button type="button"
                                        className="hover:underline"
                                        style={{ color: '#1a73e8' }}
                                        onClick={(e) => { e.stopPropagation(); setShowModal(modal); }}>
                                        {label}
                                    </button>
                                ) : label}
                                <span className="text-red-400 ml-0.5">*</span>
                            </span>
                        </label>
                    ))}
                    {errors.terms && <p className="text-xs text-red-500">{errors.terms}</p>}
                    {errors.privacy && <p className="text-xs text-red-500">{errors.privacy}</p>}
                </div>

                {/* Submit */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing || !allChecked}
                        className="w-full flex justify-center items-center py-3.5 px-6 rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-40"
                        style={{
                            background: '#005bbf',
                            fontSize: '1rem',
                            letterSpacing: '0.01em',
                            boxShadow: '0 4px 14px rgba(0,91,191,0.28)',
                        }}
                    >
                        {processing ? 'Memproses...' : 'Buat Akun'}
                    </button>
                </div>
            </form>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                {showModal === 'terms' ? (termsAgreement?.title || 'Terms of Service') : (privacyAgreement?.title || 'Privacy Policy')}
                            </h2>
                            <button type="button" onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {(showModal === 'terms' ? termsAgreement?.content : privacyAgreement?.content || []).map((section, i) => (
                                <div key={i}>
                                    <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{section.title}</h3>
                                    <ul className="space-y-1">
                                        {section.items.map((item, j) => (
                                            <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#1a73e8' }} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-200">
                            <button type="button" onClick={() => setShowModal(null)}
                                className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-semibold hover:bg-gray-700 transition text-sm">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </GuestLayout>
    );
}
