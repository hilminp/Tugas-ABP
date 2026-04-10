import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Welcome.css';

const Welcome = () => {
    const { user } = useAuth();
    const [activePopup, setActivePopup] = useState(null);

    const popupContent = useMemo(() => ({
        privacy: {
            title: 'Privacy Policy',
            body: 'Kami menjaga kerahasiaan data pengguna. Informasi personal hanya digunakan untuk kebutuhan layanan dan keamanan akun, tidak dibagikan ke pihak lain tanpa izin pengguna.'
        },
        terms: {
            title: 'Terms of Service',
            body: 'Dengan menggunakan Curhatin, pengguna setuju menggunakan platform secara bertanggung jawab, tidak melakukan penyalahgunaan, dan mematuhi aturan komunitas untuk menjaga kenyamanan bersama.'
        },
        safety: {
            title: 'Safety Guidelines',
            body: 'Dilarang menyebarkan ujaran kebencian, ancaman, atau konten berbahaya. Jika menemukan pelanggaran, segera laporkan ke admin agar kami bisa menindaklanjuti dengan cepat.'
        },
        contact: {
            title: 'Contact',
            body: 'Butuh bantuan? Hubungi tim Curhatin melalui email support@curhatin.app atau melalui admin panel. Kami akan membantu secepat mungkin.'
        }
    }), []);

    const selectedPopup = activePopup ? popupContent[activePopup] : null;

    return (
        <div className="editorial-landing">
            <nav className="top-nav">
                <div className="brand">
                    <span className="brand-heart">❤</span>
                    <span className="brand-name">Curhatin</span>
                </div>
                <div className="nav-actions">
                    <button className="menu-btn" type="button">☰</button>
                </div>
            </nav>

            <main className="hero-wrap">
                <section className="hero-left">
                    <div className="chip-list">
                        <span>Anonim</span>
                        <span>Gratis</span>
                        <span>Privat</span>
                        <span>No Judgement</span>
                    </div>
                    <h1>
                        Kamu nggak sendirian koq,
                        {' '}
                        <span>curhat di sini.</span>
                    </h1>
                    <p>
                        Ruang aman untuk berbagi perasaan tanpa judgement. Sepenuhnya gratis dan anonim.
                    </p>

                    <div className="hero-cta-row">
                        {user ? (
                            <Link to={user.is_admin ? "/admin/dashboard" : "/home"} className="btn-gradient">
                                Mulai Curhat Sekarang
                            </Link>
                        ) : (
                            <Link to="/login" className="btn-gradient">Mulai Curhat Sekarang</Link>
                        )}
                        <button className="btn-ghost" type="button">
                            <span>▶</span>
                            Pelajari Cara Kerja
                        </button>
                    </div>

                    <div className="proof-row">
                        <div className="avatar-stack" aria-hidden="true">
                            <img alt="User avatar 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_vxHYnkKt7qtoedtJNGyx278hPe7UWSzRZZZjW2o9WvtWNK_koNVyyyY4-Wgj2_20INB8V567K4zZHfMI75xKQ-u2O6QnpClbW_9Iw4SMdyclw2byC8rRSvTdhlS3fXiligRbukOtHiV2gjw44Hw4VMePa6bbJOJKP_xQ9zgzN_LK9oyCG48QRLnxuQsGfB5FHnSX1btLhhGmtVYQuPqP8Y3rdPgnzsC8f_bPl76PEtyfGXXIbK91fPq4COZhe_RH3SBXLatoH2U" />
                            <img alt="User avatar 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAk_yrID_eHckObppOvNhoTqE9XtCAlTjXkko2VeXiClkSLUxCbjyhp6xCk5NdPyPftNm07qoLOdeEe0oVBoInwzlEGOVvACGgTNQW48dWSNkXPUnzDNdpIO2VH8JdQRnQSsJRFIiROZCFmqzd0tDQBMLOe2b9yfJwL8FTYefecMo-SseI3WTIgOnuOPCOGnnenvIY3URzJzpDTy8W4FJoNNhwfrOSqkT5qf_xQ_KjNsrWUJruCQA4AxdEvHYkJKrACqOVYHbGUVM" />
                            <img alt="User avatar 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDutOOj5O80hi9b-HJbRXQ6awtQXB42AQajm3Lsyt4mpjGvR2PMlAOktuFg6Yk9XpKB9-G76AKLkRgFAqdTFNdRYDLYXMVqFbh5W4XoBhxD7h1KRAJHxF_rlcgikqW057XlD8L7C345tq53gcmaMFS6ZNaUkojoiE80dxTpqN0Q4DRfgcvyZGgh1PtK5roKIUJers5V-yW_k5MaCUmk2BQQlS_e_sxzmf9QkjMb5hqi6HLL7ASXuzSlNERNhYHHzvGoxvaRYM-1_M" />
                        </div>
                        <p><strong>12,000+</strong> orang telah berbagi hari ini.</p>
                    </div>
                </section>

                <section className="hero-right">
                    <div className="cta-card">
                        <div className="accent-line"></div>
                        <h2>Mulai Berbagi Sekarang</h2>
                        <p>
                            Buka hatimu tanpa rasa takut. Platform kami didesain khusus untuk menjaga privasi Anda seutuhnya
                            melalui teknologi anonimitas tercanggih.
                        </p>

                        <div className="cta-actions">
                            {user ? (
                                <Link to={user.is_admin ? "/admin/dashboard" : "/home"} className="btn-gradient">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="btn-gradient">Masuk</Link>
                                    <Link to="/register" className="btn-outline">Register</Link>
                                </>
                            )}
                        </div>

                        <div className="secure-badge">🛡 Data Terenkripsi & Anonim</div>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="footer-brand">
                    <div className="brand">
                        <span className="brand-heart">❤</span>
                        <span className="brand-name">Curhatin</span>
                    </div>
                    <p>© 2024 Editorial Sanctuary. Kisahmu adalah prioritas kami.</p>
                </div>
                <div className="footer-links">
                    <button type="button" onClick={() => setActivePopup('privacy')}>Privacy Policy</button>
                    <button type="button" onClick={() => setActivePopup('terms')}>Terms of Service</button>
                    <button type="button" onClick={() => setActivePopup('safety')}>Safety Guidelines</button>
                    <button type="button" onClick={() => setActivePopup('contact')}>Contact</button>
                </div>
            </footer>

            {selectedPopup && (
                <div className="popup-overlay" onClick={() => setActivePopup(null)}>
                    <div className="popup-card" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <h3>{selectedPopup.title}</h3>
                            <button type="button" className="popup-close" onClick={() => setActivePopup(null)}>
                                ✕
                            </button>
                        </div>
                        <p>{selectedPopup.body}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Welcome;
