import { useState } from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const inp = "w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm";

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
            <form onSubmit={submit} className="space-y-2">
                {/* Nama & Telepon */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <input placeholder="Nama lengkap" value={data.name} autoFocus
                            onChange={(e) => setData('name', e.target.value)} className={inp} />
                        <InputError message={errors.name} className="mt-1 text-xs" />
                    </div>
                    <div>
                        <input type="tel" placeholder="No. telepon" value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)} className={inp} />
                        <InputError message={errors.phone} className="mt-1 text-xs" />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <input type="email" placeholder="Email" value={data.email}
                        onChange={(e) => setData('email', e.target.value)} className={inp} />
                    <InputError message={errors.email} className="mt-1 text-xs" />
                </div>

                {/* Password */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <div className="relative">
                            <input type={showPw ? 'text' : 'password'} placeholder="Password" value={data.password}
                                onChange={(e) => setData('password', e.target.value)} className={inp + ' pr-10'} />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                                {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1 text-xs" />
                    </div>
                    <div>
                        <div className="relative">
                            <input type={showCpw ? 'text' : 'password'} placeholder="Konfirmasi password" value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)} className={inp + ' pr-10'} />
                            <button type="button" onClick={() => setShowCpw(!showCpw)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                                {showCpw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1 text-xs" />
                    </div>
                </div>

                {/* Persetujuan */}
                <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 space-y-1.5 shadow-sm">
                    <p className="text-xs text-gray-400 font-medium">Persetujuan</p>
                    {[
                        { key: 'terms', label: 'Syarat & Ketentuan', modal: 'terms' },
                        { key: 'privacy', label: 'Kebijakan Privasi', modal: 'privacy' },
                        { key: 'newsletter', label: 'Berlangganan newsletter & promo', modal: null },
                    ].map(({ key, label, modal }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data[key]}
                                onChange={(e) => setData(key, e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0" />
                            <span className="text-xs text-gray-600">
                                {modal ? <>Setuju <button type="button" className="text-blue-600 hover:underline"
                                    onClick={(e) => { e.stopPropagation(); setShowModal(modal); }}>{label}</button></> : label}
                                <span className="text-red-400 ml-0.5">*</span>
                            </span>
                        </label>
                    ))}
                    {errors.terms && <p className="text-xs text-red-500">{errors.terms}</p>}
                    {errors.privacy && <p className="text-xs text-red-500">{errors.privacy}</p>}
                </div>

                <button type="submit" disabled={processing || !allChecked}
                    className="w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-xl disabled:opacity-40 transition text-sm shadow-sm">
                    {processing ? 'Memproses...' : 'Buat Akun'}
                </button>
            </form>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                {showModal === 'terms' ? (termsAgreement?.title || 'Syarat & Ketentuan') : (privacyAgreement?.title || 'Kebijakan Privasi')}
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
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
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
