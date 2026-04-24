import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { PSYCHOLOGIST_CATEGORIES } from '../../../constants/psychologistCategories';
import { POPULAR_BANKS } from '../../../constants/bankList';

const RegisterPsikolog = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        password_confirmation: '',
        spesialisasi: '',
        no_rekening: '',
        nama_bank: '',
    });
    const [strFile, setStrFile] = useState(null);
    const [ijazahFile, setIjazahFile] = useState(null);
    const [strLabel, setStrLabel] = useState(null);
    const [ijazahLabel, setIjazahLabel] = useState(null);
    const [agreed, setAgreed] = useState(false);
    const [showSyarat, setShowSyarat] = useState(false);
    const [showKodeEtik, setShowKodeEtik] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dropdowns, setDropdowns] = useState({ spesialisasi: false, nama_bank: false });
    const navigate = useNavigate();

    // Close dropdowns when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => setDropdowns({ spesialisasi: false, nama_bank: false });
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (e.target.name === 'str_file') {
            setStrFile(file);
            setStrLabel(file ? file.name : null);
        }
        if (e.target.name === 'ijazah_file') {
            setIjazahFile(file);
            setIjazahLabel(file ? file.name : null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!agreed) {
            setError('Anda harus menyetujui Syarat & Ketentuan terlebih dahulu.');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('email', formData.email);
            data.append('username', formData.username);
            data.append('password', formData.password);
            data.append('password_confirmation', formData.password_confirmation);
            data.append('spesialisasi', formData.spesialisasi);
            data.append('no_rekening', formData.no_rekening);
            data.append('nama_bank', formData.nama_bank);
            if (strFile) data.append('str_file', strFile);
            if (ijazahFile) data.append('ijazah_file', ijazahFile);

            const res = await api.post('/register/psikolog', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/login', { state: { message: res.data.message } });
        } catch (err) {
            if (err.response?.data?.errors) {
                const msgs = Object.values(err.response.data.errors).flat().join('\n');
                setError(msgs);
            } else {
                setError(err.response?.data?.message || err.response?.data?.error || 'Pendaftaran gagal.');
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
                    <div className="absolute inset-0 opacity-10 z-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAP-jboHe8BFYVop-gn5D1hDNToC7nMxQESUZ5Us76CQhl3dt8o6H3A6dOfRmyi_firnKbHT2JIxc9ABBQd24Jh8Evws2ttkOQxyrTiOWK4_ZPQFXKVzXXR5WEYuz4JoV-0P84sje3okCqj6glIyoepyej-EluupLZqs-cxP3CjY5SCpwh9r5AQc5XDzrQiKsN22ve6HgzDkqNI-RnGfamtqOAg86lcY58xf7N8QDlhxTcF_RCmfJPJBqq_T-5KE0K6rEduxs8dZ-A')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay' }}></div>
                    <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#A46477]/20 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#A46477]/10 blur-[150px] rounded-full"></div>

                    <div className="relative z-10 max-w-lg">
                        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-[#A46477] animate-pulse"></span>
                            <span className="text-xs uppercase tracking-widest text-[#ffd9e2] font-semibold">Bergabung Sebagai Mitra</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
                            Jadilah Cahaya di Balik <span className="text-[#A46477]">Setiap Cerita.</span>
                        </h1>
                        <p className="text-base text-[#d8c2c5] leading-relaxed font-light">
                            Misi kami adalah memberikan ruang aman bagi setiap jiwa untuk berbicara. Sebagai Psikolog, Anda adalah pilar penyembuhan di The Ethereal Sanctuary.
                        </p>
                    </div>
                </section>

                {/* Form Section */}
                <section className="w-full md:w-1/2 bg-[#f9f0f1] flex items-start justify-center p-4 md:p-6 relative overflow-y-auto custom-scrollbar h-full">
                    <div className="absolute inset-0 opacity-5 z-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBkTjbg4h73w5anNYpGcPlNq7SO0dBGGGVub-nmyjZQt5rOMzXr3TS7J-HtvVC8neaTKoiRvk7WR9i_Pu4_oKC4otPj0Gu3Njj6nHxclLmy8ufyDTCpvb97vQeBosC0KB9S60jrcferAbjgvJwCI3pNT25LHHe0s6qJ1xnFxrKQ8nmg9vXVPmUhY_ML5Lf0hDcpc-wxUAn9lx3JYWLgBXLzOxrKA5HkbjDSiw_HEDdX-y-0TzNcXVxz7xO2i3b72W70d-YiW1EZ5kU')", backgroundSize: 'cover' }}></div>

                    <div className="glass-effect w-full max-w-xl p-6 md:p-8 rounded-2xl relative z-10 shadow-2xl shadow-[#A46477]/10 border border-white/60 my-4">
                        <div className="mb-5 text-center">
                            <h2 className="text-2xl font-bold text-[#1A1416] mb-1">Pendaftaran Psikolog</h2>
                            <p className="text-[#534346]/80 text-xs">Lengkapi data diri Anda untuk memulai praktek digital.</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-6 px-5 py-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm whitespace-pre-wrap leading-relaxed">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            {/* Username + Email — 2 kolom */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#534346] px-1">Username</label>
                                    <input
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-full bg-white border border-[#d8c2c5]/30 focus:border-[#A46477] focus:ring-2 focus:ring-[#A46477]/20 outline-none transition-all placeholder:text-[#857376]/50 text-[#1A1416] text-sm"
                                        placeholder="psikolog_id"
                                        type="text"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#534346] px-1">Email Profesional</label>
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-full bg-white border border-[#d8c2c5]/30 focus:border-[#A46477] focus:ring-2 focus:ring-[#A46477]/20 outline-none transition-all placeholder:text-[#857376]/50 text-[#1A1416] text-sm"
                                        placeholder="nama@email.com"
                                        type="email"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email (sudah di grid atas) */}

                            {/* Spesialisasi + No Rekening — 2 kolom */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#534346] px-1">Spesialisasi</label>
                                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={() => setDropdowns({ ...dropdowns, spesialisasi: !dropdowns.spesialisasi, nama_bank: false })}
                                            className={`w-full px-4 py-2.5 rounded-full bg-white border border-[#d8c2c5]/30 focus:border-[#A46477] focus:ring-2 focus:ring-[#A46477]/20 outline-none transition-all text-left flex items-center justify-between text-sm ${!formData.spesialisasi ? 'text-[#857376]/50' : 'text-[#1A1416]'}`}
                                        >
                                            <span className="truncate">
                                                {formData.spesialisasi 
                                                    ? PSYCHOLOGIST_CATEGORIES.find(c => c.value === formData.spesialisasi)?.label 
                                                    : 'Pilih Spesialisasi Anda'}
                                            </span>
                                            <span className={`material-symbols-outlined transition-transform duration-300 ${dropdowns.spesialisasi ? 'rotate-180' : ''}`}>expand_more</span>
                                        </button>
                                        
                                        {dropdowns.spesialisasi && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-[#d8c2c5]/30 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in duration-200 max-h-48 overflow-y-auto custom-scrollbar">
                                                {PSYCHOLOGIST_CATEGORIES.map((category) => (
                                                    <div
                                                        key={category.value}
                                                        onClick={() => {
                                                            setFormData({ ...formData, spesialisasi: category.value });
                                                            setDropdowns({ ...dropdowns, spesialisasi: false });
                                                        }}
                                                        className={`px-5 py-2.5 text-sm cursor-pointer transition-colors hover:bg-[#A46477]/5 ${formData.spesialisasi === category.value ? 'bg-[#A46477]/10 text-[#A46477] font-bold' : 'text-[#534346]'}`}
                                                    >
                                                        {category.label}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#534346] px-1">Nama Bank</label>
                                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={() => setDropdowns({ ...dropdowns, nama_bank: !dropdowns.nama_bank, spesialisasi: false })}
                                            className={`w-full px-4 py-2.5 rounded-full bg-white border border-[#d8c2c5]/30 focus:border-[#A46477] focus:ring-2 focus:ring-[#A46477]/20 outline-none transition-all text-left flex items-center justify-between text-sm ${!formData.nama_bank ? 'text-[#857376]/50' : 'text-[#1A1416]'}`}
                                        >
                                            <span className="truncate">
                                                {formData.nama_bank 
                                                    ? POPULAR_BANKS.find(b => b.value === formData.nama_bank)?.label 
                                                    : 'Pilih Bank'}
                                            </span>
                                            <span className={`material-symbols-outlined transition-transform duration-300 ${dropdowns.nama_bank ? 'rotate-180' : ''}`}>account_balance</span>
                                        </button>

                                        {dropdowns.nama_bank && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-[#d8c2c5]/30 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in duration-200 max-h-48 overflow-y-auto custom-scrollbar">
                                                {POPULAR_BANKS.map((bank) => (
                                                    <div
                                                        key={bank.value}
                                                        onClick={() => {
                                                            setFormData({ ...formData, nama_bank: bank.value });
                                                            setDropdowns({ ...dropdowns, nama_bank: false });
                                                        }}
                                                        className={`px-5 py-2.5 text-sm cursor-pointer transition-colors hover:bg-[#A46477]/5 ${formData.nama_bank === bank.value ? 'bg-[#A46477]/10 text-[#A46477] font-bold' : 'text-[#534346]'}`}
                                                    >
                                                        {bank.label}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#534346] px-1">Nomor Rekening</label>
                                    <input
                                        name="no_rekening"
                                        value={formData.no_rekening}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-full bg-white border border-[#d8c2c5]/30 focus:border-[#A46477] focus:ring-2 focus:ring-[#A46477]/20 outline-none transition-all placeholder:text-[#857376]/50 text-[#1A1416] text-sm"
                                        placeholder="Nomor Rekening Anda"
                                        type="text"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password + Konfirmasi — 2 kolom */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#534346] px-1">Kata Sandi</label>
                                    <input
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-full bg-white border border-[#d8c2c5]/30 focus:border-[#A46477] focus:ring-2 focus:ring-[#A46477]/20 outline-none transition-all placeholder:text-[#857376]/50 text-[#1A1416] text-sm"
                                        placeholder="••••••••"
                                        type="password"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#534346] px-1">Konfirmasi Sandi</label>
                                    <input
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-full bg-white border border-[#d8c2c5]/30 focus:border-[#A46477] focus:ring-2 focus:ring-[#A46477]/20 outline-none transition-all placeholder:text-[#857376]/50 text-[#1A1416] text-sm"
                                        placeholder="••••••••"
                                        type="password"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Upload Dokumen */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#534346] px-1 block">Verifikasi Kredensial</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* STR */}
                                    <div>
                                        <input className="hidden" id="str_file" name="str_file" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} required />
                                        <label htmlFor="str_file" className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${strLabel ? 'border-[#A46477] bg-[#ffd9e2]/20' : 'border-[#d8c2c5]/60 bg-white hover:bg-[#F5E6E8] hover:border-[#A46477]/50'}`}>
                                            <span className="material-symbols-outlined text-[#A46477] mb-1 text-2xl">clinical_notes</span>
                                            <span className="text-xs font-semibold text-[#1A1416] text-center truncate w-full text-center">{strLabel ? strLabel : 'Unggah STR'}</span>
                                            <span className="text-[9px] text-[#534346] mt-0.5">{strLabel ? '✓ Terpilih' : 'PDF/JPG · Maks 5MB'}</span>
                                        </label>
                                    </div>
                                    {/* Ijazah */}
                                    <div>
                                        <input className="hidden" id="ijazah_file" name="ijazah_file" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} required />
                                        <label htmlFor="ijazah_file" className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${ijazahLabel ? 'border-[#A46477] bg-[#ffd9e2]/20' : 'border-[#d8c2c5]/60 bg-white hover:bg-[#F5E6E8] hover:border-[#A46477]/50'}`}>
                                            <span className="material-symbols-outlined text-[#A46477] mb-1 text-2xl">school</span>
                                            <span className="text-xs font-semibold text-[#1A1416] text-center truncate w-full text-center">{ijazahLabel ? ijazahLabel : 'Unggah Ijazah S2'}</span>
                                            <span className="text-[9px] text-[#534346] mt-0.5">{ijazahLabel ? '✓ Terpilih' : 'Sertifikat Terakhir'}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Checkbox */}
                            <div className="flex items-start gap-3 px-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="agree"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="mt-1 rounded border-[#d8c2c5] text-[#A46477] focus:ring-[#A46477] cursor-pointer"
                                />
                                <label htmlFor="agree" className="text-xs text-[#534346] leading-relaxed">
                                    Saya menyetujui{' '}
                                    <button type="button" onClick={() => setShowSyarat(true)} className="text-[#A46477] font-bold hover:underline cursor-pointer">Syarat &amp; Ketentuan</button>
                                    {' '}serta{' '}
                                    <button type="button" onClick={() => setShowKodeEtik(true)} className="text-[#A46477] font-bold hover:underline cursor-pointer">Kode Etik Psikolog</button>
                                    {' '}yang berlaku di The Ethereal Sanctuary.
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#A46477] text-white py-3 rounded-full font-bold text-sm shadow-xl shadow-[#A46477]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                        Mendaftar...
                                    </>
                                ) : (
                                    <>
                                        Daftar Sebagai Psikolog
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </>
                                )}
                            </button>

                            {/* Back to role selection */}
                            <div className="flex justify-center mt-2">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#d8c2c5] text-[#534346] text-sm font-semibold hover:border-[#A46477] hover:text-[#A46477] hover:bg-[#ffd9e2]/10 transition-all"
                                >
                                    <span className="material-symbols-outlined text-base">arrow_back</span>
                                    Pilih Role Lain
                                </Link>
                            </div>
                        </form>
                    </div>

                </section>
            </main>

            {/* Modals */}
            {showSyarat && <ModalSyarat onClose={() => setShowSyarat(false)} />}
            {showKodeEtik && <ModalKodeEtik onClose={() => setShowKodeEtik(false)} />}
        </div>
    );
};

/* ── Modal Syarat & Ketentuan ── */
function ModalSyarat({ onClose }) {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-[#1A1416]/60 backdrop-blur-sm"></div>
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-[#eee0e2] flex-shrink-0">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A46477] mb-1">The Ethereal Sanctuary</p>
                        <h3 className="text-xl font-bold text-[#1A1416]">Syarat &amp; Ketentuan</h3>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f4e9eb] text-[#534346] transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
                {/* Body */}
                <div className="overflow-y-auto px-8 py-6 space-y-4 text-sm text-[#534346] leading-relaxed" style={{scrollbarWidth:'thin'}}>
                    {[
                        { n: '1', title: 'Ketentuan Umum', body: 'Platform The Ethereal Sanctuary merupakan aplikasi yang menyediakan layanan berbagi cerita (curhat) dan konsultasi dengan psikolog secara online. Dengan menggunakan layanan ini, pengguna dianggap telah membaca dan menyetujui seluruh ketentuan yang berlaku.' },
                        { n: '2', title: 'Penggunaan Layanan', body: 'Pengguna wajib menggunakan aplikasi dengan tujuan yang baik dan tidak melanggar hukum. Dilarang mengunggah konten yang mengandung unsur kekerasan, pornografi, ujaran kebencian, atau hal lain yang merugikan pihak lain.' },
                        { n: '3', title: 'Privasi Pengguna', body: 'Platform berkomitmen untuk menjaga kerahasiaan data pengguna. Informasi pribadi tidak akan dibagikan kepada pihak lain tanpa izin, kecuali untuk kepentingan keamanan atau sesuai dengan ketentuan hukum yang berlaku.' },
                        { n: '4', title: 'Konten Curhatan', body: 'Setiap pengguna bertanggung jawab atas isi curhatan yang diposting. Admin berhak menghapus konten yang dianggap melanggar aturan atau tidak sesuai dengan norma yang berlaku.' },
                        { n: '5', title: 'Layanan Konsultasi', body: 'Konsultasi yang dilakukan melalui platform ini bertujuan untuk memberikan dukungan dan saran, bukan sebagai pengganti diagnosis medis atau penanganan profesional secara langsung.' },
                        { n: '6', title: 'Tanggung Jawab Pengguna', body: 'Pengguna bertanggung jawab atas penggunaan akun masing-masing dan wajib menjaga kerahasiaan akun.' },
                        { n: '7', title: 'Perubahan Ketentuan', body: 'Pihak pengelola berhak mengubah syarat dan ketentuan sewaktu-waktu sesuai kebutuhan sistem.' },
                    ].map(item => (
                        <div key={item.n} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ffd9e2] text-[#A46477] text-xs font-bold flex items-center justify-center mt-0.5">{item.n}</span>
                            <div>
                                <p className="font-bold text-[#1A1416] mb-1">{item.title}</p>
                                <p>{item.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Footer */}
                <div className="px-8 py-5 border-t border-[#eee0e2] flex-shrink-0">
                    <button onClick={onClose} className="w-full bg-[#A46477] text-white py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
                        Saya Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Modal Kode Etik Psikolog ── */
function ModalKodeEtik({ onClose }) {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-[#1A1416]/60 backdrop-blur-sm"></div>
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-[#eee0e2] flex-shrink-0">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A46477] mb-1">The Ethereal Sanctuary</p>
                        <h3 className="text-xl font-bold text-[#1A1416]">Kode Etik Psikolog</h3>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f4e9eb] text-[#534346] transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
                {/* Body */}
                <div className="overflow-y-auto px-8 py-6 space-y-4 text-sm text-[#534346] leading-relaxed" style={{scrollbarWidth:'thin'}}>
                    {[
                        { n: '1', title: 'Kerahasiaan', body: 'Psikolog wajib menjaga kerahasiaan seluruh informasi yang diperoleh dari pengguna selama proses konsultasi.' },
                        { n: '2', title: 'Profesionalisme', body: 'Psikolog harus memberikan layanan secara profesional, objektif, dan tidak memihak.' },
                        { n: '3', title: 'Batasan Layanan', body: 'Psikolog hanya memberikan saran dan dukungan psikologis sesuai dengan kompetensinya, serta tidak memberikan diagnosis medis secara langsung melalui platform.' },
                        { n: '4', title: 'Sikap Etis', body: 'Psikolog wajib bersikap sopan, menghargai pengguna, serta tidak melakukan tindakan yang merugikan atau menyinggung pengguna.' },
                        { n: '5', title: 'Kejujuran Informasi', body: 'Psikolog wajib memberikan informasi yang benar dan tidak menyesatkan dalam memberikan saran atau pendapat.' },
                        { n: '6', title: 'Larangan Penyalahgunaan', body: 'Psikolog dilarang menyalahgunakan hubungan dengan pengguna untuk kepentingan pribadi.' },
                        { n: '7', title: 'Kepatuhan terhadap Aturan', body: 'Psikolog wajib mematuhi seluruh aturan yang berlaku dalam platform The Ethereal Sanctuary.' },
                    ].map(item => (
                        <div key={item.n} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ffd9e2] text-[#A46477] text-xs font-bold flex items-center justify-center mt-0.5">{item.n}</span>
                            <div>
                                <p className="font-bold text-[#1A1416] mb-1">{item.title}</p>
                                <p>{item.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Footer */}
                <div className="px-8 py-5 border-t border-[#eee0e2] flex-shrink-0">
                    <button onClick={onClose} className="w-full bg-[#A46477] text-white py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
                        Saya Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RegisterPsikolog;
