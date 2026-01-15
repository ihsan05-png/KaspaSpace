import React, { useState } from "react";
import { Search } from "lucide-react";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import OnlineBookingSection from "./OnlineBookingSection";
import GrowTogetherSection from "./GrowthTogetherSection";
import FeaturedProductsSection from "./FeaturedProduct";
import KasperAISection from "./kasperAi";
import ApaKataMereka from "./ApaKataMereka";
import ELibrarySection from "./Library";
import WhyChooseUsSection from "./MengapaKami";
import MitraKami from "./MitraKami";
import DipercayaKlien from "./DipercayaKlien";
import BeritaTerkini from "./BeritaTerkini";
import FAQ from "./FAQ";
import KantorPusat from "./KantorPusat";
import Video from "../../images/background.mp4";

const LandingPage = ({ latestMedia = [] }) => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <>
            <div className="min-h-screen bg-white">
                <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-4">
                <div className="absolute inset-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src={Video} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/55" />
                </div>

                <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                        Coworking Space
                    </h1>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-blue-200">
                        #GrowingWithUs
                    </h2>
                    <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                        Kerja lebih profesional, produktif, dan efisien dengan kombinasi ruang kantor fleksibel dan dukungan bisnis andal.
                    </p>

                    <div className="flex justify-center">
                        <a
                            href="/get-closer"
                            className="inline-block border border-white/80 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-white hover:text-gray-900 transition-all duration-300"
                        >
                            #KenalLebihDekat
                        </a>
                    </div>
                </div>
            </section>

            {/* Search strip */}
            <section
                className="py-8"
                style={{ backgroundColor: "#0048a7", color: "#fff" }}
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Cari produk Anda di sini"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-4 py-4 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm sm:text-base font-semibold leading-snug">
                        <span className="text-lg" aria-hidden="true">
                            ℹ️
                        </span>
                        <span>
                            Rekomendasi: Coworking, Virtual Office, Private Office, Meeting Room, Legalitas Usaha, Back Office
                        </span>
                    </div>
                </div>
            </section>

            <OnlineBookingSection />
            <GrowTogetherSection />
            <FeaturedProductsSection />
            <KasperAISection />
            <ELibrarySection />
            <WhyChooseUsSection />
            <ApaKataMereka />
            <MitraKami />
            <DipercayaKlien />
            <BeritaTerkini news={latestMedia} />
            <FAQ />
            <KantorPusat />
            <Footer />
            </div>
        </>
    );
};

export default LandingPage;
