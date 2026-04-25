import React, { useEffect, useState, useRef } from 'react';
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
    const [showNotif, setShowNotif] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotif(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Modal state
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', id: null, name: '' });
    const [rejectReason, setRejectReason] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

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

    const openVerifyModal = (id, name) => {
        setModalConfig({ isOpen: true, type: 'verify', id, name });
    };

    const openRejectModal = (id, name) => {
        setModalConfig({ isOpen: true, type: 'reject', id, name });
        setRejectReason('');
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, type: '', id: null, name: '' });
        setRejectReason('');
    };

    const submitVerify = async () => {
        setModalLoading(true);
        try {
            await api.post(`/admin/verify/${modalConfig.id}`);
            fetchVerifications();
            closeModal();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal memverifikasi');
        } finally {
            setModalLoading(false);
        }
    };

    const submitReject = async () => {
        if (!rejectReason.trim()) {
            alert('Alasan penolakan tidak boleh kosong.');
            return;
        }
        setModalLoading(true);
        try {
            await api.post(`/admin/reject/${modalConfig.id}`, { reason: rejectReason.trim() });
            fetchVerifications();
            closeModal();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menolak');
        } finally {
            setModalLoading(false);
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
            <aside className="h-screen w-64 docked left-0 flex flex-col h-full border-r border-teal-100/10 bg-teal-50 dark:bg-slate-950 font-plus-jakarta text-base shrink-0">
                <div className="px-6 py-8">
                    <h1 className="text-lg font-black text-teal-900 dark:text-teal-50">The Sanctuary</h1>
                    <p className="text-xs text-teal-700/60 dark:text-teal-300/40 uppercase tracking-widest mt-1">Admin Console</p>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 dark:hover:bg-teal-800/20 transition-all rounded-lg">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 dark:hover:bg-teal-800/20 transition-all rounded-lg group">
                        <span className="material-symbols-outlined">groups</span>
                        <span>Kelola Pengguna</span>
                    </Link>
                    <Link to="/admin/verifications" className="flex items-center gap-3 px-4 py-3 text-[#A46477] font-bold border-r-4 border-[#A46477] bg-teal-100/20 active:translate-x-1 duration-150 rounded-l-lg">
                        <span className="material-symbols-outlined">verified_user</span>
                        <span>Verifikasi</span>
                    </Link>
                    <Link to="/admin/appeals" className="flex items-center gap-3 px-4 py-3 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 dark:hover:bg-teal-800/20 transition-all rounded-lg group">
                        <span className="material-symbols-outlined">mail</span>
                        <span>Kotak Surat Banding</span>
                    </Link>
                </nav>
                <div className="px-4 py-6 border-t border-teal-100/10">
                    <button onClick={() => navigate('/home')} className="w-full bg-[#A46477] text-white py-3 rounded-full font-bold text-sm mb-6 shadow-lg shadow-[#A46477]/20 active:scale-95 transition-transform">
                        Kembali ke Aplikasi
                    </button>
                    <div className="space-y-1">
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 transition-all rounded-lg text-sm">
                            <span className="material-symbols-outlined text-sm">logout</span>
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto silk-texture">
                {/* TopNavBar */}
                <header className="w-full docked top-0 flex justify-between items-center px-8 py-3 bg-teal-50/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-teal-100/20 sticky z-20">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-teal-600/70 text-sm">search</span>
                            <input 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-teal-100/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-teal-600/50" 
                                placeholder="Cari data..." 
                                type="text" 
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Notification Bell */}
                        <div className="relative" ref={notifRef}>
                            <button 
                                onClick={() => setShowNotif(!showNotif)}
                                className="relative p-2 rounded-full hover:bg-teal-100/50 text-teal-700 dark:text-teal-300 transition-colors"
                            >
                                <span className="material-symbols-outlined">notifications</span>
                                {data?.pendingCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-teal-50 dark:border-slate-900"></span>
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotif && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-teal-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-teal-50 dark:border-slate-700 bg-teal-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                        <h3 className="font-bold text-sm text-teal-900 dark:text-teal-100">Notifikasi</h3>
                                        {data?.pendingCount > 0 && (
                                            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{data.pendingCount} Baru</span>
                                        )}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {!data || data.pendingCount === 0 || !data.pendingPsikolog ? (
                                            <div className="px-4 py-6 text-center text-sm text-slate-500">
                                                Tidak ada notifikasi baru
                                            </div>
                                        ) : (
                                            data.pendingPsikolog.slice(0, 5).map(p => (
                                                <div key={p.id} onClick={() => {navigate('/admin/verifications'); setShowNotif(false)}} className="px-4 py-3 border-b last:border-0 border-teal-50 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{p.name} <span className="font-normal text-slate-500">mendaftar sebagai Psikolog.</span></p>
                                                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mt-1 uppercase">Menunggu Verifikasi</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {data?.pendingCount > 0 && (
                                        <div onClick={() => {navigate('/admin/verifications'); setShowNotif(false)}} className="px-4 py-2 bg-teal-50 dark:bg-slate-800 text-center text-xs font-bold text-teal-700 dark:text-teal-400 cursor-pointer hover:bg-teal-100 dark:hover:bg-slate-700 transition-colors">
                                            Lihat Semua Verifikasi
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 border-l border-teal-100/20 pl-6">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-teal-900 dark:text-teal-50">{me?.name || 'Admin Utama'}</p>
                            </div>
                            {me?.profile_image ? (
                                <img alt="Administrator Profile" className="w-10 h-10 rounded-full object-cover border-2 border-primary-container shadow-sm" src={`${STORAGE_BASE_URL}/${me.profile_image}`} />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-white border-2 border-teal-100 flex items-center justify-center text-teal-800 font-bold shadow-sm">
                                    {me?.name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                            )}
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
                <div className="p-10 w-full">
                    {/* Header Section */}
                    <div className="mb-12">
                        <h2 className="text-4xl font-extrabold text-on-background tracking-tight mb-2">Verifikasi Psikolog</h2>
                        <p className="text-on-surface-variant max-w-2xl leading-relaxed">Kelola dan verifikasi kredensial profesional psikolog baru untuk menjaga standar kualitas layanan di Ethereal Sanctuary.</p>
                    </div>

                    {/* Dashboard Stats & Filters */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                        <div className="flex gap-2 bg-surface-container-low p-1.5 rounded-full shadow-inner border border-teal-100/10">
                             <button 
                                onClick={() => setFilter('semua')} 
                                className={`px-8 py-2 rounded-full text-sm transition-all duration-300 ${filter === 'semua' ? 'font-bold bg-[#A46477] text-white shadow-lg -translate-y-0.5 scale-105' : 'font-medium text-on-surface-variant hover:bg-teal-100/50 hover:-translate-y-0.5 hover:scale-105 hover:shadow-md active:scale-95'}`}
                            >
                                Semua
                            </button>
                            <button 
                                onClick={() => setFilter('pending')} 
                                className={`px-8 py-2 rounded-full text-sm transition-all duration-300 ${filter === 'pending' ? 'font-bold bg-[#A46477] text-white shadow-lg -translate-y-0.5 scale-105' : 'font-medium text-on-surface-variant hover:bg-teal-100/50 hover:-translate-y-0.5 hover:scale-105 hover:shadow-md active:scale-95'}`}
                            >
                                Menunggu
                            </button>
                            <button 
                                onClick={() => setFilter('verified')} 
                                className={`px-8 py-2 rounded-full text-sm transition-all duration-300 ${filter === 'verified' ? 'font-bold bg-[#A46477] text-white shadow-lg -translate-y-0.5 scale-105' : 'font-medium text-on-surface-variant hover:bg-teal-100/50 hover:-translate-y-0.5 hover:scale-105 hover:shadow-md active:scale-95'}`}
                            >
                                Terverifikasi
                            </button>
                            <button 
                                onClick={() => setFilter('rejected')} 
                                className={`px-8 py-2 rounded-full text-sm transition-all duration-300 ${filter === 'rejected' ? 'font-bold bg-red-500 text-white shadow-lg -translate-y-0.5 scale-105' : 'font-medium text-on-surface-variant hover:bg-red-50 hover:text-red-600 hover:-translate-y-0.5 hover:scale-105 hover:shadow-md active:scale-95'}`}
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

                                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                    <span className="material-symbols-outlined">payments</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-amber-800 uppercase">Informasi Pembayaran</span>
                                                    <p className="text-sm font-black text-amber-900">{u.nama_bank || 'BANK'} - {u.no_rekening || 'Belum diisi'}</p>
                                                </div>
                                            </div>

                                            {u.statusType === 'pending' ? (
                                                <div className="flex gap-3">
                                                    <button onClick={() => openVerifyModal(u.id, u.name)} className="group/approve flex-1 py-3 bg-white border border-outline-variant/30 text-on-surface-variant rounded-full text-sm font-bold hover:bg-green-600 hover:text-white hover:border-green-600 hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2">
                                                        <span className="material-symbols-outlined text-base group-hover/approve:scale-125 transition-transform duration-300" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span> Setujui
                                                    </button>
                                                    <button onClick={() => openRejectModal(u.id, u.name)} className="group/reject flex-1 py-3 border border-outline-variant/30 text-on-surface-variant rounded-full text-sm font-bold hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2">
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

            {/* Confirmation Modal */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
                        {/* Header */}
                        <div className={`p-6 text-white ${modalConfig.type === 'verify' ? 'bg-[#356765]' : 'bg-red-600'}`}>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-3xl">
                                    {modalConfig.type === 'verify' ? 'verified_user' : 'warning'}
                                </span>
                                <h3 className="text-xl font-bold">
                                    {modalConfig.type === 'verify' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}
                                </h3>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <p className="text-slate-700 dark:text-slate-300 mb-6">
                                {modalConfig.type === 'verify' ? (
                                    <>Apakah Anda yakin ingin memverifikasi psikolog <strong>{modalConfig.name}</strong>? Mereka akan mendapatkan akses penuh ke platform.</>
                                ) : (
                                    <>Anda akan menolak permohonan <strong>{modalConfig.name}</strong>. Silakan tuliskan alasan penolakan di bawah ini.</>
                                )}
                            </p>

                            {modalConfig.type === 'reject' && (
                                <div className="mb-4">
                                    <label htmlFor="reason" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Alasan Penolakan (Wajib)
                                    </label>
                                    <textarea
                                        id="reason"
                                        rows="3"
                                        className="w-full p-3 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm resize-none"
                                        placeholder="Beritahu pengguna alasan spesifik agar mereka bisa memperbaiki..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        autoFocus
                                    ></textarea>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 justify-end mt-8">
                                <button
                                    onClick={closeModal}
                                    disabled={modalLoading}
                                    className="px-6 py-2.5 rounded-full font-bold text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={modalConfig.type === 'verify' ? submitVerify : submitReject}
                                    disabled={modalLoading || (modalConfig.type === 'reject' && !rejectReason.trim())}
                                    className={`px-6 py-2.5 rounded-full font-bold text-white shadow-lg transition-all flex items-center justify-center min-w-[120px] disabled:opacity-60 disabled:cursor-not-allowed
                                        ${modalConfig.type === 'verify' ? 'bg-[#356765] hover:bg-teal-800 shadow-teal-900/30' : 'bg-red-600 hover:bg-red-700 shadow-red-600/30'}`}
                                >
                                    {modalLoading ? (
                                        <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
                                    ) : (
                                        modalConfig.type === 'verify' ? 'Setujui' : 'Tolak'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerifications;
