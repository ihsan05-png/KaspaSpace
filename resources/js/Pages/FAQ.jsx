import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqData = [
        {
            question: "Lokasi Kaspa Space di mana?",
            answer: "Saat ini Kaspa Space ada di Kota Surakarta dan Surabaya. Kami terus berupaya menambah lokasi untuk memberikan layanan yang merata."
        },
        {
            question: "Virtual Office apakah bisa PKP?",
            answer: "Tentu bisa. Kami akan membantu Anda mengurus PKP sampai jadi. Dapatkan diskon harga sesuai paket yang diambil."
        },
        {
            question: "Bisa berkunjung ke kantor Pusat?",
            answer: "Anda dapat mengunjungi Kaspa Space Surakarta di hari kerja Senin sampai Sabtu, pukul 08:00 sampai 17:00 WIB."
        },
        {
            question: "Apa produk utama Kaspa Space?",
            answer: "Private office, coworking space, meeting room, virtual office, legalitas usaha, dan back office."
        },
        {
            question: "Cara reservasi dan pemesanan?",
            answer: "Produk dan layanan kami dapat dipesan secara online lewat website. Jangan khawatir jika Anda bingung, kami siap membantu."
        }
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-16 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-left">
                    FAQ
                </h2>
                
                <div className="space-y-4">
                    {faqData.map((faq, index) => (
                        <div 
                            key={index}
                            className="border-b border-gray-200 pb-4"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex justify-between items-start text-left py-4 focus:outline-none group"
                            >
                                <h3 className="text-xl font-semibold text-gray-900 pr-8">
                                    {faq.question}
                                </h3>
                                {openIndex === index ? (
                                    <ChevronUp className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                ) : (
                                    <ChevronDown className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                )}
                            </button>
                            
                            {openIndex === index && (
                                <div className="pb-4 text-gray-600 text-base leading-relaxed animate-fadeIn">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
