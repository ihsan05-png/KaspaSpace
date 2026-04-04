import React, { useState } from 'react';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const ProductsEdit = ({ product, categories, rooms = [], productRoomIds = [], unitAssignments: initialUnitAssignments = {} }) => {
  const { data, setData, post, processing, errors } = useForm({
    title: product.title || '',
    subtitle: product.subtitle || '',
    description: product.description || '',
    promo_label: product.promo_label || '',
    base_price: product.base_price || '',
    category_id: product.category_id || '',
    product_type: product.product_type || '',
    is_active: product.is_active || true,
    existing_images: product.images || [],
    images: [],
    custom_options: product.custom_options || [],
    variants: (product.variants || []).map(v => ({
      ...v,
      name: v.name ? v.name.replace(/\s*\(Full Day[^)]*\)/gi, '').trim() : v.name,
    })),
    recommendations: product.recommended_products?.map(p => p.id) || [],
    room_ids: productRoomIds,
    unit_assignments: initialUnitAssignments, // { roomId: [unitIndices] }
  });

  const [imagePreview, setImagePreview] = useState(product.images || []);
  const [newImages, setNewImages] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState(product.product_type || '');

  const { operationalHours } = usePage().props;
  const OPEN  = operationalHours?.open  || '08:00';
  const CLOSE = operationalHours?.close || '17:00';
  // Use per-product hours if saved, otherwise fall back to global setting
  const [localOpen, setLocalOpen] = useState(product.open_time || OPEN);
  const [localClose, setLocalClose] = useState(product.close_time || CLOSE);
  const localMaxHours = Math.max(1, parseInt(localClose.split(':')[0], 10) - parseInt(localOpen.split(':')[0], 10));

  // Generate hourly variants based on custom operational hours
  const generateHourlyVariants = (type, open, close) => {
    const oH = parseInt(open.split(':')[0], 10);
    const cH = parseInt(close.split(':')[0], 10);
    const maxH = Math.max(1, cH - oH);

    if (type === 'meeting_room') {
      const packages = [
        { label: 'Basic',    sku: 'MR-B' },
        { label: 'Standard', sku: 'MR-S' },
        { label: 'Plus',     sku: 'MR-P' },
      ];
      const variants = [];
      let order = 1;
      packages.forEach(pkg => {
        for (let i = 1; i <= maxH; i++) {
          variants.push({
            name: `${pkg.label} ${i} Jam`,
            price: '',
            compare_price: '',
            stock_quantity: 1,
            manage_stock: true,
            sku: `${pkg.sku}-${i}H`,
            duration_hours: i,
            sort_order: order++,
          });
        }
      });
      return variants;
    }

    const prefix = type === 'share_desk' ? 'SD' : 'PR';
    const stock  = type === 'share_desk' ? 8 : 1;
    return Array.from({ length: maxH }, (_, i) => ({
      name: `${i + 1} Jam`,
      price: '',
      compare_price: '',
      stock_quantity: stock,
      manage_stock: true,
      sku: `${prefix}-${i + 1}H`,
      duration_hours: i + 1,
      sort_order: i + 1,
    }));
  };

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

    const selectedCategory = categories.find(cat => cat.id == categoryId);
    const hasExistingVariants = data.variants.some(v => v.id);

    if (selectedCategory && selectedCategory.name === 'Coworking Space') {
      // Keep existing product_type and variants if they have DB IDs
      if (!hasExistingVariants) {
        setSelectedProductType('');
        setData('product_type', '');
      }
    } else {
      setSelectedProductType('');
      setData('product_type', '');
      // Only clear variants if they don't have DB IDs
      if (!hasExistingVariants) {
        setData('variants', []);
      }
    }
  };

  // Handler untuk memilih tipe produk di Coworking Space
  const handleProductTypeChange = (productType) => {
    setSelectedProductType(productType);
    setData('product_type', productType);

    // Only replace variants with templates if current variants don't have database IDs
    // (i.e., they are new/unsaved variants). If variants already have IDs, keep them.
    const hasExistingVariants = data.variants.some(v => v.id);
    if (hasExistingVariants) {
      return; // Keep existing DB variants, only update product_type
    }

    // Set variasi berdasarkan tipe produk
    if (productType === 'private_office') {
      setData('variants', [...privateOfficeVariants]);
    } else if (productType === 'share_desk') {
      setLocalOpen(OPEN);
      setLocalClose(CLOSE);
      setData('variants', generateHourlyVariants('share_desk', OPEN, CLOSE));
    } else if (productType === 'private_room') {
      setLocalOpen(OPEN);
      setLocalClose(CLOSE);
      setData('variants', generateHourlyVariants('private_room', OPEN, CLOSE));
    } else if (productType === 'meeting_room') {
      setLocalOpen(OPEN);
      setLocalClose(CLOSE);
      setData('variants', generateHourlyVariants('meeting_room', OPEN, CLOSE));
    } else if (productType === 'virtual_office') {
      setData('variants', [...virtualOfficeVariants]);
    }
  };

  const handleLocalHoursChange = (newOpen, newClose) => {
    setLocalOpen(newOpen);
    setLocalClose(newClose);
    if (['share_desk', 'private_room', 'meeting_room'].includes(selectedProductType)) {
      const oH = parseInt(newOpen.split(':')[0], 10);
      const cH = parseInt(newClose.split(':')[0], 10);
      const newMaxH = Math.max(1, cH - oH);
      const prefix = selectedProductType === 'share_desk' ? 'SD' : selectedProductType === 'meeting_room' ? 'MR' : 'PR';
      const defaultStock = selectedProductType === 'share_desk' ? 8 : 1;

      // Smart merge: preserve existing data where hours still fit, add new slots
      const newVariants = Array.from({ length: newMaxH }, (_, i) => {
        const h = i + 1;
        const existing = data.variants.find(v => Number(v.duration_hours) === h);
        if (existing) return {
          ...existing,
          sort_order: h,
          name: existing.name ? existing.name.replace(/\s*\(Full Day[^)]*\)/gi, '').trim() : existing.name,
        }; // keep with saved price & id, update sort_order, clean up name
        return {
          name: `${h} Jam`,
          price: '',
          compare_price: '',
          stock_quantity: defaultStock,
          manage_stock: true,
          sku: `${prefix}-${h}H`,
          duration_hours: h,
          sort_order: h,
        };
      });
      setData('variants', newVariants);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Add new files to state
    const updatedImages = [...data.images, ...files];
    setData('images', updatedImages);
    
    // Create preview URLs for new images
    const newPreviews = [...imagePreview];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newPreviews.push(event.target.result);
        setImagePreview([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
    
    // Track new images separately
    setNewImages(prev => [...prev, ...files]);
    
    // Clear input
    e.target.value = '';
  };

  const removeExistingImage = (index) => {
    // Check if this is an existing image or new upload
    const isExistingImage = index < data.existing_images.length;
    
    if (isExistingImage) {
      // Remove from existing images
      const newExistingImages = data.existing_images.filter((_, i) => i !== index);
      setData('existing_images', newExistingImages);
    } else {
      // Remove from new images
      const newImageIndex = index - data.existing_images.length;
      const updatedNewImages = data.images.filter((_, i) => i !== newImageIndex);
      setData('images', updatedNewImages);
      setNewImages(prev => prev.filter((_, i) => i !== newImageIndex));
    }
    
    // Remove from preview
    const newPreviews = imagePreview.filter((_, i) => i !== index);
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
    const isHourly = ['share_desk', 'private_room', 'meeting_room'].includes(selectedProductType);

    if (isHourly) {
      const maxHours = data.variants.reduce((max, v) => Math.max(max, Number(v.duration_hours) || 0), 0);
      const nextHours = maxHours + 1;
      const prefix = selectedProductType === 'share_desk' ? 'SD' : selectedProductType === 'meeting_room' ? 'MR' : 'PR';
      const defaultStock = selectedProductType === 'share_desk' ? 8 : 1;
      setData('variants', [...data.variants, {
        name: `${nextHours} Jam`,
        price: '',
        compare_price: '',
        stock_quantity: defaultStock,
        manage_stock: true,
        sku: `${prefix}-${nextHours}H`,
        duration_hours: nextHours,
        sort_order: nextHours,
      }]);
    } else {
      setData('variants', [...data.variants, {
        name: '',
        price: '',
        compare_price: '',
        stock_quantity: 0,
        manage_stock: false,
        attributes: {},
        sku: ''
      }]);
    }
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
    
    console.log('Form submitted!');
    console.log('Processing:', processing);
    console.log('Data:', data);
    
    // Filter out empty custom options
    const validCustomOptions = data.custom_options.filter(option => 
      option.question && option.question.trim() !== ''
    );
    
    // Check for named variants missing a price (auto-generated slots often have empty price)
    const variantsWithoutPrice = data.variants.filter(variant =>
      variant.name && variant.name.trim() !== '' && !variant.price && variant.price !== 0
    );
    if (variantsWithoutPrice.length > 0) {
      alert(`Harap isi harga untuk varian: ${variantsWithoutPrice.map(v => v.name).join(', ')}`);
      return;
    }

    // Filter out completely empty variants (no name)
    const validVariants = data.variants.filter(variant =>
      variant.name && variant.name.trim() !== ''
    );
    
    // Prepare form data
    const submitData = {
      title: data.title,
      subtitle: data.subtitle || '',
      description: data.description || '',
      promo_label: data.promo_label || '',
      base_price: data.base_price,
      category_id: data.category_id,
      product_type: data.product_type || '',
      open_time: localOpen || null,
      close_time: localClose || null,
      is_active: data.is_active ? 1 : 0,
      existing_images: data.existing_images,
      custom_options: validCustomOptions,
      variants: validVariants,
      recommendations: data.recommendations,
      room_ids: data.room_ids,
    };
    
    console.log('Submit data:', submitData);
    
    // If there are new images, use FormData via Inertia (let Inertia handle array encoding)
    if (data.images.length > 0) {
      console.log('Using FormData with images:', data.images.length);
      router.post(route('admin.products.update', product.slug), {
        ...submitData,
        images: data.images,
        _method: 'PUT',
      }, {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => {
          console.log('Update successful!');
        },
        onError: (errors) => {
          console.error('Update failed:', errors);
        },
      });
    } else {
      console.log('Using regular PUT request');
      // No new images, use router.put with submitData directly
      router.put(route('admin.products.update', product.slug), submitData, {
        preserveScroll: true,
        onSuccess: () => {
          console.log('Update successful!');
        },
        onError: (errors) => {
          console.error('Update failed:', errors);
        },
      });
    }
  };

  return (
    <AdminLayout title={`Edit Produk: ${product.title}`}>
      <Head title={`Edit Produk: ${product.title}`} />
      
      <form onSubmit={handleSubmit}>
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
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Edit Produk</h1>
              <p className="text-sm text-gray-500 mt-1">{product.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={data.is_active ? 'active' : 'draft'}
              onChange={(e) => setData('is_active', e.target.value === 'active')}
              className="block text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="active">Ditampilkan</option>
              <option value="draft">Disembunyikan</option>
            </select>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Produk</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
            {imagePreview.map((preview, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={typeof preview === 'string' && preview.startsWith('data:') 
                    ? preview 
                    : `/storage/${preview}`
                  }
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
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
                <span className="mt-2 text-sm text-gray-500">Tambahkan Media</span>
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
        <div className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
              className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
              className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={8}
              className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            {['share_desk', 'private_room', 'meeting_room'].includes(selectedProductType) && (
              <p className="mt-2 text-xs text-gray-500 italic">
                💡 Tips: Jelaskan fasilitas ruangan dan jam operasional {localOpen}-{localClose} WIB
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
                <option value="share_desk">Share Desk - Meeting Room (sewa per meja)</option>
                <option value="private_room">Private Room - Meeting Room (sewa seluruh ruangan)</option>
                <option value="meeting_room">Meeting Room (sewa ruangan rapat per jam)</option>
                <option value="virtual_office">Virtual Office (sewa alamat kantor + fasilitas)</option>
              </select>
              {selectedProductType && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {selectedProductType === 'private_office' && '✓ Variasi untuk Private Office telah ditambahkan (12 paket: 4/6/8 pax)'}
                    {selectedProductType === 'share_desk' && `✓ Variasi untuk Share Desk telah ditambahkan (1-${localMaxHours} jam, operasional ${localOpen}-${localClose} WIB)`}
                    {selectedProductType === 'private_room' && `✓ Variasi untuk Private Room telah ditambahkan (1-${localMaxHours} jam, operasional ${localOpen}-${localClose} WIB)`}
                    {selectedProductType === 'meeting_room' && `✓ Variasi Meeting Room: Basic/Standard/Plus × 1-${localMaxHours} jam (total ${localMaxHours * 3} varian, operasional ${localOpen}-${localClose} WIB)`}
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
                  )}
                  {selectedProductType === 'virtual_office' && (
                    <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-md">
                      <p className="text-sm font-medium text-purple-800">ℹ️ Info: Virtual Office</p>
                      <ul className="text-xs text-purple-700 mt-1 space-y-1 list-disc list-inside">
                        <li><strong>Sewa alamat kantor</strong> dengan fasilitas penunjang usaha</li>
                        <li>Fasilitas: Alamat usaha Kaspa Space, penerimaan surat, meeting room, layanan bisnis, jasa PKP</li>
                        <li>Stok unlimited (999) karena berbasis virtual</li>
                        <li>Paket bundling tersedia: Platinum 12 bulan + PT Perorangan/PT/CV</li>
                      </ul>
                    </div>
                  )}
                  {(['share_desk', 'private_room', 'meeting_room'].includes(selectedProductType)) && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm font-medium text-yellow-800">⚠️ Perhatian: Coworking Time-Based Booking</p>
                      <ul className="text-xs text-yellow-700 mt-1 space-y-1 list-disc list-inside">
                        <li>Share Desk dan Private Room bisa berbagi ruangan fisik yang sama</li>
                        <li>Jika Private Room dipesan → semua meja Share Desk di ruangan yang sama tidak tersedia</li>
                        <li><strong>Stok otomatis kembali setelah durasi sewa berakhir</strong></li>
                        <li>Assign ruangan di menu <strong>Manajemen Ruangan</strong> untuk mengaktifkan cross-blocking</li>
                      </ul>
                    </div>
                  )}
                  {selectedProductType === 'meeting_room' && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-sm font-medium text-amber-800">ℹ️ Info: Meeting Room</p>
                      <ul className="text-xs text-amber-700 mt-1 space-y-1 list-disc list-inside">
                        <li>Sewa <strong>1 ruangan rapat eksklusif</strong> per jam</li>
                        <li>Ruangan terpisah dari Share Desk / Private Room</li>
                        <li>Assign ruangan di menu <strong>Manajemen Ruangan</strong> setelah produk disimpan</li>
                        <li>Stok otomatis kembali setelah durasi sewa berakhir</li>
                      </ul>
                    </div>
                  )}
                  {(['share_desk', 'private_room', 'meeting_room'].includes(selectedProductType)) && (
                    <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                      <p className="text-xs font-semibold text-indigo-800 mb-2">⏰ Jam Operasional Produk Ini</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-indigo-700 mb-1">Jam Buka</label>
                          <input
                            type="time"
                            value={localOpen}
                            onChange={(e) => handleLocalHoursChange(e.target.value, localClose)}
                            className="block w-full text-sm border-indigo-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-indigo-700 mb-1">Jam Tutup</label>
                          <input
                            type="time"
                            value={localClose}
                            onChange={(e) => handleLocalHoursChange(localOpen, e.target.value)}
                            className="block w-full text-sm border-indigo-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-indigo-600 mt-2">
                        {data.variants.some(v => v.id)
                          ? `Produk sudah tersimpan — ubah jam tidak mereset varian. Gunakan tombol "+" untuk menambah jam baru.`
                          : `Varian jam otomatis diperbarui: ${localMaxHours} varian (1 Jam – ${localMaxHours} Jam)`
                        }
                      </p>
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
                  id="edit-status-active"
                  checked={data.is_active === true}
                  onChange={() => setData('is_active', true)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="edit-status-active" className="ml-2 text-sm text-gray-700">Aktif</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="edit-status-inactive"
                  checked={data.is_active === false}
                  onChange={() => setData('is_active', false)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="edit-status-inactive" className="ml-2 text-sm text-gray-700">Tidak Aktif</label>
              </div>
            </div>
          </div>
        </div>

        {/* Product Variants */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Variasi produk</h3>
              {data.category_id && categories.find(cat => cat.id == data.category_id)?.name === 'Coworking Space' && selectedProductType && (
                <p className="text-sm text-gray-500 mt-1">
                  Variasi telah ditambahkan secara otomatis. Anda tinggal mengisi harga untuk setiap variasi.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Tambah varian
            </button>
          </div>

          <div className="space-y-4">
            {data.variants.map((variant, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Varian {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Varian</label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Harga <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
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
                      className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      value={variant.sku || ''}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                {/* Jumlah unit ruangan — hanya di varian pertama private_office */}
                {selectedProductType === 'private_office' && index === 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Jumlah Unit Ruangan</label>
                      <input
                        type="number"
                        value={variant.stock_quantity}
                        onChange={(e) => updateVariant(index, 'stock_quantity', e.target.value)}
                        placeholder="0"
                        min="1"
                        className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">📦 Total unit ruangan tersedia untuk semua varian (Room 1, Room 2, dst. di monitoring).</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Custom Options */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
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


        {/* Room Assignment */}
        {['share_desk', 'private_room', 'meeting_room', 'private_office'].includes(data.product_type) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Penugasan Ruangan</h2>
              <Link href="/admin/rooms" className="text-xs text-indigo-600 hover:underline">Kelola Ruangan →</Link>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Produk yang berbagi ruangan yang sama akan saling mengunci slot waktu.
            </p>
            {rooms.length === 0 ? (
              <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3">
                Belum ada ruangan. <Link href="/admin/rooms" className="underline font-medium">Buat ruangan di halaman Ruangan</Link>, lalu kembali ke sini untuk menugaskan.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {rooms.map((room) => {
                  const unitCount = room.unit_count ?? 1;
                  const unitNames = room.unit_names ?? [];
                  const isMulti = unitCount > 1;
                  const selectedUnits = data.unit_assignments[room.id] ?? [];

                  if (isMulti) {
                    const allSelected = selectedUnits.length === unitCount;
                    const someSelected = selectedUnits.length > 0 && !allSelected;
                    return (
                      <div key={room.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={el => { if (el) el.indeterminate = someSelected; }}
                            onChange={(e) => {
                              const all = e.target.checked ? Array.from({length: unitCount}, (_, i) => i) : [];
                              setData('unit_assignments', {...data.unit_assignments, [room.id]: all});
                            }}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-800">
                            {room.name}
                            <span className="text-gray-400 font-normal ml-1">({unitCount} unit)</span>
                            {room.is_active === false && <span className="ml-1 text-xs text-red-500">(Nonaktif)</span>}
                          </span>
                        </div>
                        <div className="ml-6 grid grid-cols-2 gap-1">
                          {Array.from({length: unitCount}, (_, i) => {
                            const unitName = unitNames[i] || `Unit ${i + 1}`;
                            const checked = selectedUnits.includes(i);
                            return (
                              <label key={i} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    const next = e.target.checked
                                      ? [...selectedUnits, i]
                                      : selectedUnits.filter(u => u !== i);
                                    setData('unit_assignments', {...data.unit_assignments, [room.id]: next});
                                  }}
                                  className="h-3.5 w-3.5 text-indigo-600 border-gray-300 rounded"
                                />
                                <span className="text-xs text-gray-700">{unitName}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={room.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`room-${room.id}`}
                        checked={data.room_ids.includes(room.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setData('room_ids', [...data.room_ids, room.id]);
                          } else {
                            setData('room_ids', data.room_ids.filter(id => id !== room.id));
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`room-${room.id}`} className="ml-2 text-sm text-gray-700">
                        {room.name}
                        <span className="text-gray-400 ml-1">(1 unit · {room.capacity} meja/unit)</span>
                        {room.is_active === false && <span className="ml-1 text-xs text-red-500">(Nonaktif)</span>}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
            {errors.room_ids && <p className="mt-1 text-sm text-red-600">{errors.room_ids}</p>}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-between pt-6">
          <button
            type="button"
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                // Handle delete - you may want to use router.delete here
                window.location.href = route('admin.products.destroy', product.slug);
              }
            }}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Hapus Produk
          </button>
          
          <div className="flex items-center space-x-3">
            <Link
              href={route('admin.products.index')}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors inline-block text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {processing ? 'Menyimpan...' : 'Update Produk'}
            </button>
          </div>
        </div>
      </div>
      </form>
    </AdminLayout>
  );
};

export default ProductsEdit;
