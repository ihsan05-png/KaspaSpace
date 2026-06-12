import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

const LABELS = {
    privacy: { title: 'Kebijakan Privasi' },
    terms:   { title: 'Syarat dan Ketentuan' },
};

function renderSection(section, i) {
    return (
        <section key={i} className="mb-6">
            {section.title && (
                <h2 className="text-base font-bold text-gray-800 mb-2">{section.title}</h2>
            )}
            {/* Format dari seeder: items adalah array string */}
            {Array.isArray(section.items) && (
                <ul className="space-y-1">
                    {section.items.map((item, j) => (
                        <li key={j} className="text-gray-600 leading-relaxed flex gap-2">
                            <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )}
            {/* Format alternatif: content adalah string */}
            {section.content && typeof section.content === 'string' && (
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</p>
            )}
        </section>
    );
}

export default function AgreementPage({ agreement, type }) {
    const label = LABELS[type] ?? { title: 'Dokumen' };

    return (
        <>
            <Head title={label.title} />
            <Navbar />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="mb-6 text-sm text-gray-500 flex items-center gap-2">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
                        <span>/</span>
                        <span className="text-gray-700 font-medium">{label.title}</span>
                    </nav>

                    <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
                        {agreement ? (
                            <>
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
                                    {agreement.title ?? label.title}
                                </h1>
                                <div className="divide-y divide-gray-100">
                                    {Array.isArray(agreement.content)
                                        ? agreement.content.map(renderSection)
                                        : (
                                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                                {typeof agreement.content === 'string'
                                                    ? agreement.content
                                                    : JSON.stringify(agreement.content)}
                                            </p>
                                        )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">{label.title}</h1>
                                <p className="text-gray-500">Dokumen ini sedang dalam proses pembuatan.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
