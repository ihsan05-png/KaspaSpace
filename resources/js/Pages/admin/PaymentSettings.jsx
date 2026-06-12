import { useState } from 'react';
import { router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    QrCode,
    Building2,
    Upload,
    Save,
    CheckCircle,
    AlertCircle,
    Image as ImageIcon,
    Percent,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';

export default function AdminPaymentSettings({
    settings = {
        qris_image: '/storage/qris-default.png',
        bank_name: 'Bank BCA',
        account_number: '1234567890',
        account_name: 'PT Toko Kita',
        open_time: '08:00',
        close_time: '17:00',
        ppn_enabled: true,
        ppn_rate: 11,
    }
}) {
    const [formData, setFormData] = useState({
        bank_name: settings.bank_name || '',
        account_number: settings.account_number || '',
        account_name: settings.account_name || ''
    });

    // PPN
    const [ppn, setPpn] = useState({
        ppn_enabled: settings.ppn_enabled ?? true,
        ppn_rate:    settings.ppn_rate    ?? 11,
    });
    const [ppnSaving, setPpnSaving] = useState(false);
    const [ppnMsg,    setPpnMsg]    = useState(null);

    const handleSavePpn = (e) => {
        e.preventDefault();
        setPpnSaving(true);
        setPpnMsg(null);
        router.post('/admin/paymentsettings/ppn', {
            ppn_enabled: ppn.ppn_enabled,
            ppn_rate:    Number(ppn.ppn_rate),
        }, {
            onSuccess: () => {
                setPpnSaving(false);
                setPpnMsg({ ok: true, text: 'Pengaturan PPN berhasil disimpan!' });
                setTimeout(() => setPpnMsg(null), 3000);
            },
            onError: (errs) => {
                setPpnSaving(false);
                setPpnMsg({ ok: false, text: Object.values(errs)[0] || 'Gagal menyimpan' });
            },
        });
    };

    const [qrisImage, setQrisImage] = useState(settings.qris_image);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    qris_image: 'Ukuran file maksimal 2MB'
                }));
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
            
            if (errors.qris_image) {
                setErrors(prev => ({
                    ...prev,
                    qris_image: null
                }));
            }
        }
    };

    const handleSaveBankSettings = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMessage('');

        router.post('/admin/paymentsettings/bank', formData, {
            onSuccess: () => {
                setIsSaving(false);
                setSuccessMessage('Pengaturan bank berhasil disimpan!');
                setTimeout(() => setSuccessMessage(''), 3000);
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSaving(false);
            }
        });
    };

    const handleUploadQris = () => {
        if (!selectedFile) return;

        setIsSaving(true);
        setSuccessMessage('');
        
        const uploadData = new FormData();
        uploadData.append('qris_image', selectedFile);
        uploadData.append('_method', 'POST');

        router.post('/admin/paymentsettings/qris', uploadData, {
            onSuccess: () => {
                setIsSaving(false);
                setQrisImage(previewUrl);
                setSelectedFile(null);
                setPreviewUrl(null);
                setSuccessMessage('QR Code berhasil diupload!');
                setTimeout(() => setSuccessMessage(''), 3000);
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSaving(false);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan Pembayaran" />
            
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan Pembayaran</h1>
                <p className="text-gray-600">Kelola metode pembayaran untuk toko Anda</p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-medium">{successMessage}</p>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                {/* QRIS Settings */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <QrCode className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">QR Code QRIS</h2>
                            <p className="text-sm text-gray-600">Upload QR Code untuk pembayaran QRIS</p>
                        </div>
                    </div>

                    {/* Current QRIS */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            QR Code Saat Ini
                        </label>
                        <div className="bg-gray-50 p-6 rounded-xl">
                            {qrisImage ? (
                                <img
                                    src={qrisImage}
                                    alt="QRIS Code"
                                    className="w-64 h-64 mx-auto object-contain"
                                />
                            ) : (
                                <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm">Belum ada QR Code</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload New QRIS */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Upload QR Code Baru
                        </label>
                        
                        {!previewUrl ? (
                            <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition">
                                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                                <p className="text-gray-600 font-medium mb-1">
                                    Klik untuk upload QR Code
                                </p>
                                <p className="text-sm text-gray-500">
                                    PNG, JPG atau JPEG (Max. 2MB)
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div>
                                <div className="relative bg-gray-50 p-4 rounded-xl">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-48 h-48 mx-auto object-contain"
                                    />
                                    <button
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                                
                                <button
                                    onClick={handleUploadQris}
                                    disabled={isSaving}
                                    className="w-full mt-4 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Mengupload...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Simpan QR Code
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                        
                        {errors.qris_image && (
                            <p className="text-red-500 text-sm mt-2">{errors.qris_image}</p>
                        )}
                    </div>

                    <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-purple-800">
                                <p className="font-semibold mb-1">Tips:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Pastikan QR Code dapat di-scan dengan jelas</li>
                                    <li>Gunakan gambar berkualitas tinggi</li>
                                    <li>Ukuran file maksimal 2MB</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bank Transfer Settings */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Rekening Bank</h2>
                            <p className="text-sm text-gray-600">Pengaturan untuk transfer bank</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* Bank Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Bank <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="bank_name"
                                value={formData.bank_name}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                                    errors.bank_name ? 'border-red-500' : 'border-gray-200'
                                }`}
                                placeholder="Contoh: Bank BCA"
                            />
                            {errors.bank_name && (
                                <p className="text-red-500 text-sm mt-1">{errors.bank_name}</p>
                            )}
                        </div>

                        {/* Account Number */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nomor Rekening <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="account_number"
                                value={formData.account_number}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                                    errors.account_number ? 'border-red-500' : 'border-gray-200'
                                }`}
                                placeholder="Contoh: 1234567890"
                            />
                            {errors.account_number && (
                                <p className="text-red-500 text-sm mt-1">{errors.account_number}</p>
                            )}
                        </div>

                        {/* Account Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Atas Nama <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="account_name"
                                value={formData.account_name}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                                    errors.account_name ? 'border-red-500' : 'border-gray-200'
                                }`}
                                placeholder="Contoh: PT Toko Kita"
                            />
                            {errors.account_name && (
                                <p className="text-red-500 text-sm mt-1">{errors.account_name}</p>
                            )}
                        </div>

                        <button
                            onClick={handleSaveBankSettings}
                            disabled={isSaving}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Simpan Pengaturan Bank
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Catatan:</p>
                                <p>Informasi rekening ini akan ditampilkan kepada pelanggan yang memilih metode pembayaran transfer bank.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PPN / Pajak */}
            <div className="mt-6 bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Percent className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Pajak PPN</h2>
                        <p className="text-sm text-gray-600">Aktifkan atau nonaktifkan PPN pada setiap transaksi</p>
                    </div>
                </div>

                {ppnMsg && (
                    <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${ppnMsg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {ppnMsg.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {ppnMsg.text}
                    </div>
                )}

                <form onSubmit={handleSavePpn} className="space-y-5">
                    {/* Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                            <p className="font-semibold text-gray-800">Status PPN</p>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {ppn.ppn_enabled ? 'PPN aktif — akan dikenakan pada setiap transaksi' : 'PPN nonaktif — tidak ada pajak yang dikenakan'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setPpn(prev => ({ ...prev, ppn_enabled: !prev.ppn_enabled }))}
                            className="flex items-center gap-2 transition-colors"
                        >
                            {ppn.ppn_enabled
                                ? <ToggleRight className="w-12 h-12 text-indigo-600" />
                                : <ToggleLeft  className="w-12 h-12 text-gray-400" />}
                        </button>
                    </div>

                    {/* Rate */}
                    {ppn.ppn_enabled && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tarif PPN (%) <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={ppn.ppn_rate}
                                    onChange={e => setPpn(prev => ({ ...prev, ppn_rate: e.target.value }))}
                                    className="w-32 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 font-bold text-lg"
                                    required
                                />
                                <span className="text-gray-500 font-medium">%</span>
                                <span className="text-sm text-gray-400">
                                    (Indonesia: 11% — berlaku sejak April 2022)
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={ppnSaving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                        <Save className="w-4 h-4" />
                        {ppnSaving ? 'Menyimpan...' : 'Simpan Pengaturan PPN'}
                    </button>
                </form>
            </div>

            {/* Preview Section */}
            <div className="mt-6 bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Preview untuk Pelanggan</h2>
                <p className="text-gray-600 mb-6">Berikut tampilan yang akan dilihat pelanggan:</p>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* QRIS Preview */}
                    <div className="border-2 border-gray-200 rounded-xl p-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full mb-4">
                            <QrCode className="w-5 h-5" />
                            <span className="font-semibold">Pembayaran QRIS</span>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-xl mb-4">
                            {qrisImage ? (
                                <img 
                                    src={qrisImage} 
                                    alt="QRIS Preview" 
                                    className="w-48 h-48 mx-auto object-contain"
                                />
                            ) : (
                                <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-500 text-sm">Belum ada QR Code</p>
                                </div>
                            )}
                        </div>
                        
                        <p className="text-sm text-gray-600 text-center">
                            📱 Scan QR Code menggunakan aplikasi e-wallet
                        </p>
                    </div>

                    {/* Bank Transfer Preview */}
                    <div className="border-2 border-gray-200 rounded-xl p-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
                            <Building2 className="w-5 h-5" />
                            <span className="font-semibold">Transfer Bank</span>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Nama Bank</p>
                                <p className="font-bold text-gray-900">
                                    {formData.bank_name || 'Belum diisi'}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Nomor Rekening</p>
                                <p className="font-bold text-gray-900">
                                    {formData.account_number || 'Belum diisi'}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Atas Nama</p>
                                <p className="font-bold text-gray-900">
                                    {formData.account_name || 'Belum diisi'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}