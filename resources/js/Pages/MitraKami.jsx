import React from "react";

const MitraKami = () => {
    const partners = [
        { name: "NETHUB", logo: "/images/mitrakami/nethub-IXNqM20ZbCUl4JQ3.png" },
        { name: "Rentfix", logo: "/images/mitrakami/rentfix-mp8qoMR51QS1pnpO.png" },
        { name: "Notaris Kevin", logo: "/images/mitrakami/notaris-kevin-virdiantor-A0x1KlWaQpH5EMJ5.png" },
        { name: "xwork", logo: "/images/mitrakami/xwork-YNqPoXz47Gc1M8Qg.png" },
        { name: "BRI", logo: "/images/mitrakami/bri1-Yyv0G1zVDRtP9Mn0.png" },
        { name: "Faberhost", logo: "/images/mitrakami/faberhost-ToQGrygy1QtGX67q.png" },
        { name: "SOHO 708", logo: "/images/mitrakami/soho-708-logo-mjEGo86zNpCqGOnM.png" },
        { name: "Dokter Finance", logo: "/images/mitrakami/dokter-finance-mp84B0r4O2hKP9RD.png" },
        { name: "Bank Sinarmas", logo: "/images/mitrakami/bank-sinarmas-kynJUkDVl7caMK8n.png" },
        { name: "Saung Uleg", logo: "/images/mitrakami/saung-uleg1-AE0rX6oK8wiXyO8X.png" },
    ];

    const coveredBy = [
        { name: "PT Suara Merdeka Press", logo: "/images/diliput/pt-suara-merdeka-press1-jGlvCXGMlmBbZp7L.png" },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mitra Kami Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Mitra Kami
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Kaspa Space dipercaya oleh banyak mitra strategis untuk mendorong
                        peningkatan pelayan yang lebih baik
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center mb-20">
                    {partners.map((partner, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center p-4 transition-all duration-300"
                        >
                            <img
                                src={partner.logo}
                                alt={partner.name}
                                className="h-24 md:h-32 w-auto object-contain"
                            />
                        </div>
                    ))}
                </div>

                {/* Diliput Oleh Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Diliput Oleh
                    </h2>
                </div>

                <div className="flex flex-wrap gap-8 items-center justify-center">
                    {coveredBy.map((media, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center p-4 transition-all duration-300"
                        >
                            <img
                                src={media.logo}
                                alt={media.name}
                                className="h-24 md:h-32 w-auto object-contain"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MitraKami;
