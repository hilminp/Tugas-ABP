import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterRoleSelect.css';

/* -------------------------------------------------------
   Small reusable helpers
------------------------------------------------------- */

/** Render a Material Symbols Outlined icon */
const Icon = ({ name, className = '' }) => (
    <span className={`rrs-material-icon ${className}`} aria-hidden="true">
        {name}
    </span>
);

/** Feature list item */
const Feature = ({ icon, iconClass, children }) => (
    <li className="rrs-feature-item">
        <Icon name={icon} className={`rrs-feature-icon--${iconClass}`} />
        {children}
    </li>
);

/* -------------------------------------------------------
   Main component
------------------------------------------------------- */

const RegisterRoleSelect = () => {
    const navigate = useNavigate();
    const [modal, setModal] = useState({ isOpen: false, title: '', content: '' });

    const openModal = (title, content) => {
        setModal({ isOpen: true, title, content });
    };

    const modalData = {
        safeSpaces: {
            title: "Ruang Aman",
            content: "Kami percaya setiap orang berhak punya ruang yang aman untuk bercerita. Di Curhatin, kamu bisa berbagi tanpa takut dihakimi, didengarkan dengan empati, dan merasa lebih tenang setelahnya."
        },
        philosophy: {
            title: "Tentang Kami",
            content: "Kami percaya bahwa setiap cerita itu penting. Curhatin hadir untuk menjadi tempat yang suportif, di mana kamu bisa merasa didengar, dipahami, dan menemukan arah yang lebih baik bersama orang yang tepat."
        },
        privacy: {
            title: "Privasi",
            content: "Privasi kamu adalah prioritas kami. Semua percakapan dan data dijaga dengan aman, sehingga kamu bisa berbagi dengan lebih nyaman tanpa khawatir informasi kamu disalahgunakan."
        }
    };

    return (
        <div className="rrs-page">

            {/* ── Decorative overlays (absolute inside .rrs-page) ── */}
            {/* Animated blobs handled by CSS ::before / ::after on .rrs-page */}
            <div className="rrs-streak"      aria-hidden="true" />
            <div className="rrs-grain-layer" aria-hidden="true" />

            {/* ── Main content (z-index: 2 so it sits above blobs) ── */}
            <main className="rrs-main" style={{ position: 'relative', zIndex: 2 }}>

                {/* Brand */}
                <div className="rrs-brand">
                    <h1 className="rrs-brand-title">Curhatin</h1>
                    <p className="rrs-brand-sub">Masuk ke ruang aman digitalmu.</p>
                </div>

                {/* Registration path cards */}
                <div className="rrs-grid">

                    {/* ── Card: Anonim ── */}
                    <div className="rrs-card rrs-card--anonim">
                        <div className="rrs-card-header">
                            <div className="rrs-icon-box rrs-icon-box--primary">
                                <Icon name="masks" />
                            </div>
                            <h2 className="rrs-card-title">Anonim</h2>
                            <p className="rrs-card-desc">
                                Lagi pengen cerita tapi takut di-judge? 
                                Di sini kamu bisa bebas ngomong apa aja, tanpa harus nunjukin siapa kamu.
                            </p>
                        </div>

                        <div className="rrs-card-footer">
                            <ul className="rrs-feature-list">
                                <Feature icon="check_circle" iconClass="primary">
                                    Nggak perlu pakai nama asli
                                </Feature>
                                <Feature icon="check_circle" iconClass="primary">
                                    Catatan kamu aman & terenkripsi
                                </Feature>
                            </ul>

                            <button
                                className="rrs-btn rrs-btn--primary"
                                onClick={() => navigate('/register/anonim')}
                                type="button"
                            >
                                Mulai Cerita Yuk
                                <Icon name="arrow_forward" />
                            </button>
                        </div>
                    </div>

                    {/* ── Card: Psikolog ── */}
                    <div className="rrs-card rrs-card--psikolog">
                        <div className="rrs-card-header">
                            <div className="rrs-icon-box rrs-icon-box--tertiary">
                                <Icon name="psychology" />
                            </div>
                            <h2 className="rrs-card-title">Psikolog</h2>
                            <p className="rrs-card-desc">
                                Punya keahlian dan hati buat bantu orang lain? 
                                Yuk jadi bagian dari Curhatin dan temani mereka yang lagi butuh didengar.
                            </p>
                        </div>

                        <div className="rrs-card-footer">
                            <ul className="rrs-feature-list">
                                <Feature icon="verified" iconClass="tertiary">
                                    Akun profesional terverifikasi
                                </Feature>
                                <Feature icon="verified" iconClass="tertiary">
                                    Konsultasi aman & nyaman
                                </Feature>
                            </ul>

                            <button
                                className="rrs-btn rrs-btn--tertiary"
                                onClick={() => navigate('/register/psikolog')}
                                type="button"
                            >
                                Gabung Jadi Psikolog
                                <Icon name="assignment_ind" />
                            </button>
                        </div>
                    </div>

                </div>{/* /grid */}

                {/* Secondary navigation */}
                <div className="rrs-secondary-nav">
                    <p className="rrs-signin-text">
                        Udah punya akun?
                        <Link to="/login" className="rrs-signin-link">Masuk Yuk </Link>
                    </p>

                    <nav className="rrs-footer-links" aria-label="Footer links">
                        <button onClick={() => openModal(modalData.safeSpaces.title, modalData.safeSpaces.content)} className="rrs-footer-btn">Ruang aman</button>
                        <span className="rrs-dot" aria-hidden="true" />
                        <button onClick={() => openModal(modalData.philosophy.title, modalData.philosophy.content)} className="rrs-footer-btn">Tentang Kami</button>
                        <span className="rrs-dot" aria-hidden="true" />
                        <button onClick={() => openModal(modalData.privacy.title, modalData.privacy.content)} className="rrs-footer-btn">Privasi</button>
                    </nav>
                </div>

                <AnimatePresence>
                    {modal.isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setModal({ ...modal, isOpen: false })}
                                className="absolute inset-0 bg-[#1A1416]/60 backdrop-blur-md"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative z-10 bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden"
                            >
                                <div className="p-8">
                                    <div className="w-12 h-12 bg-[#fdf2f5] rounded-2xl flex items-center justify-center text-[#A46477] mb-6">
                                        <span className="material-symbols-outlined text-2xl">
                                            {modal.title === 'Safe Spaces' ? 'verified_user' : 
                                             modal.title === 'Our Philosophy' ? 'auto_awesome' : 'lock_person'}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800 mb-4">{modal.title}</h2>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        {modal.content}
                                    </p>
                                    <button 
                                        onClick={() => setModal({ ...modal, isOpen: false })}
                                        className="w-full mt-8 py-4 bg-[#A46477] text-white rounded-2xl font-bold hover:bg-[#8a5263] transition-all active:scale-95 shadow-lg shadow-[#A46477]/20"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </main>

        </div>
    );
};

export default RegisterRoleSelect;
