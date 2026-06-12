import React from "react";

const DipercayaKlien = () => {
    const clients = [
        // Baris 1
        { name: "SOFDøH Soft Sourdough", logo: "/images/client/sofdoh-holistik-wellnery-YrDJBX06EPhz1P8x.png" },
        { name: "Kindirga EduAccess", logo: "/images/client/kindirga-eduaccess-A1a5NrEMXaC84xqB.png" },
        { name: "ABI Insurance", logo: "/images/client/abi-insurance1-YBgbxy2VllHyraaZ.png" },
        { name: "Sevibu", logo: "/images/client/sevibu-m5KnbxQ7lRCzl9Dz.png" },
        { name: "VG Solusi", logo: "/images/client/pt-visioner-global-solusi-ALpPow6EePTzqDOg.png" },
        { name: "PT Makala Inovasi Digital", logo: "/images/client/pt-makala-inovasi-digital-mnlJ9zlQKVHgwq4L.png" },
        { name: "Sansan", logo: "/images/client/pt-sinergi-abadi-nusantara-YanJ19P19pcXwv59.png" },
        { name: "EDUGORILLA", logo: "/images/client/edugorilla-m7Vb3Kbk6lcMDx1l.png" },
        
        // Baris 2
        { name: "HSI", logo: "/images/client/hsi-A3Q76QQwvLTnoNaJ.png" },
        { name: "Codero Coding Robot", logo: "/images/client/codero-mk3vzODGzRi5y2KM.png" },
        { name: "Parakletos", logo: "/images/client/parakletos-praktek-psikolog-1-A85Eo9KoLacykMPZ.png" },
        { name: "U Can Speak", logo: "/images/client/u-can-speak1-KdfwtV5kE031HcKh.png" },
        { name: "PT Britta Buana Sakti", logo: "/images/client/pt-britta-buana-sakti-WLsASq9RbOzOMSNi.png" },
        { name: "Modena", logo: "/images/client/pt-modena-indonesia-hZdbfPcWdfwkzRBp.png" },
        { name: "Maxride", logo: "/images/client/pt-max-auto-indonesia-kpLOeKnQZ3RoLTnv.png" },
        { name: "Zilingo", logo: "/images/client/zilingo-2FPWxugXy26DYXgx.png" },
        
        // Baris 3
        { name: "Suara Merdeka", logo: "/images/client/pt-suara-merdeka-press1-jGlvCXGMlmBbZp7L.png" },
        { name: "ProWebSolution", logo: "/images/client/cv-pro-web-solution-BropyfeGf02P4agb.png" },
        { name: "The Kirimaya", logo: "/images/client/pt-the-kirimaya-asri-kCjzXTXx9a1VFD3t.png" },
        { name: "MIGUNANI Consulting", logo: "/images/client/migunani-consulting-5FpettRyzPzPEoCB.png" },
        
        // Previous clients from first screenshot
        { name: "Wind's Chemical Indonesia", logo: "/images/client/cv-winds-chemical-indonesia-FO2HlPnqgG7CUhtG.png" },
        { name: "KHPI", logo: "/images/client/pkhpi-ALp7LelErlU44vJN.png" },
        { name: "Pajak Smart", logo: "/images/client/pajak-smart-Yg2qXjX3aNILvJqb.png" },
        { name: "Sekolah Pajak", logo: "/images/client/cv-sekolah-pajak-A85Elek2nWs7nbr9.png" },
        { name: "Haramain", logo: "/images/client/haramain-university-WDQuPWLTONX1lS8F.png" },
        { name: "UNS", logo: "/images/client/uns-Pr6g8qWDF64s3rkf.png" },
        { name: "Prospect", logo: "/images/client/prospect-institute-YleqNWnOzqC3a9KV.png" },
        { name: "Nathan Thomas & Partners", logo: "/images/client/konsultan-pajak-nathan-thomas-YD0BgljKlghopR6X.png" },
        { name: "SSJ Software Development", logo: "/images/client/cv-solo-satu-jiwa-Yg2qXjLZPEU14Q6w.png" },
        { name: "Notarius INI", logo: "/images/client/notaris-kevin-virdiantor-A0x1KlWaQpH5EMJ5.png" },
        { name: "PT Bangun Sumberdaya", logo: "/images/client/pt-bangun-sumberdaya-mandiri-m7V5Z3klNNTpoON0.png" },
        { name: "Access", logo: "/images/client/pt-access-media-tour-YNqPoBJxqyUMVllp.png" },
        { name: "PT Lesa Digital Solusi", logo: "/images/client/pt-lesa-digital-solusi-1-mxBMvb2GBPSpMrBO.png" },
        { name: "STC", logo: "/images/client/pt-sanna-technology-consultant-2-YD0B1oQpN8uKplNE.png" },
        { name: "Mindset Psychology", logo: "/images/client/mindset-psychology-counseling1-A85VyZ0Wk7fZboO5.png" },
        { name: "UMS", logo: "/images/client/ums-1-YrDqnbxp5xt5Pa79.png" },
        { name: "Hilano LCZ Indonesia", logo: "/images/client/hilano-lcz-indonesia1-AGB22RPk57TV37GG.png" },
        { name: "PT Dewa Kimia", logo: "/images/client/pt-dewa-kimia-indonesia1-m5KMMR683liEkwVk.png" },
        { name: "Aizen", logo: "/images/client/aizen-indonesia1-tU4aNsJCQW87jKu0.png" },
        { name: "Karya Mandiri", logo: "/images/client/pt-san-karya-mandiri1-AQExxgvwPkf9y3we.png" },
        { name: "Arifin Masruri", logo: "/images/client/arifin-masruri-consulting1-AzGXxj0KV0hnw1P7.png" },
        { name: "Arlic", logo: "/images/client/arlic-indonesia-imsdcivzuPn7PxIQ.png" },
        { name: "Cembeliq Tech", logo: "/images/client/cembeliq-tech.-YBgbx86aKeigQlpr.png" },
        { name: "Drone Solo", logo: "/images/client/drone_solo-Aq2JXNxzPqhpeXPK.png" },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Dipercaya Banyak Klien
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Sejak berdiri pada Juni 2024, Kaspa Space sudah dipercaya oleh banyak
                        klien baik dalam negeri maupun luar negeri
                    </p>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-6 items-center justify-items-center">
                    {clients.map((client, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center p-3 bg-white rounded-lg hover:shadow-md transition-all duration-300"
                        >
                            <img
                                src={client.logo}
                                alt={client.name}
                                className="h-20 md:h-24 w-auto object-contain"
                            />
                        </div>
                    ))}
                    
                    {/* And More button */}
                    <div className="flex items-center justify-center p-3">
                        <div className="h-24 w-24 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-center">
                            <div>
                                <div className="text-sm">And</div>
                                <div className="text-lg font-bold">More</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DipercayaKlien;
