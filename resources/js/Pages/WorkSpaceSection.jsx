import React, { useState, useMemo } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { Link, usePage, router } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import ProductModal from "@/Components/ProductModal";
import CartDrawer from "@/Components/CartDrawer";
import GoogleSheetsScheduleSection from "./SectionWorkSpace/GoogleSheetsScheduleSection";
import { IMAGE_PLACEHOLDER } from "@/utils/placeholders";

const WorkspaceSection = ({ products = [], currentCategory, categories = [] }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { props } = usePage();
    const cart = props.cart || [];

    // Debug logs
    console.log("=== WorkspaceSection Debug ===");
    console.log("Total products received:", products.length);
    console.log("Products:", products);
    console.log("Cart items:", cart.length);

    // Filter produk berdasarkan search term
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch =
                searchTerm === "" ||
                (product.title &&
                    product.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()));

            return matchesSearch;
        });
    }, [products, searchTerm]);

    const handleOrderClick = (product) => {
        console.log("=== handleOrderClick Debug ===");
        console.log("Product clicked:", product);
        console.log("Product has variants:", product?.variants);
        console.log("Product has custom_options:", product?.custom_options);
        console.log("Product keys:", Object.keys(product));

        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handleAddToCart = () => {
        // Open cart drawer after item is added
        setIsCartOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
            <Navbar />

            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Decorative blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {/* Title and Navigation Section */}
                    <div className="text-center mb-10">
                        <div className="mb-6">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                Coworking Space
                            </h1>
                            <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed">
                                Tempat kerja modern dan fleksibel untuk produktivitas maksimal
                            </p>
                        </div>

                        {/* Category Navigation */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            <button
                                onClick={() => router.visit('/workspace/coworking-space')}
                                className="px-5 py-2 bg-white text-blue-600 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                Coworking Space
                            </button>
                            <button
                                onClick={() => router.visit('/jasa-profesional-section')}
                                className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-semibold text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105"
                            >
                                Jasa Profesional
                            </button>
                            <button
                                onClick={() => router.visit('/food-beverage')}
                                className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-semibold text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105"
                            >
                                Food & Beverage
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto mb-6">
                        <div className="relative">
                            <Search
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={20}
                            />
                            <input
                                type="text"
                                placeholder="Cari coworking space..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-slate-800 bg-white/95 backdrop-blur-sm border-2 border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent shadow-xl placeholder-gray-400 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Info Badge */}
                    <div className="text-center">
                        <a
                            href="#schedule"
                            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 group"
                        >
                            <svg
                                className="w-4 h-4 group-hover:scale-110 transition-transform"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>Lihat jadwal ketersediaan ruang di sini</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="bg-gradient-to-b from-white via-blue-50/30 to-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                    {/* Section Header */}
                    <div className="mb-10">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                                    Ruang Kerja Tersedia
                                </h2>
                                <p className="text-blue-600 font-medium flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                    {filteredProducts.length} ruang ditemukan
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
                                <div className="w-6 h-1 bg-blue-300 rounded-full"></div>
                                <div className="w-3 h-1 bg-blue-200 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden group"
                                >
                                    {/* Product Image */}
                                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-gray-50">
                                        <img
                                            src={
                                                product.images &&
                                                product.images.length > 0
                                                    ? `/storage/${product.images[0]}`
                                                    : IMAGE_PLACEHOLDER
                                            }
                                            alt={product.title}
                                            className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.src = IMAGE_PLACEHOLDER;
                                            }}
                                        />
                                        
                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                        {/* Promo Label */}
                                        {product.promo_label && (
                                            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg animate-pulse">
                                                {product.promo_label}
                                            </div>
                                        )}

                                        {/* Category Badge */}
                                        {product.category && (
                                            <div className="absolute top-3 right-3 bg-blue-600/95 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
                                                {product.category.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-5">
                                        <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 text-base leading-tight min-h-[48px] group-hover:text-blue-600 transition-colors">
                                            {product.title}
                                        </h3>

                                        {/* Subtitle */}
                                        {product.subtitle && (
                                            <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                                                {product.subtitle}
                                            </p>
                                        )}

                                        {/* Price Section */}
                                        <div className="mb-4 bg-gradient-to-r from-blue-50 to-blue-100/50 p-3 rounded-lg">
                                            <div className="text-xs text-blue-700 font-semibold mb-1 uppercase tracking-wide">
                                                Mulai dari
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-bold text-blue-900">
                                                    Rp{" "}
                                                    {Number(
                                                        product.base_price
                                                    ).toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                            {product.variants &&
                                                product.variants.length > 0 && (
                                                    <p className="text-xs text-blue-600 mt-1 font-medium">
                                                        {product.variants.length}{" "}
                                                        paket tersedia
                                                    </p>
                                                )}
                                        </div>

                                        {/* Order Button */}
                                        <button
                                            onClick={() =>
                                                handleOrderClick(product)
                                            }
                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                Pesan Sekarang
                                                <svg
                                                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9 5l7 7-7 7"
                                                    ></path>
                                                </svg>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-20">
                            <div className="max-w-md mx-auto">
                                <div className="relative w-32 h-32 mx-auto mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Search size={40} className="text-blue-600" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                                    Tidak ada ruang kerja yang ditemukan
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {searchTerm
                                        ? "Coba gunakan kata kunci yang berbeda atau hapus filter pencarian"
                                        : "Belum ada ruang kerja yang tersedia saat ini"}
                                </p>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        Tampilkan Semua Produk
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule Section */}
            <div id="schedule" className="bg-gradient-to-b from-gray-50 to-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Section Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-3">
                                Jadwal Ketersediaan Ruangan
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Lihat jadwal real-time ketersediaan ruang kerja kami
                            </p>
                        </div>

                        {/* Schedule Iframe */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                                <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    Jadwal Sewa Ruangan
                                </h3>
                            </div>
                            <div className="relative">
                                <iframe
                                    className="w-full h-[600px] border-0"
                                    src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSi4CNuxtDmtyXyIYCEEyToK9oTTYygNf7KnU1JdvqoNkjBCkWtTv8Rtgr8-_-g3WUamRjmTNQxDEQS/pubhtml?widget=true&amp;headers=false"
                                    title="Jadwal Sewa Ruangan"
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Schedule Component */}
            <GoogleSheetsScheduleSection />

            {/* Product Modal */}
            <ProductModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onAddToCart={handleAddToCart}
            />

            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />
            <Footer />
        </div>
    );
};

export default WorkspaceSection;
