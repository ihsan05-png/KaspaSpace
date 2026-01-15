import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const ProductsEdit = ({ product, categories, allProducts }) => {
  const { data, setData, post, put, processing, errors } = useForm({
    title: product.title || '',
    subtitle: product.subtitle || '',
    description: product.description || '',
    promo_label: product.promo_label || '',
    base_price: product.base_price || '',
    category_id: product.category_id || '',
    is_active: product.is_active || true,
    existing_images: product.images || [],
    images: [],
    custom_options: product.custom_options || [],
    variants: product.variants || [],
    recommendations: product.recommended_products?.map(p => p.id) || [],
  });

  const [imagePreview, setImagePreview] = useState(product.images || []);
  const [newImages, setNewImages] = useState([]);

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
    
    console.log('Form submitted!');
    console.log('Processing:', processing);
    console.log('Data:', data);
    
    // Filter out empty custom options
    const validCustomOptions = data.custom_options.filter(option => 
      option.question && option.question.trim() !== ''
    );
    
    // Filter out empty variants
    const validVariants = data.variants.filter(variant => 
      variant.name && variant.name.trim() !== '' && variant.price
    );
    
    // Prepare form data
    const submitData = {
      title: data.title,
      subtitle: data.subtitle || '',
      description: data.description || '',
      promo_label: data.promo_label || '',
      base_price: data.base_price,
      category_id: data.category_id,
      is_active: data.is_active ? 1 : 0,
      existing_images: data.existing_images,
      custom_options: validCustomOptions,
      variants: validVariants,
      recommendations: data.recommendations,
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
      // No new images, use regular put
      put(route('admin.products.update', product.slug), {
        data: submitData,
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
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Dasar <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
              <input
                type="number"
                value={data.base_price}
                onChange={(e) => setData('base_price', e.target.value)}
                className="block w-full pl-8 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {errors.base_price && <p className="mt-1 text-sm text-red-600">{errors.base_price}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={data.category_id}
              onChange={(e) => setData('category_id', e.target.value)}
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
            <h3 className="text-lg font-medium text-gray-900">Variasi produk</h3>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Tambahkan variasi produk
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">Harga</label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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

        {/* Product Recommendations */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
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
                    {allProducts.map((prod) => (
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
                          {prod.title} ({prod.category.name})
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
