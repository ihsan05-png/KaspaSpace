import React from "react";
import { Head, Link } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import { CalendarIcon, ClockIcon, UserIcon } from "@heroicons/react/24/outline";

const NewsIndex = ({ news }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateReadTime = (content) => {
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} min baca`;
    };

    return (
        <>
            <Head title="Berita" />
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                
                {/* Header Section */}
                <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Berita & Artikel
                        </h1>
                        <p className="text-xl text-blue-100 max-w-2xl">
                            Dapatkan informasi terbaru seputar Kaspa Space, tips produktivitas, dan inspirasi bisnis
                        </p>
                    </div>
                </section>

                {/* News Grid */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {news.data && news.data.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {news.data.map((newsItem) => (
                                        <Link
                                            key={newsItem.id}
                                            href={route('news.show', newsItem.slug)}
                                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                        >
                                            {newsItem.image && (
                                                <div className="aspect-video overflow-hidden">
                                                    <img
                                                        src={`/storage/${newsItem.image}`}
                                                        alt={newsItem.title}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-6">
                                                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                                                    {newsItem.title}
                                                </h2>
                                                
                                                {newsItem.excerpt && (
                                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                                        {newsItem.excerpt}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                                                    <div className="flex items-center space-x-4">
                                                        {newsItem.author && (
                                                            <div className="flex items-center space-x-1">
                                                                <UserIcon className="h-4 w-4" />
                                                                <span>{newsItem.author}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <ClockIcon className="h-4 w-4" />
                                                        <span>{calculateReadTime(newsItem.content)}</span>
                                                    </div>
                                                </div>

                                                {newsItem.published_at && (
                                                    <div className="flex items-center space-x-1 text-sm text-gray-500 mt-2">
                                                        <CalendarIcon className="h-4 w-4" />
                                                        <span>{formatDate(newsItem.published_at)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {news.links && news.links.length > 3 && (
                                    <div className="mt-12 flex justify-center">
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            {news.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-blue-600 border-blue-600 text-white'
                                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    } ${
                                                        index === 0 ? 'rounded-l-md' : ''
                                                    } ${
                                                        index === news.links.length - 1 ? 'rounded-r-md' : ''
                                                    } ${
                                                        !link.url ? 'cursor-not-allowed opacity-50' : ''
                                                    }`}
                                                    disabled={!link.url}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Belum Ada Berita
                                </h3>
                                <p className="text-gray-600">
                                    Berita dan artikel akan segera hadir. Silakan kembali lagi nanti.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default NewsIndex;
