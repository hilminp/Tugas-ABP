import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import logoCurhatin from '../../../assets/logoCurhatin.png';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [activePopup, setActivePopup] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await api.post('/login', { email, password });
            login(res.data.user, res.data.access_token);
            if (res.data.user.is_admin) {
                navigate('/admin/dashboard');
            } else {
                navigate('/home');
            }
        } catch (err) {
            if (err.response?.data?.is_rejected) {
                setError({ type: 'rejected', message: err.response.data.message });
            } else {
                setError({ type: 'general', message: err.response?.data?.message || 'Login failed.' });
            }
        }
    };

    const handleReapply = async () => {
        if (!window.confirm("Yakin ingin mereset pendaftaran lama Anda agar bisa mendaftar ulang? (Data lama akan dibersihkan)")) return;
        try {
            const res = await api.post('/reapply', { email, password });
            alert(res.data.message);
            setError(null);
            navigate('/register/psikolog');
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menghapus data lama');
        }
    };

    const popupContent = {
        privacy: {
            title: 'Kebijakan Privasi',
            body: 'Curhatin menjaga kerahasiaan data pengguna. Informasi akun digunakan hanya untuk kebutuhan layanan dan keamanan, serta tidak dibagikan tanpa persetujuan pengguna.'
        },
        terms: {
            title: 'Syarat Layanan',
            body: 'Dengan menggunakan Curhatin, pengguna setuju menggunakan platform secara bertanggung jawab, tidak menyalahgunakan fitur, dan mematuhi aturan komunitas.'
        },
        safety: {
            title: 'Pusat Keamanan',
            body: 'Jangan kirim konten berbahaya, ancaman, atau ujaran kebencian. Jika menemukan pelanggaran, segera laporkan agar tim bisa menindaklanjuti.'
        }
    };

    return (
        <div className="login-modern-page">
            <div className="organic-blob blob-one" />
            <div className="organic-blob blob-two" />
            <div className="organic-blob blob-three" />

            <main className="login-modern-main">
                <div className="login-modern-shell">
                    <section className="login-modern-left">
                        <div className="login-modern-left-content">
                            <img src={logoCurhatin} alt="Curhatin brand mark" className="login-modern-brand-logo" />
                            <h1>
                                Temukan <span>ruang aman</span> untuk dirimu.
                            </h1>
                            <p>
                                Curhatin adalah ruang digital untuk mengekspresikan perasaan dengan jujur, berdiskusi dengan aman, dan refleksi diri.
                            </p>
                        </div>

                        <div className="login-modern-proof">
                            <div className="avatar-stack-auth" aria-hidden="true">
                                <img alt="User 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBstyNzqzSxDBOK1_1DAWeV-jMJE7nSJHzYFQN5bz5OSV3uZaDIyAcWqQ2SdvXUCWlz-t4nBG8XrSa7i2CwPLE1daA_7PMf4PD5P2GNd0EXXFbp6c9XYH8u92XaRRjj12uKJus2iVfHZuivQ0NDQ8edZamA7WMl608Mh25QGV7P7csjV2164AFxeIRqNlRH19IEE_gUpRRrlwdy_OaJeY-TVDwBK8Xpdvvz8-AK3L0aOCzpMjG-M-mqEDtCppLc4uTycIODmmHwfOE" />
                                <img alt="User 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-jKEiJoc9r_gsxJ5e7yjuPNgodOYXdZ3Xwx5eql824srqAOOjqL5kgXYOjmk08LimXRZRz2h5eIsYANLbE4Kh23MvWjH6Ykpy-kFMAnhR8adTRuCz0mpE1BEGCUbDTUGbxU2M0zm6qQXINApqMmCmiQQ62CZLhfGCyjHdvI3k1PdeyEm6Zl8nE6lJg-OTBjz8jPQZgdvTs4SfZrEiMYjCQsm-hz_pIe3e33GifCxR36KOhIfwuvQQ5eFYIA-uj2iI8HLGD8l0UBU" />
                                <img alt="User 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh2-k9ta0PTQWMtfK8yFratl8Mhuc9tH8fiZNsSdfPhMYh618QQDskk-eMA6BC9rklF9lzS_Y-B8cLGjuduYNevSsoTNPUi2tsoIcIHIKbvG4KfXyGARsbUw9AqfPoSS5DSUhjh-bhSXyjQPgXMU0RQLRsyv8yBC91KZO79nEyiTzU6zNkoAe9KNZXVZ8psgoH1rxsaG7Hk55_eaqW5pFnzN4e4bcwozDj2aJLbJsFGPGjKwyp2IF24uMx_XbtEX424idDyMtExYo" />
                            </div>
                            <p>Bergabung bersama 10.000+ pengguna yang mencari ketenangan.</p>
                        </div>
                    </section>

                    <section className="login-modern-right">
                        <div className="login-modern-form-wrap">
                            <div className="login-modern-head">
                                <h2>Selamat datang kembali</h2>
                                <p>Silakan masukkan detail akun untuk melanjutkan</p>
                            </div>

                            {location.state?.message && <div className="auth-alert success">{location.state.message}</div>}
                            {error && (
                                <div className="auth-alert error" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                    <div>{error.message || error}</div>
                                    {error.type === 'rejected' && (
                                        <button 
                                            type="button" 
                                            onClick={handleReapply}
                                            style={{
                                                background: '#fff', 
                                                color: '#e74c3c', 
                                                border: '1px solid #e74c3c', 
                                                padding: '8px 14px', 
                                                borderRadius: '8px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                alignSelf: 'flex-start',
                                                fontSize: '13px'
                                            }}
                                        >
                                            Hapus data lama & Daftar Ulang
                                        </button>
                                    )}
                                </div>
                            )}

                            <form className="login-modern-form" onSubmit={handleSubmit}>
                                <div className="modern-field">
                                    <label htmlFor="email">Alamat email</label>
                                    <div className="modern-input-wrap">
                                        <span className="modern-input-icon">✉</span>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="modern-field">
                                    <div className="modern-field-top">
                                        <label htmlFor="password">Kata sandi</label>
                                    </div>
                                    <div className="modern-input-wrap">
                                        <span className="modern-input-icon">🔒</span>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            className="toggle-pass-btn"
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                        >
                                            {showPassword ? '🙈' : '👁'}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="login-modern-submit">Masuk</button>
                            </form>

                            <div className="login-modern-bottom">
                                <p>
                                    Belum punya akun?
                                    <Link to="/register">Daftar gratis</Link>
                                </p>
                                <Link to="/" className="back-home-link">Kembali ke beranda</Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="login-modern-footer">
                <div className="footer-left">
                    <span className="footer-brand">Curhatin</span>
                    <p>© 2024 Curhatin. Ruang digital aman untuk ekspresi diri yang jujur.</p>
                </div>
                <div className="footer-right">
                    <button type="button" onClick={() => setActivePopup('privacy')}>Kebijakan Privasi</button>
                    <button type="button" onClick={() => setActivePopup('terms')}>Syarat Layanan</button>
                    <button type="button" onClick={() => setActivePopup('safety')}>Pusat Keamanan</button>
                </div>
            </footer>

            {activePopup && (
                <div className="login-popup-overlay" onClick={() => setActivePopup(null)}>
                    <div className="login-popup-card" onClick={(e) => e.stopPropagation()}>
                        <div className="login-popup-head">
                            <h3>{popupContent[activePopup].title}</h3>
                            <button type="button" onClick={() => setActivePopup(null)}>✕</button>
                        </div>
                        <p>{popupContent[activePopup].body}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
