import React from 'react';
import Navbar from '@/Components/Navbar';

const AiApp = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <section className="max-w-5xl mx-auto px-4 py-16">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">
                        AI App
                    </h1>
                    <p className="text-slate-600 mb-6">
                        Halaman ini disiapkan untuk akses fitur AI Kaspa Space.
                    </p>
                    <div className="border border-slate-200 rounded-xl p-5">
                        <h2 className="text-lg font-semibold text-slate-800 mb-2">
                            Coming Soon
                        </h2>
                        <p className="text-sm text-slate-600">
                            Kami sedang menyiapkan pengalaman AI yang lebih lengkap.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AiApp;
