import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Head, router } from "@inertiajs/react";
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
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);
    const abortRef = useRef(null);
    const debounceRef = useRef(null);
    const cacheRef = useRef(new Map());

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchChange = (e) => {
        const q = e.target.value;
        setSearchQuery(q);

        if (abortRef.current) abortRef.current.abort();
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (q.trim().length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            setIsSearching(false);
            return;
        }

        const key = q.trim().toLowerCase();

        // Jika hasil sudah ada di cache, tampilkan langsung tanpa request
        if (cacheRef.current.has(key)) {
            setSearchResults(cacheRef.current.get(key));
            setIsSearching(false);
            setShowDropdown(true);
            return;
        }

        setIsSearching(true);
        setShowDropdown(true);

        debounceRef.current = setTimeout(() => {
            abortRef.current = new AbortController();
            fetch(`/api/products/search?q=${encodeURIComponent(key)}`, {
                signal: abortRef.current.signal,
            })
                .then((res) => res.json())
                .then((data) => {
                    cacheRef.current.set(key, data);
                    setSearchResults(data);
                    setIsSearching(false);
                })
                .catch((err) => {
                    if (err.name !== "AbortError") {
                        setSearchResults([]);
                        setIsSearching(false);
                    }
                });
        }, 400);
    };

    const handleSelectProduct = (slug) => {
        setShowDropdown(false);
        setSearchQuery("");
        router.visit(`/product/${slug}`);
    };

    const handleSearchSubmit = (e) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            setShowDropdown(false);
            router.visit(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <>
            <Head><title>Kaspa Space - Coworking Space & Virtual Office</title></Head>
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
                    <div className="relative" ref={searchRef}>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500 z-10" />
                        <input
                            type="text"
                            placeholder="Cari produk Anda di sini"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchSubmit}
                            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                            className="w-full pl-14 pr-10 py-4 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(""); setSearchResults([]); setShowDropdown(false); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}

                        {/* Dropdown results */}
                        {showDropdown && (
                            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl overflow-hidden z-50">
                                {isSearching ? (
                                    <div className="px-5 py-4 text-gray-500 text-sm">Mencari...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleSelectProduct(product.slug)}
                                            className="w-full flex items-center gap-4 px-5 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-0"
                                        >
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.title}
                                                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                    <Search className="h-5 w-5 text-blue-400" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-gray-900 font-medium text-sm truncate">{product.title}</p>
                                                <p className="text-gray-500 text-xs">
                                                    {product.category && <span className="mr-2">{product.category}</span>}
                                                    {product.min_price > 0 ? `Dari Rp${product.min_price.toLocaleString("id-ID")}` : "Hubungi Kami"}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-5 py-4 text-gray-500 text-sm">Produk tidak ditemukan.</div>
                                )}
                            </div>
                        )}
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
