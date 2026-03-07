import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
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

    // Operational hours: product-specific → global setting → hardcoded default
    const { operationalHours } = usePage().props;
    const openTime  = product.open_time  || operationalHours?.open  || '08:00';
    const closeTime = product.close_time || operationalHours?.close || '17:00';

    // Share desk capacity from variant stock_quantity (default 8)
    const shareDeskCapacity = product.variants?.[0]?.stock_quantity ?? 8;

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

                {/* Share Desk Package Details */}
                {(product.product_type === 'share_desk' ||
                  product.title?.toLowerCase().includes('share desk') ||
                  product.title?.toLowerCase().includes('coworking')) && (
                    <div className="mt-12">
                        {/* Intro Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Kerja Produktif Tanpa Perlu Kantor Sendiri</h2>
                            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-6">
                                Capek kerja dari rumah tapi belum siap sewa kantor? Share desk adalah solusinya! Nikmati suasana kerja yang profesional, fasilitas lengkap, dan komunitas produktif hanya dengan biaya per jam. Cocok untuk freelancer, remote worker, mahasiswa, hingga pebisnis yang butuh tempat kerja fleksibel tanpa komitmen jangka panjang.
                            </p>

                            <h2 className="text-xl font-bold text-gray-900 mb-4">Apa Itu Share Desk?</h2>
                            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-4">
                                Share desk adalah layanan coworking space dengan konsep meja bersama. Anda dapat menggunakan meja kerja yang nyaman di area coworking Kaspa Space bersama pengguna lain. Sistem booking per jam memberikan fleksibilitas penuh — bayar sesuai kebutuhan, tanpa perlu kontrak bulanan. Anda dapat membaca blogs ini:
                            </p>
                            <ul className="list-disc list-inside text-left max-w-4xl mx-auto text-blue-600 mb-8 space-y-1">
                                <li>
                                    <a href="https://kaspaspace.com/5-tips-memilih-workspace-yang-tepat-untuk-pertumbuhan-bisnis-anda" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        5 Tips Memilih Workspace yang Tepat untuk Pertumbuhan Bisnis Anda
                                    </a>
                                </li>
                                <li>
                                    <a href="https://kaspaspace.com/perbandingan-sewa-kantor-coworking-space-vs-ruko-atau-rumah-untuk-kantor" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        Perbandingan Sewa Kantor: Coworking Space vs Ruko atau Rumah untuk Kantor
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Package Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Fasilitas Share Desk */}
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                    <h3 className="font-bold text-center text-gray-800">Fasilitas Share Desk</h3>
                                </div>
                                <div className="px-4 py-3">
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                                        <li>Meja & kursi kerja yang ergonomis dan nyaman</li>
                                        <li>Wi-Fi kecepatan tinggi 100 Mbps</li>
                                        <li>Stop kontak & colokan USB di setiap meja</li>
                                        <li>AC sentral ruangan yang sejuk</li>
                                        <li>Loker penyimpanan barang (opsional)</li>
                                        <li>Pantry dengan air minum, teh, dan kopi</li>
                                        <li>Area lobi dan ruang santai</li>
                                        <li>Mushola & toilet bersih</li>
                                        <li>Akses eBook di eLibrary Kaspa Space</li>
                                        <li>Lingkungan kerja yang kondusif dan bebas distraksi</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Paket Share Desk (Durasi) */}
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                    <h3 className="font-bold text-center text-gray-800">Paket Durasi & Harga</h3>
                                </div>

                                {/* Paket Per Jam */}
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Booking Per Jam:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        <li>Fleksibel mulai dari 1 jam hingga seharian</li>
                                        <li>Bayar sesuai durasi yang dipilih</li>
                                        <li>Booking real-time, langsung konfirmasi</li>
                                        <li>Tidak perlu kontrak atau komitmen jangka panjang</li>
                                    </ul>
                                </div>

                                {/* Ketentuan */}
                                <div className="px-4 py-3">
                                    <p className="font-bold text-gray-800 mb-2">Ketentuan Penggunaan:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        <li>Jam operasional {openTime} – {closeTime} WIB</li>
                                        <li>Kapasitas meja hingga {shareDeskCapacity} orang bersamaan</li>
                                        <li>Meja dikembalikan tepat waktu sesuai durasi booking</li>
                                        <li>Dilarang membawa makanan berbau tajam</li>
                                        <li>Jaga kebersihan dan ketenangan bersama</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Keunggulan */}
                        <div className="mt-6 border border-gray-300 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                <h3 className="font-bold text-center text-gray-800">Kenapa Pilih Share Desk Kaspa Space?</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                                <div className="px-4 py-4 border-b md:border-b-0 md:border-r border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Lokasi Strategis</p>
                                    <p className="text-sm text-gray-700">Berada di kawasan Sinarmas, Surabaya — mudah dijangkau dari berbagai penjuru kota dengan akses parkir yang luas.</p>
                                </div>
                                <div className="px-4 py-4 border-b md:border-b-0 md:border-r border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Komunitas Produktif</p>
                                    <p className="text-sm text-gray-700">Bergabung dengan komunitas profesional, freelancer, dan entrepreneur yang saling mendukung dan berkolaborasi.</p>
                                </div>
                                <div className="px-4 py-4">
                                    <p className="font-bold text-gray-800 mb-2">Harga Terjangkau</p>
                                    <p className="text-sm text-gray-700">Investasi produktivitas yang hemat — lebih murah dari kafe, lebih profesional dari rumah, lebih fleksibel dari kantor sendiri.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Private Room Package Details */}
                {(product.product_type === 'private_room' ||
                  product.title?.toLowerCase().includes('private room') ||
                  product.title?.toLowerCase().includes('meeting room')) && (
                    <div className="mt-12">
                        {/* Intro Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Rapat Profesional, Meeting Privat, Presentasi Berkesan</h2>
                            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-6">
                                Butuh ruangan privat untuk meeting klien, rapat tim, presentasi, sesi pelatihan, atau diskusi penting? Private room Kaspa Space hadir dengan ruangan nyaman yang dilengkapi peralatan presentasi lengkap. Booking per jam, tidak perlu kontrak bulanan — fleksibel sesuai kebutuhan Anda.
                            </p>

                            <h2 className="text-xl font-bold text-gray-900 mb-4">Apa Itu Private Room?</h2>
                            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-4">
                                Private room adalah ruangan meeting eksklusif yang dapat disewa per jam. Ruangan ini terpisah dari area coworking umum, memberikan privasi penuh untuk diskusi rahasia, negosiasi bisnis, atau sesi kerja yang membutuhkan konsentrasi tinggi. Kapasitas ruangan mendukung rapat kecil hingga presentasi tim. Anda dapat membaca blogs ini:
                            </p>
                            <ul className="list-disc list-inside text-left max-w-4xl mx-auto text-blue-600 mb-8 space-y-1">
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
                            </ul>
                        </div>

                        {/* Package Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Fasilitas Private Room */}
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                    <h3 className="font-bold text-center text-gray-800">Fasilitas Private Room</h3>
                                </div>
                                <div className="px-4 py-3">
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                                        <li>Ruangan privat eksklusif dengan pintu tertutup</li>
                                        <li>Meja rapat panjang dengan kursi yang nyaman</li>
                                        <li>Layar proyektor / TV screen untuk presentasi</li>
                                        <li>Whiteboard untuk brainstorming</li>
                                        <li>Wi-Fi kecepatan tinggi 100 Mbps</li>
                                        <li>AC ruangan yang dapat diatur suhu</li>
                                        <li>Stop kontak & colokan USB</li>
                                        <li>Pantry dengan air minum, teh, dan kopi</li>
                                        <li>Layanan resepsionis untuk menyambut tamu</li>
                                        <li>Papan nama (name tag) di pintu ruangan</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Paket Private Room */}
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                    <h3 className="font-bold text-center text-gray-800">Paket Durasi & Harga</h3>
                                </div>

                                {/* Booking Per Jam */}
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Booking Per Jam:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        <li>Tersedia dari 1 jam hingga seharian penuh</li>
                                        <li>Harga bervariasi sesuai durasi yang dipilih</li>
                                        <li>Booking real-time, langsung terkonfirmasi</li>
                                        <li>Ekslusif satu ruangan per sesi — tidak berbagi</li>
                                    </ul>
                                </div>

                                {/* Ketentuan */}
                                <div className="px-4 py-3">
                                    <p className="font-bold text-gray-800 mb-2">Ketentuan Penggunaan:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        <li>Jam operasional {openTime} – {closeTime} WIB</li>
                                        <li>Kapasitas ruangan hingga 10 orang</li>
                                        <li>Ruangan dikembalikan tepat waktu sesuai booking</li>
                                        <li>Dilarang membawa makanan berbau tajam ke dalam ruangan</li>
                                        <li>Pemesanan dapat dilakukan minimal 30 menit sebelumnya</li>
                                        <li>Hanya 1 sesi booking per waktu yang sama (ekslusif)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Keunggulan */}
                        <div className="mt-6 border border-gray-300 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                <h3 className="font-bold text-center text-gray-800">Ideal Digunakan Untuk</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                                <div className="px-4 py-4 border-b md:border-b-0 md:border-r border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Rapat & Meeting</p>
                                    <p className="text-sm text-gray-700">Meeting klien, rapat tim internal, negosiasi bisnis, atau diskusi proyek yang membutuhkan privasi penuh.</p>
                                </div>
                                <div className="px-4 py-4 border-b md:border-b-0 md:border-r border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Presentasi & Pelatihan</p>
                                    <p className="text-sm text-gray-700">Sesi presentasi produk, pelatihan karyawan, workshop kecil, atau demo kepada klien dengan peralatan lengkap.</p>
                                </div>
                                <div className="px-4 py-4">
                                    <p className="font-bold text-gray-800 mb-2">Wawancara & Konsultasi</p>
                                    <p className="text-sm text-gray-700">Sesi wawancara kandidat, konsultasi bisnis privat, atau coaching session yang membutuhkan suasana tenang dan profesional.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Print Package Details */}
                {(product.product_type === 'print' ||
                  product.title?.toLowerCase().includes('print')) && (
                    <div className="mt-12">
                        {/* Intro Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Cetak Dokumen Cepat, Murah, dan Berkualitas</h2>
                            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-6">
                                Butuh cetak dokumen, proposal, laporan, atau materi presentasi? Kaspa Space menyediakan layanan print dengan printer berkualitas tinggi, berbagai pilihan ukuran kertas, dan hasil cetak yang tajam. Tidak perlu keluar jauh — cetak langsung di tempat kerja Anda!
                            </p>

                            <h2 className="text-xl font-bold text-gray-900 mb-4">Apa Itu Layanan Print Kaspa Space?</h2>
                            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-4">
                                Layanan print Kaspa Space adalah jasa cetak dokumen yang tersedia di area coworking. Anda dapat mencetak berbagai jenis dokumen mulai dari hitam-putih hingga berwarna, ukuran A4 hingga A3. Harga per lembar yang terjangkau membuat layanan ini cocok untuk kebutuhan cetak harian maupun dalam jumlah banyak.
                            </p>
                        </div>

                        {/* Package Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Fasilitas Print */}
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                    <h3 className="font-bold text-center text-gray-800">Fasilitas Layanan Print</h3>
                                </div>
                                <div className="px-4 py-3">
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                                        <li>Printer laser & inkjet berkualitas tinggi</li>
                                        <li>Cetak hitam-putih dan berwarna (full color)</li>
                                        <li>Ukuran kertas A4, F4, dan A3</li>
                                        <li>Berbagai jenis kertas: HVS, glossy, art paper</li>
                                        <li>Hasil cetak tajam dan tahan lama</li>
                                        <li>Layanan print dari USB, email, atau Google Drive</li>
                                        <li>Proses cetak cepat, tidak perlu antri lama</li>
                                        <li>Tersedia di area coworking Kaspa Space</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Paket Print */}
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                    <h3 className="font-bold text-center text-gray-800">Paket & Harga</h3>
                                </div>

                                {/* Paket */}
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Pilihan Paket:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        <li>Harga per lembar, bayar sesuai jumlah cetakan</li>
                                        <li>Tersedia paket hitam-putih dan berwarna</li>
                                        <li>Tidak ada minimum order</li>
                                        <li>Bisa cetak dari 1 lembar hingga ratusan lembar</li>
                                    </ul>
                                </div>

                                {/* Ketentuan */}
                                <div className="px-4 py-3">
                                    <p className="font-bold text-gray-800 mb-2">Ketentuan Penggunaan:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        <li>File dikirim via USB, email, atau Google Drive</li>
                                        <li>Format file: PDF, Word, Excel, JPG, PNG</li>
                                        <li>Pembayaran dilakukan di kasir Kaspa Space</li>
                                        <li>Tidak melayani cetak konten ilegal atau SARA</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Keunggulan */}
                        <div className="mt-6 border border-gray-300 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                <h3 className="font-bold text-center text-gray-800">Kenapa Cetak di Kaspa Space?</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                                <div className="px-4 py-4 border-b md:border-b-0 md:border-r border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Harga Terjangkau</p>
                                    <p className="text-sm text-gray-700">Harga per lembar yang bersaing — lebih hemat dibanding warnet atau print shop biasa, tanpa mengorbankan kualitas.</p>
                                </div>
                                <div className="px-4 py-4 border-b md:border-b-0 md:border-r border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Praktis & Cepat</p>
                                    <p className="text-sm text-gray-700">Cetak dokumen langsung di tempat kerja Anda. Tidak perlu keluar gedung — hemat waktu dan tenaga untuk hal yang lebih penting.</p>
                                </div>
                                <div className="px-4 py-4">
                                    <p className="font-bold text-gray-800 mb-2">Kualitas Terjamin</p>
                                    <p className="text-sm text-gray-700">Printer berkualitas dengan tinta original menghasilkan cetakan yang tajam, jelas, dan profesional untuk setiap dokumen Anda.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Materai Package Details */}
                {(product.product_type === 'materai' ||
                  product.title?.toLowerCase().includes('materai')) && (
                    <div className="mt-12">
                        {/* Intro Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Materai Resmi, Praktis, dan Terpercaya</h2>
                            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-6">
                                Perlu materai untuk dokumen perjanjian, kontrak kerja, surat kuasa, atau dokumen resmi lainnya? Kaspa Space menyediakan materai tempel dan e-Materai resmi yang sah secara hukum. Tersedia langsung di lokasi tanpa perlu antri di kantor pos atau minimarket.
                            </p>

                            <h2 className="text-xl font-bold text-gray-900 mb-4">Apa Itu Layanan Materai Kaspa Space?</h2>
                            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-4">
                                Layanan materai Kaspa Space menyediakan materai tempel resmi keluaran Peruri yang sah digunakan untuk berbagai dokumen hukum dan perjanjian. Materai tersedia dalam nominal sesuai ketentuan berlaku dan dapat langsung dibeli di area kasir Kaspa Space tanpa prosedur yang rumit.
                            </p>
                        </div>

                        {/* Package Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Informasi Materai */}
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                    <h3 className="font-bold text-center text-gray-800">Informasi Layanan Materai</h3>
                                </div>
                                <div className="px-4 py-3">
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                                        <li>Materai tempel resmi keluaran Peruri</li>
                                        <li>Sah secara hukum sesuai UU Bea Materai</li>
                                        <li>Tersedia dalam nominal sesuai ketentuan berlaku</li>
                                        <li>Pembelian satuan maupun dalam jumlah banyak</li>
                                        <li>Dapat digunakan untuk berbagai dokumen resmi</li>
                                        <li>Proses pembelian cepat di kasir Kaspa Space</li>
                                        <li>Stok selalu tersedia setiap hari kerja</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Kegunaan Materai */}
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                    <h3 className="font-bold text-center text-gray-800">Dokumen yang Memerlukan Materai</h3>
                                </div>

                                {/* Dokumen Perjanjian */}
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Dokumen Perjanjian & Kontrak:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        <li>Surat perjanjian kerja sama bisnis</li>
                                        <li>Kontrak kerja karyawan</li>
                                        <li>Perjanjian sewa menyewa</li>
                                        <li>MOU (Memorandum of Understanding)</li>
                                    </ul>
                                </div>

                                {/* Dokumen Hukum */}
                                <div className="px-4 py-3">
                                    <p className="font-bold text-gray-800 mb-2">Dokumen Hukum & Administrasi:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        <li>Surat kuasa dan surat pernyataan</li>
                                        <li>Kuitansi pembayaran di atas nominal tertentu</li>
                                        <li>Dokumen pengajuan kredit & pinjaman</li>
                                        <li>Akta jual beli dan dokumen notaris</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Keunggulan */}
                        <div className="mt-6 border border-gray-300 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                <h3 className="font-bold text-center text-gray-800">Kenapa Beli Materai di Kaspa Space?</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                                <div className="px-4 py-4 border-b md:border-b-0 md:border-r border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Resmi & Terpercaya</p>
                                    <p className="text-sm text-gray-700">Materai yang kami jual adalah produk resmi Peruri, terjamin keasliannya dan sah digunakan untuk semua dokumen hukum.</p>
                                </div>
                                <div className="px-4 py-4 border-b md:border-b-0 md:border-r border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Praktis & Mudah</p>
                                    <p className="text-sm text-gray-700">Beli materai langsung di kasir Kaspa Space tanpa perlu antri panjang. Cocok untuk Anda yang sedang bekerja di area coworking.</p>
                                </div>
                                <div className="px-4 py-4">
                                    <p className="font-bold text-gray-800 mb-2">Stok Selalu Ada</p>
                                    <p className="text-sm text-gray-700">Stok materai selalu kami jaga agar tersedia setiap hari kerja. Tidak perlu khawatir kehabisan saat dokumen Anda mendesak.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Legalitas Usaha Package Details */}
                {(product.product_type === 'legalitas' ||
                  product.title?.toLowerCase().includes('legalitas')) && (
                    <div className="mt-12">
                        {/* Intro Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Urus Legalitas Usaha Tanpa Ribet</h2>
                            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-6">
                                Usaha Anda sudah berjalan tapi belum punya legalitas? Atau baru ingin memulai bisnis dengan fondasi hukum yang kuat? Kaspa Space hadir membantu pengurusan legalitas usaha mulai dari SKDU, PKP, pendirian CV, PT, hingga PT Perorangan — proses cepat, harga transparan, dan didampingi tenaga profesional.
                            </p>

                            <h2 className="text-xl font-bold text-gray-900 mb-4">Apa Itu Layanan Legalitas Usaha Kaspa Space?</h2>
                            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-4">
                                Layanan legalitas usaha Kaspa Space adalah jasa pengurusan dokumen hukum dan perizinan usaha yang ditangani oleh tim profesional berpengalaman. Mulai dari surat keterangan domisili usaha, pengajuan PKP, hingga pendirian badan usaha seperti CV dan PT — semua dapat diurus dengan mudah tanpa harus bolak-balik ke instansi pemerintah.
                            </p>
                        </div>

                        {/* Package Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Daftar Paket & Harga dari database */}
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                    <h3 className="font-bold text-center text-gray-800">Paket & Harga Legalitas Usaha</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {product.variants && product.variants.length > 0 ? (
                                        product.variants.map((variant) => (
                                            <div key={variant.id} className="flex items-center justify-between px-4 py-3">
                                                <span className="text-sm text-gray-700 font-medium">{variant.name}</span>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-blue-700">
                                                        Rp{Number(variant.price).toLocaleString('id-ID')}
                                                    </span>
                                                    {variant.compare_price && Number(variant.compare_price) > Number(variant.price) && (
                                                        <div className="text-xs text-gray-400 line-through">
                                                            Rp{Number(variant.compare_price).toLocaleString('id-ID')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                            Hubungi kami untuk informasi harga
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Yang Sudah Termasuk */}
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                    <h3 className="font-bold text-center text-gray-800">Yang Sudah Termasuk</h3>
                                </div>

                                {/* Umum */}
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Layanan Umum:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        <li>Konsultasi awal gratis sebelum pengurusan</li>
                                        <li>Pendampingan proses dari awal hingga selesai</li>
                                        <li>Update status pengurusan secara berkala</li>
                                        <li>Dokumen digital dikirim via WhatsApp / email</li>
                                    </ul>
                                </div>

                                {/* Ketentuan */}
                                <div className="px-4 py-3">
                                    <p className="font-bold text-gray-800 mb-2">Ketentuan:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        <li>Estimasi waktu sesuai jenis layanan yang dipilih</li>
                                        <li>Siapkan dokumen persyaratan yang diminta</li>
                                        <li>Biaya pemerintah (PNBP) di luar harga layanan</li>
                                        <li>Hubungi kami untuk konsultasi lebih lanjut</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Keunggulan */}
                        <div className="mt-6 border border-gray-300 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                <h3 className="font-bold text-center text-gray-800">Kenapa Urus Legalitas di Kaspa Space?</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                                <div className="px-4 py-4 border-b md:border-b-0 md:border-r border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Proses Cepat</p>
                                    <p className="text-sm text-gray-700">Tim kami yang berpengalaman memastikan pengurusan dokumen berjalan efisien tanpa bolak-balik ke instansi yang membuang waktu Anda.</p>
                                </div>
                                <div className="px-4 py-4 border-b md:border-b-0 md:border-r border-gray-200">
                                    <p className="font-bold text-gray-800 mb-2">Harga Transparan</p>
                                    <p className="text-sm text-gray-700">Tidak ada biaya tersembunyi. Harga yang tertera adalah harga final layanan kami — Anda tahu persis berapa yang harus dibayar.</p>
                                </div>
                                <div className="px-4 py-4">
                                    <p className="font-bold text-gray-800 mb-2">Didampingi Profesional</p>
                                    <p className="text-sm text-gray-700">Setiap proses didampingi tenaga ahli yang berpengalaman di bidang hukum dan perizinan usaha, memastikan dokumen Anda sah dan sesuai regulasi.</p>
                                </div>
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
