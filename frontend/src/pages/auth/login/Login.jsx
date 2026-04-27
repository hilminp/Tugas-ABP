import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import { Mail, Lock, Eye, EyeOff, X, ArrowLeft, LogIn, ChevronRight, ShieldCheck, FileText, LockKeyhole } from 'lucide-react';
import logoFinal from '../../../assets/LogoFinal.png';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [activePopup, setActivePopup] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, onConfirm: null });
    const [successModal, setSuccessModal] = useState({ show: false, message: '' });
    const [appealModal, setAppealModal] = useState({ show: false, reason: '', loading: false });
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
            } else if (err.response?.data?.is_suspended) {
                setError({ type: 'suspended', message: err.response.data.message });
            } else {
                setError({ type: 'general', message: err.response?.data?.message || 'Login failed.' });
            }
        }
    };

    const handleReapply = async () => {
        setConfirmModal({
            show: true,
            title: 'Reset Pendaftaran',
            message: 'Yakin ingin mereset pendaftaran lama Anda agar bisa mendaftar ulang? (Data lama akan dibersihkan)',
            onConfirm: async () => {
                try {
                    const res = await api.post('/reapply', { email, password });
                    setConfirmModal({ show: false, onConfirm: null });
                    setSuccessModal({ 
                        show: true, 
                        message: res.data.message 
                    });
                    setError(null);
                } catch (err) {
                    alert(err.response?.data?.message || 'Gagal menghapus data lama');
                }
            }
        });
    };

    const handleAppealSubmit = async (e) => {
        e.preventDefault();
        setAppealModal(prev => ({ ...prev, loading: true }));
        try {
            const res = await api.post('/appeals/submit', { 
                email, 
                password, 
                reason: appealModal.reason 
            });
            alert(res.data.message);
            setAppealModal({ show: false, reason: '', loading: false });
            setError(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal mengirim banding.');
        } finally {
            setAppealModal(prev => ({ ...prev, loading: false }));
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
                            <img src={logoFinal} alt="Curhatin brand mark" className="login-modern-brand-logo" />
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
                                    {error.type === 'suspended' && (
                                        <button 
                                            type="button" 
                                            onClick={() => setAppealModal({ ...appealModal, show: true })}
                                            style={{
                                                background: '#fff', 
                                                color: '#f39c12', 
                                                border: '1px solid #f39c12', 
                                                padding: '8px 14px', 
                                                borderRadius: '8px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                alignSelf: 'flex-start',
                                                fontSize: '13px'
                                            }}
                                        >
                                            Ajukan Banding
                                        </button>
                                    )}
                                </div>
                            )}

                            <form className="login-modern-form" onSubmit={handleSubmit}>
                                <div className="modern-field">
                                    <label htmlFor="email">Alamat email</label>
                                    <div className="modern-input-wrap">
                                        <span className="modern-input-icon">
                                            <Mail size={18} strokeWidth={2.5} />
                                        </span>
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
                                        <span className="modern-input-icon">
                                            <LockKeyhole size={18} strokeWidth={2.5} />
                                        </span>
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
                                            {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="login-modern-submit">
                                    <LogIn size={18} strokeWidth={2.5} />
                                    Masuk
                                </button>
                            </form>

                            <div className="login-modern-bottom">
                                <p>
                                    Belum punya akun?
                                    <Link to="/register">Daftar gratis <ChevronRight size={14} style={{display: 'inline', marginLeft: '4px'}} /></Link>
                                </p>
                                <Link to="/" className="back-home-link">
                                    <ArrowLeft size={16} />
                                    Kembali ke beranda
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="login-modern-footer">
                <div className="footer-left">
                    <span className="footer-brand">Curhatin</span>
                    <p>© 2026 Curhatin. Ruang digital aman untuk ekspresi diri yang jujur.</p>
                </div>
                <div className="footer-right">
                    <button type="button" onClick={() => setActivePopup('privacy')}>
                        <ShieldCheck size={14} style={{marginRight: '6px'}} />
                        Kebijakan Privasi
                    </button>
                    <button type="button" onClick={() => setActivePopup('terms')}>
                        <FileText size={14} style={{marginRight: '6px'}} />
                        Syarat Layanan
                    </button>
                    <button type="button" onClick={() => setActivePopup('safety')}>
                        <ShieldCheck size={14} style={{marginRight: '6px'}} />
                        Pusat Keamanan
                    </button>
                </div>
            </footer>

            {activePopup && (
                <div className="login-popup-overlay" onClick={() => setActivePopup(null)}>
                    <div className="login-popup-card" onClick={(e) => e.stopPropagation()}>
                        <div className="login-popup-head">
                            <h3>{popupContent[activePopup].title}</h3>
                            <button type="button" onClick={() => setActivePopup(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <p>{popupContent[activePopup].body}</p>
                    </div>
                </div>
            )}

            {confirmModal.show && (
                <div className="login-popup-overlay" onClick={() => setConfirmModal({ show: false, onConfirm: null })}>
                    <div className="login-popup-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                        <div className="login-popup-head" style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <LockKeyhole size={20} />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{confirmModal.title}</h3>
                            </div>
                            <button type="button" onClick={() => setConfirmModal({ show: false, onConfirm: null })}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ marginBottom: '25px', lineHeight: '1.6', color: '#64748b' }}>{confirmModal.message}</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button 
                                type="button" 
                                onClick={() => setConfirmModal({ show: false, onConfirm: null })}
                                style={{ padding: '12px 20px', borderRadius: '14px', background: '#f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '14px' }}
                            >
                                Batal
                            </button>
                            <button 
                                type="button" 
                                onClick={confirmModal.onConfirm}
                                style={{ 
                                    padding: '12px 24px', 
                                    borderRadius: '14px', 
                                    background: '#ef4444', 
                                    color: '#fff', 
                                    fontWeight: 700, 
                                    fontSize: '14px',
                                    boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.2)'
                                }}
                            >
                                Ya, Lanjutkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {appealModal.show && (
                <div className="login-popup-overlay" onClick={() => setAppealModal({ ...appealModal, show: false })}>
                    <div className="login-popup-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="login-popup-head">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ShieldCheck size={20} />
                                </div>
                                <h3>Ajukan Banding</h3>
                            </div>
                            <button type="button" onClick={() => setAppealModal({ ...appealModal, show: false })}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ marginBottom: '20px', fontSize: '14px', color: '#64748b' }}>
                            Akun Anda sedang disuspend. Jika Anda merasa ini adalah kesalahan, silakan berikan alasan mengapa akun Anda harus diaktifkan kembali.
                        </p>
                        <form onSubmit={handleAppealSubmit}>
                            <div className="modern-field" style={{ marginBottom: '25px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Alasan Banding</label>
                                <textarea 
                                    required
                                    value={appealModal.reason}
                                    onChange={(e) => setAppealModal({ ...appealModal, reason: e.target.value })}
                                    style={{ 
                                        width: '100%', 
                                        minHeight: '120px', 
                                        padding: '16px', 
                                        borderRadius: '16px', 
                                        background: '#f8fafc', 
                                        border: '2px solid #f1f5f9',
                                        fontSize: '14px',
                                        resize: 'none',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    placeholder="Tuliskan alasan Anda di sini..."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setAppealModal({ ...appealModal, show: false })}
                                    style={{ padding: '12px 24px', borderRadius: '14px', background: '#f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '14px' }}
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={appealModal.loading}
                                    style={{ 
                                        padding: '12px 24px', 
                                        borderRadius: '14px', 
                                        background: '#A46477', 
                                        color: '#fff', 
                                        fontWeight: 700, 
                                        fontSize: '14px',
                                        boxShadow: '0 10px 15px -3px rgba(164, 100, 119, 0.3)',
                                        opacity: appealModal.loading ? 0.7 : 1
                                    }}
                                >
                                    {appealModal.loading ? 'Mengirim...' : 'Kirim Banding'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {successModal.show && (
                <div className="login-popup-overlay" onClick={() => {
                    setSuccessModal({ show: false, message: '' });
                    navigate('/register/psikolog');
                }}>
                    <div className="login-popup-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{ 
                            width: '64px', 
                            height: '64px', 
                            borderRadius: '50%', 
                            background: '#ecfdf5', 
                            color: '#10b981', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <ShieldCheck size={32} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>Berhasil!</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '25px' }}>{successModal.message}</p>
                        <button 
                            type="button" 
                            onClick={() => {
                                setSuccessModal({ show: false, message: '' });
                                navigate('/register/psikolog');
                            }}
                            style={{ 
                                width: '100%',
                                padding: '14px', 
                                borderRadius: '14px', 
                                background: '#10b981', 
                                color: '#fff', 
                                fontWeight: 700,
                                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)'
                            }}
                        >
                            Daftar Sekarang
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
