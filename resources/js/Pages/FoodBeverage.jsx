import React, { useState, useMemo } from 'react';
import { Search, Star, MapPin, Clock } from 'lucide-react';
import { router } from '@inertiajs/react';
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import ProductModal from "@/Components/ProductModal";
import { IMAGE_PLACEHOLDER } from "@/utils/placeholders";

const FoodBeverage = ({ products = [], currentCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
        <Navbar />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-black bg-opacity-30"
          style={{
            backgroundImage: "url('/api/placeholder/1920/400')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          {/* Title and Navigation Section */}
          <div className="text-center mb-10">
            <div className="mb-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Kuliner Lokal
              </h1>
              <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed">
                Food and beverage yang dihidangkan secara cepat, praktis, terjangkau, dan enak. Gratis pengiriman dan alat makan
              </p>
            </div>

            {/* Category Navigation */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <button
                onClick={() => router.visit('/workspace/coworking-space')}
                className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-semibold text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105"
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
                className="px-5 py-2 bg-white text-blue-600 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Food & Beverage
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-lg mx-auto relative mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
              <input
                type="text"
                placeholder="Cari Kuliner Lokal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 bg-white/95 backdrop-blur-sm border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-lg placeholder-blue-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-gradient-to-b from-blue-50/50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Kuliner Lokal Tersedia
                </h2>
                <p className="text-blue-600 font-medium">
                  {filteredProducts.length} produk ditemukan
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-blue-600">
                <div className="w-8 h-1 bg-blue-600 rounded"></div>
                <div className="w-4 h-1 bg-blue-300 rounded"></div>
                <div className="w-2 h-1 bg-blue-200 rounded"></div>
              </div>
            </div>
          </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {filteredProducts.map((product) => {
            const displayImage = product.images && product.images.length > 0 
              ? `/storage/${product.images[0]}` 
              : IMAGE_PLACEHOLDER;
            
            const minPrice = product.variants && product.variants.length > 0
              ? Math.min(...product.variants.map(v => v.price))
              : product.base_price || 0;

            return (
              <div
                key={product.id}
                className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent z-10"></div>
                  <img
                    src={displayImage}
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = IMAGE_PLACEHOLDER;
                    }}
                  />
                  {product.promo_label && (
                    <div className="absolute top-3 left-3 z-20">
                      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                        {product.promo_label}
                      </span>
                    </div>
                  )}
                  
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-200/30 to-transparent"></div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="font-semibold text-slate-800 mb-3 line-clamp-2 text-base leading-tight">
                    {product.title}
                  </h3>
                  
                  {product.subtitle && (
                    <p className="text-xs text-blue-600 mb-3 line-clamp-1">{product.subtitle}</p>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-xs text-blue-600 font-medium mb-1">Mulai dari</div>
                    <span className="text-lg font-bold text-blue-900 bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                      Rp{Number(minPrice).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Order Button */}
                  <button 
                    onClick={() => handleOrderClick(product)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-4 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Pesan Sekarang
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  </button>
                </div>

                {/* Bottom decoration */}
                <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Tidak ada produk yang ditemukan</h3>
              <p className="text-blue-600 mb-6">Coba gunakan kata kunci yang berbeda atau jelajahi semua produk kami</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
              >
                Lihat Semua Produk
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
      
      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={selectedProduct}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default FoodBeverage;