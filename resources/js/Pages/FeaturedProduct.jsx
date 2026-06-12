import React from 'react';

const FeaturedProductsSection = () => {
  const products = [
    {
      id: 1,
      title: "Workspace",
      description: "Sewa private office mulai dari 2jt/bulan. Fasilitas lengkap cocok untuk tempat mengembangkan usaha Anda.",
      image: "/api/placeholder/300/200"
    },
    {
      id: 2,
      title: "Coworking Space",
      description: "Ruang kerja bersama untuk bekerja atau nugas. Fleksibel dan harga terjangkau mulai dari 10rb/jam.",
      image: "/api/placeholder/300/200"
    },
    {
      id: 3,
      title: "Virtual Office",
      description: "Jarang Ngantor? Virtual office jadi solusi. Mulai dari 1jt/enam bulan sudah dapat alamat domisili usaha dan gratis PKP.",
      image: "/api/placeholder/300/200"
    },
    {
      id: 4,
      title: "Legalitas & Sertifikasi",
      description: "Pendirian PT, CV, perizinan, atau sertifikasi ISO sekarang lebih mudah dan cepat. Buat usaha Anda lebih aman dan kredibel.",
      image: "/api/placeholder/300/200"
    },
    {
      id: 5,
      title: "Keuangan & Pajak",
      description: "Banyak bisnis tutup karena salah kelola keuangan dan pajak. Serahkan pada kami, lebih efisien dibandingkan tim in house",
      image: "/api/placeholder/300/200"
    },
    {
      id: 6,
      title: "Artificial Intelligence",
      description: "Kami menghadirkan terobosan baru AI digital marketing bernama Kasper AI. Tingkatkan efisiensi usaha Anda.",
      image: "/api/placeholder/300/200"
    }
  ];

  return (
    <section className="bg-cyan-400 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Produk Unggulan
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Cari tahu daftar di bawah ini. Kemungkinan besar Anda juga menyukai
            layanan yang sering dicari oleh kebanyakan orang
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 hover:bg-opacity-20 transition-all duration-300 hover:transform hover:scale-105"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {product.title}
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                {product.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-4 h-4 bg-white bg-opacity-20 rounded-full"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-white bg-opacity-15 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-white bg-opacity-25 rounded-full"></div>
          <div className="absolute bottom-40 right-1/3 w-5 h-5 bg-white bg-opacity-10 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;