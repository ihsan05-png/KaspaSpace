import React from 'react';
import { MapPin, Clock } from 'lucide-react';

const KantorPusat = () => {
    return (
        <section className="py-16 px-4 bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Left Column - Text Content */}
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                            Kantor Pusat
                        </h2>
                        
                        <p className="text-gray-700 text-lg leading-relaxed">
                            Kaspa Space berada di sebelah barat Stadion Manahan Solo. 
                            Silakan jika ingin berkunjung untuk survei atau sewa kantor 
                            maupun sekedar berbincang tentang layanan kami.
                        </p>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Alamat Kantor Pusat</h3>
                                    <p className="text-gray-700">
                                        Coworking & Virtual Office - Kaspa Space Manahan,<br />
                                        Jl. Adi Sucipto No.Blok I, Manahan, Banjarsari,<br />
                                        Surakarta City, Central Java 57139
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Operasional</h3>
                                    <p className="text-gray-700">
                                        Senin - Sabtu, 08:00 - 17:00 WIB
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Map */}
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] md:h-[500px]">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.0821!2d110.7982496!3d-7.5543959!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a150836ddfc5f%3A0x6a0a0e823bb991f2!2sCoworking%20%26%20Virtual%20Office%20-%20Kaspa%20Space%20Manahan!5e0!3m2!1sen!2sid!4v1736326789123"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Kaspa Space Manahan Location"
                        ></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default KantorPusat;
