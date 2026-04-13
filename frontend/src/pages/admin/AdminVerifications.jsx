import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api, STORAGE_BASE_URL } from '../../lib/api';
import { getSpesialisasiLabel } from '../../lib/constants';

const AdminVerifications = () => {
    const { user: me, logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('semua'); // semua, pending, verified
    const [searchTerm, setSearchTerm] = useState('');

    const fetchVerifications = async () => {
        try {
            const res = await api.get('/admin/verifications');
            setData(res.data);
        } catch (err) {
            console.error("Failed to load verifications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVerifications();
    }, []);

    const handleVerify = async (id, name) => {
        if (!window.confirm(`Verifikasi psikolog ${name}?`)) return;
        try {
            await api.post(`/admin/verify/${id}`);
            fetchVerifications();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal memverifikasi');
        }
    };

    const handleReject = async (id, name) => {
        const reason = window.prompt(`Masukkan alasan penolakan untuk ${name} (wajib diisi):`);
        if (reason === null) return;
        if (!reason.trim()) {
            alert('Alasan penolakan tidak boleh kosong.');
            return;
        }
        
        try {
            await api.post(`/admin/reject/${id}`, { reason: reason.trim() });
            fetchVerifications();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menolak');
        }
    };

    // Loading handled via skeleton below

    // Combine and process data uniformly for display
    let allItems = [];
    if (data?.pendingPsikolog) {
        data.pendingPsikolog.forEach(p => allItems.push({ ...p, statusType: 'pending' }));
    }
    if (data?.verifiedPsikolog) {
        data.verifiedPsikolog.forEach(p => allItems.push({ ...p, statusType: 'verified' }));
    }
    if (data?.rejectedPsikolog) {
        data.rejectedPsikolog.forEach(p => allItems.push({ ...p, statusType: 'rejected' }));
    }

    // Sort by newest created_at
    allItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Filter
    let displayedItems = allItems.filter(p => {
        if (filter !== 'semua' && p.statusType !== filter) return false;
        if (searchTerm && !(p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.email?.toLowerCase().includes(searchTerm.toLowerCase()))) {
            return false;
        }
        return true;
    });

    const pendingCount = allItems.filter(i => i.statusType === 'pending').length;

    return (
        <div className="bg-background text-on-background min-h-screen flex h-screen w-full overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .silk-texture {
                    background-color: #ebfdfc;
                    background-image: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(164,100,119,0.05) 100%);
                    position: relative;
                }
                .silk-texture::after {
                    content: "";
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                    opacity: 0.02;
                    pointer-events: none;
                }
            `}</style>
            
            {/* SideNavBar */}
            <aside className="h-screen w-64 docked left-0 bg-teal-50 dark:bg-slate-950 flex flex-col h-full border-r border-teal-100/10 shrink-0 sticky top-0">
                <div className="p-8">
                    <h1 className="text-lg font-black text-teal-900 dark:text-teal-50 tracking-tight">The Sanctuary</h1>
                    <p className="text-xs font-medium text-teal-700/60 dark:text-teal-300/40 uppercase tracking-widest mt-1">Admin Console</p>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 transition-all rounded-lg">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 transition-all rounded-lg group">
                        <span className="material-symbols-outlined">groups</span>
                        <span className="font-medium">Kelola Pengguna</span>
                    </Link>
                    <Link to="/admin/verifications" className="flex items-center gap-3 px-4 py-3 text-[#A46477] font-bold border-r-4 border-[#A46477] bg-teal-100/20 rounded-l-lg active:translate-x-1 duration-150">
                        <span className="material-symbols-outlined">verified_user</span>
                        <span className="font-medium">Verifikasi</span>
                    </Link>
                </nav>
                <div className="p-6 border-t border-teal-100/10">
                    <button onClick={() => navigate('/home')} className="w-full py-3 bg-[#A46477] text-white rounded-full font-bold text-sm shadow-lg shadow-[#A46477]/20 hover:opacity-90 transition-opacity">
                        Kembali ke Aplikasi
                    </button>
                    <div className="mt-6 space-y-2">
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-teal-700/60 dark:text-teal-300/40 text-sm hover:bg-teal-100/40 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-sm">logout</span>
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto silk-texture">
                {/* TopNavBar */}
                <header className="bg-teal-50/80 dark:bg-slate-900/80 backdrop-blur-xl w-full sticky top-0 z-40 flex justify-between items-center px-8 py-3 border-b border-teal-100/20">
                    <div className="flex items-center gap-6 w-1/2">
                        <div className="relative w-full max-w-md">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-teal-600/70">search</span>
                            <input 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-teal-100/30 border-none rounded-full text-sm focus:ring-2 focus:ring-teal-200 text-teal-900 placeholder-teal-600/50" 
                                placeholder="Cari nama psikolog..." 
                                type="text"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 ml-4">
                            <div className="text-right">
                                <p className="text-sm font-bold text-teal-900">{me?.name || 'Admin'}</p>
                                <p className="text-[10px] text-teal-600 uppercase tracking-widest">Administrator</p>
                            </div>
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container shadow-sm">
                                <img alt="Administrator Profile" className="w-full h-full object-cover" src={me?.profile_image ? `${STORAGE_BASE_URL}/${me.profile_image}` : "https://lh3.googleusercontent.com/aida-public/AB6AXuCAviLUwwa4BUjMc5XWOz6n6tszkTPOAmRjBf29KoW44KKBq4UlndvQDAUVpohqW35gJMKMi2NUEbZnbx56tkOqV8-aaBQdFvde_wa2rd2tEUdfluqOZJ-YA332kUEdQllyKX_xXGEdYjQ6Ll0CyP4hc8O6zkDl6L20aByFzIM9Pvr7HDl5K8r-EFVGleSVwiJIpnHe-uyL2Zi-xYKes96y_yL9Z2SGMROGqXwWFm_wTwpfecKOiTKqLNfObq4jBw8AJkWJ-rORsL4"} />
                            </div>
                        </div>
                    </div>
                </header>

                {loading || !data ? (
                    <div className="p-10 max-w-7xl mx-auto w-full animate-pulse transition-all">
                        <div className="mb-12">
                            <div className="h-10 bg-teal-100/50 rounded-lg w-1/3 mb-4"></div>
                            <div className="h-4 bg-teal-100/30 rounded w-2/3"></div>
                        </div>
                        <div className="flex justify-between items-end gap-6 mb-8">
                            <div className="h-10 bg-teal-100/50 rounded-full w-64"></div>
                            <div className="h-14 bg-teal-100/30 rounded-lg w-32"></div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <div className="bg-white rounded-2xl h-72 border border-teal-100/30 shadow-sm"></div>
                            <div className="bg-white rounded-2xl h-72 border border-teal-100/30 shadow-sm"></div>
                        </div>
                    </div>
                ) : (
                <div className="p-10 max-w-7xl mx-auto w-full">
                    {/* Header Section */}
                    <div className="mb-12">
                        <h2 className="text-4xl font-extrabold text-on-background tracking-tight mb-2">Verifikasi Psikolog</h2>
                        <p className="text-on-surface-variant max-w-2xl leading-relaxed">Kelola dan verifikasi kredensial profesional psikolog baru untuk menjaga standar kualitas layanan di Ethereal Sanctuary.</p>
                    </div>

                    {/* Dashboard Stats & Filters */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                        <div className="flex bg-surface-container-low p-1.5 rounded-full">
                             <button 
                                onClick={() => setFilter('semua')} 
                                className={`px-8 py-2 rounded-full text-sm transition-all ${filter === 'semua' ? 'font-bold bg-[#A46477] text-white shadow-md' : 'font-medium text-on-surface-variant hover:bg-surface-container'}`}
                            >
                                Semua
                            </button>
                            <button 
                                onClick={() => setFilter('pending')} 
                                className={`px-8 py-2 rounded-full text-sm transition-all ${filter === 'pending' ? 'font-bold bg-[#A46477] text-white shadow-md' : 'font-medium text-on-surface-variant hover:bg-surface-container'}`}
                            >
                                Menunggu
                            </button>
                            <button 
                                onClick={() => setFilter('verified')} 
                                className={`px-8 py-2 rounded-full text-sm transition-all ${filter === 'verified' ? 'font-bold bg-[#A46477] text-white shadow-md' : 'font-medium text-on-surface-variant hover:bg-surface-container'}`}
                            >
                                Terverifikasi
                            </button>
                            <button 
                                onClick={() => setFilter('rejected')} 
                                className={`px-8 py-2 rounded-full text-sm transition-all ${filter === 'rejected' ? 'font-bold bg-red-500 text-white shadow-md' : 'font-medium text-on-surface-variant hover:bg-surface-container'}`}
                            >
                                Ditolak
                            </button>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-[#A46477] tracking-widest uppercase">Total Permohonan</span>
                            <p className="text-3xl font-black text-on-background">{allItems.length} <span className="text-sm font-medium text-on-surface-variant">psikolog</span></p>
                        </div>
                    </div>

                    {/* Bento Grid of Psychologists */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {displayedItems.length === 0 ? (
                            <div className="col-span-1 xl:col-span-2 py-16 text-center bg-surface-container-lowest rounded-lg border-2 border-dashed border-outline-variant/30 text-on-surface-variant">
                                <span className="material-symbols-outlined text-5xl mb-4 opacity-50">search_off</span>
                                <p className="font-bold text-lg">Tidak ada data psikolog ditemukan.</p>
                                <p className="text-sm">Filter atau pencarian Anda tidak memiliki hasil.</p>
                            </div>
                        ) : (
                            displayedItems.map((u) => (
                                <div key={u.id} className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-teal-100/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4">
                                        {u.statusType === 'pending' ? (
                                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Menunggu</span>
                                        ) : u.statusType === 'rejected' ? (
                                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Ditolak</span>
                                        ) : (
                                            <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Terverifikasi</span>
                                        )}
                                    </div>
                                    <div className="flex gap-6">
                                        {u.profile_image ? (
                                            <img src={`${STORAGE_BASE_URL}/${u.profile_image}`} className="w-24 h-24 rounded-lg object-cover bg-surface-container" alt={u.name} />
                                        ) : (
                                            <div className="w-24 h-24 rounded-lg bg-surface-container flex flex-shrink-0 items-center justify-center font-bold text-3xl text-secondary opacity-80">
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1 w-full min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-bold text-on-background line-clamp-1">{u.name}</h3>
                                                {u.statusType === 'verified' && (
                                                    <span className="material-symbols-outlined text-[#356765] text-sm" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                                                )}
                                                {u.statusType === 'rejected' && (
                                                    <span className="material-symbols-outlined text-red-500 text-sm" style={{fontVariationSettings: "'FILL' 1"}}>cancel</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[10px] font-bold bg-[#ffd9e2] text-[#A46477] px-2 py-0.5 rounded uppercase tracking-wider">
                                                    {getSpesialisasiLabel(u.spesialisasi)}
                                                </span>
                                                <span className="text-xs text-on-surface-variant/60">Professional</span>
                                            </div>
                                            <p className="text-sm text-[#A46477] font-medium mb-4 truncate">{u.email}</p>
                                            
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="bg-surface-container-low p-3 rounded">
                                                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Dokumen STR</span>
                                                    {u.str_file ? (
                                                        <a href={`${STORAGE_BASE_URL}/${u.str_file}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-teal-700 hover:underline inline-flex items-center gap-1"><span className="material-symbols-outlined text-sm">description</span> Buka File</a>
                                                    ) : (
                                                        <span className="text-sm font-medium opacity-50">Tidak ada</span>
                                                    )}
                                                </div>
                                                <div className="bg-surface-container-low p-3 rounded">
                                                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Dokumen Ijazah</span>
                                                    {u.ijazah_file ? (
                                                        <a href={`${STORAGE_BASE_URL}/${u.ijazah_file}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-teal-700 hover:underline inline-flex items-center gap-1"><span className="material-symbols-outlined text-sm">school</span> Buka File</a>
                                                    ) : (
                                                        <span className="text-sm font-medium opacity-50">Tidak ada</span>
                                                    )}
                                                </div>
                                            </div>

                                            {u.statusType === 'pending' ? (
                                                <div className="flex gap-3">
                                                    <button onClick={() => handleVerify(u.id, u.name)} className="group/approve flex-1 py-3 bg-white border border-outline-variant/30 text-on-surface-variant rounded-full text-sm font-bold hover:bg-green-600 hover:text-white hover:border-green-600 hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2">
                                                        <span className="material-symbols-outlined text-base group-hover/approve:scale-125 transition-transform duration-300" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span> Setujui
                                                    </button>
                                                    <button onClick={() => handleReject(u.id, u.name)} className="group/reject flex-1 py-3 border border-outline-variant/30 text-on-surface-variant rounded-full text-sm font-bold hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2">
                                                        <span className="material-symbols-outlined text-base group-hover/reject:rotate-90 transition-transform duration-300">cancel</span> Tolak
                                                    </button>
                                                </div>
                                            ) : u.statusType === 'rejected' ? (
                                                <div className="flex flex-col gap-2">
                                                    <span className="w-full text-center py-3 border border-red-200 text-red-600 bg-red-50 rounded-full text-sm font-bold block">
                                                        Ditolak
                                                    </span>
                                                    {u.rejected_reason && (
                                                        <p className="text-xs text-center text-red-400 px-2" title={u.rejected_reason}>
                                                            Alasan: {u.rejected_reason}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex gap-3">
                                                    <span className="w-full text-center py-3 border border-outline-variant/30 text-teal-800 bg-teal-50 rounded-full text-sm font-bold block">
                                                        Sudah Disetujui
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Document Preview Bento Piece (Dynamic Info) */}
                        {pendingCount > 0 && filter !== 'verified' && (
                            <div className="bg-surface-container rounded-lg p-8 flex flex-col justify-between border-2 border-dashed border-outline-variant/20 col-span-1 xl:col-span-2 mt-4">
                                <div>
                                    <span className="material-symbols-outlined text-4xl text-[#A46477] mb-4">description</span>
                                    <h3 className="text-xl font-bold text-on-background mb-2">Peringatan Dokumen</h3>
                                    <p className="text-on-surface-variant text-sm leading-relaxed">Terdapat {pendingCount} pendaftar baru yang memerlukan pemrosesan validasi manual dari tim Anda.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                )}
            </main>
        </div>
    );
};

export default AdminVerifications;
