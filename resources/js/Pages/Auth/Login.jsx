import { useState } from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const inp = "w-full px-4 py-3 rounded-lg text-sm bg-[#f3f4f5] border border-transparent focus:border-[#1a73e8] focus:bg-white placeholder-[#9aa0b4] text-[#191c1d] outline-none transition-all duration-200";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            {status && (
                <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#414754' }}>Email</label>
                    <input
                        type="email"
                        placeholder="jane@company.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="username"
                        autoFocus
                        className={inp}
                    />
                    <InputError message={errors.email} className="mt-1.5 text-xs" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#414754' }}>Kata Sandi</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="current-password"
                            className={inp + ' pr-11'}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5 text-xs" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm" style={{ color: '#414754' }}>Ingat saya</span>
                    </label>
                    {canResetPassword && (
                        <Link href={route('password.request')} className="text-sm hover:underline" style={{ color: '#1a73e8' }}>
                            Lupa kata sandi?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex justify-center items-center py-3.5 px-6 rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50"
                        style={{
                            background: '#005bbf',
                            fontSize: '1rem',
                            boxShadow: '0 4px 14px rgba(0,91,191,0.28)',
                        }}
                    >
                        {processing ? 'Memproses...' : 'Masuk'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
