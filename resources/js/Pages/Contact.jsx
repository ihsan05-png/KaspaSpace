import React, { useState } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { MapPinIcon, ClockIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import meetingRoomImage from '../../images/meeting-room1.jpg';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Kirim ke WhatsApp
        const message = `*Pesan dari Website Kaspa Space*\n\nNama: ${formData.name}\nEmail: ${formData.email}\nWhatsApp: ${formData.whatsapp}\n\nPesan:\n${formData.message}`;
        const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        
        setIsSubmitting(false);
        setSubmitStatus('success');
        
        // Reset form
        setFormData({
            name: '',
            email: '',
            whatsapp: '',
            message: ''
        });

        // Reset status setelah 3 detik
        setTimeout(() => {
            setSubmitStatus(null);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
            <Navbar />
            
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Kontak Kami
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Hubungi kami untuk mendapatkan informasi layanan atau kerjasama bisnis.
                    </p>
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div>
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                                    Kontak Kami
                                </h2>
                                <p className="text-slate-600 mb-8">
                                    Hubungi kami untuk mendapatkan informasi layanan atau kerjasama bisnis.
                                </p>

                                {submitStatus === 'success' && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-700 text-sm">
                                            Pesan berhasil dikirim! Kami akan menghubungi Anda segera.
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Nama */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama*
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Masukkan nama lengkap Anda"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email*
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Masukkan alamat email Anda"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>

                                    {/* WhatsApp */}
                                    <div>
                                        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                                            WhatsApp*
                                        </label>
                                        <input
                                            type="tel"
                                            id="whatsapp"
                                            name="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={handleChange}
                                            placeholder="Masukkan nomor WhatsApp Anda"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>

                                    {/* Pesan */}
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                            Pesan*
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Tuliskan pesan Anda di sini..."
                                            rows="5"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                            required
                                        ></textarea>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                                    </button>
                                </form>
                            </div>

                            {/* Contact Image */}
                            <div className="mt-8">
                                <img
                                    src={meetingRoomImage}
                                    alt="Kaspa Space Meeting Room"
                                    className="w-full h-64 object-cover rounded-2xl shadow-lg"
                                />
                            </div>
                        </div>

                        {/* Office Info & Map */}
                        <div className="space-y-8">
                            {/* Kantor Pusat */}
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                    Kantor Pusat
                                </h2>
                                <p className="text-slate-600 mb-8">
                                    Kaspa Space berada di sebelah barat Stadion Manahan Solo. Silakan jika ingin berkunjung untuk survei atau sewa kantor maupun sekedar berbincang tentang layanan kami.
                                </p>

                                <div className="space-y-6">
                                    {/* Alamat */}
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <MapPinIcon className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                Alamat Kantor Pusat
                                            </h3>
                                            <p className="text-gray-600">
                                                Kaspa Space - Jl. Adi Sucipto Blok I,<br />
                                                Manahan, Banjarsari, Surakarta, 57139.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Operasional */}
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <ClockIcon className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                Operasional
                                            </h3>
                                            <p className="text-gray-600">
                                                Senin - Sabtu, 08:00 - 17:00 WIB
                                            </p>
                                        </div>
                                    </div>

                                    {/* WhatsApp */}
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <PhoneIcon className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                WhatsApp
                                            </h3>
                                            <a href="https://wa.me/6281234567890" className="text-blue-600 hover:text-blue-700">
                                                +62 812 3456 7890
                                            </a>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                Email
                                            </h3>
                                            <a href="mailto:hello@kaspaspace.com" className="text-blue-600 hover:text-blue-700">
                                                hello@kaspaspace.com
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Google Maps */}
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.0821!2d110.7982496!3d-7.5543959!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a150836ddfc5f%3A0x6a0a0e823bb991f2!2sCoworking%20%26%20Virtual%20Office%20-%20Kaspa%20Space%20Manahan!5e0!3m2!1sen!2sid!4v1736326789123"
                                    width="100%"
                                    height="400"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Lokasi Kaspa Space"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;
