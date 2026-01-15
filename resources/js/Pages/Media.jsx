import React from 'react';
import { Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

const Media = ({ latestBlogs = [], latestNews = [] }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateReadTime = (content) => {
        if (!content) return '2 min baca';
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} min baca`;
    };

    const renderNewsCard = (newsItem, routeName) => (
        <Link
            key={newsItem.id}
            href={route(routeName, newsItem.slug)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
            {newsItem.image ? (
                <div className="aspect-video overflow-hidden">
                    <img
                        src={`/storage/${newsItem.image}`}
                        alt={newsItem.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
            ) : (
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                </div>
            )}
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                    {newsItem.title}
                </h3>
                
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
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <section className="max-w-7xl mx-auto px-4 py-16">
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-bold text-slate-900 mb-3">
                        Kaspa Space Media
                    </h1>
                    <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                        Temukan informasi menarik dan berkualitas seputar bisnis, ekonomi,<br />
                        dan coworking space secara gratis.
                    </p>
                </div>

                {/* Kaspa Space Blogs Section */}
                <div className="mb-16">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Kaspa Space Blogs
                        </h2>
                        <p className="text-blue-100 text-lg">
                            Informasi seputar coworking space, tips & trik, produktivitas, opini,<br />
                            dan lainnya.
                        </p>
                    </div>
                    
                    {latestBlogs.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {latestBlogs.map((blog) => renderNewsCard(blog, 'blogs.show'))}
                            </div>
                            <div className="text-center mt-8">
                                <Link
                                    href={route('blogs.index')}
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Lihat Semua Blogs
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Belum Ada Blog
                            </h3>
                            <p className="text-gray-600">
                                Blog akan segera hadir. Silakan kembali lagi nanti.
                            </p>
                        </div>
                    )}
                </div>

                {/* Kaspa Space News Section */}
                <div className="mb-12">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Kaspa Space News
                        </h2>
                        <p className="text-blue-100 text-lg">
                            Informasi seputar ekonomi mikro dan makro yang terjadi di dalam<br />
                            negeri dan luar negeri.
                        </p>
                    </div>
                    
                    {latestNews.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {latestNews.map((news) => renderNewsCard(news, 'news.show'))}
                            </div>
                            <div className="text-center mt-8">
                                <Link
                                    href={route('news.index')}
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Lihat Semua News
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Belum Ada Berita
                            </h3>
                            <p className="text-gray-600">
                                Berita akan segera hadir. Silakan kembali lagi nanti.
                            </p>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Media;
