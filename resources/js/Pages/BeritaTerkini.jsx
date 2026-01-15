import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BeritaTerkini = ({ news = [] }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });
    };

    const calculateReadTime = (content) => {
        if (!content) return '2 min baca';
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} min baca`;
    };

    const totalPages = Math.ceil(news.length / 4) || 1;
    const displayedNews = news.slice(0, 4);

    return (
        <section className="py-20" style={{ backgroundColor: "#0048a7" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Title */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        News and Blogs
                    </h2>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                        Temukan informasi terkini dan artikel menarik seputar bisnis, ekonomi, dan coworking space
                    </p>
                </div>

                {displayedNews.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {displayedNews.map((item) => (
                                <Link
                                    key={item.id}
                                    href={route(item.type === 'blogs' ? 'blogs.show' : 'news.show', item.slug)}
                                    className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                                >
                                    <div className="relative h-48 overflow-hidden bg-gray-200">
                                        {item.image ? (
                                            <img
                                                src={`/storage/${item.image}`}
                                                alt={item.title}
                                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-3 hover:text-blue-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(item.published_at || item.created_at)} · {calculateReadTime(item.content)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        
                        {/* Lihat Selengkapnya Button */}
                        <div className="text-center mt-8 mb-8">
                            <Link
                                href="/media"
                                className="inline-flex items-center px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
                            >
                                Lihat Selengkapnya
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 text-white">
                        <p className="text-xl">Belum ada berita tersedia</p>
                        <p className="text-sm mt-2 opacity-75">Silakan tambahkan berita melalui admin panel</p>
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                        onClick={() => setCurrentPage(1)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === 1
                                ? "bg-white text-blue-700 font-bold"
                                : "text-white hover:bg-white/20"
                        }`}
                    >
                        1
                    </button>

                    <button
                        onClick={() => setCurrentPage(2)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === 2
                                ? "bg-white text-blue-700 font-bold"
                                : "text-white hover:bg-white/20"
                        }`}
                    >
                        2
                    </button>

                    <button
                        onClick={() => setCurrentPage(3)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === 3
                                ? "bg-white text-blue-700 font-bold"
                                : "text-white hover:bg-white/20"
                        }`}
                    >
                        3
                    </button>

                    <button
                        onClick={() => setCurrentPage(4)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === 4
                                ? "bg-white text-blue-700 font-bold"
                                : "text-white hover:bg-white/20"
                        }`}
                    >
                        4
                    </button>

                    <span className="text-white px-2">...</span>

                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === totalPages
                                ? "bg-white text-blue-700 font-bold"
                                : "text-white hover:bg-white/20"
                        }`}
                    >
                        {totalPages}
                    </button>

                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default BeritaTerkini;
