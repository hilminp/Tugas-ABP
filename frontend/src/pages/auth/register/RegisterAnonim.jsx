import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';

const RegisterAnonim = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        password_confirmation: ''
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await api.post('/register/anonim', formData);
            navigate('/login', { state: { message: res.data.message } });
        } catch (err) {
            if (err.response?.data?.errors) {
                const msgs = Object.values(err.response.data.errors).flat().join('\n');
                setError(msgs);
            } else {
                setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface font-body text-on-surface h-screen overflow-hidden selection:bg-[#A46477]/20" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .velvet-gradient { background: linear-gradient(135deg, #2D1B22 0%, #1A1416 100%); }
                .glass-effect { background: rgba(255,255,255,0.75); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #d8c2c5; border-radius: 10px; }
            `}</style>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-[#FCF7F8]/80 backdrop-blur-xl border-b border-[#d8c2c5]/30">
                <div className="flex justify-between items-center px-8 py-3 max-w-7xl mx-auto">
                    <Link to="/" className="text-2xl font-bold tracking-tight text-[#1A1416]">
                        The Ethereal Sanctuary
                    </Link>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <span className="text-[#534346]">Sudah punya akun?</span>
                        <Link to="/login" className="px-5 py-2 rounded-full border border-[#A46477] text-[#A46477] font-bold hover:bg-[#A46477] hover:text-white transition-all text-sm">
                            Masuk
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="flex flex-col md:flex-row" style={{ height: 'calc(100vh - 57px)', marginTop: '57px' }}>

                {/* Hero Section */}
                <section className="hidden md:flex w-full md:w-1/2 relative h-full items-center justify-center p-8 md:p-16 overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 velvet-gradient z-0"></div>
                    <div className="absolute inset-0 opacity-10 z-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBkTjbg4h73w5anNYpGcPlNq7SO0dBGGGVub-nmyjZQt5rOMzXr3TS7J-HtvVC8neaTKoiRvk7WR9i_Pu4_oKC4otPj0Gu3Njj6nHxclLmy8ufyDTCpvb97vQeBosC0KB9S60jrcferAbjgvJwCI3pNT25LHHe0s6qJ1xnFxrKQ8nmg9vXVPmUhY_ML5Lf0hDcpc-wxUAn9lx3JYWLgBXLzOxrKA5HkbjDSiw_HEDdX-y-0TzNcXVxz7xO2i3b72W70d-YiW1EZ5kU')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay' }}></div>
                    <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#A46477]/20 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#A46477]/10 blur-[150px] rounded-full"></div>

                    <div className="relative z-10 max-w-lg">
                        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-[#A46477] animate-pulse"></span>
                            <span className="text-xs uppercase tracking-widest text-[#ffd9e2] font-semibold">Ruang Aman Tanpa Nama</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
                            Bicaralah Jujur, <br /><span className="text-[#A46477]">Tanpa Penghakiman.</span>
                        </h1>
                        <p className="text-base text-[#d8c2c5] leading-relaxed font-light">
                            Bagikan bebanmu dalam anonimitas total. Di sini, suaramu didengar dan perasaanmu dihargai. Mulailah perjalanan menuju ketenangan.
                        </p>
                    </div>
                </section>

                {/* Form Section */}
                <section className="w-full md:w-1/2 bg-[#f9f0f1] flex items-center justify-center p-4 md:p-6 relative overflow-y-auto custom-scrollbar h-full">
                    <div className="absolute inset-0 opacity-5 z-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAP-jboHe8BFYVop-gn5D1hDNToC7nMxQESUZ5Us76CQhl3dt8o6H3A6dOfRmyi_firnKbHT2JIxc9ABBQd24Jh8Evws2ttkOQxyrTiOWK4_ZPQFXKVzXXR5WEYuz4JoV-0P84sje3okCqj6glIyoepyej-EluupLZqs-cxP3CjY5SCpwh9r5AQc5XDzrQiKsN22ve6HgzDkqNI-RnGfamtqOAg86lcY58xf7N8QDlhxTcF_RCmfJPJBqq_T-5KE0K6rEduxs8dZ-A')", backgroundSize: 'cover' }}></div>

                    <div className="glass-effect w-full max-w-md p-8 rounded-2xl relative z-10 shadow-2xl shadow-[#A46477]/10 border border-white/60">
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold text-[#1A1416] mb-1">Daftar Anonim</h2>
                            <p className="text-[#534346]/80 text-xs">Lengkapi data untuk memulai perjalanan ketenanganmu.</p>
                        </div>

                        {error && (
                            <div className="mb-6 px-5 py-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm whitespace-pre-wrap leading-relaxed">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#534346] px-1">Username</label>
                                <input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-full bg-white border border-[#d8c2c5]/30 focus:border-[#A46477] focus:ring-2 focus:ring-[#A46477]/20 outline-none transition-all placeholder:text-[#857376]/50 text-[#1A1416] text-sm"
                                    placeholder="Username pilihanmu"
                                    type="text"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#534346] px-1">Alamat Email</label>
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-full bg-white border border-[#d8c2c5]/30 focus:border-[#A46477] focus:ring-2 focus:ring-[#A46477]/20 outline-none transition-all placeholder:text-[#857376]/50 text-[#1A1416] text-sm"
                                    placeholder="nama@email.com"
                                    type="email"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#534346] px-1">Kata Sandi</label>
                                    <input
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-full bg-white border border-[#d8c2c5]/30 focus:border-[#A46477] focus:ring-2 focus:ring-[#A46477]/20 outline-none transition-all placeholder:text-[#857376]/50 text-[#1A1416] text-sm"
                                        placeholder="••••••••"
                                        type="password"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#534346] px-1">Konfirmasi</label>
                                    <input
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-full bg-white border border-[#d8c2c5]/30 focus:border-[#A46477] focus:ring-2 focus:ring-[#A46477]/20 outline-none transition-all placeholder:text-[#857376]/50 text-[#1A1416] text-sm"
                                        placeholder="••••••••"
                                        type="password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 bg-[#A46477] text-white py-3.5 rounded-full font-bold text-sm shadow-xl shadow-[#A46477]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {loading ? 'Mendaftar...' : (
                                    <>
                                        Daftar Sekarang
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </>
                                )}
                            </button>

                            <div className="flex justify-center mt-2">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#d8c2c5] text-[#534346] text-xs font-bold hover:border-[#A46477] hover:text-[#A46477] hover:bg-[#ffd9e2]/10 transition-all"
                                >
                                    <span className="material-symbols-outlined text-base">arrow_back</span>
                                    Pilih Role Lain
                                </Link>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default RegisterAnonim;