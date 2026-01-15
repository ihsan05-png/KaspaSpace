import React from "react";

const MitraKami = () => {
    const partners = [
        { name: "NETHUB", logo: "/path/to/nethub-logo.png" },
        { name: "Rentfix", logo: "/path/to/rentfix-logo.png" },
        { name: "Notarius INI", logo: "/path/to/notarius-logo.png" },
        { name: "xwork", logo: "/path/to/xwork-logo.png" },
        { name: "BRI", logo: "/path/to/bri-logo.png" },
        { name: "Education", logo: "/path/to/education-logo.png" },
        { name: "SOHO 700", logo: "/path/to/soho-logo.png" },
        { name: "Dokter Finance", logo: "/path/to/dokter-finance-logo.png" },
        { name: "Bank Sinarmas", logo: "/path/to/sinarmas-logo.png" },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Mitra Kami
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Kaspa Space dipercaya oleh banyak mitra strategis untuk mendorong
                        peningkatan pelayan yang lebih baik
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center">
                    {partners.map((partner, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-300"
                        >
                            <img
                                src={partner.logo}
                                alt={partner.name}
                                className="h-16 w-auto object-contain"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MitraKami;
