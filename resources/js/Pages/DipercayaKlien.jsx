import React from "react";

const DipercayaKlien = () => {
    const clients = [
        // Baris 1
        { name: "SOFDøH Soft Sourdough", logo: "/path/to/sofdoh-logo.png" },
        { name: "Kindirga EduAccess", logo: "/path/to/kindirga-logo.png" },
        { name: "ABI Insurance", logo: "/path/to/abi-logo.png" },
        { name: "Sevibu", logo: "/path/to/sevibu-logo.png" },
        { name: "VG Solusi", logo: "/path/to/vgsolusi-logo.png" },
        { name: "PT Makala Inovasi Digital", logo: "/path/to/makala-logo.png" },
        { name: "Sansan", logo: "/path/to/sansan-logo.png" },
        { name: "EDUGORILLA", logo: "/path/to/edugorilla-logo.png" },
        
        // Baris 2
        { name: "HSI", logo: "/path/to/hsi-logo.png" },
        { name: "Codero Coding Robot", logo: "/path/to/codero-logo.png" },
        { name: "Rumah Damar", logo: "/path/to/rumahdamar-logo.png" },
        { name: "U Can Speak", logo: "/path/to/ucanspeak-logo.png" },
        { name: "PT Britta Buana Sakti", logo: "/path/to/britta-logo.png" },
        { name: "Modena", logo: "/path/to/modena-logo.png" },
        { name: "Maxride", logo: "/path/to/maxride-logo.png" },
        { name: "2Lingo Learning Center", logo: "/path/to/2lingo-logo.png" },
        
        // Baris 3
        { name: "Suara Merdeka", logo: "/path/to/suaramerdeka-logo.png" },
        { name: "ProWebSolution", logo: "/path/to/prowebsolution-logo.png" },
        { name: "The Kirimaya", logo: "/path/to/kirimaya-logo.png" },
        { name: "MIGUNANI Consulting", logo: "/path/to/migunani-logo.png" },
        
        // Previous clients from first screenshot
        { name: "Wind's Chemical Indonesia", logo: "/path/to/winds-logo.png" },
        { name: "KHPI", logo: "/path/to/khpi-logo.png" },
        { name: "Pajak Smart", logo: "/path/to/pajaksmart-logo.png" },
        { name: "Sekolah Pasar", logo: "/path/to/sekolahpasar-logo.png" },
        { name: "Yayasan Ibarat Kabut", logo: "/path/to/yayasan-logo.png" },
        { name: "SMU", logo: "/path/to/smu-logo.png" },
        { name: "Prospect", logo: "/path/to/prospect-logo.png" },
        { name: "Nathan Thomas & Partners", logo: "/path/to/nathan-logo.png" },
        { name: "SSJ Software Development", logo: "/path/to/ssj-logo.png" },
        { name: "Notarius INI", logo: "/path/to/notarius2-logo.png" },
        { name: "PT Banjang Lembagaku", logo: "/path/to/banjang-logo.png" },
        { name: "Access", logo: "/path/to/access-logo.png" },
        { name: "PT Lesa Digital Solusi", logo: "/path/to/lesa-logo.png" },
        { name: "STC", logo: "/path/to/stc-logo.png" },
        { name: "Dewi Intan Puspitadesi", logo: "/path/to/dewi-logo.png" },
        { name: "UMS", logo: "/path/to/ums-logo.png" },
        { name: "Hilano LCZ Indonesia", logo: "/path/to/hilano-logo.png" },
        { name: "PT Dewa Kimia", logo: "/path/to/dewa-logo.png" },
        { name: "Ajithara", logo: "/path/to/ajithara-logo.png" },
        { name: "Karya Mandiri", logo: "/path/to/karya-logo.png" },
        { name: "Arifin Masruri", logo: "/path/to/arifin-logo.png" },
        { name: "Yoga", logo: "/path/to/yoga-logo.png" },
        { name: "Cembeliq Tech", logo: "/path/to/cembeliq-logo.png" },
        { name: "Drone Solo", logo: "/path/to/drone-logo.png" },
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
                                className="h-16 w-auto object-contain"
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
