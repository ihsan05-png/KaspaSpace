import React from "react";
import { Head, Link } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import { CalendarIcon, ClockIcon, UserIcon, ArrowLeftIcon, ShareIcon } from "@heroicons/react/24/outline";

const NewsShow = ({ news, relatedNews }) => {
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

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: news.title,
                text: news.excerpt || news.title,
                url: window.location.href,
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link berhasil disalin!');
        }
    };

    return (
        <>
            <Head title={news.title} />
            <div className="min-h-screen bg-white">
                <Navbar />
                
                {/* Back Button */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
                    <Link
                        href={route('news.index')}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Kembali ke Berita
                    </Link>
                </div>

                {/* Article Header */}
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <header className="mb-8">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {news.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
                            {news.author && (
                                <div className="flex items-center space-x-2">
                                    <UserIcon className="h-5 w-5" />
                                    <span className="font-medium">{news.author}</span>
                                </div>
                            )}
                            
                            {news.published_at && (
                                <div className="flex items-center space-x-2">
                                    <CalendarIcon className="h-5 w-5" />
                                    <span>{formatDate(news.published_at)}</span>
                                </div>
                            )}
                            
                            <div className="flex items-center space-x-2">
                                <ClockIcon className="h-5 w-5" />
                                <span>{calculateReadTime(news.content)}</span>
                            </div>

                            <button
                                onClick={handleShare}
                                className="ml-auto flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <ShareIcon className="h-5 w-5" />
                                <span>Bagikan</span>
                            </button>
                        </div>

                        {news.image && (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-6">
                                <img
                                    src={`/storage/${news.image}`}
                                    alt={news.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </header>

                    {/* Article Content */}
                    <div className="prose prose-lg max-w-none">
                        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {news.content}
                        </div>
                    </div>

                    {/* Tags or Categories (if available) */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Diterbitkan pada {formatDate(news.published_at)}
                            </div>
                            <button
                                onClick={handleShare}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <ShareIcon className="h-5 w-5 mr-2" />
                                Bagikan Artikel
                            </button>
                        </div>
                    </div>
                </article>

                {/* Related News */}
                {relatedNews && relatedNews.length > 0 && (
                    <section className="bg-gray-50 py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">
                                Berita Terkait
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {relatedNews.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={route('news.show', item.slug)}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                    >
                                        {item.image && (
                                            <div className="aspect-video overflow-hidden">
                                                <img
                                                    src={`/storage/${item.image}`}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                                                {item.title}
                                            </h3>
                                            
                                            {item.excerpt && (
                                                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                                    {item.excerpt}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                {item.published_at && (
                                                    <span>{formatDate(item.published_at)}</span>
                                                )}
                                                <span>{calculateReadTime(item.content)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <Footer />
            </div>
        </>
    );
};

export default NewsShow;
