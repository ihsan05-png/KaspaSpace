import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { IMAGE_PLACEHOLDER } from '@/utils/placeholders';
import { ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus } from 'lucide-react';
import BookingDateTimePicker from '@/Components/BookingDateTimePicker';

const ProductShow = ({ product }) => {
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [customOptions, setCustomOptions] = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [bookingData, setBookingData] = useState({ date: null, startTime: null, endTime: null });

    const isCoworkingBooking = ['share_desk', 'private_room'].includes(product.product_type);

    // Auto-select first variant
    useEffect(() => {
        if (product.variants && product.variants.length > 0) {
            const firstActiveVariant = product.variants.find(v =>
                v.is_active && (!v.manage_stock || v.stock_quantity > 0)
            );
            if (firstActiveVariant) {
                setSelectedVariant(firstActiveVariant);
            }
        }
    }, [product]);

    const images = product.images && product.images.length > 0
        ? product.images
        : [null];

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const handleVariantChange = (e) => {
        const variant = product.variants.find(v => v.id === parseInt(e.target.value));
        if (variant) setSelectedVariant(variant);
    };

    const handleCustomOptionChange = (optionName, value) => {
        setCustomOptions(prev => ({
            ...prev,
            [optionName]: value
        }));
    };

    const handleAddToCart = () => {
        if (!selectedVariant) {
            alert('Silakan pilih paket terlebih dahulu');
            return;
        }

        if (isCoworkingBooking && (!bookingData.date || !bookingData.startTime)) {
            alert('Silakan pilih tanggal dan waktu booking');
            return;
        }

        const data = {
            product_id: product.id,
            product_name: product.title,
            variant_id: selectedVariant.id,
            variant_name: selectedVariant.name,
            custom_options: customOptions,
            quantity: quantity,
            price: selectedVariant.price,
            booking_date: bookingData.date || null,
            booking_start_time: bookingData.startTime || null,
        };

        router.post('/cart/add', data, {
            preserveScroll: true,
            onSuccess: () => {
                setIsCartOpen(true);
            },
            onError: (errors) => {
                console.error('Error adding to cart:', errors);
                alert('Gagal menambahkan ke keranjang');
            }
        });
    };

    const displayPrice = selectedVariant
        ? Number(selectedVariant.price)
        : (product.variants && product.variants.length > 0
            ? Number(product.variants[0].price)
            : Number(product.base_price || 0));

    return (
        <div className="min-h-screen bg-white">
            <Head title={product.title} />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column - Images */}
                    <div>
                        {/* Main Image */}
                        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <img
                                src={images[currentImageIndex]
                                    ? `/storage/${images[currentImageIndex]}`
                                    : IMAGE_PLACEHOLDER}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = IMAGE_PLACEHOLDER;
                                }}
                            />

                            {/* Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
                                    >
                                        <ChevronRight className="w-6 h-6 text-gray-700" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                                            currentImageIndex === index
                                                ? 'border-blue-600'
                                                : 'border-transparent hover:border-gray-300'
                                        }`}
                                    >
                                        <img
                                            src={image ? `/storage/${image}` : IMAGE_PLACEHOLDER}
                                            alt={`${product.title} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = IMAGE_PLACEHOLDER;
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Description Section */}
                        {product.description && (
                            <div className="mt-8 prose prose-sm max-w-none">
                                <div
                                    className="text-gray-700 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }}
                                />
                            </div>
                        )}

                    </div>

                    {/* Right Column - Product Info */}
                    <div>
                        {/* Title */}
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                            {product.title}
                        </h1>

                        {/* Subtitle */}
                        {product.subtitle && (
                            <p className="text-lg text-gray-700 font-medium mb-4">
                                {product.subtitle}
                            </p>
                        )}

                        {/* Price */}
                        <div className="mb-6">
                            <p className="text-3xl font-bold text-gray-900">
                                Rp{displayPrice.toLocaleString('id-ID')}
                            </p>
                            {selectedVariant?.compare_price && selectedVariant.compare_price > selectedVariant.price && (
                                <p className="text-lg text-gray-500 line-through">
                                    Rp{Number(selectedVariant.compare_price).toLocaleString('id-ID')}
                                </p>
                            )}
                        </div>

                        {/* Variant Selection */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Paket
                                </label>
                                <select
                                    value={selectedVariant?.id || ''}
                                    onChange={handleVariantChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                >
                                    {product.variants.map((variant) => {
                                        const isDisabled = !variant.is_active || (variant.manage_stock && variant.stock_quantity <= 0);
                                        return (
                                            <option
                                                key={variant.id}
                                                value={variant.id}
                                                disabled={isDisabled}
                                            >
                                                {variant.name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        )}

                        {/* Booking Date/Time Picker for coworking products */}
                        {isCoworkingBooking && selectedVariant && (
                            <div className="mb-6">
                                <BookingDateTimePicker
                                    productId={product.id}
                                    productType={product.product_type}
                                    selectedVariant={selectedVariant}
                                    onBookingChange={setBookingData}
                                />
                            </div>
                        )}

                        {/* Custom Options */}
                        {product.custom_options && product.custom_options.length > 0 && (
                            <div className="space-y-4 mb-6">
                                {product.custom_options.map((option, index) => (
                                    <div key={index}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {option.label || option.name}
                                            {option.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>

                                        {option.type === 'checkbox' && (
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={customOptions[option.name] === 'ya'}
                                                    onChange={(e) => handleCustomOptionChange(option.name, e.target.checked ? 'ya' : '')}
                                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="ml-3 text-sm text-gray-600">Ya</span>
                                            </div>
                                        )}

                                        {option.type === 'text' && (
                                            <input
                                                type="text"
                                                value={customOptions[option.name] || ''}
                                                onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                                placeholder={option.placeholder || `Masukkan ${option.name}`}
                                            />
                                        )}

                                        {option.type === 'select' && option.options && (
                                            <select
                                                value={customOptions[option.name] || ''}
                                                onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            >
                                                <option value="">Pilih {option.name}</option>
                                                {option.options.map((opt, idx) => (
                                                    <option key={idx} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        )}

                                        {option.type === 'textarea' && (
                                            <textarea
                                                value={customOptions[option.name] || ''}
                                                onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                                                rows={3}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                                placeholder={option.placeholder || `Masukkan ${option.name}`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Jumlah
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center justify-center"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2"
                                    min="1"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center justify-center"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedVariant || (isCoworkingBooking && (!bookingData.date || !bookingData.startTime))}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {!selectedVariant
                                ? 'Pilih Paket Terlebih Dahulu'
                                : isCoworkingBooking && (!bookingData.date || !bookingData.startTime)
                                    ? 'Pilih Tanggal & Waktu Booking'
                                    : 'Tambah ke Keranjang'}
                        </button>

                        {/* Additional Info Accordions */}
                        <div className="mt-8 space-y-4">
                            <details className="border-t border-gray-200 pt-4">
                                <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-900">
                                    Administrasi
                                    <span className="text-xl">+</span>
                                </summary>
                                <div className="mt-3 text-gray-600 text-sm">
                                    Kami membutuhkan informasi serta dokumen terkait PIC dan perusahaan Anda. Hubungi kami untuk informasi lebih lanjut.
                                </div>
                            </details>

                            <details className="border-t border-gray-200 pt-4">
                                <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-900">
                                    Kesepakatan
                                    <span className="text-xl">+</span>
                                </summary>
                                <div className="mt-3 text-gray-600 text-sm">
                                    Silakan hubungi kami untuk informasi mengenai kesepakatan dan ketentuan layanan.
                                </div>
                            </details>
                        </div>
                    </div>
                </div>

                {/* Virtual Office Package Details Table */}
                {(product.product_type === 'virtual_office' ||
                  product.title?.toLowerCase().includes('virtual office')) && (
                    <div className="mt-12">
                        {/* Intro Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Jangan Hamburkan Uang Anda</h2>
                            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-6">
                                Tidak punya cukup uang, jarang ngantor, atau males kalau bangun kantor sendiri? Solusinya pakai virtual office saja! Anda hemat waktu dengan kantor siap pakai dan tidak perlu banyak usaha untuk membangun kantor sendiri. Gunakan logika Anda untuk berfikir. Jika membutuhkan alamat kantor prestisius dengan fasilitas yang lengkap Kaspa Space bisa jadi pilihan yang tepat.
                            </p>

                            <h2 className="text-xl font-bold text-gray-900 mb-4">Apa Itu Virtual Office?</h2>
                            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-4">
                                Virtual office adalah sewa alamat kantor dengan fasilitas penunjang usaha. Dengan virtual office usaha Anda dapat menggunakan alamat kantor Kaspa Space sebagai alamat usaha. Fasilitas penunjang usaha seperti layanan penerimaan surat, meeting room, layanan bisnis, atau jasa pengajuan PKP. Anda dapat membaca blogs ini:
                            </p>
                            <ul className="list-disc list-inside text-left max-w-4xl mx-auto text-blue-600 mb-8">
                                <li>
                                    <a href="https://kaspaspace.com/mengenal-virtual-office-solo-solusi-cerdas-untuk-para-pebisnis" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        https://kaspaspace.com/mengenal-virtual-office-solo-solusi-cerdas-untuk-para-pebisnis
                                    </a>
                                </li>
                                <li>
                                    <a href="https://kaspaspace.com/sejarah-dan-perkembangan-virtual-office-dari-ide-hingga-realisasi" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        https://kaspaspace.com/sejarah-dan-perkembangan-virtual-office-dari-ide-hingga-realisasi
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Package Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Paket Virtual Office */}
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                <h3 className="font-bold text-center text-gray-800">Paket Virtual Office</h3>
                            </div>

                            {/* Bronze */}
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="font-bold text-gray-800 mb-2">Bronze:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    <li>Jasa penerimaan surat, paket, panggilan, & email</li>
                                    <li>Alamat kantor untuk non-badan usaha</li>
                                    <li>Gratis akses eBook di eLibrary</li>
                                    <li>Gratis meeting room 2 jam/bulan</li>
                                    <li>Gratis pembuatan rekening bank BRI & Sinarmas</li>
                                </ul>
                            </div>

                            {/* Platinum */}
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="font-bold text-gray-800 mb-2">Platinum:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    <li>Jasa penerimaan surat, paket, panggilan, & email</li>
                                    <li>Surat keterangan domisili gedung</li>
                                    <li>Gratis akses eBook di eLibrary</li>
                                    <li>Gratis meeting room 2 jam/bulan</li>
                                    <li>Gratis pembuatan rekening bank BRI & Sinarmas</li>
                                    <li>Voucher diskon 10% layanan Dokter Finance</li>
                                </ul>
                            </div>

                            {/* Gold */}
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="font-bold text-gray-800 mb-2">Gold:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    <li>Jasa penerimaan surat, paket, panggilan, & email</li>
                                    <li>Surat keterangan domisili gedung</li>
                                    <li>Gratis akses eBook di eLibrary</li>
                                    <li>Gratis meeting room 2 jam/bulan & coworking 6 hari/bulan</li>
                                    <li>Gratis pembuatan rekening bank BRI & Sinarmas</li>
                                    <li>Voucher diskon 10% layanan Dokter Finance</li>
                                    <li>Voucher diskon 20% meeting room & coworking</li>
                                </ul>
                            </div>

                            {/* Diamond */}
                            <div className="px-4 py-3">
                                <p className="font-bold text-gray-800 mb-2">Diamond:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    <li>Jasa penerimaan surat, paket, panggilan, & email</li>
                                    <li>Surat keterangan domisili gedung</li>
                                    <li>Gratis akses eBook di eLibrary</li>
                                    <li>Gratis meeting room 4 jam/bulan & coworking 6 hari/bulan</li>
                                    <li>Gratis pembuatan rekening bank BRI & Sinarmas</li>
                                    <li>Voucher diskon 10% layanan Dokter Finance</li>
                                    <li>Voucher diskon 20% meeting room & coworking</li>
                                    <li>Voucher diskon 50% jasa pengajuan PKP</li>
                                </ul>
                            </div>
                        </div>

                        {/* Paket Bundling VO + Legalitas Usaha */}
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                <h3 className="font-bold text-center text-gray-800">Paket Bundling VO + Legalitas Usaha</h3>
                            </div>

                            {/* VO Platinum + Pendirian PT Perorangan */}
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="font-bold text-gray-800 mb-2">VO Platinum + Pendirian PT Perorangan:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    <li>Virtual Office Platinum 12 bulan</li>
                                    <li>Voucher diskon 20% meeting room & coworking</li>
                                    <li>SK kemenkumham, surat pernyataan pendirian PT Perorangan, NIB, NPWP, lampiran RBA (SPPL,k3l, izin komersial dll), Email baru, akun OSS</li>
                                </ul>
                            </div>

                            {/* VO Platinum + Pendirian PT */}
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="font-bold text-gray-800 mb-2">VO Platinum + Pendirian PT:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    <li>Virtual Office Platinum 12 bulan</li>
                                    <li>Voucher diskon 20% meeting room & coworking</li>
                                    <li>Voucher diskon 50% jasa pengajuan PKP</li>
                                    <li>SK kemenkumham, akta notaris, NIB, NPWP, lampiran RBA (SPPL,k3l, izin komersial dll), email baru, akun OSS</li>
                                </ul>
                            </div>

                            {/* VO Platinum + Pendirian CV */}
                            <div className="px-4 py-3">
                                <p className="font-bold text-gray-800 mb-2">VO Platinum + Pendirian CV:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    <li>Virtual Office Platinum 12 bulan</li>
                                    <li>Voucher diskon 20% meeting room & coworking</li>
                                    <li>Voucher diskon 50% jasa pengajuan PKP</li>
                                    <li>SK kemenkumham, akta notaris, NIB, NPWP, lampiran RBA (SPPL,k3l, izin komersial dll), email baru, akun OSS</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* Private Office Package Details */}
                {(product.product_type === 'private_office' ||
                  product.title?.toLowerCase().includes('private office')) && (
                    <div className="mt-12">
                        {/* Intro Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Dikira Hemat Malah Boncos</h2>
                            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-6">
                                Sewa ruko di lokasi prestisius ratusan juta per tahun, belum renovasi, merawat, bayar listrik, air, internet, AC, dan lainnya. Solusinya pakai private office saja! Hemat waktu dengan kantor siap pakai dan tidak perlu keluar banyak uang untuk membangun kantor sendiri. Fleksibel bisa sewa bulanan, fasilitas lengkap, dan siap pakai. Tapi kalau mau ngantor di kontrakan atau kost ya terserah.
                            </p>

                            <h2 className="text-xl font-bold text-gray-900 mb-4">Apa Itu Private Office?</h2>
                            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-4">
                                Private office adalah ruang kantor privat untuk tim Anda. Dibuat khusus untuk UMKM/UKM yang ingin punya kantor sendiri. Sudah sepaket dengan layanan resepsionis, kebersihan, internet, listrik, hingga meeting room. Anda dapat membaca blogs ini:
                            </p>
                            <ul className="list-disc list-inside text-left max-w-4xl mx-auto text-blue-600 mb-8 space-y-1">
                                <li>
                                    <a href="https://kaspaspace.com/5-tips-memilih-workspace-yang-tepat-untuk-pertumbuhan-bisnis-anda" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        5 Tips Memilih Workspace yang Tepat untuk Pertumbuhan Bisnis Anda
                                    </a>
                                </li>
                                <li>
                                    <a href="https://kaspaspace.com/mengenal-service-office-space-layanan-ruang-kantor-modern" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        Mengenal Service Office Space - Layanan Ruang Kantor Modern
                                    </a>
                                </li>
                                <li>
                                    <a href="https://kaspaspace.com/sewa-kantor-kaspa-space-lebih-untung-daripada-sewa-ruko" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        Sewa Kantor Kaspa Space Lebih Untung daripada Sewa Ruko
                                    </a>
                                </li>
                                <li>
                                    <a href="https://kaspaspace.com/perbandingan-sewa-kantor-coworking-space-vs-ruko-atau-rumah-untuk-kantor" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        Perbandingan Sewa Kantor: Coworking Space vs Ruko atau Rumah untuk Kantor
                                    </a>
                                </li>
                                <li>
                                    <a href="https://kaspaspace.com/sewa-kantor-di-solo-apa-untungnya" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        Sewa Kantor di Solo - Apa Untungnya?
                                    </a>
                                </li>
                                <li>
                                    <a href="https://kaspaspace.com/sewa-kantor-bulanan-solo-di-kaspa-space-manahan-coworking-space-solo-private-office-office-space" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        Sewa Kantor Bulanan Solo di Kaspa Space Manahan
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Package Table */}
                        <div className="border border-gray-300 rounded-lg overflow-hidden max-w-4xl mx-auto">
                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                <h3 className="font-bold text-center text-gray-800">Varian Private Office</h3>
                            </div>

                            {/* Private Office 4 pax (small size) */}
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="font-bold text-gray-800 mb-2">Private Office 4 pax (small size):</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    <li>Jasa front desk resepsionis & office boy</li>
                                    <li>Surat keterangan domisili gedung</li>
                                    <li>Luas 8 m² dengan 2 meja, 4 kursi, & laci</li>
                                    <li>AC 1/2 PK, Wi-Fi 100 Mbps, & stop kontak</li>
                                    <li>Lobi, mushola, pantry dengan dispenser air panas dingin & teh</li>
                                    <li>Gratis meeting room 5 jam/bulan</li>
                                    <li>Gratis akses eBook di eLibrary</li>
                                    <li>Gratis 1 pack tisu/bln</li>
                                    <li>Voucher diskon 10% layanan Dokter Finance</li>
                                    <li>Voucher diskon 20% meeting room & coworking</li>
                                </ul>
                            </div>

                            {/* Private Office 4 pax */}
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="font-bold text-gray-800 mb-2">Private Office 4 pax:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    <li>Jasa front desk resepsionis & office boy</li>
                                    <li>Surat keterangan domisili gedung</li>
                                    <li>Luas 9 m² dengan 2 meja, 4 kursi, & laci</li>
                                    <li>AC 1/2 PK, Wi-Fi 100 Mbps, & stop kontak</li>
                                    <li>Lobi, mushola, pantry dengan dispenser air panas dingin & teh</li>
                                    <li>Gratis meeting room 5 jam/bulan</li>
                                    <li>Gratis akses eBook di eLibrary</li>
                                    <li>Gratis 1 pack tisu/bln</li>
                                    <li>Voucher diskon 10% layanan Dokter Finance</li>
                                    <li>Voucher diskon 20% meeting room & coworking</li>
                                </ul>
                            </div>

                            {/* Private Office 6 pax */}
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="font-bold text-gray-800 mb-2">Private Office 6 pax:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    <li>Jasa front desk resepsionis & office boy</li>
                                    <li>Surat keterangan domisili gedung</li>
                                    <li>Luas 12 m² dengan 3 meja, 6 kursi, & laci</li>
                                    <li>AC 3/4 PK, Wi-Fi 100 Mbps, stop kontak, & whiteboard</li>
                                    <li>Lobi, mushola, pantry dengan dispenser air panas dingin & teh</li>
                                    <li>Gratis meeting room 5 jam/bulan</li>
                                    <li>Gratis akses eBook di eLibrary</li>
                                    <li>Gratis 1 pack tisu/bln</li>
                                    <li>Voucher diskon 10% layanan Dokter Finance</li>
                                    <li>Voucher diskon 20% meeting room & coworking</li>
                                </ul>
                            </div>

                            {/* Private Office 8 pax */}
                            <div className="px-4 py-3">
                                <p className="font-bold text-gray-800 mb-2">Private Office 8 pax:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    <li>Jasa front desk resepsionis & office boy</li>
                                    <li>Surat keterangan domisili gedung</li>
                                    <li>Luas 14 m² dengan 4 meja, 8 kursi, & laci</li>
                                    <li>AC 1 PK, Wi-Fi 100 Mbps, & stop kontak</li>
                                    <li>Lobi, mushola, pantry dengan dispenser air panas dingin & teh</li>
                                    <li>Gratis meeting room 5 jam/bulan</li>
                                    <li>Gratis akses eBook di eLibrary</li>
                                    <li>Gratis 1 pack tisu/bln</li>
                                    <li>Voucher diskon 10% layanan Dokter Finance</li>
                                    <li>Voucher diskon 20% meeting room & coworking</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recommended Products */}
                {product.recommendedProducts && product.recommendedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Produk Terkait</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {product.recommendedProducts.map((rec) => (
                                <a
                                    key={rec.id}
                                    href={`/product/${rec.slug}`}
                                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                                >
                                    <div className="aspect-square bg-gray-100">
                                        <img
                                            src={rec.images && rec.images[0]
                                                ? `/storage/${rec.images[0]}`
                                                : IMAGE_PLACEHOLDER}
                                            alt={rec.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition"
                                            onError={(e) => {
                                                e.target.src = IMAGE_PLACEHOLDER;
                                            }}
                                        />
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                                            {rec.title}
                                        </h3>
                                        <p className="text-blue-600 font-semibold mt-1">
                                            Rp{Number(rec.variants?.[0]?.price || rec.base_price || 0).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer />

            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />
        </div>
    );
};

export default ProductShow;
