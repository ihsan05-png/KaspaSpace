import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Register({ termsAgreement, privacyAgreement }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        terms: false,
        privacy: false,
        newsletter: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showModal, setShowModal] = useState(null); // 'terms' | 'privacy' | null

    const termsContent = termsAgreement?.content || [];
    const privacyContent = privacyAgreement?.content || [];

    const allAgreementsChecked = data.terms && data.privacy && data.newsletter;

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                {/* Name & Email in row on larger screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="name" value="Nama" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="phone" value="No. Telepon" />
                        <TextInput
                            id="phone"
                            type="tel"
                            name="phone"
                            value={data.phone}
                            className="mt-1 block w-full"
                            autoComplete="tel"
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="08xxxxxxxxxx"
                            required
                        />
                        <InputError message={errors.phone} className="mt-1" />
                    </div>
                </div>

                <div className="mt-3">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* Password fields in row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    <div>
                        <InputLabel htmlFor="password" value="Password" />
                        <div className="relative mt-1">
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className="block w-full pr-10"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" />
                        <div className="relative mt-1">
                            <TextInput
                                id="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="block w-full pr-10"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>
                </div>

                {/* Compact Agreement Section */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-2">Persetujuan</p>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.terms}
                                onChange={(e) => setData('terms', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                Setuju{' '}
                                <button type="button" className="text-blue-600 hover:underline" onClick={(e) => { e.stopPropagation(); setShowModal('terms'); }}>
                                    Syarat & Ketentuan
                                </button>
                                <span className="text-red-500 ml-1">*</span>
                            </span>
                        </label>
                        {errors.terms && <p className="text-xs text-red-500 ml-6">{errors.terms}</p>}

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.privacy}
                                onChange={(e) => setData('privacy', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                Setuju{' '}
                                <button type="button" className="text-blue-600 hover:underline" onClick={(e) => { e.stopPropagation(); setShowModal('privacy'); }}>
                                    Kebijakan Privasi
                                </button>
                                <span className="text-red-500 ml-1">*</span>
                            </span>
                        </label>
                        {errors.privacy && <p className="text-xs text-red-500 ml-6">{errors.privacy}</p>}

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.newsletter}
                                onChange={(e) => setData('newsletter', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                Berlangganan newsletter & promo
                                <span className="text-red-500 ml-1">*</span>
                            </span>
                        </label>
                        {errors.newsletter && <p className="text-xs text-red-500 ml-6">{errors.newsletter}</p>}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Sudah punya akun?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing || !allAgreementsChecked}>
                        Register
                    </PrimaryButton>
                </div>
            </form>

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
                                <XMarkIcon className="w-6 h-6" />
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
        </GuestLayout>
    );
}
