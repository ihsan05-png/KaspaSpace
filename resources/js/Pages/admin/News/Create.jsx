import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';

const NewsCreate = () => {
  const [imagePreview, setImagePreview] = useState(null);
  
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    type: 'news',
    excerpt: '',
    content: '',
    image: null,
    author: '',
    is_published: false,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.news.store'), {
      forceFormData: true,
    });
  };

  return (
    <AdminLayout title="Tambah Berita">
      <Head title="Tambah Berita" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link
            href={route('admin.news.index')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-3"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Tambah Berita</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Masukkan judul berita"
                    className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="news">News - Informasi ekonomi mikro dan makro</option>
                    <option value="blogs">Blogs - Tips, trik, dan produktivitas</option>
                  </select>
                  {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penulis
                  </label>
                  <input
                    type="text"
                    value={data.author}
                    onChange={(e) => setData('author', e.target.value)}
                    placeholder="Nama penulis"
                    className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.author && <p className="mt-1 text-sm text-red-600">{errors.author}</p>}
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ringkasan
                  </label>
                  <textarea
                    value={data.excerpt}
                    onChange={(e) => setData('excerpt', e.target.value)}
                    placeholder="Ringkasan singkat berita"
                    rows={3}
                    className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.excerpt && <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konten <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                    placeholder="Tulis konten berita lengkap di sini..."
                    rows={12}
                    className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gambar
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="mb-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="mx-auto h-48 w-auto object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setData('image', null);
                            }}
                            className="mt-2 text-sm text-red-600 hover:text-red-700"
                          >
                            Hapus Gambar
                          </button>
                        </div>
                      ) : (
                        <>
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                              <span>Upload gambar</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                            <p className="pl-1">atau drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF sampai 2MB</p>
                        </>
                      )}
                    </div>
                  </div>
                  {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                </div>

                {/* Publish Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.is_published}
                    onChange={(e) => setData('is_published', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Publikasikan berita sekarang
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <Link
                  href={route('admin.news.index')}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {processing ? 'Menyimpan...' : 'Simpan Berita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewsCreate;
