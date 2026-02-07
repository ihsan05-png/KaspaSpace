import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const ProductCreate = ({ categories, allProducts }) => {
  const { data, setData, post, processing, errors, progress } = useForm({
    title: '',
    subtitle: '',
    description: '',
    promo_label: '',
    base_price: 0,
    category_id: '',
    product_type: '',
    is_active: true,
    sort_order: 0,
    meta_description: '',
    meta_keywords: '',
    images: [],
    custom_options: [],
    variants: [],
    recommendations: [],
  });

  const [imagePreview, setImagePreview] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState('');

  // Variasi otomatis untuk Private Office (berdasarkan kapasitas)
  const privateOfficeVariants = [
    { name: 'Private Office 4 pax (small size) 1 month', price: '', compare_price: '', stock_quantity: 6, manage_stock: true, sku: 'PO-4PAX-S-1M' },
    { name: 'Private Office 4 pax (small size) 6 months', price: '', compare_price: '', stock_quantity: 6, manage_stock: true, sku: 'PO-4PAX-S-6M' },
    { name: 'Private Office 4 pax (small size) 1 year', price: '', compare_price: '', stock_quantity: 6, manage_stock: true, sku: 'PO-4PAX-S-1Y' },
    { name: 'Private Office 4 pax 1 month', price: '', compare_price: '', stock_quantity: 6, manage_stock: true, sku: 'PO-4PAX-1M' },
    { name: 'Private Office 4 pax 6 months', price: '', compare_price: '', stock_quantity: 6, manage_stock: true, sku: 'PO-4PAX-6M' },
    { name: 'Private Office 4 pax 1 year', price: '', compare_price: '', stock_quantity: 6, manage_stock: true, sku: 'PO-4PAX-1Y' },
    { name: 'Private Office 6 pax 1 month', price: '', compare_price: '', stock_quantity: 6, manage_stock: true, sku: 'PO-6PAX-1M' },
    { name: 'Private Office 6 pax 6 months', price: '', compare_price: '', stock_quantity: 6, manage_stock: true, sku: 'PO-6PAX-6M' },
    { name: 'Private Office 6 pax 1 year', price: '', compare_price: '', stock_quantity: 6, manage_stock: true, sku: 'PO-6PAX-1Y' },
    { name: 'Private Office 8 pax 1 month', price: '', compare_price: '', stock_quantity: 6, manage_stock: true, sku: 'PO-8PAX-1M' },
    { name: 'Private Office 8 pax 6 months', price: '', compare_price: '', stock_quantity: 6, manage_stock: true, sku: 'PO-8PAX-6M' },
    { name: 'Private Office 8 pax 1 year', price: '', compare_price: '', stock_quantity: 6, manage_stock: true, sku: 'PO-8PAX-1Y' },
  ];

  // Variasi otomatis untuk Share Desk (08:00 - 17:00 WIB)
  const shareDeskVariants = [
    { name: '1 Jam', price: '', compare_price: '', stock_quantity: 8, manage_stock: true, sku: 'SD-1H', duration_hours: 1 },
    { name: '2 Jam', price: '', compare_price: '', stock_quantity: 8, manage_stock: true, sku: 'SD-2H', duration_hours: 2 },
    { name: '3 Jam', price: '', compare_price: '', stock_quantity: 8, manage_stock: true, sku: 'SD-3H', duration_hours: 3 },
    { name: '4 Jam', price: '', compare_price: '', stock_quantity: 8, manage_stock: true, sku: 'SD-4H', duration_hours: 4 },
    { name: '5 Jam', price: '', compare_price: '', stock_quantity: 8, manage_stock: true, sku: 'SD-5H', duration_hours: 5 },
    { name: '6 Jam', price: '', compare_price: '', stock_quantity: 8, manage_stock: true, sku: 'SD-6H', duration_hours: 6 },
    { name: '7 Jam', price: '', compare_price: '', stock_quantity: 8, manage_stock: true, sku: 'SD-7H', duration_hours: 7 },
    { name: '8 Jam', price: '', compare_price: '', stock_quantity: 8, manage_stock: true, sku: 'SD-8H', duration_hours: 8 },
    { name: '9 Jam (Full Day)', price: '', compare_price: '', stock_quantity: 8, manage_stock: true, sku: 'SD-9H', duration_hours: 9 },
  ];

  // Variasi otomatis untuk Private Room (08:00 - 17:00 WIB)
  const privateRoomVariants = [
    { name: '1 Jam', price: '', compare_price: '', stock_quantity: 1, manage_stock: true, sku: 'PR-1H', duration_hours: 1 },
    { name: '2 Jam', price: '', compare_price: '', stock_quantity: 1, manage_stock: true, sku: 'PR-2H', duration_hours: 2 },
    { name: '3 Jam', price: '', compare_price: '', stock_quantity: 1, manage_stock: true, sku: 'PR-3H', duration_hours: 3 },
    { name: '4 Jam', price: '', compare_price: '', stock_quantity: 1, manage_stock: true, sku: 'PR-4H', duration_hours: 4 },
    { name: '5 Jam', price: '', compare_price: '', stock_quantity: 1, manage_stock: true, sku: 'PR-5H', duration_hours: 5 },
    { name: '6 Jam', price: '', compare_price: '', stock_quantity: 1, manage_stock: true, sku: 'PR-6H', duration_hours: 6 },
    { name: '7 Jam', price: '', compare_price: '', stock_quantity: 1, manage_stock: true, sku: 'PR-7H', duration_hours: 7 },
    { name: '8 Jam', price: '', compare_price: '', stock_quantity: 1, manage_stock: true, sku: 'PR-8H', duration_hours: 8 },
    { name: '9 Jam (Full Day 08:00-17:00)', price: '', compare_price: '', stock_quantity: 1, manage_stock: true, sku: 'PR-9H', duration_hours: 9 },
  ];

  // Variasi otomatis untuk Virtual Office
  const virtualOfficeVariants = [
    { name: 'Bronze 1 Bulan', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-BRONZE-1M' },
    { name: 'Bronze 6 Bulan', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-BRONZE-6M' },
    { name: 'Bronze 12 Bulan', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-BRONZE-12M' },
    { name: 'Platinum 1 Bulan', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-PLATINUM-1M' },
    { name: 'Platinum 6 Bulan', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-PLATINUM-6M' },
    { name: 'Platinum 12 Bulan', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-PLATINUM-12M' },
    { name: 'Gold 1 Bulan', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-GOLD-1M' },
    { name: 'Gold 6 Bulan', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-GOLD-6M' },
    { name: 'Gold 12 Bulan', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-GOLD-12M' },
    { name: 'Diamond 1 Bulan', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-DIAMOND-1M' },
    { name: 'Diamond 6 Bulan', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-DIAMOND-6M' },
    { name: 'Diamond 12 Bulan', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-DIAMOND-12M' },
    { name: 'Platinum 12 bulan + PT Perorangan', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-PLATINUM-12M-PTPER' },
    { name: 'Platinum 12 bulan + PT', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-PLATINUM-12M-PT' },
    { name: 'Platinum 12 bulan + CV', price: '', compare_price: '', stock_quantity: 999, manage_stock: true, sku: 'VO-PLATINUM-12M-CV' },
  ];

  // Handler untuk mengubah kategori dan auto-generate variasi
  const handleCategoryChange = (categoryId) => {
    setData('category_id', categoryId);
    
    // Cek apakah kategori yang dipilih adalah Coworking Space
    const selectedCategory = categories.find(cat => cat.id == categoryId);
    if (selectedCategory && selectedCategory.name === 'Coworking Space') {
      // Reset product type selection
      setSelectedProductType('');
      setData('product_type', '');
    } else {
      setSelectedProductType('');
      setData('product_type', '');
      setData('variants', []);
    }
  };

  // Handler untuk memilih tipe produk di Coworking Space
  const handleProductTypeChange = (productType) => {
    setSelectedProductType(productType);
    setData('product_type', productType);
    
    // Set variasi berdasarkan tipe produk
    if (productType === 'private_office') {
      setData('variants', [...privateOfficeVariants]);
    } else if (productType === 'share_desk') {
      setData('variants', [...shareDeskVariants]);
    } else if (productType === 'private_room') {
      setData('variants', [...privateRoomVariants]);
    } else if (productType === 'virtual_office') {
      setData('variants', [...virtualOfficeVariants]);
    } else {
      setData('variants', []);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Add to existing images
    setData('images', [...data.images, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = data.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setData('images', newImages);
    setImagePreview(newPreviews);
  };

  const addCustomOption = () => {
    setData('custom_options', [...data.custom_options, {
      question: '',
      type: 'checkbox',
      options: [],
      required: false
    }]);
  };

  const updateCustomOption = (index, field, value) => {
    const newOptions = [...data.custom_options];
    newOptions[index][field] = value;
    setData('custom_options', newOptions);
  };

  const removeCustomOption = (index) => {
    const newOptions = data.custom_options.filter((_, i) => i !== index);
    setData('custom_options', newOptions);
  };

  const addVariant = () => {
    setData('variants', [...data.variants, {
      name: '',
      price: '',
      compare_price: '',
      stock_quantity: 0,
      manage_stock: false,
      attributes: {},
      sku: ''
    }]);
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...data.variants];
    newVariants[index][field] = value;
    setData('variants', newVariants);
  };

  const removeVariant = (index) => {
    const newVariants = data.variants.filter((_, i) => i !== index);
    setData('variants', newVariants);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Add basic fields
    formData.append('title', data.title);
    formData.append('subtitle', data.subtitle || '');
    formData.append('description', data.description || '');
    formData.append('promo_label', data.promo_label || '');
    formData.append('base_price', data.base_price);
    formData.append('category_id', data.category_id);
    formData.append('is_active', data.is_active ? '1' : '0');
    formData.append('is_featured', data.is_featured ? '1' : '0');
    formData.append('sort_order', data.sort_order || '0');
    formData.append('meta_description', data.meta_description || '');
    formData.append('meta_keywords', data.meta_keywords || '');
    
    // Add images
    data.images.forEach((image, index) => {
      if (image instanceof File) {
        formData.append(`images[${index}]`, image);
      }
    });
    
    // Add custom options
    data.custom_options.forEach((option, index) => {
      formData.append(`custom_options[${index}][question]`, option.question);
      formData.append(`custom_options[${index}][type]`, option.type);
      formData.append(`custom_options[${index}][required]`, option.required ? '1' : '0');
      if (option.options && option.options.length > 0) {
        option.options.forEach((opt, optIndex) => {
          formData.append(`custom_options[${index}][options][${optIndex}]`, opt);
        });
      }
    });
    
    // Add variants
    data.variants.forEach((variant, index) => {
      formData.append(`variants[${index}][name]`, variant.name);
      formData.append(`variants[${index}][price]`, variant.price);
      formData.append(`variants[${index}][compare_price]`, variant.compare_price || '');
      formData.append(`variants[${index}][stock_quantity]`, variant.stock_quantity || '0');
      formData.append(`variants[${index}][manage_stock]`, variant.manage_stock ? '1' : '0');
      formData.append(`variants[${index}][sku]`, variant.sku || '');
    });
    
    // Add recommendations
    data.recommendations.forEach((rec, index) => {
      formData.append(`recommendations[${index}]`, rec);
    });

    console.log('Submitting form data:', data);
    
    // Try different route names based on your setup
    const routeName = route().has('admin.products.store') ? 'admin.products.store' : 'products.store';
    
    post(route(routeName), {
      data: formData,
      forceFormData: true,
      onSuccess: () => {
        console.log('Product created successfully');
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
      }
    });
  };

  return (
    <AdminLayout title="Tambah Produk">
      <Head title="Tambah Produk" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Tambah Produk</h1>
          </div>
        </div>

        {/* Show validation errors */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-red-800 mb-2">Terjadi kesalahan:</h3>
            <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
              {Object.keys(errors).map(key => (
                <li key={key}>{errors[key]}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Gambar Produk</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
              {imagePreview.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {/* Add Image Button */}
              {imagePreview.length < 6 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                  <PhotoIcon className="h-8 w-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Tambah Gambar</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="Nama produk"
                className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subjudul</label>
              <input
                type="text"
                value={data.subtitle}
                onChange={(e) => setData('subtitle', e.target.value)}
                placeholder="Subjudul produk"
                className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Promo Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label promosi</label>
              <input
                type="text"
                value={data.promo_label}
                onChange={(e) => setData('promo_label', e.target.value)}
                placeholder="NEW, SALE, dll"
                className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Deskripsi produk"
                rows={8}
                className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              {(selectedProductType === 'share_desk' || selectedProductType === 'private_room') && (
                <p className="mt-2 text-xs text-gray-500 italic">
                  💡 Tips: Jelaskan bahwa Meeting Room memiliki 8 meja kerja dengan jam operasional 08:00-17:00 WIB
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={data.category_id}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
            </div>

            {/* Product Type Selection for Coworking Space */}
            {data.category_id && categories.find(cat => cat.id == data.category_id)?.name === 'Coworking Space' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Produk <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProductType}
                  onChange={(e) => handleProductTypeChange(e.target.value)}
                  className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Pilih Tipe Produk</option>
                  <option value="private_office">Private Office (6 ruangan terpisah)</option>
                  <option value="share_desk">Share Desk - Meeting Room (sewa per meja, 08:00-17:00 WIB)</option>
                  <option value="private_room">Private Room - Meeting Room (sewa seluruh ruangan, 08:00-17:00 WIB)</option>
                  <option value="virtual_office">Virtual Office (sewa alamat kantor + fasilitas)</option>
                </select>
                {selectedProductType && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {selectedProductType === 'private_office' && '✓ Variasi untuk Private Office telah ditambahkan (12 paket: 4/6/8 pax)'}
                      {selectedProductType === 'share_desk' && '✓ Variasi untuk Share Desk telah ditambahkan (1-9 jam, operasional 08:00-17:00 WIB)'}
                      {selectedProductType === 'private_room' && '✓ Variasi untuk Private Room telah ditambahkan (1-9 jam, operasional 08:00-17:00 WIB)'}
                      {selectedProductType === 'virtual_office' && '✓ Variasi untuk Virtual Office telah ditambahkan (15 paket: Bronze/Platinum/Gold/Diamond)'}
                    </p>
                    {selectedProductType === 'private_office' && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-medium text-blue-800">ℹ️ Info: Private Office Shared Inventory</p>
                        <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc list-inside">
                        <li><strong>Total 6 ruangan</strong> tersedia untuk SEMUA varian (4 pax / 6 pax / 8 pax)</li>
                        <li>Customer bebas memilih kapasitas dan durasi apapun selama masih ada ruangan tersedia</li>
                        <li>Contoh: 2 ruangan (4 pax), 2 ruangan (6 pax), 2 ruangan (8 pax) = 6 ruangan terpakai</li>
                          <li>Stok berkurang dari pool 6 ruangan yang sama, bukan per varian</li>
                        </ul>
                      </div>
                    )}                    {selectedProductType === 'virtual_office' && (
                      <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-md">
                        <p className="text-sm font-medium text-purple-800">ℹ️ Info: Virtual Office</p>
                        <ul className="text-xs text-purple-700 mt-1 space-y-1 list-disc list-inside">
                          <li><strong>Sewa alamat kantor</strong> dengan fasilitas penunjang usaha</li>
                          <li>Fasilitas: Alamat usaha Kaspa Space, penerimaan surat, meeting room, layanan bisnis, jasa PKP</li>
                          <li>Stok unlimited (999) karena berbasis virtual</li>
                          <li>Paket bundling tersedia: Platinum 12 bulan + PT Perorangan/PT/CV</li>
                        </ul>
                      </div>
                    )}                    {(selectedProductType === 'share_desk' || selectedProductType === 'private_room') && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm font-medium text-yellow-800">⚠️ Perhatian: Meeting Room Time-Based Booking</p>
                        <ul className="text-xs text-yellow-700 mt-1 space-y-1 list-disc list-inside">
                          <li>Share Desk dan Private Room menggunakan ruangan yang SAMA (1 ruangan dengan 8 meja)</li>
                          <li>Jika Private Room dipesan → semua 8 meja Share Desk tidak tersedia untuk waktu yang sama</li>
                          <li><strong>Stok otomatis kembali setelah durasi sewa berakhir</strong> (contoh: booking 1 jam → stok kembali setelah 1 jam)</li>
                          <li>Backend harus mengimplementasikan sistem scheduling untuk auto-recovery stok berdasarkan waktu</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Status radio buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Produk *</label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-active"
                    checked={data.is_active === true}
                    onChange={() => setData('is_active', true)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="status-active" className="ml-2 text-sm text-gray-700">Aktif</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-inactive"
                    checked={data.is_active === false}
                    onChange={() => setData('is_active', false)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="status-inactive" className="ml-2 text-sm text-gray-700">Tidak Aktif</label>
                </div>
              </div>
            </div>
          </div>

          {/* Product Variants */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Variasi Produk</h3>
                {data.category_id && categories.find(cat => cat.id == data.category_id)?.name === 'Coworking Space' && selectedProductType && (
                  <p className="text-sm text-gray-500 mt-1">
                    Variasi telah ditambahkan secara otomatis. Anda tinggal mengisi harga untuk setiap variasi.
                  </p>
                )}
              </div>
              {(!data.category_id || categories.find(cat => cat.id == data.category_id)?.name !== 'Coworking Space') && (
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Tambah Variasi
                </button>
              )}
            </div>

            <div className="space-y-4">
              {data.variants.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {data.category_id && categories.find(cat => cat.id == data.category_id)?.name === 'Coworking Space' ? (
                    'Pilih tipe produk untuk menambahkan variasi secara otomatis'
                  ) : (
                    'Belum ada variasi. Klik tombol "Tambah Variasi" untuk menambahkan.'
                  )}
                </div>
              )}
              {data.variants.map((variant, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Varian {index + 1}</h4>
                    {(!data.category_id || categories.find(cat => cat.id == data.category_id)?.name !== 'Coworking Space') && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nama Varian</label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        placeholder="Contoh: Ukuran L"
                        className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        readOnly={data.category_id && categories.find(cat => cat.id == data.category_id)?.name === 'Coworking Space'}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Harga <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        placeholder="100000"
                        min="0"
                        step="0.01"
                        className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Harga Asal</label>
                      <input
                        type="number"
                        value={variant.compare_price}
                        onChange={(e) => updateVariant(index, 'compare_price', e.target.value)}
                        placeholder="120000"
                        min="0"
                        step="0.01"
                        className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                      <input
                        type="text"
                        value={variant.sku || ''}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        placeholder="SKU123"
                        className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        readOnly={data.category_id && categories.find(cat => cat.id == data.category_id)?.name === 'Coworking Space'}
                      />
                    </div>
                  </div>
                  
                  {/* Stock management for Coworking Space */}
                  {data.category_id && categories.find(cat => cat.id == data.category_id)?.name === 'Coworking Space' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Stok Awal</label>
                          <input
                            type="number"
                            value={variant.stock_quantity}
                            onChange={(e) => updateVariant(index, 'stock_quantity', e.target.value)}
                            placeholder="0"
                            min="0"
                            className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="flex items-center pt-5">
                          <input
                            type="checkbox"
                            checked={variant.manage_stock}
                            onChange={(e) => updateVariant(index, 'manage_stock', e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-xs text-gray-700">Kelola stok</label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                      {selectedProductType === 'private_office' && '📦 PENTING: Semua varian berbagi 6 ruangan yang sama. Stok tidak dikelola per varian, tapi secara keseluruhan (total 6 ruangan untuk semua kapasitas 4/6/8 pax). Backend harus menghitung total ruangan terpakai dari semua varian.'}
                        {selectedProductType === 'share_desk' && '📦 Stok menunjukkan jumlah meja tersedia (maksimal 8). Stok kembali otomatis setelah durasi sewa selesai (contoh: booking 2 jam → stok kembali setelah 2 jam).'}
                        {selectedProductType === 'private_room' && '📦 Stok menunjukkan ketersediaan ruangan (1 = tersedia). Stok kembali otomatis setelah durasi sewa selesai (contoh: booking 3 jam → stok kembali setelah 3 jam).'}                      {selectedProductType === 'virtual_office' && '📦 Virtual Office berbasis virtual/digital sehingga stok unlimited (999). Tidak ada batasan fisik ruangan. Stok kembali setelah masa langganan berakhir.'}                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Options */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Info kustom</h3>

            <div className="space-y-4">
              {data.custom_options.map((option, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Pertanyaan {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeCustomOption(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Pertanyaan</label>
                      <input
                        type="text"
                        value={option.question}
                        onChange={(e) => updateCustomOption(index, 'question', e.target.value)}
                        className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={option.required}
                        onChange={(e) => updateCustomOption(index, 'required', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Wajib</label>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addCustomOption}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mx-auto mb-1" />
                Tambah Pertanyaan Kustom
              </button>
            </div>
          </div>

          {/* Product Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Produk terkait</h3>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.recommendations.length > 0}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      setData('recommendations', []);
                    }
                  }}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">Tampilkan produk terkait</label>
              </div>

              {data.recommendations.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih produk rekomendasi</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {allProducts && allProducts.map((prod) => (
                        <div key={prod.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={data.recommendations.includes(prod.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setData('recommendations', [...data.recommendations, prod.id]);
                              } else {
                                setData('recommendations', data.recommendations.filter(id => id !== prod.id));
                              }
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            {prod.title} ({prod.category?.name})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {processing ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductCreate;