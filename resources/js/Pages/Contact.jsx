import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { MapPin, Clock, Phone, Mail, ArrowRight } from 'lucide-react';
import workspaceImg from '../../images/workspace-hero.jpg';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const msg = `*Pesan dari Website Kaspa Space*\n\nNama: ${formData.name}\nEmail: ${formData.email}\nWhatsApp: ${formData.whatsapp}\n\nPesan:\n${formData.message}`;
        window.open(`https://wa.me/62895363501632?text=${encodeURIComponent(msg)}`, '_blank');
        setIsSubmitting(false);
        setSubmitStatus('success');
        setFormData({ name: '', email: '', whatsapp: '', message: '' });
        setTimeout(() => setSubmitStatus(null), 3000);
    };

    const infoItems = [
        {
            icon: MapPin,
            iconBg: '#005bbf',
            title: 'Kantor Pusat',
            content: 'Kaspa Space - Jl. Adi Sucipto Blok I,\nManahan, Banjarsari, Surakarta, 57139.',
            cardBg: 'rgba(0,91,191,0.06)',
        },
        {
            icon: Clock,
            iconBg: '#005bbf',
            title: 'Operasional',
            content: 'Senin - Sabtu,\n08:00 - 17:00 WIB',
            cardBg: 'rgba(0,91,191,0.06)',
        },
        {
            icon: Phone,
            iconBg: '#25d366',
            title: 'WhatsApp',
            content: '+62 895 3635 01632',
            href: 'https://wa.me/62895363501632',
            cardBg: 'rgba(37,211,102,0.07)',
        },
        {
            icon: Mail,
            iconBg: '#005bbf',
            title: 'Email',
            content: 'hello@kaspaspace.com',
            href: 'mailto:hello@kaspaspace.com',
            cardBg: 'rgba(0,91,191,0.06)',
        },
    ];

    return (
        <div className="min-h-screen antialiased" style={{ backgroundColor: '#fff', color: '#191c1d', fontFamily: 'Inter, sans-serif' }}>
            <Head title="Kontak" />
            <Navbar />

            {/* ── HERO ── */}
            <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="font-extrabold tracking-tight leading-tight mb-4"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2.8rem, 5.5vw, 4rem)', color: '#191c1d' }}>
                            Kontak Kami
                        </h1>
                        <p className="text-base leading-relaxed" style={{ color: '#414754', maxWidth: '22rem' }}>
                            Hubungi kami untuk mendapatkan informasi layanan atau kerjasama bisnis.
                        </p>
                    </div>
                    <div className="hidden lg:block rounded-2xl overflow-hidden"
                        style={{ height: '340px', boxShadow: '0 12px 36px rgba(25,28,29,0.10)' }}>
                        <img src={workspaceImg} alt="Kaspa Space" className="w-full h-full object-cover" />
                    </div>
                </div>
            </section>

            {/* ── FORM + INFO ── */}
            <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-14">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Form card */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl p-8"
                            style={{ background: '#fff', border: '1.5px solid rgba(193,198,214,0.35)', boxShadow: '0 4px 24px rgba(25,28,29,0.06)' }}>
                            <h2 className="font-bold mb-1"
                                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', color: '#191c1d' }}>
                                Kirim Pesan
                            </h2>
                            <p className="text-sm mb-7" style={{ color: '#6b7280' }}>
                                Isi form di bawah, kami akan segera merespons.
                            </p>

                            {submitStatus === 'success' && (
                                <div className="mb-6 px-4 py-3 rounded-xl text-sm"
                                    style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#2e7d32' }}>
                                    Pesan berhasil dikirim! Kami akan menghubungi Anda segera.
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                                            style={{ color: '#6b7280' }}>Nama Lengkap</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange}
                                            placeholder="Masukkan nama Anda" required
                                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                            style={{ background: '#f3f4f5', border: '1px solid transparent', color: '#191c1d' }}
                                            onFocus={e => e.target.style.border = '1px solid rgba(0,91,191,0.35)'}
                                            onBlur={e => e.target.style.border = '1px solid transparent'} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                                            style={{ color: '#6b7280' }}>WhatsApp</label>
                                        <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange}
                                            placeholder="+62 8xx xxxx xxxx" required
                                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                            style={{ background: '#f3f4f5', border: '1px solid transparent', color: '#191c1d' }}
                                            onFocus={e => e.target.style.border = '1px solid rgba(0,91,191,0.35)'}
                                            onBlur={e => e.target.style.border = '1px solid transparent'} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                                        style={{ color: '#6b7280' }}>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                                        placeholder="nama@perusahaan.com" required
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{ background: '#f3f4f5', border: '1px solid transparent', color: '#191c1d' }}
                                        onFocus={e => e.target.style.border = '1px solid rgba(0,91,191,0.35)'}
                                        onBlur={e => e.target.style.border = '1px solid transparent'} />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                                        style={{ color: '#6b7280' }}>Pesan</label>
                                    <textarea name="message" value={formData.message} onChange={handleChange}
                                        placeholder="Jelaskan kebutuhan atau pertanyaan Anda..."
                                        rows={5} required
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                                        style={{ background: '#f3f4f5', border: '1px solid transparent', color: '#191c1d' }}
                                        onFocus={e => e.target.style.border = '1px solid rgba(0,91,191,0.35)'}
                                        onBlur={e => e.target.style.border = '1px solid transparent'} />
                                </div>

                                <button type="submit" disabled={isSubmitting}
                                    className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white"
                                    style={{ background: '#005bbf', boxShadow: '0 4px 14px rgba(0,91,191,0.3)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#1a73e8'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#005bbf'}>
                                    {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Info cards */}
                    <div className="lg:col-span-2 flex flex-col gap-3">
                        {infoItems.map(({ icon: Icon, iconBg, title, content, href, cardBg }) => (
                            <div key={title} className="flex items-start gap-4 rounded-2xl px-5 py-4"
                                style={{ background: cardBg }}>
                                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ background: iconBg }}>
                                    <Icon className="w-5 h-5" style={{ color: '#fff' }} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider mb-0.5"
                                        style={{ color: '#6b7280' }}>{title}</p>
                                    {href ? (
                                        <a href={href}
                                            className="text-sm font-semibold whitespace-pre-line hover:underline"
                                            style={{ color: '#191c1d' }}>
                                            {content}
                                        </a>
                                    ) : (
                                        <p className="text-sm font-semibold whitespace-pre-line"
                                            style={{ color: '#191c1d' }}>{content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── MAP ── */}
            <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
                <div className="rounded-2xl overflow-hidden"
                    style={{ boxShadow: '0 4px 20px rgba(25,28,29,0.08)' }}>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.0821!2d110.7982496!3d-7.5543959!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a150836ddfc5f%3A0x6a0a0e823bb991f2!2sCoworking%20%26%20Virtual%20Office%20-%20Kaspa%20Space%20Manahan!5e0!3m2!1sen!2sid!4v1736326789123"
                        width="100%" height="400"
                        style={{ border: 0, display: 'block' }}
                        allowFullScreen="" loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Lokasi Kaspa Space"
                    />
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;
